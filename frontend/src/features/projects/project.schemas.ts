import { z } from 'zod';

// Client-side rules mirroring backend project.validation.ts
export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Project name must be at least 2 characters')
    .max(150, 'Project name must not exceed 150 characters'),
  description: z
    .string()
    .trim()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
