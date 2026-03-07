'use client';

import { FC, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  640: { slidesPerView: 3, spaceBetween: 12 },
  1024: { slidesPerView: 6, spaceBetween: 16 },
};

const RAZNOYE_ID = '550e8400-e29b-41d4-a716-446655440001';

export const HomeBrandCarousel: FC<Props> = ({ categories }) => {
  const filteredCategories = categories.filter(c => c.id !== RAZNOYE_ID);

  const [activeCatId, setActiveCatId] = useState<string | undefined>(
    filteredCategories[0]?.id,
  );

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['homeBrands', activeCatId],
    queryFn: () => getFeaturedBrands(activeCatId, 12),
    staleTime: 5 * 60 * 1000,
  });

  const items = isLoading
    ? Array.from({ length: 12 }).map((_, i) => ({ id: `sk-${i}` }) as any)
    : brands;

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <div className='w-full'>
      {/* Title row — no Shop all for brands */}
      <div className='mb-2'>
        <h2 className='text-2xl md:text-3xl font-bold text-black'>Featured Brands</h2>
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

      {/* Carousel with outside arrows */}
      <div className='relative'>
        <button
          ref={prevRef}
          className='hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-9 h-9 items-center justify-center bg-white rounded-full shadow border border-gray-200 hover:bg-gray-50 transition'
          aria-label='Previous'
        >
          <ChevronLeft className='w-4 h-4 text-gray-700' />
        </button>

        <Swiper
          modules={[Navigation]}
          breakpoints={brandBreakpoints}
          navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
          onBeforeInit={swiper => {
            (swiper.params.navigation as any).prevEl = prevRef.current;
            (swiper.params.navigation as any).nextEl = nextRef.current;
          }}
          loop={items.length >= 6}
          speed={400}
        >
          {items.map((item: any, index: number) => (
            <SwiperSlide key={item.id || index}>
              <a
                href={isLoading ? undefined : `${ROUTES.BRANDS}/${item.id}`}
                className='relative flex flex-col justify-between h-full bg-white rounded-xl shadow-md transition hover:shadow-lg max-h-[199px] md:max-h-[436px] p-4 md:bg-[#F5F5FA] md:shadow-none md:hover:shadow-none'
              >
                <div className='overflow-hidden mb-4'>
                  {isLoading ? (
                    <Skeleton height={100} width='100%' className='rounded-xl md:!h-[300px]' />
                  ) : (
                    <div className='w-full h-[100px] md:h-[300px] flex items-center justify-center overflow-hidden rounded-xl bg-gray-100'>
                      {item.photo ? (
                        <img
                          src={toImageSrc(item.photo)}
                          alt={item.name}
                          className='max-h-full max-w-full object-contain'
                        />
                      ) : (
                        <span className='text-xs text-gray-400 text-center px-2'>{item.name}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className='flex flex-col gap-1 text-black'>
                  {isLoading ? (
                    <Skeleton height={15} width='100%' />
                  ) : (
                    <div className='text-xs md:text-lg font-medium text-center line-clamp-2 min-h-8 md:min-h-14'>
                      {item.name}
                    </div>
                  )}
                </div>
              </a>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          ref={nextRef}
          className='hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-9 h-9 items-center justify-center bg-white rounded-full shadow border border-gray-200 hover:bg-gray-50 transition'
          aria-label='Next'
        >
          <ChevronRight className='w-4 h-4 text-gray-700' />
        </button>
      </div>
    </div>
  );
};
