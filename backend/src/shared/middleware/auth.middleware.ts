import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth.utils';
import { ApiError } from '../utils/api-error';
import { UserRole } from '../constants/user-role';
import { User, IUser } from '../../database/models/user.model';

// Make the authenticated user available on the express request
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Protect routes: require a valid authorization (Bearer token) header
// Errors are forwarded to the global error handler (Express 5 catches async rejections)
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {

  // getting the token from the request headers
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication token is required');
  }

  // Throws JsonWebTokenError/TokenExpiredError, mapped to 401 by the error handler
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  // Ensure the user still exists
  const user = await User.findById(payload.userId);
  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  req.user = user;
  next();
};

// Role-based access control: allow only the given roles (must run after authenticate)
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden();
    }

    next();
  };
};

// Convenience guard for Admin-only routes
export const requireAdmin = authorize(UserRole.ADMIN);
