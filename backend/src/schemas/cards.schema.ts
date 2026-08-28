import { z } from 'zod';

export const columnSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);

export const createCardSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).default(''),
  column: columnSchema.default('TODO'),
});

export const updateCardSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200).optional(),
    description: z.string().trim().max(2000).optional(),
  })
  .refine(
    (data) => data.title !== undefined || data.description !== undefined,
    {
      message: 'At least one field must be provided',
    },
  );

export const moveCardSchema = z.object({
  column: columnSchema,
  position: z.number().int().min(0),
});

export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type MoveCardInput = z.infer<typeof moveCardSchema>;
