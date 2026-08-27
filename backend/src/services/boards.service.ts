import { nanoid } from 'nanoid';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import type {
  CreateBoardInput,
  UpdateBoardInput,
} from '../schemas/boards.schema.js';

export async function createBoard(input: CreateBoardInput) {
  return prisma.board.create({
    data: {
      id: nanoid(),
      name: input.name,
    },
  });
}

export async function getBoardById(id: string) {
  const board = await prisma.board.findUnique({
    where: { id },
    include: {
      cards: {
        orderBy: [{ column: 'asc' }, { position: 'asc' }],
      },
    },
  });

  if (!board) {
    throw new AppError('Board not found', 404);
  }

  return board;
}

export async function updateBoard(id: string, input: UpdateBoardInput) {
  try {
    return await prisma.board.update({
      where: { id },
      data: { name: input.name },
    });
  } catch {
    throw new AppError('Board not found', 404);
  }
}

export async function deleteBoard(id: string) {
  try {
    await prisma.board.delete({ where: { id } });
  } catch {
    throw new AppError('Board not found', 404);
  }
}