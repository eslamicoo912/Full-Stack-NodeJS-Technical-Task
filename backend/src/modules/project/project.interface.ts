import { Types } from 'mongoose';

export interface CreateProjectInput {
  name: string;
  description?: string;
  owner?: Types.ObjectId;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export interface AddMemberInput {
  userId: string;
}
