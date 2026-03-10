'use client';

import React from 'react';
import Link from 'next/link';
import { ArticleItem } from '@/api/articles/types';
import { toImageSrc } from '@/utils/toImageSrc';

interface ArticleCardProps {
  article: ArticleItem;
  sectionPath: string; // '/blog' or '/hub'
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, sectionPath }) => {
  const href = `${sectionPath}/${article.slug}`;
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <Link href={href} className='group block'>
      {/* Image */}
      <div className='aspect-[4/3] bg-gray-200 overflow-hidden mb-3'>
        {article.coverImage ? (
          <img
            src={toImageSrc(article.coverImage)}
            alt={article.title}
            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
          />
        ) : (
          <div className='w-full h-full bg-gray-200' />
        )}
      </div>

      {/* Category */}
      {article.categoryName && (
        <p className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>
          {article.categoryName}
        </p>
      )}

      {/* Title */}
      <h3 className='text-sm font-medium text-gray-900 leading-snug group-hover:underline line-clamp-3'>
        {article.title}
      </h3>

      {/* Date */}
      {date && (
        <p className='text-xs text-gray-400 mt-1'>{date}</p>
      )}
    </Link>
  );
};
