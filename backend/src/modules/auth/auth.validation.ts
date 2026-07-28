import { z } from 'zod';

const emailSchema = z
  .string('Email is required')
  .trim()
  .toLowerCase()
  .pipe(z.email('Email must be a valid email address'));

export const registerSchema = z.object({
  name: z
    .string('Name is required')
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  email: emailSchema,
  password: z
    .string('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string('Password is required').min(1, 'Password is required'),
});
