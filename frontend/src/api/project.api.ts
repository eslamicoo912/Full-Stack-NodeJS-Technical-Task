import { apiClient } from './client';
import type { PaginatedResult } from '../types/api';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
} from '../types/project';

export interface ProjectListParams {
  page?: number;
  search?: string;
  sort?: string;
}

export const listProjectsApi = async (
  params: ProjectListParams
): Promise<PaginatedResult<Project>> => {
  const res = await apiClient.get<PaginatedResult<Project>>('/projects', {
    params,
  });
  return res.data;
};

export const getProjectApi = async (id: string): Promise<Project> => {
  const res = await apiClient.get<{ project: Project }>(`/projects/${id}`);
  return res.data.project;
};

export const createProjectApi = async (
  input: CreateProjectInput
): Promise<Project> => {
  const res = await apiClient.post<{ project: Project }>('/projects', input);
  return res.data.project;
};

export const updateProjectApi = async (
  id: string,
  input: UpdateProjectInput
): Promise<Project> => {
  const res = await apiClient.patch<{ project: Project }>(
    `/projects/${id}`,
    input
  );
  return res.data.project;
};

export const deleteProjectApi = async (id: string): Promise<void> => {
  await apiClient.delete(`/projects/${id}`);
};
