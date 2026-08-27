import { baseApi } from '../../app/baseApi';
import type {
  Board,
  CreateBoardRequest,
  UpdateBoardRequest,
} from './boardTypes';
import type {
  Card,
  CreateCardRequest,
  MoveCardRequest,
  UpdateCardRequest,
} from '../cards/cardsTypes';

export const boardsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBoard: builder.mutation<Board, CreateBoardRequest>({
      query: (body) => ({
        url: '/boards',
        method: 'POST',
        body,
      }),
    }),

    getBoard: builder.query<Board, string>({
      query: (id) => `/boards/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Board', id }],
    }),

    updateBoard: builder.mutation<
      Board,
      { id: string; body: UpdateBoardRequest }
    >({
      query: ({ id, body }) => ({
        url: `/boards/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Board', id }],
    }),

    deleteBoard: builder.mutation<void, string>({
      query: (id) => ({
        url: `/boards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Board', id }],
    }),

    createCard: builder.mutation<
      Card,
      { boardId: string; body: CreateCardRequest }
    >({
      query: ({ boardId, body }) => ({
        url: `/boards/${boardId}/cards`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: 'Board', id: boardId },
      ],
    }),

    updateCard: builder.mutation<
      Card,
      { id: string; boardId: string; body: UpdateCardRequest }
    >({
      query: ({ id, body }) => ({
        url: `/cards/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: 'Board', id: boardId },
      ],
    }),

    moveCard: builder.mutation<
      Card,
      { id: string; boardId: string; body: MoveCardRequest }
    >({
      query: ({ id, body }) => ({
        url: `/cards/${id}/move`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: 'Board', id: boardId },
      ],
    }),

    deleteCard: builder.mutation<void, { id: string; boardId: string }>({
      query: ({ id }) => ({
        url: `/cards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { boardId }) => [
        { type: 'Board', id: boardId },
      ],
    }),
  }),
});

export const {
  useCreateBoardMutation,
  useGetBoardQuery,
  useLazyGetBoardQuery,
  useUpdateBoardMutation,
  useDeleteBoardMutation,
  useCreateCardMutation,
  useUpdateCardMutation,
  useMoveCardMutation,
  useDeleteCardMutation,
} = boardsApi;
