import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { routes } from '../app/router';
import { setupStore } from '../app/store';

const board = {
  id: 'board-1',
  name: 'Sprint board',
  createdAt: new Date().toISOString(),
  cards: [
    {
      id: 'card-1',
      boardId: 'board-1',
      title: 'Write docs',
      description: 'Explain the API',
      column: 'TODO',
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'card-2',
      boardId: 'board-1',
      title: 'Ship feature',
      description: '',
      column: 'DONE',
      position: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

function renderBoardPage() {
  const router = createMemoryRouter(routes, {
    initialEntries: ['/boards/board-1'],
  });

  render(
    <Provider store={setupStore()}>
      <RouterProvider router={router} />
    </Provider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('BoardPage', () => {
  it('renders the three fixed columns with their cards', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(board), { status: 200 })),
    );

    renderBoardPage();

    expect(
      await screen.findByRole('heading', { name: /sprint board/i }),
    ).toBeInTheDocument();

    expect(screen.getByRole('region', { name: 'To Do' })).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'In Progress' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Done' })).toBeInTheDocument();

    expect(screen.getByText('Write docs')).toBeInTheDocument();
    expect(screen.getByText('Ship feature')).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'In Progress' }),
    ).toHaveTextContent(/no cards yet/i);
  });

  it('requires a title before creating a card', async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(board), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    renderBoardPage();

    await user.click(
      await screen.findByRole('button', { name: /add card to to do/i }),
    );

    const dialog = screen.getByRole('dialog', { name: /add card to to do/i });
    await user.click(
      within(dialog).getByRole('button', { name: /save card/i }),
    );

    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      /title is required/i,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await user.type(within(dialog).getByLabelText(/title/i), 'New card');
    await user.click(
      within(dialog).getByRole('button', { name: /save card/i }),
    );

    expect(fetchMock.mock.calls.length).toBeGreaterThan(1);
  });

  it('prefills the form when editing an existing card', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(board), { status: 200 })),
    );

    const user = userEvent.setup();
    renderBoardPage();

    await user.click(
      await screen.findByRole('button', { name: /edit card write docs/i }),
    );

    expect(screen.getByLabelText(/title/i)).toHaveValue('Write docs');
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      'Explain the API',
    );
  });

  it('asks for confirmation before deleting a card', async () => {
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(board), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    renderBoardPage();

    await user.click(
      await screen.findByRole('button', { name: /delete card write docs/i }),
    );

    const dialog = screen.getByRole('dialog', { name: /delete card/i });
    expect(dialog).toHaveTextContent(/write docs/i);

    await user.click(within(dialog).getByRole('button', { name: /cancel/i }));

    expect(
      screen.queryByRole('dialog', { name: /delete card/i }),
    ).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await user.click(
      screen.getByRole('button', { name: /delete card write docs/i }),
    );
    await user.click(
      within(screen.getByRole('dialog', { name: /delete card/i })).getByRole(
        'button',
        { name: /delete card/i },
      ),
    );

    expect(fetchMock.mock.calls.length).toBeGreaterThan(1);
  });

  it('shows a clear error for an unknown board id', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ message: 'Board not found' }), {
            status: 404,
          }),
      ),
    );

    renderBoardPage();

    expect(
      await screen.findByRole('heading', { name: /board unavailable/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/board not found/i)).toBeInTheDocument();
  });
});
