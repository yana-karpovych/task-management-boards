export type Column = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type Card = {
  id: string;
  boardId: string;
  title: string;
  description: string;
  column: Column;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateCardRequest = {
  title: string;
  description?: string;
  column?: Column;
};

export type UpdateCardRequest = {
  title?: string;
  description?: string;
};

export type MoveCardRequest = {
  column: Column;
  position: number;
};
