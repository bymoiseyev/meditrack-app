import 'dotenv/config';
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';

// Seed credentials
const NURSE        = { email: 'nurse@meditrack.se',       password: 'nurse123' };
const PHARMACIST   = { email: 'pharmacist@meditrack.se',  password: 'pharmacist123' };

// ─── Authentication ───────────────────────────────────────────────────────────

describe('Authentication', () => {

  it('returns a token when logging in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(NURSE);

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('returns 401 when password is wrong', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: NURSE.email, password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('returns 401 when accessing a protected route without a token', async () => {
    const res = await request(app).get('/api/medications');

    expect(res.status).toBe(401);
  });

});

// ─── Role-based access ────────────────────────────────────────────────────────

describe('Role-based access', () => {
  let nurseToken: string;
  let pharmacistToken: string;

  beforeAll(async () => {
    const [nurseRes, pharmacistRes] = await Promise.all([
      request(app).post('/api/auth/login').send(NURSE),
      request(app).post('/api/auth/login').send(PHARMACIST),
    ]);
    nurseToken      = nurseRes.body.token;
    pharmacistToken = pharmacistRes.body.token;
  });

  it('returns 403 when a nurse tries to advance an order status', async () => {
    // Role check fires before any DB lookup, so the order ID does not need to exist
    const res = await request(app)
      .patch('/api/orders/1/status')
      .set('Authorization', `Bearer ${nurseToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 403 when an Apotekare tries to delete a medication', async () => {
    // Only Admin can delete — Apotekare is blocked at the role middleware
    const res = await request(app)
      .delete('/api/medications/1')
      .set('Authorization', `Bearer ${pharmacistToken}`);

    expect(res.status).toBe(403);
  });

});
