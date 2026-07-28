import { z } from 'zod';
import { TaskStatus, TaskPriority } from '../../database/models/task.model';
import { objectIdSchema } from '../project/project.validation';

export const createTaskSchema = z.object({
  title: z
    .string('Task title is required')
    .trim()
    .min(2, 'Task title must be at least 2 characters')
    .max(200, 'Task title must not exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  status: z.enum(TaskStatus, 'Status must be one of: To Do, In Progress, Done').optional(),
  priority: z.enum(TaskPriority, 'Priority must be one of: Low, Medium, High').optional(),
  dueDate: z.coerce.date('Due date must be a valid date').optional(),
  assignee: objectIdSchema.optional(),
});

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, 'Task title must be at least 2 characters')
      .max(200, 'Task title must not exceed 200 characters')
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, 'Description must not exceed 2000 characters')
      .optional(),
    status: z.enum(TaskStatus, 'Status must be one of: To Do, In Progress, Done').optional(),
    priority: z.enum(TaskPriority, 'Priority must be one of: Low, Medium, High').optional(),
    dueDate: z.coerce.date('Due date must be a valid date').optional(),
    // null unassigns the task
    assignee: objectIdSchema.nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update',
  });
