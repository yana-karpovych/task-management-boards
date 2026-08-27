import type { NextFunction, Request, Response } from 'express';
import {
  createCardSchema,
  moveCardSchema,
  updateCardSchema,
} from '../schemas/cards.schema.js';
import * as cardsService from '../services/cards.service.js';
import { parseBody } from '../utils/validate.js';

function getParam(req: Request, name: string): string {
  const value = req.params[name];
  return Array.isArray(value) ? value[0]! : value!;
}

export async function createCard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = parseBody(createCardSchema, req.body);
    const card = await cardsService.createCard(getParam(req, 'boardId'), input);
    res.status(201).json(card);
  } catch (error) {
    next(error);
  }
}

export async function updateCard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = parseBody(updateCardSchema, req.body);
    const card = await cardsService.updateCard(getParam(req, 'id'), input);
    res.status(200).json(card);
  } catch (error) {
    next(error);
  }
}

export async function moveCard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const input = parseBody(moveCardSchema, req.body);
    const card = await cardsService.moveCard(getParam(req, 'id'), input);
    res.status(200).json(card);
  } catch (error) {
    next(error);
  }
}

export async function deleteCard(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await cardsService.deleteCard(getParam(req, 'id'));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
