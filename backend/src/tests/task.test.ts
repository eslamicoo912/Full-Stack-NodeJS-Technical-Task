import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { connectDatabase } from '../database/connection';
import { IUser } from '../database/models/user.model';
import { TaskStatus } from '../database/models/task.model';
import { canTransition } from '../modules/task/task.state-machine';
import { createTestUser, clearDatabase } from './helpers';

let owner: { user: IUser; token: string };
let projectId: string;

beforeAll(async () => {
  await connectDatabase();
});

beforeEach(async () => {
  await clearDatabase();
  owner = await createTestUser();
  const projectRes = await request(app)
    .post('/api/projects')
    .set('Authorization', `Bearer ${owner.token}`)
    .send({ name: 'Task Test Project' });
  projectId = projectRes.body.project._id;
});

afterAll(async () => {
  await mongoose.disconnect();
});

const createTask = (body: Record<string, unknown> = {}) => {
  return request(app)
    .post(`/api/projects/${projectId}/tasks`)
    .set('Authorization', `Bearer ${owner.token}`)
    .send({ title: 'Test Task', ...body });
};

describe('task status state machine (unit)', () => {
  it('allows only one-step transitions', () => {
    expect(canTransition(TaskStatus.TODO, TaskStatus.IN_PROGRESS)).toBe(true);
    expect(canTransition(TaskStatus.IN_PROGRESS, TaskStatus.DONE)).toBe(true);
    expect(canTransition(TaskStatus.DONE, TaskStatus.IN_PROGRESS)).toBe(true);
    expect(canTransition(TaskStatus.TODO, TaskStatus.DONE)).toBe(false);
    expect(canTransition(TaskStatus.DONE, TaskStatus.TODO)).toBe(false);
  });
});

describe('PATCH /api/projects/:projectId/tasks/:taskId', () => {
  it('rejects an invalid status transition (To Do -> Done)', async () => {
    const taskRes = await createTask();

    const res = await request(app)
      .patch(`/api/projects/${projectId}/tasks/${taskRes.body.task._id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'Done' });

    expect(res.status).toBe(400);
  });

  it('applies a valid transition and writes an audit log entry', async () => {
    const taskRes = await createTask();
    const taskId = taskRes.body.task._id;

    const res = await request(app)
      .patch(`/api/projects/${projectId}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ status: 'In Progress' });

    expect(res.status).toBe(200);
    expect(res.body.task.status).toBe('In Progress');

    const auditLogsRes = await request(app)
      .get(`/api/projects/${projectId}/tasks/${taskId}/audit-logs`)
      .set('Authorization', `Bearer ${owner.token}`);

    expect(auditLogsRes.body.auditLogs).toHaveLength(2);
    expect(auditLogsRes.body.auditLogs[0].fromStatus).toBe('To Do');
    expect(auditLogsRes.body.auditLogs[0].toStatus).toBe('In Progress');
  });
});

