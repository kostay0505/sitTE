'use client';

import React from 'react';
import { ArticleBlock } from '@/api/articles/types';
import { toImageSrc } from '@/utils/toImageSrc';

function parseBlocks(content: string | null): ArticleBlock[] {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {}
  return null;
}

interface ArticleContentProps {
  content: string | null;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({ content }) => {
  const blocks = parseBlocks(content);

  if (blocks.length === 0) return null;

  return (
    <div className='max-w-[720px] mx-auto'>
      {blocks.map((block) => {
        switch (block.type) {
          case 'heading1':
            return (
              <h1 key={block.id} className='text-3xl font-semibold text-gray-900 mt-8 mb-4 leading-tight'>
                {block.content}
              </h1>
            );
          case 'heading2':
            return (
              <h2 key={block.id} className='text-2xl font-semibold text-gray-900 mt-7 mb-3 leading-tight'>
                {block.content}
              </h2>
            );
          case 'heading3':
            return (
              <h3 key={block.id} className='text-xl font-semibold text-gray-900 mt-6 mb-3 leading-tight'>
                {block.content}
              </h3>
            );
          case 'paragraph':
            return (
              <p key={block.id} className='text-base text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap'>
                {block.content}
              </p>
            );
          case 'quote':
            return (
              <blockquote key={block.id} className='border-l-4 border-gray-300 pl-5 my-6 italic text-gray-600 text-lg'>
                {block.content}
              </blockquote>
            );
          case 'image': {
            const src = block.content.startsWith('http') ? block.content : toImageSrc(block.content);
            return (
              <figure key={block.id} className='my-8'>
                <img src={src} alt={block.caption || ''} className='w-full object-cover' />
                {block.caption && (
                  <figcaption className='text-sm text-gray-400 text-center mt-2'>{block.caption}</figcaption>
                )}
              </figure>
            );
          }
          case 'video': {
            const embed = getYoutubeEmbedUrl(block.content);
            if (embed) {
              return (
                <div key={block.id} className='my-8 aspect-video'>
                  <iframe
                    src={embed}
                    className='w-full h-full'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                  />
                </div>
              );
            }
            return (
              <div key={block.id} className='my-8'>
                <a href={block.content} target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>
                  {block.content}
                </a>
              </div>
            );
          }
          case 'divider':
            return <hr key={block.id} className='my-8 border-gray-200' />;
          default:
            return null;
        }
      })}
    </div>
  );
};
