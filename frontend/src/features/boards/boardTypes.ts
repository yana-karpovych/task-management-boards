import type { Card } from '../cards/cardsTypes';

export type Board = {
  id: string;
  name: string;
  createdAt: string;
  cards?: Card[];
};

export type CreateBoardRequest = {
  name: string;
};

export type UpdateBoardRequest = {
  name: string;
};
