'use client';

import { FC } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { toImageSrc } from '@/utils/toImageSrc';
import type { BannerContent } from '@/api/site-content/types';
import { Link } from '@/components/Link/Link';

interface Props {
  content: BannerContent | null;
}

export const HomeBanner: FC<Props> = ({ content }) => {
  const slides = content?.slides ?? [];
  if (!slides.length) return null;

  return (
    <div className='w-full'>
      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={{ delay: 15000, disableOnInteraction: false }}
        loop={slides.length > 1}
        speed={600}
        navigation
        className='w-full'
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className='relative w-full h-[200px] md:h-[400px] overflow-hidden bg-gray-100'>
              <img
                src={toImageSrc(slide.image)}
                alt={`Banner ${i + 1}`}
                className='w-full h-full object-cover'
              />
              {slide.buttonText && slide.buttonLink && (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <Link
                    href={slide.buttonLink}
                    className='bg-white text-black text-sm md:text-base font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition'
                  >
                    {slide.buttonText}
                  </Link>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
