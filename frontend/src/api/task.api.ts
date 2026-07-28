import { apiClient } from './client';
import type { PaginatedResult } from '../types/api';
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task';

export interface TaskListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  status?: string;
  priority?: string;
  assignee?: string;
}

export const listTasksApi = async (
  projectId: string,
  params: TaskListParams
): Promise<PaginatedResult<Task>> => {
  const res = await apiClient.get<PaginatedResult<Task>>(
    `/projects/${projectId}/tasks`,
    { params }
  );
  return res.data;
};

export const createTaskApi = async (
  projectId: string,
  input: CreateTaskInput
): Promise<Task> => {
  const res = await apiClient.post<{ task: Task }>(
    `/projects/${projectId}/tasks`,
    input
  );
  return res.data.task;
};

export const updateTaskApi = async (
  projectId: string,
  taskId: string,
  input: UpdateTaskInput
): Promise<Task> => {
  const res = await apiClient.patch<{ task: Task }>(
    `/projects/${projectId}/tasks/${taskId}`,
    input
  );
  return res.data.task;
};

export const deleteTaskApi = async (
  projectId: string,
  taskId: string
): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}/tasks/${taskId}`);
};
