import { Query } from 'mongoose';

export interface QueryString {
  page?: string;
  limit?: string;
  sort?: string;
  search?: string;
  [key: string]: string | undefined;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export class APIFeatures<T> {
  private page = DEFAULT_PAGE;
  private limit = DEFAULT_LIMIT;

  constructor(
    private query: Query<T[], T>,
    private queryString: QueryString
  ) {}

  search(fields: string[]): this {
    const term = this.queryString.search?.trim();
    if (term && fields.length > 0) {
      const regex = { $regex: escapeRegex(term), $options: 'i' };
      this.query = this.query.find({
        $or: fields.map((field) => ({ [field]: regex })),
      });
    }
    return this;
  }

  filter(allowedFields: string[]): this {
    const criteria: Record<string, string> = {};
    for (const field of allowedFields) {
      const value = this.queryString[field];
      if (value !== undefined && value !== '') {
        criteria[field] = value;
      }
    }
    if (Object.keys(criteria).length > 0) {
      this.query = this.query.find(criteria);
    }
    return this;
  }

  // ?sort=priority,-createdAt -> "priority -createdAt"; newest first by default
  sort(): this {
    const sortBy = this.queryString.sort
      ? this.queryString.sort.split(',').join(' ')
      : '-createdAt';
    this.query = this.query.sort(sortBy);
    return this;
  }

  // ?page=2&limit=20 with sane defaults and an upper bound on limit
  paginate(): this {
    const page = parseInt(this.queryString.page ?? '', 10);
    const limit = parseInt(this.queryString.limit ?? '', 10);

    this.page = Number.isNaN(page) || page < 1 ? DEFAULT_PAGE : page;
    this.limit =
      Number.isNaN(limit) || limit < 1 ? DEFAULT_LIMIT : Math.min(limit, MAX_LIMIT);

    this.query = this.query.skip((this.page - 1) * this.limit).limit(this.limit);
    return this;
  }

  // Run the query and count total matches (before skip/limit) in parallel
  async execute(): Promise<PaginatedResult<T>> {
    const [data, total] = await Promise.all([
      this.query.exec(),
      this.query.model.countDocuments(this.query.getFilter()).exec(),
    ]);

    return {
      data,
      pagination: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages: Math.ceil(total / this.limit),
      },
    };
  }
}
