import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { routes } from './app/router';
import { store } from './app/store';

describe('App routing', () => {
  it('renders home page on /', () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] });

    render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>,
    );

    expect(
      screen.getByRole('heading', { name: /task management boards/i }),
    ).toBeInTheDocument();
  });

  it('renders board page route for /boards/:id', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/boards/test-board-id'],
    });

    render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>,
    );

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /board unavailable/i }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('link', { name: /back to home/i }),
    ).toBeInTheDocument();
  });
});
