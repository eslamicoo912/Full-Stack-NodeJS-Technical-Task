import { apiClient } from './client';
import type { PaginatedResult } from '../types/api';
import type { User } from '../types/user';
import type { TaskAuditLog } from '../types/task';

// List users (Admin only) — used for the "add member" dropdown
export const listUsersApi = async (
  params: { search?: string; limit?: number } = {}
): Promise<PaginatedResult<User>> => {
  const res = await apiClient.get<PaginatedResult<User>>('/users', { params });
  return res.data;
};

// Get the status-change history for a task
export const getAuditLogsApi = async (
  projectId: string,
  taskId: string
): Promise<TaskAuditLog[]> => {
  const res = await apiClient.get<{ auditLogs: TaskAuditLog[] }>(
    `/projects/${projectId}/tasks/${taskId}/audit-logs`
  );
  return res.data.auditLogs;
};
