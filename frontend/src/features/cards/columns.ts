import type { Card, Column } from './cardsTypes';

export const COLUMNS: Array<{ id: Column; title: string }> = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'DONE', title: 'Done' },
];

export function getCardsByColumn(cards: Card[], column: Column): Card[] {
  return cards
    .filter((card) => card.column === column)
    .sort((a, b) => a.position - b.position);
}
