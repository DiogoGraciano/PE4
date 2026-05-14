import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useFunctions } from '../useFunctions';
import { renderHookWithProviders } from '../../test/utils';
import apiService from '../../services/api';

vi.mock('../../services/api', () => ({
  default: { getFunctions: vi.fn() },
}));

const api = vi.mocked(apiService);

describe('useFunctions', () => {
  it('fetches list with long staleTime', async () => {
    api.getFunctions.mockResolvedValueOnce({
      data: [{ id: 1, codigo: 'ADM', nome_funcao: 'Admin' }],
      message: '',
      success: true,
    });
    const { result } = renderHookWithProviders(() => useFunctions());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});
