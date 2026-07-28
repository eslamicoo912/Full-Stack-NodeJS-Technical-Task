import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.middleware';
import { authenticate, requireAdmin } from '../../shared/middleware/auth.middleware';
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
} from './project.validation';
import * as projectController from './project.controller';

const router = Router();

// all project routes require authentication
router.use(authenticate);

router
  .route('/')
  .get(projectController.listProjects)
  .post(validate(createProjectSchema), projectController.createProject);

router
  .route('/:id')
  .get(projectController.getProject)
  .patch(validate(updateProjectSchema), projectController.updateProject)
  .delete(projectController.deleteProject);

// member management is restricted to Admins (assessment requirement)
router.post(
  '/:id/members',
  requireAdmin,
  validate(addMemberSchema),
  projectController.addMember
);
router.delete('/:id/members/:userId', requireAdmin, projectController.removeMember);

export default router;
