import { QueryFilter } from 'mongoose';
import { Project, IProject } from '../../database/models/project.model';
import { Task } from '../../database/models/task.model';
import { TaskAuditLog } from '../../database/models/task-audit-log.model';
import { User, IUser } from '../../database/models/user.model';
import {
  APIFeatures,
  QueryString,
  PaginatedResult,
} from '../../shared/utils/api-features';
import { CreateProjectInput } from './project.interface';

const POPULATE_FIELDS = [
  { path: 'owner', select: 'name email' },
  { path: 'members', select: 'name email' },
];

// Paginated, searchable, sortable list scoped by the given access filter
export const findProjects = (
  filter: QueryFilter<IProject>,
  queryString: QueryString
): Promise<PaginatedResult<IProject>> => {
  return new APIFeatures(
    Project.find(filter).populate(POPULATE_FIELDS),
    queryString
  )
    .search(['name', 'description'])
    .filter(['name'])
    .sort()
    .paginate()
    .execute();
};

export const findProjectById = (id: string): Promise<IProject | null> => {
  return Project.findById(id).exec();
};

export const populateProject = (project: IProject): Promise<IProject> => {
  return project.populate(POPULATE_FIELDS);
};

export const createProject = (input: CreateProjectInput): Promise<IProject> => {
  return Project.create(input);
};

// Remove the project along with its tasks and audit logs
export const deleteProjectWithRelated = async (
  project: IProject
): Promise<void> => {
  await Promise.all([
    project.deleteOne(),
    Task.deleteMany({ project: project._id }),
    TaskAuditLog.deleteMany({ project: project._id }), // cascade deleting
  ]);
};

export const addMemberById = (
  projectId: string,
  userId: string
): Promise<IProject | null> => {
  return Project.findByIdAndUpdate(
    projectId,
    { $addToSet: { members: userId } },
    { returnDocument: 'after' }
  )
    .populate(POPULATE_FIELDS)
    .exec();
};

export const removeMemberById = (
  projectId: string,
  userId: string
): Promise<IProject | null> => {
  return Project.findByIdAndUpdate(
    projectId,
    { $pull: { members: userId } },
    { returnDocument: 'after' }
  )
    .populate(POPULATE_FIELDS)
    .exec();
};

export const findUserById = (id: string): Promise<IUser | null> => {
  return User.findById(id).exec();
};
