'use client';

import { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getActiveCategories } from '@/api/category/methods';
import { ROUTES } from '@/config/routes';
import { cn } from '@/utils/cn';

export const CategoryNav: FC = () => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categoriesNav'],
    queryFn: getActiveCategories,
    staleTime: 10 * 60 * 1000,
  });

  const roots = categories.filter(c => !c.parentId);

  if (isLoading) {
    return (
      <div className='hidden md:flex gap-4 px-6 py-2 overflow-x-auto'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className='h-5 w-24 bg-gray-200 rounded animate-pulse shrink-0' />
        ))}
      </div>
    );
  }

  if (!roots.length) return null;

  return (
    <div className='hidden md:flex gap-6 px-6 py-2 overflow-x-auto border-b border-gray-200'>
      {roots.map(cat => (
        <a
          key={cat.id}
          href={
            cat.slug
              ? `${ROUTES.CATALOG}/category/${cat.slug}`
              : `${ROUTES.CATALOG}?category=${cat.id}`
          }
          className={cn(
            'text-sm text-gray-700 hover:text-black whitespace-nowrap transition shrink-0',
          )}
        >
          {cat.name}
        </a>
      ))}
    </div>
  );
};
