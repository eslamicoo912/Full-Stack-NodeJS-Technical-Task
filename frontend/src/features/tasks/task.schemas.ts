import { z } from 'zod';

// Client-side rules mirroring backend task.validation.ts
export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Task title must be at least 2 characters')
    .max(200, 'Task title must not exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  status: z.enum(['To Do', 'In Progress', 'Done']).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
