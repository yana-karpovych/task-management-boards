import type { NextFunction, Request, Response } from 'express';
import {
  createBoardSchema,
  updateBoardSchema,
} from '../schemas/boards.schema.js';
import * as boardsService from '../services/boards.service.js';
import { parseBody } from '../utils/validate.js';

function getIdParam(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0]! : id!;
}

export async function createBoard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = parseBody(createBoardSchema, req.body);
    const board = await boardsService.createBoard(input);
    res.status(201).json(board);
  } catch (error) {
    next(error);
  }
}

export async function getBoard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const board = await boardsService.getBoardById(getIdParam(req));
    res.status(200).json(board);
  } catch (error) {
    next(error);
  }
}

export async function updateBoard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = parseBody(updateBoardSchema, req.body);
    const board = await boardsService.updateBoard(getIdParam(req), input);
    res.status(200).json(board);
  } catch (error) {
    next(error);
  }
}

export async function deleteBoard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await boardsService.deleteBoard(getIdParam(req));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
