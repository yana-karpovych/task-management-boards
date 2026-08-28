import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { boardsRouter } from './routes/boards.routes.js';
import { cardsRouter } from './routes/cards.routes.js';

export function createApp() {
  const app = express();

  // Without CORS_ORIGIN every origin is allowed, which keeps local development
  // and Docker simple. Production sets it to the deployed frontend URL.
  app.use(cors({ origin: env.corsOrigin ?? true }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/boards', boardsRouter);
  app.use('/api/cards', cardsRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
