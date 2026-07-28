import { TaskStatus } from '../../database/models/task.model';

// Simple state machine for task status transitions:
// To Do -> In Progress -> Done, one step at a time in both directions
const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.TODO, TaskStatus.DONE],
  [TaskStatus.DONE]: [TaskStatus.IN_PROGRESS],
};

export const canTransition = (from: TaskStatus, to: TaskStatus): boolean => {
  return ALLOWED_TRANSITIONS[from].includes(to);
};
