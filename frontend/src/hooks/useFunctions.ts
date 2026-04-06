import { useQuery } from '@tanstack/react-query';
import apiService from '../services/api';
import { queryKeys } from '../lib/queryKeys';

export function useFunctions() {
  return useQuery({
    queryKey: queryKeys.functions.all,
    queryFn: () => apiService.getFunctions().then(r => r.data),
    staleTime: 30 * 60 * 1000, // 30 min - dados raramente mudam
  });
}
