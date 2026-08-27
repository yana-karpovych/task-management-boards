import { Router } from 'express';
import * as boardsController from '../controllers/boards.controller.js';

export const boardsRouter = Router();

boardsRouter.post('/', boardsController.createBoard);
boardsRouter.get('/:id', boardsController.getBoard);
boardsRouter.patch('/:id', boardsController.updateBoard);
boardsRouter.delete('/:id', boardsController.deleteBoard);