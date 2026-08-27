import { Router } from 'express';
import * as cardsController from '../controllers/cards.controller.js';

export const cardsRouter = Router();

cardsRouter.patch('/:id/move', cardsController.moveCard);
cardsRouter.patch('/:id', cardsController.updateCard);
cardsRouter.delete('/:id', cardsController.deleteCard);
