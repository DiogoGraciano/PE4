import { waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  useStudents,
  useStudent,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
} from '../useStudents';
import { renderHookWithProviders, makeStudent } from '../../test/utils';
import apiService from '../../services/api';
import { queryKeys } from '../../lib/queryKeys';

vi.mock('../../services/api', () => ({
  default: {
    getStudents: vi.fn(),
    getStudent: vi.fn(),
    createStudent: vi.fn(),
    updateStudent: vi.fn(),
    deleteStudent: vi.fn(),
  },
}));

const api = vi.mocked(apiService);
const ok = <T>(data: T) => ({ data, message: '', success: true });

describe('useStudents', () => {
  it('fetches the list', async () => {
    const students = [makeStudent()];
    api.getStudents.mockResolvedValueOnce(ok(students));
    const { result } = renderHookWithProviders(() => useStudents());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(students);
  });
});

describe('useStudent', () => {
  it('fetches by id when id truthy', async () => {
    const student = makeStudent({ id: 7 });
    api.getStudent.mockResolvedValueOnce(ok(student));
    const { result } = renderHookWithProviders(() => useStudent(7));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.getStudent).toHaveBeenCalledWith(7);
    expect(result.current.data).toEqual(student);
  });

  it('is disabled when id is falsy', () => {
    const { result } = renderHookWithProviders(() => useStudent(0));
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('mutations invalidate students cache', () => {
  it('useCreateStudent invalidates on success', async () => {
    api.createStudent.mockResolvedValueOnce(ok(makeStudent()));
    const { result, queryClient } = renderHookWithProviders(() => useCreateStudent());
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await act(async () => {
      await result.current.mutateAsync({ nome: 'x' });
    });
    expect(api.createStudent).toHaveBeenCalledWith({ nome: 'x' });
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.students.all });
  });

  it('useUpdateStudent', async () => {
    api.updateStudent.mockResolvedValueOnce(ok(makeStudent()));
    const { result, queryClient } = renderHookWithProviders(() => useUpdateStudent());
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await act(async () => {
      await result.current.mutateAsync({ id: 3, data: { nome: 'y' } });
    });
    expect(api.updateStudent).toHaveBeenCalledWith(3, { nome: 'y' });
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.students.all });
  });

  it('useDeleteStudent', async () => {
    api.deleteStudent.mockResolvedValueOnce(ok(undefined));
    const { result, queryClient } = renderHookWithProviders(() => useDeleteStudent());
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    await act(async () => {
      await result.current.mutateAsync(9);
    });
    expect(api.deleteStudent).toHaveBeenCalledWith(9);
    expect(spy).toHaveBeenCalledWith({ queryKey: queryKeys.students.all });
  });
});
