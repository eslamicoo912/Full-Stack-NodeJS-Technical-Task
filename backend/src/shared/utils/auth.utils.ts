import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../constants/user-role';
import { IUser } from '../../database/models/user.model';

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

// Generate a token for an authenticated user
export const generateToken = (user: IUser): string => {
  const payload: JwtPayload = {
    userId: String(user._id),
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
};

// Verify the token and return the payload
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

// Compare a plain-text password against the user's hashed password.
// The user document must be fetched with .select('+password').
export const comparePassword = (
  user: IUser,
  plainPassword: string
): Promise<boolean> => {
  return user.comparePassword(plainPassword);
};
