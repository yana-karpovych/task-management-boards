import { Router } from 'express';
import * as boardsController from '../controllers/boards.controller.js';
import * as cardsController from '../controllers/cards.controller.js';

export const boardsRouter = Router();

boardsRouter.post('/', boardsController.createBoard);
boardsRouter.post('/:boardId/cards', cardsController.createCard);
boardsRouter.get('/:id', boardsController.getBoard);
boardsRouter.patch('/:id', boardsController.updateBoard);
boardsRouter.delete('/:id', boardsController.deleteBoard);
