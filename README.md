# Task Management Boards

Anonymous Kanban-style task boards. Anyone can create a board, receive its unique
ID and share that ID to give access — there is no registration or login. Each
board has three fixed columns (To Do, In Progress, Done) and cards that can be
created, edited, deleted, reordered and dragged between columns.

## Live demo

- Frontend: 
- API: 

## Stack

- **Frontend:** React, Vite, TypeScript, Redux Toolkit + RTK Query, React Router,
  dnd-kit, CSS Modules
- **Backend:** Express, TypeScript, Zod, Prisma
- **Database:** PostgreSQL
- **Testing:** Vitest, React Testing Library, Supertest
- **Quality:** ESLint, Prettier
- **Infrastructure:** Docker, Docker Compose, GitHub Actions

## Project structure

```
backend/    Express API, Prisma schema and migrations
frontend/   React single-page application
```

## Quick start with Docker

The fastest way to run everything (database, API, frontend) is Docker Compose.
Database migrations are applied automatically when the backend container starts.

```bash
docker compose up -d --build
```

Then open <http://localhost:5173>.

| Service  | URL                                            |
| -------- | ---------------------------------------------- |
| Frontend | <http://localhost:5173>                        |
| API      | <http://localhost:4000/api>                    |
| Postgres | `postgresql://postgres:postgres@localhost:5432/task_boards` |

To stop the stack, optionally removing the database volume:

```bash
docker compose down        
docker compose down -v    
```

Ports 5173, 4000 and 5432 must be free — stop any local dev servers first.

## Local development

Requires Node.js 22+ and a running PostgreSQL instance. If you do not have
Postgres locally, start just the database with `docker compose up -d postgres`.

### Backend

```bash
cd backend
npm install
cp .env.example .env        
npx prisma migrate dev
npm run dev                
```

Environment variables (`backend/.env`):

| Variable            | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `PORT`              | API port, defaults to 4000.                                    |
| `DATABASE_URL`      | PostgreSQL connection string.                                  |
| `TEST_DATABASE_URL` | Separate database used by the API tests.                       |
| `CORS_ORIGIN`       | Allowed origin in production. Leave empty to allow any origin. |

### Frontend

```bash
cd frontend
npm install
cp .env.example .env        
npm run dev                 
```

## Scripts

Both packages expose the same set of commands:

| Command                | Description                        |
| ---------------------- | ---------------------------------- |
| `npm run dev`           | Start in watch mode.               |
| `npm run build`         | Type-check and build for production. |
| `npm run lint`          | Run ESLint.                        |
| `npm run format:check`  | Verify Prettier formatting.        |
| `npm run test`          | Run the test suite once.           |

The backend additionally provides `npm start` (run the built server),
`npm run prisma:migrate`, `npm run prisma:generate` and `npm run prisma:studio`.

## Testing

```bash
cd backend && npm run test     
cd frontend && npm run test    
```

Backend tests run against `TEST_DATABASE_URL`, so they never touch development
data. Create the test database once with:

```bash
createdb task_boards_test
```

## API

Base path: `/api`. All responses are JSON, and errors share the shape
`{ "message": "..." }`.

| Method   | Endpoint                  | Description                                     |
| -------- | ------------------------- | ----------------------------------------------- |
| `GET`    | `/health`                 | Health check.                                   |
| `POST`   | `/boards`                 | Create a board. Body: `{ name }`.               |
| `GET`    | `/boards/:id`             | Get a board with all its cards.                 |
| `PATCH`  | `/boards/:id`             | Rename a board. Body: `{ name }`.               |
| `DELETE` | `/boards/:id`             | Delete a board and, by cascade, its cards.      |
| `POST`   | `/boards/:boardId/cards`  | Create a card. Body: `{ title, description?, column? }`. |
| `PATCH`  | `/cards/:id`              | Update a card. Body: `{ title?, description? }`. |
| `PATCH`  | `/cards/:id/move`         | Move or reorder. Body: `{ column, position }`.  |
| `DELETE` | `/cards/:id`              | Delete a card.                                  |

`column` is one of `TODO`, `IN_PROGRESS`, `DONE`. Card order is stored as a
contiguous `position` integer per column, and the API renormalises positions on
every move, reorder and delete so the sequence never develops gaps.

## Design decisions

- **Columns are not entities.** The requirements fix them at three, so a column
  is an enum value on a card rather than a database table. This removes column
  CRUD, ordering and validation code that would never be used.
- **Board ID as the access key.** Authentication was explicitly out of scope, so
  a `nanoid` board ID doubles as the shareable secret.
- **RTK Query for server state.** Caching, loading flags and invalidation come
  for free, while purely local concerns (modal visibility, form drafts, in-flight
  drag state) stay in `useState`.
- **Positions normalised server-side.** Keeping the ordering rules in one service
  means the client can send a simple target index and trust the result.
