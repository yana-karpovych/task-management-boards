import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { routes } from '../app/router';
import { store } from '../app/store';

function renderHome() {
  const router = createMemoryRouter(routes, { initialEntries: ['/'] });

  render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  );

  return router;
}

describe('HomePage', () => {
  it('renders create and open controls', () => {
    renderHome();

    expect(screen.getByLabelText(/board name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/board id/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument();
  });

  it('requires a board name before creating', async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getByRole('button', { name: /create/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /board name is required/i,
    );
  });

  it('navigates to the board page when opening by id', async () => {
    const user = userEvent.setup();
    const router = renderHome();

    await user.type(screen.getByLabelText(/board id/i), 'some-board-id');
    await user.click(screen.getByRole('button', { name: /load/i }));

    expect(router.state.location.pathname).toBe('/boards/some-board-id');
  });
});
