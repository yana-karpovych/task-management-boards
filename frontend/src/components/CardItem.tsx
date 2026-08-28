import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './CardItem.module.css';
import { DeleteIcon, EditIcon } from './icons';
import type { Card } from '../features/cards/cardsTypes';

type CardItemProps = {
  card: Card;
  isDeleting: boolean;
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
};

export function CardPreview({ card }: { card: Card }) {
  return (
    <article className={`${styles.card} ${styles.overlay}`} aria-hidden="true">
      <h3 className={styles.title}>{card.title}</h3>
      {card.description && (
        <p className={styles.description}>{card.description}</p>
      )}

      <div className={styles.actions}>
        <span className="iconButton">
          <EditIcon />
        </span>
        <span className="iconButton">
          <DeleteIcon />
        </span>
      </div>
    </article>
  );
}

export function CardItem({
  card,
  isDeleting,
  onEdit,
  onDelete,
}: CardItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  return (
    <article
      ref={setNodeRef}
      aria-label={card.title}
      className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      <h3 className={styles.title}>{card.title}</h3>

      {card.description && (
        <p className={styles.description}>{card.description}</p>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className="iconButton"
          onClick={() => onEdit(card)}
          aria-label={`Edit card ${card.title}`}
        >
          <EditIcon />
        </button>
        <button
          type="button"
          className="iconButton"
          onClick={() => onDelete(card)}
          disabled={isDeleting}
          aria-label={`Delete card ${card.title}`}
        >
          <DeleteIcon />
        </button>
      </div>
    </article>
  );
}
