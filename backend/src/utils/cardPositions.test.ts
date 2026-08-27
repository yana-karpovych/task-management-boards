import { describe, expect, it } from 'vitest';
import {
  clampPosition,
  insertIntoColumn,
  reorderWithinColumn,
  withContiguousPositions,
} from './cardPositions.js';

describe('cardPositions', () => {
  it('clamps position into valid range', () => {
    expect(clampPosition(-1, 2)).toBe(0);
    expect(clampPosition(0, 2)).toBe(0);
    expect(clampPosition(1, 2)).toBe(1);
    expect(clampPosition(5, 2)).toBe(2);
  });

  it('reorders within a column (C moves to position 1)', () => {
    const cards = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];

    const reordered = withContiguousPositions(
      reorderWithinColumn(cards, 'C', 1),
    );

    expect(reordered.map((card) => [card.id, card.position])).toEqual([
      ['A', 0],
      ['C', 1],
      ['B', 2],
    ]);
  });

  it('reorders within a column (A moves to the end)', () => {
    const cards = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];

    const reordered = withContiguousPositions(
      reorderWithinColumn(cards, 'A', 2),
    );

    expect(reordered.map((card) => [card.id, card.position])).toEqual([
      ['B', 0],
      ['C', 1],
      ['A', 2],
    ]);
  });

  it('inserts into another column at position 0', () => {
    const target = [{ id: 'X' }, { id: 'Y' }];
    const moving = { id: 'C' };

    const next = withContiguousPositions(insertIntoColumn(target, moving, 0));

    expect(next.map((card) => [card.id, card.position])).toEqual([
      ['C', 0],
      ['X', 1],
      ['Y', 2],
    ]);
  });

  it('inserts into another column at the end', () => {
    const target = [{ id: 'X' }, { id: 'Y' }];
    const moving = { id: 'C' };

    const next = withContiguousPositions(insertIntoColumn(target, moving, 99));

    expect(next.map((card) => [card.id, card.position])).toEqual([
      ['X', 0],
      ['Y', 1],
      ['C', 2],
    ]);
  });

  it('normalizes source column after removal (contiguous from 0)', () => {
    const sourceAfterRemoval = [{ id: 'A' }, { id: 'B' }];
    const normalized = withContiguousPositions(sourceAfterRemoval);

    expect(normalized.map((card) => card.position)).toEqual([0, 1]);
  });
});
