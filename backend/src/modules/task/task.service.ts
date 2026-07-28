import { Types } from 'mongoose';
import { ApiError } from '../../shared/utils/api-error';
import { UserRole } from '../../shared/constants/user-role';
import { QueryString, PaginatedResult } from '../../shared/utils/api-features';
import { ITask } from '../../database/models/task.model';
import { ITaskAuditLog } from '../../database/models/task-audit-log.model';
import { IProject } from '../../database/models/project.model';
import { IUser } from '../../database/models/user.model';
import { getAccessibleProject } from '../project/project.service';
import { canTransition } from './task.state-machine';
import * as taskRepository from './task.repository';
import { CreateTaskInput, UpdateTaskInput } from './task.interface';

// the assignee must belong to the project (owner or member)
const assertAssigneeInProject = (project: IProject, assigneeId: string): void => {
  const belongs =
    String(project.owner) === assigneeId ||
    project.members.some((member) => String(member) === assigneeId);
  if (!belongs) {
    throw ApiError.badRequest('Assignee must be a member of the project');
  }
};

// fetch a task and make sure it belongs to the given project
const getTaskInProject = async (
  projectId: string,
  taskId: string
): Promise<ITask> => {
  const task = await taskRepository.findTaskById(taskId);
  if (!task || String(task.project) !== projectId) {
    throw ApiError.notFound('Task not found in this project');
  }
  return task;
};

export const listTasks = async (
  user: IUser,
  projectId: string,
  queryString: QueryString
): Promise<PaginatedResult<ITask>> => {
  await getAccessibleProject(projectId, user);
  return taskRepository.findTasks({ project: projectId }, queryString);
};

export const getTask = async (
  user: IUser,
  projectId: string,
  taskId: string
): Promise<ITask> => {
  await getAccessibleProject(projectId, user);
  const task = await getTaskInProject(projectId, taskId);
  return taskRepository.populateTask(task);
};

export const createTask = async (
  user: IUser,
  projectId: string,
  input: CreateTaskInput
): Promise<ITask> => {
  const project = await getAccessibleProject(projectId, user);

  if (input.assignee) {
    assertAssigneeInProject(project, input.assignee);
  }

  const task = await taskRepository.createTask({
    ...input,
    project: project._id as Types.ObjectId,
    creator: user._id as Types.ObjectId,
  });

  // Audit the initial status (fromStatus is null on creation)
  await taskRepository.createAuditLog(
    task,
    user._id as Types.ObjectId,
    null,
    task.status
  );

  return taskRepository.populateTask(task);
};

export const updateTask = async (
  user: IUser,
  projectId: string,
  taskId: string,
  input: UpdateTaskInput
): Promise<ITask> => {
  const project = await getAccessibleProject(projectId, user);
  const task = await getTaskInProject(projectId, taskId);

  if (input.assignee) {
    assertAssigneeInProject(project, input.assignee);
  }

  // Status changes must follow the state machine and are audit logged
  const previousStatus = task.status;
  const statusChanged =
    input.status !== undefined && input.status !== previousStatus;

  if (statusChanged && !canTransition(previousStatus, input.status!)) {
    throw ApiError.badRequest(
      `Cannot change status from "${previousStatus}" to "${input.status}"`
    );
  }

  task.set(input);
  await task.save();

  if (statusChanged) {
    await taskRepository.createAuditLog(
      task,
      user._id as Types.ObjectId,
      previousStatus,
      task.status
    );
  }

  return taskRepository.populateTask(task);
};

export const deleteTask = async (
  user: IUser,
  projectId: string,
  taskId: string
): Promise<void> => {
  const project = await getAccessibleProject(projectId, user);
  const task = await getTaskInProject(projectId, taskId);

  // Only an Admin, the project owner, or the task creator can delete a task
  const canDelete =
    user.role === UserRole.ADMIN ||
    String(project.owner) === String(user._id) ||
    String(task.creator) === String(user._id);
  if (!canDelete) {
    throw ApiError.forbidden(
      'Only an Admin, the project owner, or the task creator can delete this task'
    );
  }

  await taskRepository.deleteTaskWithRelated(task);
};

// Status change history of a task (audit log), requires project access
export const getTaskAuditLogs = async (
  user: IUser,
  projectId: string,
  taskId: string
): Promise<ITaskAuditLog[]> => {
  await getAccessibleProject(projectId, user);
  await getTaskInProject(projectId, taskId);
  return taskRepository.findAuditLogsByTask(taskId);
};
