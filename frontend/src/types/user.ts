// Mirror of backend user model / user-role constants

export const UserRole = {
  ADMIN: 'Admin',
  MEMBER: 'Member',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Populated references only expose name and email (backend POPULATE_FIELDS)
export type UserRef = Pick<User, '_id' | 'name' | 'email'>;
