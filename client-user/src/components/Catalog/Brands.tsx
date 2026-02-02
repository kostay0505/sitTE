'use client';

import { FC } from 'react';
import { ImageWithSkeleton } from '../common/ImageWithSkeleton/ImageWithSkeleton';
import { Carousel } from '../common/Carousel/Carousel';
import { Skeleton } from '../common/Skeleton/Skeleton';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/routes';
import { cn } from '@/utils/cn';
import type { AvailableBrandsResponse } from '@/api/brands/types';
import { toImageSrc } from '@/utils/toImageSrc';

interface Props {
  brands: AvailableBrandsResponse;
  isLoading?: boolean;
}

export const Brands: FC<Props> = ({ brands, isLoading = false }) => {
  const { push } = useRouter();

  if (isLoading) {
    return (
      <div className='flex gap-4'>
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <Skeleton
              width={80}
              height={80}
              className='rounded-md'
              key={index}
            />
          ))}
      </div>
    );
  }

  return (
    <Carousel
      items={brands}
      showPagination={false}
      label='Бренды'
      renderItem={brand => (
        <ImageWithSkeleton
          src={toImageSrc(brand.photo)}
          alt={brand.name}
          className='w-full h-20 object-contain cursor-pointer'
          containerClassName={cn(
            'flex items-center justify-center w-full h-20 bg-white rounded-md shadow p-2 transition hover:opacity-70',
            'md:h-28 md:bg-none md:shadow-none',
          )}
          onClick={() => push(`${ROUTES.BRANDS}/${brand.id}`)}
          isLoading={isLoading}
        />
      )}
      breakpoints={{
        0: { slidesPerView: 4, spaceBetween: 16 },
      }}
      autoPlay
    />
  );
};
