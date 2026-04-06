import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import { queryKeys } from '../lib/queryKeys';

export function useSmtpConfig() {
  return useQuery({
    queryKey: queryKeys.smtpConfig.all,
    queryFn: () => apiService.getSmtpConfig().then(r => r.data),
  });
}

export function useSaveSmtpConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => apiService.saveSmtpConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.smtpConfig.all });
    },
  });
}

export function useTestSmtpConnection() {
  return useMutation({
    mutationFn: (data: any) => apiService.testSmtpConnection(data),
  });
}
