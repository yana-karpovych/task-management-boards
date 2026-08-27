import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';

describe('POST /api/boards', () => {
  it('creates a board', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/boards')
      .send({ name: 'My Board' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'My Board' });
    expect(res.body.id).toEqual(expect.any(String));
  });
});
