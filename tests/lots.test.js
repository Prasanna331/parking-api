const request = require('supertest');
const app = require('../src/app');
const { clearTables, closePool } = require('./helpers/db');

let adminToken;
let viewerToken;
let lotId;

beforeAll(async () => {
  await clearTables();

  // Create admin user
  const admin = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin', email: 'admin@test.com', password: 'secret123', role: 'admin' });
  adminToken = admin.body.token;

  // Create viewer user
  const viewer = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Viewer', email: 'viewer@test.com', password: 'secret123', role: 'viewer' });
  viewerToken = viewer.body.token;
});

afterAll(async () => { await clearTables(); await closePool(); });

describe('GET /api/lots', () => {
  it('returns empty array when no lots exist', async () => {
    const res = await request(app)
      .get('/api/lots')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/lots');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/lots', () => {
  it('admin can create a lot', async () => {
    const res = await request(app)
      .post('/api/lots')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Central Park', address: '1 Park Ave', city: 'New York' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Central Park');
    expect(res.body.id).toBeDefined();
    expect(res.body.totalSpots).toBe(0);
    expect(res.body.isActive).toBe(true);
    lotId = res.body.id;
  });

  it('viewer cannot create a lot', async () => {
    const res = await request(app)
      .post('/api/lots')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ name: 'Mall Parking', address: '99 Mall Rd' });

    expect(res.status).toBe(403);
  });

  it('returns 422 when name is missing', async () => {
    const res = await request(app)
      .post('/api/lots')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ address: '10 Main St' });

    expect(res.status).toBe(422);
  });
});

describe('GET /api/lots/:id', () => {
  it('returns the lot by id', async () => {
    const res = await request(app)
      .get(`/api/lots/${lotId}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(lotId);
    expect(res.body.city).toBe('New York');
  });

  it('returns 404 for a non-existent lot', async () => {
    const res = await request(app)
      .get('/api/lots/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/lots/:id', () => {
  it('admin can update a lot', async () => {
    const res = await request(app)
      .put(`/api/lots/${lotId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Central Park Updated', address: '1 Park Ave', city: 'NYC', isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Central Park Updated');
    expect(res.body.isActive).toBe(false);
  });

  it('viewer cannot update a lot', async () => {
    const res = await request(app)
      .put(`/api/lots/${lotId}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ name: 'Hack', address: 'x' });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/lots/:id', () => {
  it('returns 404 when deleting a non-existent lot', async () => {
    const res = await request(app)
      .delete('/api/lots/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it('admin can delete a lot', async () => {
    const res = await request(app)
      .delete(`/api/lots/${lotId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  it('lot is gone after deletion', async () => {
    const res = await request(app)
      .get(`/api/lots/${lotId}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(404);
  });
});


