import type { Card, Column as ColumnId } from './cardsTypes';
import { COLUMNS, getCardsByColumn } from './columns';

export type DropTarget = {
  column: ColumnId;
  position: number;
};

function isColumnId(value: string): value is ColumnId {
  return COLUMNS.some((column) => column.id === value);
}

export function resolveDropTarget(
  cards: Card[],
  activeId: string,
  overId: string,
): DropTarget | null {
  const activeCard = cards.find((card) => card.id === activeId);
  if (!activeCard || activeId === overId) {
    return null;
  }

  if (isColumnId(overId)) {
    if (overId === activeCard.column) {
      return null;
    }

    return {
      column: overId,
      position: getCardsByColumn(cards, overId).length,
    };
  }

  const overCard = cards.find((card) => card.id === overId);
  if (!overCard) {
    return null;
  }

  const targetColumn = overCard.column;
  const position = getCardsByColumn(cards, targetColumn).findIndex(
    (card) => card.id === overId,
  );

  if (position < 0) {
    return null;
  }

  if (targetColumn === activeCard.column && position === activeCard.position) {
    return null;
  }

  return { column: targetColumn, position };
}
