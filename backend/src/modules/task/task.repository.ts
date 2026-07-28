import { QueryFilter, Types } from 'mongoose';
import { Task, ITask, TaskStatus } from '../../database/models/task.model';
import {
  TaskAuditLog,
  ITaskAuditLog,
} from '../../database/models/task-audit-log.model';
import {
  APIFeatures,
  QueryString,
  PaginatedResult,
} from '../../shared/utils/api-features';
import { CreateTaskInput } from './task.interface';

const POPULATE_FIELDS = [
  { path: 'creator', select: 'name email' },
  { path: 'assignee', select: 'name email' },
];

// Paginated list scoped to a project, with filtering, search, and sorting
export const findTasks = (
  filter: QueryFilter<ITask>,
  queryString: QueryString
): Promise<PaginatedResult<ITask>> => {
  return new APIFeatures(Task.find(filter).populate(POPULATE_FIELDS), queryString)
    .search(['title', 'description'])
    .filter(['status', 'priority', 'assignee'])
    .sort()
    .paginate()
    .execute();
};

export const findTaskById = (id: string): Promise<ITask | null> => {
  return Task.findById(id).exec();
};

export const populateTask = (task: ITask): Promise<ITask> => {
  return task.populate(POPULATE_FIELDS);
};

export const createTask = (input: CreateTaskInput): Promise<ITask> => {
  return Task.create(input);
};

// Remove the task along with its audit log entries
export const deleteTaskWithRelated = async (task: ITask): Promise<void> => {
  await Promise.all([
    task.deleteOne(),
    TaskAuditLog.deleteMany({ task: task._id }),
  ]);
};

// One immutable audit entry per status change (fromStatus is null on creation)
export const createAuditLog = async (
  task: ITask,
  changedBy: Types.ObjectId,
  fromStatus: TaskStatus | null,
  toStatus: TaskStatus
): Promise<void> => {
  await TaskAuditLog.create({
    task: task._id,
    project: task.project,
    changedBy,
    fromStatus,
    toStatus,
  });
};

// Status change history of a task, newest first
export const findAuditLogsByTask = (taskId: string): Promise<ITaskAuditLog[]> => {
  return TaskAuditLog.find({ task: taskId })
    .sort('-createdAt')
    .populate({ path: 'changedBy', select: 'name email' })
    .exec();
};
