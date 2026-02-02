import { api } from '../api';
import type { JobsAvailableRequest, JobsAvailableItem } from './types';

export async function getAvailableJobs(
  params: JobsAvailableRequest,
): Promise<JobsAvailableItem[]> {
  const { data } = await api.get<JobsAvailableItem[]>('/jobs/available', {
    params: {
      userId: params.userId,
      cityId: params.cityId,
      searchQuery: params.searchQuery,
      type: params.type,
      orderBy: params.orderBy ?? 'date',
      sortDirection: params.sortDirection ?? 'desc',
      limit: params.limit ?? 24,
      offset: params.offset ?? 0,
    },
  });

  return data ?? [];
}
