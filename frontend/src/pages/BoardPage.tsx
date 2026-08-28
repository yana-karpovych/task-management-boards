import { useState } from 'react';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BoardHeader } from '../components/BoardHeader';
import { BoardLoadBar } from '../components/BoardLoadBar';
import {
  CardFormModal,
  type CardFormValues,
} from '../components/CardFormModal';
import { CardPreview } from '../components/CardItem';
import { Column } from '../components/Column';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  useCreateCardMutation,
  useDeleteBoardMutation,
  useDeleteCardMutation,
  useGetBoardQuery,
  useMoveCardMutation,
  useUpdateBoardMutation,
  useUpdateCardMutation,
} from '../features/boards/boardsApi';
import type { Card, Column as ColumnId } from '../features/cards/cardsTypes';
import { COLUMNS, getCardsByColumn } from '../features/cards/columns';
import { resolveDropTarget } from '../features/cards/dnd';
import styles from './BoardPage.module.css';

type CardEditor =
  { mode: 'create'; column: ColumnId } | { mode: 'edit'; card: Card };

function getBoardErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    (error as { status?: number | string }).status === 404
  ) {
    return 'Board not found. Check the board ID and try again.';
  }

  return 'Could not load this board. Please try again.';
}

export function BoardPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

  const { data, error, isLoading, isError } = useGetBoardQuery(id, {
    skip: !id,
  });
  const [updateBoard, { isLoading: isRenaming }] = useUpdateBoardMutation();
  const [deleteBoard, { isLoading: isDeletingBoard }] =
    useDeleteBoardMutation();
  const [deleteCard] = useDeleteCardMutation();
  const [createCard, { isLoading: isCreatingCard }] = useCreateCardMutation();
  const [updateCard, { isLoading: isUpdatingCard }] = useUpdateCardMutation();
  const [moveCard] = useMoveCardMutation();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [isDeleteBoardOpen, setIsDeleteBoardOpen] = useState(false);
  const [cardPendingDelete, setCardPendingDelete] = useState<Card | null>(null);
  const [cardEditor, setCardEditor] = useState<CardEditor | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  if (!id) {
    return (
      <main className={styles.state}>
        <p>Board ID is missing.</p>
        <Link className="linkButton" to="/">
          Go back to home page
        </Link>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className={styles.state}>
        <p className={styles.muted}>Loading board…</p>
      </main>
    );
  }

  if (isError || !data) {
    return (
      <main className={styles.state}>
        <h1>Board unavailable</h1>
        <p className={styles.error}>{getBoardErrorMessage(error)}</p>
        <Link className="linkButton" to="/">
          Go back to home page
        </Link>
      </main>
    );
  }

  const cards = data.cards ?? [];
  const draggedCard = cards.find((card) => card.id === draggedCardId);

  async function handleRename(name: string) {
    setActionError('');
    await updateBoard({ id, body: { name } }).unwrap();
  }

  async function handleDeleteBoard() {
    setActionError('');

    try {
      await deleteBoard(id).unwrap();
      navigate('/');
    } catch {
      setIsDeleteBoardOpen(false);
      setActionError('Could not delete the board. Please try again.');
    }
  }

  async function handleDeleteCard() {
    if (!cardPendingDelete) {
      return;
    }

    setActionError('');

    try {
      await deleteCard({ id: cardPendingDelete.id, boardId: id }).unwrap();
    } catch {
      setActionError('Could not delete the card. Please try again.');
    } finally {
      setCardPendingDelete(null);
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setDraggedCardId(String(event.active.id));
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDraggedCardId(null);

    if (!over) {
      return;
    }

    const target = resolveDropTarget(cards, String(active.id), String(over.id));
    if (!target) {
      return;
    }

    setActionError('');

    try {
      await moveCard({
        id: String(active.id),
        boardId: id,
        body: target,
      }).unwrap();
    } catch {
      setActionError('Could not move the card. Please try again.');
    }
  }

  async function handleSubmitCard(values: CardFormValues) {
    if (!cardEditor) {
      return;
    }

    setActionError('');

    if (cardEditor.mode === 'create') {
      await createCard({
        boardId: id,
        body: { ...values, column: cardEditor.column },
      }).unwrap();
    } else {
      await updateCard({
        id: cardEditor.card.id,
        boardId: id,
        body: values,
      }).unwrap();
    }

    setCardEditor(null);
  }

  return (
    <main className={styles.page}>
      <BoardLoadBar />

      <BoardHeader
        boardId={data.id}
        name={data.name}
        isRenaming={isRenaming}
        onRename={handleRename}
        onRequestDelete={() => setIsDeleteBoardOpen(true)}
      />

      {actionError && (
        <p className={styles.error} role="alert">
          {actionError}
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setDraggedCardId(null)}
      >
        <div className={styles.board}>
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              title={column.title}
              cards={getCardsByColumn(cards, column.id)}
              deletingCardId={cardPendingDelete?.id ?? null}
              onAddCard={(columnId) =>
                setCardEditor({ mode: 'create', column: columnId })
              }
              onEditCard={(card) => setCardEditor({ mode: 'edit', card })}
              onDeleteCard={setCardPendingDelete}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {draggedCard && <CardPreview card={draggedCard} />}
        </DragOverlay>
      </DndContext>

      <Link className={`linkButton ${styles.back}`} to="/">
        Go back to home page
      </Link>

      {isDeleteBoardOpen && (
        <ConfirmDialog
          title="Delete board"
          message="This will permanently delete the board and all of its cards."
          confirmLabel="Delete board"
          isBusy={isDeletingBoard}
          onConfirm={handleDeleteBoard}
          onCancel={() => setIsDeleteBoardOpen(false)}
        />
      )}

      {cardEditor && (
        <CardFormModal
          key={
            cardEditor.mode === 'edit' ? cardEditor.card.id : cardEditor.column
          }
          mode={cardEditor.mode}
          columnTitle={
            COLUMNS.find(
              (column) =>
                column.id ===
                (cardEditor.mode === 'create'
                  ? cardEditor.column
                  : cardEditor.card.column),
            )?.title ?? ''
          }
          card={cardEditor.mode === 'edit' ? cardEditor.card : undefined}
          isSaving={isCreatingCard || isUpdatingCard}
          onSubmit={handleSubmitCard}
          onCancel={() => setCardEditor(null)}
        />
      )}

      {cardPendingDelete && (
        <ConfirmDialog
          title="Delete card"
          message={`Delete "${cardPendingDelete.title}"?`}
          confirmLabel="Delete card"
          onConfirm={handleDeleteCard}
          onCancel={() => setCardPendingDelete(null)}
        />
      )}
    </main>
  );
}
