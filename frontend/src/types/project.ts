import type { UserRef } from './user';

// Mirror of backend project model (owner/members come back populated)

export interface Project {
  _id: string;
  name: string;
  description: string;
  owner: UserRef;
  members: UserRef[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export type UpdateProjectInput = Partial<CreateProjectInput>;
