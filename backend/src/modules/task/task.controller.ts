import { Request, Response } from 'express';
import { IUser } from '../../database/models/user.model';
import { QueryString } from '../../shared/utils/api-features';
import * as taskService from './task.service';
import { io } from '../../server';

export const listTasks = async (req: Request, res: Response): Promise<void> => {
  const result = await taskService.listTasks(
    req.user as IUser,
    String(req.params.projectId),
    req.query as unknown as QueryString
  );
  res.status(200).json(result);
};

export const getTask = async (req: Request, res: Response): Promise<void> => {
  const task = await taskService.getTask(
    req.user as IUser,
    String(req.params.projectId),
    String(req.params.taskId)
  );
  res.status(200).json({ task });
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  const task = await taskService.createTask(
    req.user as IUser,
    String(req.params.projectId),
    req.body
  );
  res.status(201).json({ task });
  
  // Emit real-time event to project room
  io.to(`project:${req.params.projectId}`).emit('task:created', task);
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const task = await taskService.updateTask(
    req.user as IUser,
    String(req.params.projectId),
    String(req.params.taskId),
    req.body
  );
  res.status(200).json({ task });
  
  // Emit real-time event to project room
  io.to(`project:${req.params.projectId}`).emit('task:updated', task);
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  await taskService.deleteTask(
    req.user as IUser,
    String(req.params.projectId),
    String(req.params.taskId)
  );
  res.status(204).send();
  
  // Emit real-time event to project room
  io.to(`project:${req.params.projectId}`).emit('task:deleted', { taskId: req.params.taskId });
};

export const getTaskAuditLogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  const auditLogs = await taskService.getTaskAuditLogs(
    req.user as IUser,
    String(req.params.projectId),
    String(req.params.taskId)
  );
  res.status(200).json({ auditLogs });
};
