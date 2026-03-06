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
      <div className='hidden md:flex py-2 border-b border-gray-200' style={{ paddingLeft: 422, paddingRight: 422 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className='h-4 w-20 bg-gray-200 rounded animate-pulse shrink-0 mr-[30px]' />
        ))}
      </div>
    );
  }

  if (!roots.length) return null;

  return (
    <div
      className='hidden md:flex py-2 overflow-x-auto border-b border-gray-200'
      style={{ paddingLeft: 422, paddingRight: 422 }}
    >
      {roots.map((cat, i) => (
        <a
          key={cat.id}
          href={
            cat.slug
              ? `${ROUTES.CATALOG}/category/${cat.slug}`
              : `${ROUTES.CATALOG}?category=${cat.id}`
          }
          className={cn(
            'text-xs text-gray-700 hover:text-black whitespace-nowrap transition shrink-0',
            i < roots.length - 1 && 'mr-[30px]',
          )}
        >
          {cat.name}
        </a>
      ))}
    </div>
  );
};
