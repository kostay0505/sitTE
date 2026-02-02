'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getActiveCategories } from '@/api/category/methods'; // путь подправь под свой
import type { Category } from '@/api/category/types';
import { QK } from '@/lib/queryKeys';

export type Option = { label: string; value: string; disabled?: boolean };

export function useActiveCategories() {
  return useQuery<Category[]>({
    queryKey: QK.categories?.active?.() ?? ['categories', 'active'],
    queryFn: getActiveCategories,
    staleTime: 5 * 60_000,
  });
}

/** Готовые опции для селектов + быстрый доступ к подкатегориям */
export function useCategoryFilterOptions() {
  const { data, status } = useActiveCategories();
  const isLoading = status === 'pending';

  return useMemo(() => {
    const categories = data ?? [];
    const parents = categories
      .filter(c => !c.parentId)
      .sort((a, b) =>
        a.displayOrder !== b.displayOrder
          ? a.displayOrder - b.displayOrder
          : a.name.localeCompare(b.name),
      );

    const categoryOptions: Option[] = parents.map(c => ({
      label: c.name,
      value: c.id,
    }));

    const byParent = new Map<string, Option[]>();
    for (const c of categories) {
      if (!c.parentId) continue;
      const arr = byParent.get(c.parentId) ?? [];
      arr.push({ label: c.name, value: c.id });
      byParent.set(c.parentId, arr);
    }
    // отсортируем подкатегории по имени
    for (const [k, arr] of byParent) {
      byParent.set(
        k,
        arr.sort((a, b) => a.label.localeCompare(b.label)),
      );
    }

    const getSubcategoryOptions = (parentId?: string | null): Option[] =>
      parentId ? (byParent.get(parentId) ?? []) : [];

    return {
      isLoading,
      categoryOptions,
      getSubcategoryOptions,
      all: categories,
    };
  }, [data, isLoading]);
}
