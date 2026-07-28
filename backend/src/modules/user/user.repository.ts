import { User, IUser } from '../../database/models/user.model';
import {
  APIFeatures,
  QueryString,
  PaginatedResult,
} from '../../shared/utils/api-features';

// Paginated, searchable, sortable list of users
export const findUsers = (
  queryString: QueryString
): Promise<PaginatedResult<IUser>> => {
  return new APIFeatures(User.find(), queryString)
    .search(['name', 'email'])
    .filter(['role'])
    .sort()
    .paginate()
    .execute();
};
