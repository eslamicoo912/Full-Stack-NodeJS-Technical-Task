import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { connectDatabase } from '../database/connection';
import { clearDatabase } from './helpers';

const validUser = {
  name: 'Eslam Ashraf',
  email: 'eslam@example.com',
  password: 'Password123',
};

beforeAll(async () => {
  await connectDatabase();
});

beforeEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /api/auth/register', () => {
  it('registers a user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.role).toBe('Member');
    expect(res.body.user.password).toBeUndefined();
  });

  it('rejects registration with an already used email', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(409);
  });

  it('rejects invalid input with field errors', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'not-an-email', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rejects a wrong password with 401', async () => {
    await request(app).post('/api/auth/register').send(validUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPassword1' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('returns the current user with a valid token', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registerRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });
});
