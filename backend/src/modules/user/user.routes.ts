import { Router } from 'express';
import { authenticate, requireAdmin } from '../../shared/middleware/auth.middleware';
import * as userController from './user.controller';

const router = Router();

// listing users is restricted to Admins (used for project member management)
router.use(authenticate, requireAdmin);

router.get('/', userController.listUsers);

export default router;
