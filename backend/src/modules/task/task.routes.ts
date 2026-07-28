import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.middleware';
import { authenticate } from '../../shared/middleware/auth.middleware';
import { createTaskSchema, updateTaskSchema } from './task.validation';
import * as taskController from './task.controller';

// mergeParams gives access to :projectId from the parent mount path
// without this: req.params.projectId would be undefined
// parent mount path means: /projects/:projectId/tasks
const router = Router({ mergeParams: true });

// all task routes require authentication
router.use(authenticate);

router
  .route('/')
  .get(taskController.listTasks)
  .post(validate(createTaskSchema), taskController.createTask);

router
  .route('/:taskId')
  .get(taskController.getTask)
  .patch(validate(updateTaskSchema), taskController.updateTask)
  .delete(taskController.deleteTask);

// audit log: status change history of a task
router.get('/:taskId/audit-logs', taskController.getTaskAuditLogs);

export default router;
