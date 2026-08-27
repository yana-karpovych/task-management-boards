import { describe, expect, it } from 'vitest';
import { boardsApi } from './boardsApi';

describe('boardsApi', () => {
  it('exposes board and card endpoints', () => {
    const endpointNames = Object.keys(boardsApi.endpoints);

    expect(endpointNames).toEqual(
      expect.arrayContaining([
        'createBoard',
        'getBoard',
        'updateBoard',
        'deleteBoard',
        'createCard',
        'updateCard',
        'moveCard',
        'deleteCard',
      ]),
    );
  });
});
