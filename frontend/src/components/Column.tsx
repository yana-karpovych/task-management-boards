import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CardItem } from './CardItem';
import styles from './Column.module.css';
import type { Card, Column as ColumnId } from '../features/cards/cardsTypes';

type ColumnProps = {
  id: ColumnId;
  title: string;
  cards: Card[];
  deletingCardId: string | null;
  onAddCard: (column: ColumnId) => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (card: Card) => void;
};

export function Column({
  id,
  title,
  cards,
  deletingCardId,
  onAddCard,
  onEditCard,
  onDeleteCard,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section
      ref={setNodeRef}
      className={styles.column}
      aria-label={title}
      data-over={isOver ? 'true' : undefined}
    >
      <div className={styles.heading}>
        <h2>{title}</h2>
        <span className={styles.count}>{cards.length}</span>
      </div>

      <SortableContext
        items={cards.map((card) => card.id)}
        strategy={verticalListSortingStrategy}
      >
        {cards.length === 0 ? (
          <p className={styles.empty}>No cards yet</p>
        ) : (
          <ul className={styles.list}>
            {cards.map((card) => (
              <li key={card.id}>
                <CardItem
                  card={card}
                  isDeleting={deletingCardId === card.id}
                  onEdit={onEditCard}
                  onDelete={onDeleteCard}
                />
              </li>
            ))}
          </ul>
        )}
      </SortableContext>

      <button
        type="button"
        className={styles.add}
        onClick={() => onAddCard(id)}
        aria-label={`Add card to ${title}`}
      >
        + Add card
      </button>
    </section>
  );
}
