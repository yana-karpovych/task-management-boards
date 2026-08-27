import { Link, useParams } from 'react-router-dom';
import { useGetBoardQuery } from '../features/boards/boardsApi';

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
  const { data, error, isLoading, isError } = useGetBoardQuery(id, {
    skip: !id,
  });

  if (!id) {
    return (
      <main>
        <p>Board ID is missing.</p>
        <Link to="/">Back to home</Link>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main>
        <p>Loading board…</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main>
        <h1>Board unavailable</h1>
        <p>{getBoardErrorMessage(error)}</p>
        <Link to="/">Back to home</Link>
      </main>
    );
  }

  return (
    <main>
      <h1>{data?.name}</h1>
      <p>Board ID: {data?.id}</p>
      <p>Cards: {data?.cards?.length ?? 0}</p>
      <Link to="/">Back to home</Link>
    </main>
  );
}
