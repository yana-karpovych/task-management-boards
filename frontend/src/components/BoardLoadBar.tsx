import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FormRow.module.css';

export function BoardLoadBar() {
  const navigate = useNavigate();
  const [boardId, setBoardId] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedId = boardId.trim();
    if (!trimmedId) {
      setError('Board ID is required');
      return;
    }

    setError('');
    navigate(`/boards/${trimmedId}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.row}>
        <label className="srOnly" htmlFor="board-id">
          Board ID
        </label>
        <input
          id="board-id"
          className={styles.input}
          value={boardId}
          onChange={(event) => setBoardId(event.target.value)}
          placeholder="Enter a Board ID here"
        />
        <button type="submit" className={styles.button}>
          Load
        </button>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
