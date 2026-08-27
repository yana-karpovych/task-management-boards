import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { prisma } from './lib/prisma.js';

const app = createApp();
const createdBoardIds: string[] = [];

afterEach(async () => {
  if (createdBoardIds.length === 0) {
    return;
  }

  await prisma.board.deleteMany({
    where: { id: { in: [...createdBoardIds] } },
  });
  createdBoardIds.length = 0;
});

describe('Boards API', () => {
  it('creates a board', async () => {
    const res = await request(app)
      .post('/api/boards')
      .send({ name: 'API Board' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'API Board' });
    expect(res.body.id).toEqual(expect.any(String));
    createdBoardIds.push(res.body.id);
  });

  it('gets a board by id with cards', async () => {
    const created = await request(app)
      .post('/api/boards')
      .send({ name: 'Readable Board' });
    createdBoardIds.push(created.body.id);

    const res = await request(app).get(`/api/boards/${created.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: created.body.id,
      name: 'Readable Board',
      cards: [],
    });
  });

  it('rejects invalid board create payload', async () => {
    const res = await request(app).post('/api/boards').send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Name is required' });
  });

  it('returns 404 for unknown board id', async () => {
    const res = await request(app).get('/api/boards/missing-board-id');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Board not found' });
  });

  it('deletes a board', async () => {
    const created = await request(app)
      .post('/api/boards')
      .send({ name: 'Disposable Board' });
    const boardId = created.body.id as string;

    const deleted = await request(app).delete(`/api/boards/${boardId}`);
    expect(deleted.status).toBe(204);

    const missing = await request(app).get(`/api/boards/${boardId}`);
    expect(missing.status).toBe(404);
  });
});
