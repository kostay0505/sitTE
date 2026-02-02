'use client';

import { useQuery } from '@tanstack/react-query';
import { getAvailableBrands, getBrandById } from '@/api/brands/methods';
import { QK } from '@/lib/queryKeys';
import type { AvailableBrandsResponse, Brand } from '@/api/brands/types';

export function useAvailableBrands() {
  return useQuery<AvailableBrandsResponse>({
    queryKey: QK.brands.available(),
    queryFn: getAvailableBrands,
    staleTime: 5 * 60_000,
  });
}

export function useBrand(id?: string) {
  return useQuery<Brand>({
    enabled: !!id,
    queryKey: QK.brands.byId(id || ''),
    queryFn: () => getBrandById(id!),
  });
}
