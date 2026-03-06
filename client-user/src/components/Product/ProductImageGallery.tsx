'use client';

import { useState } from 'react';
import { cn } from '@/utils/cn';
import { ImageWithSkeleton } from '../common/ImageWithSkeleton/ImageWithSkeleton';
import { Skeleton } from '../common/Skeleton/Skeleton';
import { ImageSliderModal } from './ImageSliderModal';

interface Props {
  mediaFiles: { url: string; type: 'image' | 'video' }[];
  productId: string;
  className?: string;
  isLoading?: boolean;
}

export const ProductImageGallery: React.FC<Props> = ({
  mediaFiles,
  className,
  isLoading,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  const visibleFiles = mediaFiles.slice(0, 6);

  const handleClick = (i: number) => {
    setModalIndex(i);
    setModalOpen(true);
  };

  // Loading skeleton: 6 grey cells
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 gap-[2px]', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='aspect-square bg-gray-200 relative overflow-hidden'>
            <Skeleton width='100%' height='100%' className='absolute inset-0' />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 gap-[2px]', className)}>
      {visibleFiles.map((media, i) => (
        <div
          key={i}
          className='aspect-square bg-gray-200 overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity'
          onClick={() => handleClick(i)}
        >
          {media.type === 'video' ? (
            <video
              src={media.url}
              className='w-full h-full object-cover'
              muted
              preload='metadata'
            />
          ) : (
            <ImageWithSkeleton
              src={media.url}
              alt={`Photo ${i + 1}`}
              fill
              containerClassName='w-full h-full'
              className='object-cover'
            />
          )}
        </div>
      ))}

      {modalOpen && (
        <ImageSliderModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          mediaFiles={mediaFiles}
          initialIndex={modalIndex}
        />
      )}
    </div>
  );
};
