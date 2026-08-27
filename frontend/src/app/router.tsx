import { createBrowserRouter } from 'react-router-dom';
import { BoardPage } from '../pages/BoardPage';
import { HomePage } from '../pages/HomePage';

export const routes = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/boards/:id',
    element: <BoardPage />,
  },
];

export const router = createBrowserRouter(routes);
