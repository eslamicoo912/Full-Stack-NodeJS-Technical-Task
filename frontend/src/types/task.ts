import type { UserRef } from './user';

// Mirror of backend task model (creator/assignee come back populated)

export const TaskStatus = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
} as const;

export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const TaskPriority = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
} as const;

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  project: string;
  creator: UserRef;
  assignee: UserRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAuditLog {
  _id: string;
  task: string;
  project: string;
  changedBy: UserRef;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignee?: string;
}

// assignee: null unassigns the task
export type UpdateTaskInput = Partial<Omit<CreateTaskInput, 'assignee'>> & {
  assignee?: string | null;
};

// Mirror of backend task.state-machine.ts: one step at a time in both directions
export const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.TODO, TaskStatus.DONE],
  [TaskStatus.DONE]: [TaskStatus.IN_PROGRESS],
};

export const canTransition = (from: TaskStatus, to: TaskStatus): boolean => {
  return ALLOWED_TRANSITIONS[from].includes(to);
};
