import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BoardLoadBar } from '../components/BoardLoadBar';
import formStyles from '../components/FormRow.module.css';
import { CopyIcon } from '../components/icons';
import { useCreateBoardMutation } from '../features/boards/boardsApi';
import styles from './HomePage.module.css';

export function HomePage() {
  const [createBoard, { isLoading: isCreating }] = useCreateBoardMutation();

  const [name, setName] = useState('');
  const [createdBoardId, setCreatedBoardId] = useState('');
  const [createError, setCreateError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setCreateError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setCreateError('Board name is required');
      return;
    }

    try {
      const board = await createBoard({ name: trimmedName }).unwrap();
      setCreatedBoardId(board.id);
      setName('');
    } catch {
      setCreateError('Could not create the board. Please try again.');
    }
  }

  async function handleCopyId() {
    try {
      await navigator.clipboard.writeText(createdBoardId);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      setCreateError('Could not copy the board ID. Copy it manually.');
    }
  }

  return (
    <main className={styles.page}>
      <h1>Task Management Boards</h1>

      <div className={styles.actions}>
        <BoardLoadBar />

        <form onSubmit={handleCreate}>
          <div className={formStyles.row}>
            <label className="srOnly" htmlFor="board-name">
              Board name
            </label>
            <input
              id="board-name"
              className={formStyles.input}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter a Board Name here"
            />
            <button
              type="submit"
              className={formStyles.button}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
          {createError && (
            <p className={formStyles.error} role="alert">
              {createError}
            </p>
          )}
        </form>
      </div>

      {createdBoardId && (
        <section className={styles.created} role="status">
          <p>Board created successfully.</p>
          <p className={styles.meta}>
            Board ID: <span className={styles.boardId}>{createdBoardId}</span>
            <button
              type="button"
              className="iconButton"
              onClick={handleCopyId}
              aria-label="Copy board ID"
            >
              <CopyIcon />
            </button>
            {isCopied && <span className={styles.copied}>Copied</span>}
          </p>
          <Link className="linkButton" to={`/boards/${createdBoardId}`}>
            Open Board
          </Link>
        </section>
      )}
    </main>
  );
}
