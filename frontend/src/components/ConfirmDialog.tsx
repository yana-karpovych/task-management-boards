import styles from './Modal.module.css';

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className={styles.backdrop}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <h2>{title}</h2>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button type="button" onClick={onConfirm} disabled={isBusy}>
            {isBusy ? 'Working...' : confirmLabel}
          </button>
          <button type="button" onClick={onCancel} disabled={isBusy}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
