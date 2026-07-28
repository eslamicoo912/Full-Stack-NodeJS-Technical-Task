import { Request, Response } from 'express';
import { QueryString } from '../../shared/utils/api-features';
import * as userService from './user.service';

export const listUsers = async (req: Request, res: Response): Promise<void> => {
  const result = await userService.listUsers(
    req.query as unknown as QueryString
  );
  res.status(200).json(result);
};
