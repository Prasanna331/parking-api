const request = require('supertest');
const app = require('../src/app');
const { clearTables, closePool } = require('./helpers/db');

beforeAll(async () => { await clearTables(); });
afterAll(async () => { await clearTables(); await closePool(); });

describe('POST /api/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@test.com', password: 'secret123' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alice@test.com');
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('returns 409 for a duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Alice2', email: 'alice@test.com', password: 'secret123' });

    expect(res.status).toBe(409);
  });

  it('returns 422 for missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bad@test.com' });

    expect(res.status).toBe(422);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'secret123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'wrongpass' });

    expect(res.status).toBe(401);
  });

  it('returns 401 for unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'secret123' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@test.com', password: 'secret123' });
    token = res.body.token;
  });

  it('returns the current user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('alice@test.com');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});


