import { describe, expect, it } from 'vitest';
import type { Card, Column } from './cardsTypes';
import { resolveDropTarget } from './dnd';

function makeCard(id: string, column: Column, position: number): Card {
  return {
    id,
    boardId: 'board-1',
    title: id,
    description: '',
    column,
    position,
    createdAt: '',
    updatedAt: '',
  };
}

const cards: Card[] = [
  makeCard('a', 'TODO', 0),
  makeCard('b', 'TODO', 1),
  makeCard('c', 'TODO', 2),
  makeCard('x', 'DONE', 0),
];

describe('resolveDropTarget', () => {
  it('moves a card down within its column', () => {
    expect(resolveDropTarget(cards, 'a', 'c')).toEqual({
      column: 'TODO',
      position: 2,
    });
  });

  it('moves a card up within its column', () => {
    expect(resolveDropTarget(cards, 'c', 'a')).toEqual({
      column: 'TODO',
      position: 0,
    });
  });

  it('drops a card before the card it was released on in another column', () => {
    expect(resolveDropTarget(cards, 'a', 'x')).toEqual({
      column: 'DONE',
      position: 0,
    });
  });

  it('appends the card when dropped on an empty column', () => {
    expect(resolveDropTarget(cards, 'a', 'IN_PROGRESS')).toEqual({
      column: 'IN_PROGRESS',
      position: 0,
    });
  });

  it('appends the card when dropped on another column area', () => {
    expect(resolveDropTarget(cards, 'a', 'DONE')).toEqual({
      column: 'DONE',
      position: 1,
    });
  });

  it('ignores a drop on the card itself', () => {
    expect(resolveDropTarget(cards, 'a', 'a')).toBeNull();
  });

  it('ignores a drop on the column the card already belongs to', () => {
    expect(resolveDropTarget(cards, 'a', 'TODO')).toBeNull();
  });

  it('ignores an unknown active card', () => {
    expect(resolveDropTarget(cards, 'missing', 'a')).toBeNull();
  });
});
