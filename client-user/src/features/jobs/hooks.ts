import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import type { JobsAvailableRequest, JobsAvailableItem } from '@/api/jobs/types';
import { getAvailableJobs } from '@/api/jobs/methods';
import { QK } from '@/lib/queryKeys';

export function useAvailableJobs(
  params: JobsAvailableRequest | undefined,
  options?: Omit<
    UseQueryOptions<JobsAvailableItem[], unknown, JobsAvailableItem[]>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: QK.jobs.available(params ?? {}),
    queryFn: () => {
      if (!params) return Promise.resolve<JobsAvailableItem[]>([]);
      return getAvailableJobs(params);
    },
    enabled: !!params,
    staleTime: 30_000,
    ...options,
  });
}
