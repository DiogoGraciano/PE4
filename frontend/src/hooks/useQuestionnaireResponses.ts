import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import { queryKeys } from '../lib/queryKeys';

export function useQuestionnaireResponses(questionnaireId?: number) {
  return useQuery({
    queryKey: questionnaireId
      ? queryKeys.questionnaireResponses.byQuestionnaire(questionnaireId)
      : queryKeys.questionnaireResponses.all,
    queryFn: () => apiService.getQuestionnaireResponses(questionnaireId).then(r => r.data),
  });
}

export function useQuestionnaireResponse(id: number) {
  return useQuery({
    queryKey: queryKeys.questionnaireResponses.detail(id),
    queryFn: () => apiService.getQuestionnaireResponse(id).then(r => r.data),
    enabled: !!id,
  });
}

export function useCreateQuestionnaireResponse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiService.createQuestionnaireResponse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questionnaireResponses.all });
    },
  });
}
