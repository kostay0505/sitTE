'use client';

import React, { useEffect, useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/utils/cn';
import { Skeleton } from '../Skeleton/Skeleton';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

type Props = ImageProps & {
  isLoading?: boolean;
  skeletonClassName?: string;
  containerClassName?: string;
  fadeDurationMs?: number; // длительность анимации
};

export const ImageWithSkeleton: React.FC<Props> = ({
  isLoading,
  skeletonClassName = '',
  containerClassName = '',
  className,
  onLoadingComplete,
  onLoad,
  onError,
  alt,
  src,
  fadeDurationMs = 300,
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const durSec = prefersReducedMotion ? 0 : fadeDurationMs / 1000;

  // при смене src начинаем заново
  useEffect(() => {
    setLoaded(false);
  }, [src]);

  const showSkeleton = isLoading || !loaded;

  return (
    <div className={cn('relative w-full overflow-hidden', containerClassName)}>
      {/* Скелетон: мягко исчезает и размонтируется */}
      <AnimatePresence initial={false}>
        {showSkeleton && (
          <motion.div
            key='skeleton'
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: durSec, ease: 'easeOut' }}
            className={cn('absolute inset-0 z-10', skeletonClassName)}
          >
            <Skeleton className='w-full h-full rounded-xl' />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Картинка: мягко появляется */}
      <motion.div
        key={String(src)}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded && !isLoading ? 1 : 0 }}
        transition={{ duration: durSec, ease: 'easeOut' }}
        className='absolute inset-0'
      >
        <Image
          src={src}
          alt={alt}
          fill
          {...rest}
          className={cn('object-contain rounded-xl', className)}
          onLoadingComplete={result => {
            setLoaded(true);
            onLoadingComplete?.(result);
          }}
          onLoad={e => {
            setLoaded(true);
            onLoad?.(e);
          }}
          onError={e => {
            setLoaded(true);
            onError?.(e);
          }}
        />
      </motion.div>
    </div>
  );
};
