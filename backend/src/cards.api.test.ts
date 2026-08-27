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

async function createBoard(name = 'Cards Board') {
  const res = await request(app).post('/api/boards').send({ name });
  createdBoardIds.push(res.body.id);
  return res.body.id as string;
}

describe('Cards API', () => {
  it('creates a card on a board', async () => {
    const boardId = await createBoard();

    const res = await request(app)
      .post(`/api/boards/${boardId}/cards`)
      .send({ title: 'First card', description: 'details' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      boardId,
      title: 'First card',
      description: 'details',
      column: 'TODO',
      position: 0,
    });
  });

  it('rejects card create without title', async () => {
    const boardId = await createBoard();

    const res = await request(app)
      .post(`/api/boards/${boardId}/cards`)
      .send({ title: '' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Title is required' });
  });

  it('moves and reorders cards between columns', async () => {
    const boardId = await createBoard();

    const first = await request(app)
      .post(`/api/boards/${boardId}/cards`)
      .send({ title: 'A' });
    const second = await request(app)
      .post(`/api/boards/${boardId}/cards`)
      .send({ title: 'B' });

    const moved = await request(app)
      .patch(`/api/cards/${second.body.id}/move`)
      .send({ column: 'IN_PROGRESS', position: 0 });

    expect(moved.status).toBe(200);
    expect(moved.body).toMatchObject({
      id: second.body.id,
      column: 'IN_PROGRESS',
      position: 0,
    });

    const reordered = await request(app)
      .patch(`/api/cards/${first.body.id}/move`)
      .send({ column: 'TODO', position: 0 });

    expect(reordered.status).toBe(200);

    const board = await request(app).get(`/api/boards/${boardId}`);
    const todoCards = board.body.cards.filter(
      (card: { column: string }) => card.column === 'TODO',
    );
    const inProgressCards = board.body.cards.filter(
      (card: { column: string }) => card.column === 'IN_PROGRESS',
    );

    expect(todoCards).toHaveLength(1);
    expect(todoCards[0]).toMatchObject({ id: first.body.id, position: 0 });
    expect(inProgressCards).toHaveLength(1);
    expect(inProgressCards[0]).toMatchObject({
      id: second.body.id,
      position: 0,
    });
  });

  it('deletes a card and keeps positions contiguous', async () => {
    const boardId = await createBoard();

    const first = await request(app)
      .post(`/api/boards/${boardId}/cards`)
      .send({ title: 'Keep' });
    const second = await request(app)
      .post(`/api/boards/${boardId}/cards`)
      .send({ title: 'Remove' });

    const deleted = await request(app).delete(
      `/api/cards/${second.body.id}`,
    );
    expect(deleted.status).toBe(204);

    const board = await request(app).get(`/api/boards/${boardId}`);
    expect(board.body.cards).toHaveLength(1);
    expect(board.body.cards[0]).toMatchObject({
      id: first.body.id,
      position: 0,
    });
  });
});
