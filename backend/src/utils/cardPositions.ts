export function clampPosition(position: number, maxIndex: number): number {
  return Math.min(Math.max(position, 0), maxIndex);
}

export function reorderWithinColumn<T extends { id: string }>(
  cards: T[],
  cardId: string,
  targetPosition: number,
): T[] {
  const moving = cards.find((card) => card.id === cardId);
  if (!moving) {
    return cards;
  }

  const withoutCard = cards.filter((card) => card.id !== cardId);
  const nextPosition = clampPosition(targetPosition, withoutCard.length);
  const reordered = [...withoutCard];
  reordered.splice(nextPosition, 0, moving);
  return reordered;
}

export function insertIntoColumn<T extends { id: string }>(
  cards: T[],
  card: T,
  targetPosition: number,
): T[] {
  const withoutCard = cards.filter((item) => item.id !== card.id);
  const nextPosition = clampPosition(targetPosition, withoutCard.length);
  const nextCards = [...withoutCard];
  nextCards.splice(nextPosition, 0, card);
  return nextCards;
}

export function withContiguousPositions<T extends { id: string }>(
  cards: T[],
): Array<T & { position: number }> {
  return cards.map((card, index) => ({ ...card, position: index }));
}
