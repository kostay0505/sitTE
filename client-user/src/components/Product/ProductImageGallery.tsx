/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client';

import { useId, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { ImageWithSkeleton } from '../common/ImageWithSkeleton/ImageWithSkeleton';
import { Skeleton } from '../common/Skeleton/Skeleton';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ImageSliderModal } from './ImageSliderModal';

interface Props {
  mediaFiles: { url: string; type: 'image' | 'video' }[];
  productId: string;
  className?: string;
  isLoading?: boolean;
  isFavorite?: boolean;
}

export const ProductImageGallery: React.FC<Props> = ({
  mediaFiles,
  productId,
  className,
  isLoading,
  isFavorite,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const handleImageClick = () => {
    setModalOpen(true);
  };

  // ✅ уникальные id на случай нескольких галерей
  const uid = useId();
  const prevId = `thumb-swiper-prev-${uid}`;
  const nextId = `thumb-swiper-next-${uid}`;

  // ✅ надёжная навигация через ref
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  // Сколько показываем превью
  const slidesPerView = 4;
  // Включаем loop только когда слайдов больше, чем видимых
  const enableLoop = mediaFiles.length > slidesPerView;

  return (
    <div
      className={cn(
        'flex-1 md:flex-none flex flex-col items-center gap-2 md:max-w-2/5 md:self-start md:sticky',
        className,
      )}
      style={{ top: 0, zIndex: 40 }}
    >
      <div className='relative w-full max-h-[520px] aspect-square rounded-xl overflow-hidden bg-white'>
        {isLoading ? (
          <Skeleton width={'100%'} height={'100%'} />
        ) : (
          <>
            <FavoriteButton
              isFavorite={!!isFavorite}
              productId={productId}
              className='absolute top-4 left-4 z-10 w-7 h-7'
              size={28}
            />

            {mediaFiles[selectedIndex]?.type === 'video' ? (
              <video
                src={mediaFiles[selectedIndex].url}
                controls
                className='w-full h-full object-contain'
                onClick={handleImageClick}
              />
            ) : (
              <Image
                src={mediaFiles[selectedIndex]?.url || ''}
                alt={`Product media ${selectedIndex + 1}`}
                fill
                className='object-contain'
                priority
                unoptimized
                onClick={handleImageClick}
              />
            )}
          </>
        )}
      </div>

      <div className='relative w-full'>
        <button
          id={prevId}
          ref={prevRef}
          type='button'
          className='absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 cursor-pointer'
          aria-label='Previous'
        >
          <ChevronLeft className='w-5 h-5 text-gray-600' />
        </button>
        <button
          id={nextId}
          ref={nextRef}
          type='button'
          className='absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 cursor-pointer'
          aria-label='Next'
        >
          <ChevronRight className='w-5 h-5 text-gray-600' />
        </button>

        <Swiper
          spaceBetween={8}
          slidesPerView={slidesPerView}
          modules={[Navigation]}
          loop={enableLoop}
          watchOverflow
          className='w-10/12 mx-auto'
          // ✅ подставляем элементы навигации ДО инициализации
          onBeforeInit={swiper => {
            swiper.params.navigation = {
              //@ts-ignore
              ...(swiper.params.navigation || {}),
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            };
          }}
          // ✅ после монтирования гарантированно инициализируем/обновляем
          onSwiper={swiper => {
            //@ts-ignore
            swiper.params.navigation.prevEl = prevRef.current;
            //@ts-ignore
            swiper.params.navigation.nextEl = nextRef.current;
            swiper.navigation.init();
            swiper.navigation.update();
          }}
        >
          {mediaFiles.map((media, i) => (
            <SwiperSlide key={`${media.url}-${i}`}>
              <button
                type='button'
                onClick={() => setSelectedIndex(i)}
                className={cn(
                  'min-h-16 max-h-[100px] relative rounded-xl overflow-hidden border-2 transition bg-white aspect-square',
                  i === selectedIndex ? 'border-black' : 'border-transparent',
                )}
              >
                {media.type === 'video' ? (
                  <video
                    src={media.url}
                    className='w-[60px] h-full object-cover'
                    muted
                    preload='metadata'
                  />
                ) : (
                  <ImageWithSkeleton
                    src={media.url}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    containerClassName='w-full h-full'
                    className='object-contain'
                  />
                )}
              </button>
            </SwiperSlide>
          ))}
        </Swiper>

        {modalOpen && (
          <ImageSliderModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            mediaFiles={mediaFiles}
            initialIndex={selectedIndex}
          />
        )}
      </div>
    </div>
  );
};
