'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './styles.css';
import { cn } from '@/utils/cn';
import { ReactNode, useId } from 'react';

interface Props<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  label?: string;
  className?: string;
  showPagination?: boolean;
  loop?: boolean;
  autoPlay?: boolean;
  breakpoints?: {
    [width: number]: {
      slidesPerView: number;
      spaceBetween?: number;
    };
  };
  emptyText?: string;
}

export const defaultCarouselBreakpoints = {
  0: { spaceBetween: 8, slidesPerView: 3 }, // мобилки
  768: { spaceBetween: 16, slidesPerView: 3 }, // планшеты
  1024: { spaceBetween: 20, slidesPerView: 4 }, // десктопы
  1280: { spaceBetween: 20, slidesPerView: 4 }, // большие экраны
};

export function Carousel<T>({
  items,
  renderItem,
  label,
  className,
  showPagination = true,
  loop = true,
  autoPlay = false,
  breakpoints = {
    0: { slidesPerView: 2, spaceBetween: 8 },
    768: { slidesPerView: 3, spaceBetween: 16 },
    1024: { slidesPerView: 4, spaceBetween: 20 },
  },
  emptyText,
}: Props<T>) {
  const id = useId();
  const paginationClass = `custom-swiper-pagination-${id}`;
  const prevButtonClass = `swiper-button-prev-${id}`;
  const nextButtonClass = `swiper-button-next-${id}`;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <h2 className='text-xl md:text-2xl font-bold mb-3 text-center text-black'>
          {label}
        </h2>
      )}

      <div className='relative'>
        {!items?.length && emptyText ? (
          <div className='flex items-center justify-center w-full h-[175px] md:h-[436px] rounded-xl text-black/70 text-sm md:text-base'>
            {emptyText}
          </div>
        ) : (
          <>
            {/* Навигация */}
            <div
              className={cn(
                'hidden md:flex absolute !-left-15 top-1/2 -translate-y-1/2 z-20',
                'swiper-button-prev',
                prevButtonClass,
              )}
            />
            <div
              className={cn(
                'hidden md:flex absolute !-right-15 top-1/2 -translate-y-1/2 z-20',
                'swiper-button-next',
                nextButtonClass,
              )}
            />

            {/* Слайдер */}
            <Swiper
              loop={loop}
              breakpoints={breakpoints}
              speed={500}
              navigation={{
                prevEl: `.${prevButtonClass}`,
                nextEl: `.${nextButtonClass}`,
              }}
              pagination={
                showPagination && items?.length > 1
                  ? { clickable: true, el: `.${paginationClass}` }
                  : false
              }
              autoplay={
                autoPlay && {
                  delay: 2500,
                  disableOnInteraction: false,
                }
              }
              modules={[Autoplay, Pagination, Navigation]}
            >
              {items.map((item, index) => (
                <SwiperSlide key={index}>{renderItem(item, index)}</SwiperSlide>
              ))}
            </Swiper>
          </>
        )}
      </div>

      <div className='flex justify-center'>
        {/* Пагинация */}
        {showPagination && !emptyText && (
          <div className={cn(paginationClass, 'mt-3 gap-1')} />
        )}
      </div>
    </div>
  );
}
