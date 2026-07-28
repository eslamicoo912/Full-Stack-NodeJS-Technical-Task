import { Request, Response } from 'express';
import { IUser } from '../../database/models/user.model';
import { QueryString } from '../../shared/utils/api-features';
import * as projectService from './project.service';

export const listProjects = async (req: Request, res: Response): Promise<void> => {
  const result = await projectService.listProjects(
    req.user as IUser,
    req.query as unknown as QueryString
  );
  res.status(200).json(result);
};

export const getProject = async (req: Request, res: Response): Promise<void> => {
  const project = await projectService.getProject(
    req.user as IUser,
    String(req.params.id)
  );
  res.status(200).json({ project });
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  const project = await projectService.createProject(req.user as IUser, req.body);
  res.status(201).json({ project });
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  const project = await projectService.updateProject(
    req.user as IUser,
    String(req.params.id),
    req.body
  );
  res.status(200).json({ project });
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  await projectService.deleteProject(req.user as IUser, String(req.params.id));
  res.status(204).send();
};

export const addMember = async (req: Request, res: Response): Promise<void> => {
  const project = await projectService.addMember(
    String(req.params.id),
    req.body.userId
  );
  res.status(200).json({ project });
};

export const removeMember = async (req: Request, res: Response): Promise<void> => {
  const project = await projectService.removeMember(
    String(req.params.id),
    String(req.params.userId)
  );
  res.status(200).json({ project });
};
