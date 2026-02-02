'use client';

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/zoom';
import { ImageWithSkeleton } from '../common/ImageWithSkeleton/ImageWithSkeleton';
import { Modal } from '../common/Modal/Modal';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

interface Props {
  open: boolean;
  onClose: () => void;
  mediaFiles: { url: string; type: 'image' | 'video' }[];
  initialIndex?: number;
}

export const ImageSliderModal: React.FC<Props> = ({
  open,
  onClose,
  mediaFiles,
  initialIndex = 0,
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  return (
    <Modal open={open} onClose={onClose}>
      <div className='flex-1 w-full rounded-xl overflow-hidden min-h-[200px] max-h-md'>
        <Swiper
          initialSlide={initialIndex}
          navigation
          onSlideChange={swiper => setActiveIndex(swiper.realIndex)}
          modules={[Navigation]}
          className='relative w-full h-full rounded-xl overflow-hidden'
        >
          {mediaFiles.map((media, idx) => (
            <SwiperSlide key={idx}>
              {media.type === 'video' ? (
                <div className='relative w-full h-[70vh] flex items-center justify-center'>
                  <video
                    src={media.url}
                    controls
                    className='max-w-full max-h-full object-contain'
                  />
                </div>
              ) : (
                <Zoom canSwipeToUnzoom>
                  <div className='relative w-full h-[70vh]'>
                    <ImageWithSkeleton
                      src={media.url}
                      alt={`media ${idx + 1}`}
                      containerClassName='h-full'
                      fill
                      className='object-contain'
                    />
                  </div>
                </Zoom>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </Modal>
  );
};
