import { apiClient } from './client';
import type { Project } from '../types/project';

// Admin adds a user as a project member
export const addMemberApi = async (
  projectId: string,
  userId: string
): Promise<Project> => {
  const res = await apiClient.post<{ project: Project }>(
    `/projects/${projectId}/members`,
    { userId }
  );
  return res.data.project;
};

// Admin removes a member from a project
export const removeMemberApi = async (
  projectId: string,
  userId: string
): Promise<Project> => {
  const res = await apiClient.delete<{ project: Project }>(
    `/projects/${projectId}/members/${userId}`
  );
  return res.data.project;
};
