import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import { queryKeys } from '../lib/queryKeys';

export function useQuestionnaires() {
  return useQuery({
    queryKey: queryKeys.questionnaires.all,
    queryFn: () => apiService.getQuestionnaires().then(r => r.data),
  });
}

export function useCreateQuestionnaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiService.createQuestionnaire(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questionnaires.all });
    },
  });
}

export function useUpdateQuestionnaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiService.updateQuestionnaire(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questionnaires.all });
    },
  });
}

export function useDeleteQuestionnaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiService.deleteQuestionnaire(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questionnaires.all });
    },
  });
}
