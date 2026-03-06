'use client';

import { FC, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { cn } from '@/utils/cn';
import { HomeProductCard } from './HomeProductCard';
import type { HomeCategory, HomeProductCard as HomeProductCardType } from '@/api/home/types';
import { ROUTES } from '@/config/routes';

interface Props {
  title: string;
  categories: HomeCategory[];
  fetchProducts: (categoryId?: string, limit?: number) => Promise<HomeProductCardType[]>;
  queryKey: string;
}

const homeCarouselBreakpoints = {
  0: { slidesPerView: 2.5, spaceBetween: 8 },
  640: { slidesPerView: 3, spaceBetween: 12 },
  1024: { slidesPerView: 6, spaceBetween: 16 },
};

export const HomeProductCarousel: FC<Props> = ({ title, categories, fetchProducts, queryKey }) => {
  const [activeCatId, setActiveCatId] = useState<string | undefined>(
    categories[0]?.id,
  );

  const activeCategory = categories.find(c => c.id === activeCatId);

  const { data: products = [], isLoading } = useQuery({
    queryKey: [queryKey, activeCatId],
    queryFn: () => fetchProducts(activeCatId, 12),
    staleTime: 5 * 60 * 1000,
  });

  const items = isLoading
    ? Array.from({ length: 12 }).map((_, i) => ({ id: `sk-${i}` }) as any)
    : products;

  const shopAllHref = activeCategory?.slug
    ? `${ROUTES.CATALOG}/category/${activeCategory.slug}`
    : ROUTES.CATALOG;

  return (
    <div className='w-full'>
      {/* Header row */}
      <div className='flex flex-col md:flex-row md:items-center gap-2 mb-4'>
        <h2 className='text-xl md:text-2xl font-bold text-black shrink-0'>{title}</h2>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className='flex gap-2 flex-wrap md:flex-nowrap overflow-x-auto md:ml-4'>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCatId(cat.id)}
                className={cn(
                  'px-3 py-1 text-xs md:text-sm rounded-full border whitespace-nowrap transition',
                  activeCatId === cat.id
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500',
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Shop all button */}
        {activeCategory && (
          <a
            href={shopAllHref}
            className='md:ml-auto text-xs md:text-sm text-primary-green hover:underline whitespace-nowrap shrink-0'
          >
            Shop all {activeCategory.name} →
          </a>
        )}
      </div>

      {/* Carousel */}
      <div className='relative'>
        <Swiper
          modules={[Navigation]}
          breakpoints={homeCarouselBreakpoints}
          navigation
          loop={items.length >= 6}
          speed={400}
        >
          {items.map((item: any, index: number) => (
            <SwiperSlide key={item.id || index}>
              <HomeProductCard
                product={isLoading ? undefined : item}
                isLoading={isLoading}
                href={isLoading ? '' : `${ROUTES.CATALOG}/${item.id}`}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};
