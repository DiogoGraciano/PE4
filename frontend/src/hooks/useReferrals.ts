import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import { queryKeys } from '../lib/queryKeys';

export function useReferrals(alunoId?: number) {
  return useQuery({
    queryKey: alunoId
      ? queryKeys.referrals.byStudent(alunoId)
      : queryKeys.referrals.all,
    queryFn: () => apiService.getReferrals(alunoId).then(r => r.data),
  });
}

export function useCreateReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiService.createReferral(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.referrals.all });
    },
  });
}

export function useUpdateReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiService.updateReferral(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.referrals.all });
    },
  });
}

export function useDeleteReferral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiService.deleteReferral(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.referrals.all });
    },
  });
}
