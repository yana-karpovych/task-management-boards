import { nanoid } from 'nanoid';
import type { Column, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type {
  CreateCardInput,
  MoveCardInput,
  UpdateCardInput,
} from '../schemas/cards.schema.js';
import {
  insertIntoColumn,
  reorderWithinColumn,
  withContiguousPositions,
} from '../utils/cardPositions.js';

async function assertBoardExists(boardId: string) {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) {
    throw new AppError('Board not found', 404);
  }
}

async function getCardOrThrow(id: string) {
  const card = await prisma.card.findUnique({ where: { id } });
  if (!card) {
    throw new AppError('Card not found', 404);
  }
  return card;
}

async function applyPositions(
  tx: Prisma.TransactionClient,
  cards: Array<{ id: string; position: number; column?: Column }>,
  column?: Column,
) {
  for (const card of cards) {
    await tx.card.update({
      where: { id: card.id },
      data: {
        position: card.position,
        ...(column ? { column } : {}),
      },
    });
  }
}

async function normalizeColumn(
  tx: Prisma.TransactionClient,
  boardId: string,
  column: Column,
) {
  const cards = await tx.card.findMany({
    where: { boardId, column },
    orderBy: { position: 'asc' },
  });

  await applyPositions(tx, withContiguousPositions(cards));
}

export async function createCard(boardId: string, input: CreateCardInput) {
  await assertBoardExists(boardId);

  const position = await prisma.card.count({
    where: { boardId, column: input.column },
  });

  return prisma.card.create({
    data: {
      id: nanoid(),
      boardId,
      title: input.title,
      description: input.description,
      column: input.column,
      position,
    },
  });
}

export async function updateCard(id: string, input: UpdateCardInput) {
  await getCardOrThrow(id);

  return prisma.card.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
    },
  });
}

export async function deleteCard(id: string) {
  const card = await getCardOrThrow(id);

  await prisma.$transaction(async (tx) => {
    await tx.card.delete({ where: { id } });
    await normalizeColumn(tx, card.boardId, card.column);
  });
}

export async function moveCard(id: string, input: MoveCardInput) {
  const card = await getCardOrThrow(id);
  const { column: targetColumn, position: targetPosition } = input;

  return prisma.$transaction(async (tx) => {
    const sourceColumn = card.column;

    if (sourceColumn === targetColumn) {
      const cards = await tx.card.findMany({
        where: { boardId: card.boardId, column: sourceColumn },
        orderBy: { position: 'asc' },
      });

      const reordered = withContiguousPositions(
        reorderWithinColumn(cards, card.id, targetPosition),
      );
      await applyPositions(tx, reordered);
    } else {
      await tx.card.update({
        where: { id: card.id },
        data: {
          column: targetColumn,
          position: -1,
        },
      });

      await normalizeColumn(tx, card.boardId, sourceColumn);

      const targetCards = await tx.card.findMany({
        where: {
          boardId: card.boardId,
          column: targetColumn,
          NOT: { id: card.id },
        },
        orderBy: { position: 'asc' },
      });

      const inserted = withContiguousPositions(
        insertIntoColumn(targetCards, { ...card, column: targetColumn }, targetPosition),
      );
      await applyPositions(tx, inserted, targetColumn);
    }

    const updated = await tx.card.findUnique({ where: { id: card.id } });
    if (!updated) {
      throw new AppError('Card not found', 404);
    }
    return updated;
  });
}
