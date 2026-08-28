import { useState, type FormEvent } from 'react';
import styles from './Modal.module.css';
import type { Card } from '../features/cards/cardsTypes';

export type CardFormValues = {
  title: string;
  description: string;
};

type CardFormModalProps = {
  mode: 'create' | 'edit';
  columnTitle: string;
  card?: Card;
  isSaving: boolean;
  onSubmit: (values: CardFormValues) => Promise<void>;
  onCancel: () => void;
};

export function CardFormModal({
  mode,
  columnTitle,
  card,
  isSaving,
  onSubmit,
  onCancel,
}: CardFormModalProps) {
  const [title, setTitle] = useState(card?.title ?? '');
  const [description, setDescription] = useState(card?.description ?? '');
  const [error, setError] = useState('');

  const heading =
    mode === 'create' ? `Add card to ${columnTitle}` : 'Edit card';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title is required');
      return;
    }

    setError('');

    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim(),
      });
    } catch {
      setError('Could not save the card. Please try again.');
    }
  }

  return (
    <div className={styles.backdrop}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={heading}
      >
        <h2>{heading}</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="card-title">
            Title
          </label>
          <input
            id="card-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
          />

          <label className={styles.label} htmlFor="card-description">
            Description
          </label>
          <textarea
            id="card-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
          />

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button type="button" onClick={onCancel} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
