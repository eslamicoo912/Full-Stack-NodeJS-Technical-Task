import { Types } from 'mongoose';
import { TaskStatus, TaskPriority } from '../../database/models/task.model';

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  assignee?: string;
  project?: Types.ObjectId;
  creator?: Types.ObjectId;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  assignee?: string | null;
}
