import { useState, type FormEvent } from 'react';
import styles from './BoardHeader.module.css';
import { CopyIcon, DeleteIcon, EditIcon } from './icons';

type BoardHeaderProps = {
  boardId: string;
  name: string;
  isRenaming: boolean;
  onRename: (name: string) => Promise<void>;
  onRequestDelete: () => void;
};

export function BoardHeader({
  boardId,
  name,
  isRenaming,
  onRename,
  onRequestDelete,
}: BoardHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  function startEditing() {
    setDraftName(name);
    setError('');
    setIsEditing(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmed = draftName.trim();
    if (!trimmed) {
      setError('Board name is required');
      return;
    }

    try {
      await onRename(trimmed);
      setIsEditing(false);
    } catch {
      setError('Could not rename the board. Please try again.');
    }
  }

  async function handleCopyId() {
    try {
      await navigator.clipboard.writeText(boardId);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setError('Could not copy the board ID. Copy it manually.');
    }
  }

  return (
    <header className={styles.header}>
      {isEditing ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className="srOnly" htmlFor="board-rename">
            Board name
          </label>
          <input
            id="board-rename"
            className={styles.input}
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
          />
          <button type="submit" disabled={isRenaming}>
            {isRenaming ? 'Saving...' : 'Save name'}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            disabled={isRenaming}
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className={styles.field}>
          <span className={styles.label}>Board name</span>
          <h1 className={styles.title}>{name}</h1>
        </div>
      )}

      <div className={`${styles.field} ${styles.idField}`}>
        <span className={styles.label}>Board ID</span>
        <div className={styles.idValue}>
          <span className={styles.boardId}>{boardId}</span>
          <button
            type="button"
            className="iconButton"
            onClick={handleCopyId}
            aria-label="Copy board ID"
          >
            <CopyIcon />
          </button>
          {isCopied && <span className={styles.copied}>Copied</span>}
        </div>
      </div>

      {!isEditing && (
        <div className={styles.actions}>
          <button
            type="button"
            className="iconButton"
            onClick={startEditing}
            aria-label="Rename board"
          >
            <EditIcon size={18} />
          </button>
          <button
            type="button"
            className="iconButton"
            onClick={onRequestDelete}
            aria-label="Delete board"
          >
            <DeleteIcon size={18} />
          </button>
        </div>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </header>
  );
}
