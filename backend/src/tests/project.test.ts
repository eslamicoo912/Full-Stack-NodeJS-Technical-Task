import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { connectDatabase } from '../database/connection';
import { UserRole } from '../shared/constants/user-role';
import { createTestUser, clearDatabase } from './helpers';

beforeAll(async () => {
  await connectDatabase();
});

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /api/projects', () => {
  it('creates a project owned by the authenticated user', async () => {
    const { user, token } = await createTestUser();

    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My Project', description: 'A test project' });

    expect(res.status).toBe(201);
    expect(res.body.project.name).toBe('My Project');
    expect(res.body.project.owner._id).toBe(String(user._id));
  });
});

describe('GET /api/projects', () => {
  it('shows only projects accessible to the authenticated user', async () => {
    const owner = await createTestUser();
    const outsider = await createTestUser();

    await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Owner Project' });

    const ownerRes = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${owner.token}`);
    const outsiderRes = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${outsider.token}`);

    expect(ownerRes.status).toBe(200);
    expect(ownerRes.body.data).toHaveLength(1);
    expect(outsiderRes.body.data).toHaveLength(0);
  });
});


describe('PATCH /api/projects/:id', () => {
  it('forbids a member from updating a project they do not own', async () => {
    const owner = await createTestUser();
    const member = await createTestUser();
    const admin = await createTestUser(UserRole.ADMIN);

    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Owner Project' });
    const projectId = projectRes.body.project._id;

    await request(app)
      .post(`/api/projects/${projectId}/members`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ userId: String(member.user._id) });

    const res = await request(app)
      .patch(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${member.token}`)
      .send({ name: 'Hijacked Name' });

    expect(res.status).toBe(403);
  });
});
