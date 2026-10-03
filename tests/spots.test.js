const request = require('supertest');
const app = require('../src/app');
const { clearTables, closePool } = require('./helpers/db');

let adminToken;
let operatorToken;
let viewerToken;
let lotId;
let spotId;

beforeAll(async () => {
  await clearTables();

  const admin = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Admin', email: 'admin@test.com', password: 'secret123', role: 'admin' });
  adminToken = admin.body.token;

  const operator = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Op', email: 'operator@test.com', password: 'secret123', role: 'operator' });
  operatorToken = operator.body.token;

  const viewer = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Viewer', email: 'viewer@test.com', password: 'secret123', role: 'viewer' });
  viewerToken = viewer.body.token;

  const lot = await request(app)
    .post('/api/lots')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ name: 'Test Lot', address: '1 Test St' });
  lotId = lot.body.id;
});

afterAll(async () => { await clearTables(); await closePool(); });

describe('GET /api/spots?lotId=', () => {
  it('returns empty array when lot has no spots', async () => {
    const res = await request(app)
      .get(`/api/spots?lotId=${lotId}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/spots');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/spots', () => {
  it('admin can create a spot', async () => {
    const res = await request(app)
      .post('/api/spots')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ lotId, spotNumber: 'A1', spotType: 'standard', status: 'available' });

    expect(res.status).toBe(201);
    expect(res.body.spotNumber).toBe('A1');
    expect(res.body.status).toBe('available');
    expect(res.body.lotId).toBe(lotId);
    spotId = res.body.id;
  });

  it('lot total_spots increments after adding a spot', async () => {
    const res = await request(app)
      .get(`/api/lots/${lotId}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.body.totalSpots).toBe(1);
  });

  it('operator cannot create a spot', async () => {
    const res = await request(app)
      .post('/api/spots')
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({ lotId, spotNumber: 'B1', spotType: 'standard', status: 'available' });

    expect(res.status).toBe(403);
  });

  it('returns 409 for duplicate spot number in the same lot', async () => {
    const res = await request(app)
      .post('/api/spots')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ lotId, spotNumber: 'A1', spotType: 'standard', status: 'available' });

    expect(res.status).toBe(409);
  });

  it('returns 422 for missing lotId', async () => {
    const res = await request(app)
      .post('/api/spots')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ spotNumber: 'C1' });

    expect(res.status).toBe(422);
  });
});

describe('GET /api/spots/:id', () => {
  it('returns the spot with lotName', async () => {
    const res = await request(app)
      .get(`/api/spots/${spotId}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(spotId);
    expect(res.body.lotName).toBe('Test Lot');
  });

  it('returns 404 for a non-existent spot', async () => {
    const res = await request(app)
      .get('/api/spots/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/spots/:id/status', () => {
  it('operator can change spot status', async () => {
    const res = await request(app)
      .patch(`/api/spots/${spotId}/status`)
      .set('Authorization', `Bearer ${operatorToken}`)
      .send({ status: 'occupied' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('occupied');
  });

  it('viewer cannot change status', async () => {
    const res = await request(app)
      .patch(`/api/spots/${spotId}/status`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ status: 'available' });

    expect(res.status).toBe(403);
  });

  it('returns 422 for an invalid status value', async () => {
    const res = await request(app)
      .patch(`/api/spots/${spotId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'on_fire' });

    expect(res.status).toBe(422);
  });
});

describe('PUT /api/spots/:id', () => {
  it('admin can fully update a spot', async () => {
    const res = await request(app)
      .put(`/api/spots/${spotId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ lotId, spotNumber: 'A1-Updated', spotType: 'ev_charging', status: 'maintenance', sensorId: 'SENS-001' });

    expect(res.status).toBe(200);
    expect(res.body.spotNumber).toBe('A1-Updated');
    expect(res.body.spotType).toBe('ev_charging');
    expect(res.body.sensorId).toBe('SENS-001');
  });
});

describe('DELETE /api/spots/:id', () => {
  it('admin can delete a spot', async () => {
    const res = await request(app)
      .delete(`/api/spots/${spotId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);
  });

  it('lot total_spots decrements after deletion', async () => {
    const res = await request(app)
      .get(`/api/lots/${lotId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.body.totalSpots).toBe(0);
  });

  it('spot is gone after deletion', async () => {
    const res = await request(app)
      .get(`/api/spots/${spotId}`)
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(404);
  });

  it('returns 404 when deleting a non-existent spot', async () => {
    const res = await request(app)
      .delete('/api/spots/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});


