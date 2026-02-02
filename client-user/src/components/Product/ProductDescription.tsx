'use client';

import { cn } from '@/utils/cn';
import { FC } from 'react';
import { Skeleton } from '../common/Skeleton/Skeleton';

interface Props {
  description: string;
  className?: string;
  isLoading?: boolean;
}

export const ProductDescription: FC<Props> = ({
  description,
  className,
  isLoading,
}) => {
  return (
    <div className={cn('bg-white p-2 rounded-xl', className)}>
      <div className='font-bold mb-2 text-black text-normal text-center md:text-left'>
        Описание
      </div>
      <div className='space-y-1'>
        {isLoading ? (
          <Skeleton width={'100%'} height={100} />
        ) : (
          <div
            className='text-black text-sm whitespace-pre-line'
            dangerouslySetInnerHTML={{
              __html: description.replace(/\n/g, '<br>'),
            }}
          />
        )}
      </div>
    </div>
  );
};
