import { z } from 'zod';

export const objectIdSchema = z
  .string('Id is required')
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid id format');

export const createProjectSchema = z.object({
  name: z
    .string('Project name is required')
    .trim()
    .min(2, 'Project name must be at least 2 characters')
    .max(150, 'Project name must not exceed 150 characters'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
});

export const updateProjectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Project name must be at least 2 characters')
      .max(150, 'Project name must not exceed 150 characters')
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, 'Description must not exceed 1000 characters')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update',
  });

export const addMemberSchema = z.object({
  userId: objectIdSchema,
});
