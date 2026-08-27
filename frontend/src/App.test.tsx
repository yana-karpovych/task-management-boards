import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it } from 'vitest';
import App from './App';
import { store } from './app/store';

describe('App', () => {
  it('renders get started heading', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
    expect(
      screen.getByRole('heading', { name: /get started/i }),
    ).toBeInTheDocument();
  });
});
