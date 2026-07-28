import { Request, Response } from 'express';
import * as authService from './auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({ user, token });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { user, token } = await authService.login(req.body);
  res.status(200).json({ user, token });
};

// Current authenticated user (populated by the authenticate middleware)
export const getMe = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ user: req.user });
};
