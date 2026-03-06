'use client';

import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { cn } from '@/utils/cn';
import { toImageSrc } from '@/utils/toImageSrc';
import { Skeleton } from '@/components/common/Skeleton/Skeleton';
import { getFeaturedBrands } from '@/api/home/methods';
import type { HomeCategory } from '@/api/home/types';
import { ROUTES } from '@/config/routes';

interface Props {
  categories: HomeCategory[];
}

const brandBreakpoints = {
  0: { slidesPerView: 2.5, spaceBetween: 8 },
  640: { slidesPerView: 4, spaceBetween: 12 },
  1024: { slidesPerView: 6, spaceBetween: 16 },
};

const RAZNOYE_ID = '550e8400-e29b-41d4-a716-446655440001';

export const HomeBrandCarousel: FC<Props> = ({ categories }) => {
  const filteredCategories = categories.filter(c => c.id !== RAZNOYE_ID);

  const [activeCatId, setActiveCatId] = useState<string | undefined>(
    filteredCategories[0]?.id,
  );

  const activeCategory = filteredCategories.find(c => c.id === activeCatId) ?? filteredCategories[0];

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['homeBrands', activeCatId],
    queryFn: () => getFeaturedBrands(activeCatId, 12),
    staleTime: 5 * 60 * 1000,
  });

  const items = isLoading
    ? Array.from({ length: 12 }).map((_, i) => ({ id: `sk-${i}` }) as any)
    : brands;

  return (
    <div className='w-full'>
      {/* Title row */}
      <div className='flex items-center justify-between mb-2'>
        <h2 className='text-2xl md:text-3xl font-bold text-black'>Featured Brands</h2>
        {activeCategory && (
          <a
            href={`${ROUTES.BRANDS}/${activeCategory.id}`}
            className='text-xs md:text-sm text-primary-green hover:underline whitespace-nowrap shrink-0'
          >
            Shop all {activeCategory.name} →
          </a>
        )}
      </div>

      {/* Category pills row */}
      {filteredCategories.length > 0 && (
        <div className='flex gap-2 flex-wrap mb-4'>
          {filteredCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCatId(cat.id)}
              className={cn(
                'px-3 py-1 text-xs md:text-sm rounded-full border whitespace-nowrap transition',
                (activeCatId ?? filteredCategories[0]?.id) === cat.id
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      <div className='relative'>
        <Swiper
          modules={[Navigation]}
          breakpoints={brandBreakpoints}
          navigation
          loop={items.length >= 6}
          speed={400}
        >
          {items.map((item: any, index: number) => (
            <SwiperSlide key={item.id || index}>
              <a
                href={`${ROUTES.BRANDS}/${item.id}`}
                className='flex flex-col items-center gap-2 p-3 rounded-xl bg-white hover:bg-gray-50 transition'
              >
                {isLoading ? (
                  <>
                    <Skeleton height={80} width='100%' className='rounded-lg' />
                    <Skeleton height={14} width='70%' />
                  </>
                ) : (
                  <>
                    <div className='w-full h-[80px] flex items-center justify-center overflow-hidden rounded-lg bg-gray-100'>
                      {item.photo ? (
                        <img
                          src={toImageSrc(item.photo)}
                          alt={item.name}
                          className='max-h-[80px] max-w-full object-contain'
                        />
                      ) : (
                        <span className='text-xs text-gray-400 text-center px-2'>{item.name}</span>
                      )}
                    </div>
                    <span className='text-xs md:text-sm text-center font-medium truncate w-full'>
                      {item.name}
                    </span>
                  </>
                )}
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};
