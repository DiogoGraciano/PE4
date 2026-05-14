import { waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  useEvents,
  useEvent,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from '../useEvents';
import { renderHookWithProviders, makeScheduleEvent } from '../../test/utils';
import apiService from '../../services/api';
import { queryKeys } from '../../lib/queryKeys';

vi.mock('../../services/api', () => ({
  default: {
    getEvents: vi.fn(),
    getEvent: vi.fn(),
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
  },
}));

const api = vi.mocked(apiService);
const ok = <T>(data: T) => ({ data, message: '', success: true });

describe('useEvents', () => {
  it('fetches list', async () => {
    api.getEvents.mockResolvedValueOnce(ok([makeScheduleEvent()]));
    const { result } = renderHookWithProviders(() => useEvents());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('useEvent fetches when id truthy and is idle when 0', async () => {
    api.getEvent.mockResolvedValueOnce(ok(makeScheduleEvent({ id: 5 })));
    const { result } = renderHookWithProviders(() => useEvent(5));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getEvent).toHaveBeenCalledWith(5);

    const { result: idle } = renderHookWithProviders(() => useEvent(0));
    expect(idle.current.fetchStatus).toBe('idle');
  });

  it('useCreateEvent', async () => {
    api.createEvent.mockResolvedValueOnce(ok(makeScheduleEvent()));
    const { result, queryClient } = renderHookWithProviders(() => useCreateEvent());
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await act(async () => {
      await result.current.mutateAsync({ titulo: 'x' });
    });
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.events.all });
  });

  it('useUpdateEvent', async () => {
    api.updateEvent.mockResolvedValueOnce(ok(makeScheduleEvent()));
    const { result, queryClient } = renderHookWithProviders(() => useUpdateEvent());
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await act(async () => {
      await result.current.mutateAsync({ id: 1, data: { titulo: 'y' } });
    });
    expect(api.updateEvent).toHaveBeenCalledWith(1, { titulo: 'y' });
    expect(spy).toHaveBeenCalled();
  });

  it('useDeleteEvent', async () => {
    api.deleteEvent.mockResolvedValueOnce(ok(undefined));
    const { result, queryClient } = renderHookWithProviders(() => useDeleteEvent());
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await act(async () => {
      await result.current.mutateAsync(2);
    });
    expect(api.deleteEvent).toHaveBeenCalledWith(2);
    expect(spy).toHaveBeenCalled();
  });
});
