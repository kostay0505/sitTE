'use client';

import { FC } from 'react';
import { cn } from '@/utils/cn';
import { ImageWithSkeleton } from '@/components/common/ImageWithSkeleton/ImageWithSkeleton';
import { Skeleton } from '@/components/common/Skeleton/Skeleton';
import { toImageSrc } from '@/utils/toImageSrc';
import { formatPrice } from '@/utils/currency';
import { Link } from '@/components/Link/Link';
import type { HomeProductCard as HomeProductCardType } from '@/api/home/types';

interface Props {
  product?: HomeProductCardType;
  isLoading?: boolean;
  href?: string;
}

export const HomeProductCard: FC<Props> = ({ product, isLoading = false, href = '' }) => {
  return (
    <Link
      href={href}
      className={cn(
        'relative flex flex-col bg-white rounded-xl shadow-sm transition hover:shadow-md',
        'md:bg-[#F5F5FA] md:shadow-none md:hover:shadow-none',
        !href && 'pointer-events-none',
      )}
    >
      <div className='overflow-hidden rounded-t-xl'>
        <ImageWithSkeleton
          src={toImageSrc(product?.preview as string)}
          alt={product?.name || ''}
          isLoading={isLoading}
          containerClassName='w-full !h-[140px] md:!h-[200px]'
          className='object-contain'
          skeletonClassName='!rounded-none'
        />
      </div>

      <div className='flex flex-col gap-1 p-3 text-black'>
        {isLoading ? (
          <>
            <Skeleton height={20} width='100%' />
            <Skeleton height={16} width='70%' />
            <Skeleton height={14} width='50%' />
          </>
        ) : (
          <>
            <div className='text-xs md:text-sm font-medium line-clamp-2 min-h-[32px]'>
              {product?.name}
            </div>
            <div className='text-xs md:text-sm font-semibold text-primary-green'>
              {Number(product?.priceCash) === 0
                ? 'Цена по запросу'
                : formatPrice(product?.priceCash, product?.currency)}
            </div>
            <div className='text-[10px] md:text-xs text-gray-500 truncate'>
              {product?.sellerName}
            </div>
            {(product?.city || product?.country) && (
              <div className='text-[10px] md:text-xs text-gray-400 truncate'>
                {[product.city, product.country].filter(Boolean).join(', ')}
              </div>
            )}
          </>
        )}
      </div>
    </Link>
  );
};
