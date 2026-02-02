'use client';

import React from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/zoom';
import { Modal } from '../common/Modal/Modal';
import 'react-medium-image-zoom/dist/styles.css';
import { ShareIcon, TgIcon2 } from '../common/SvgIcon';
import { toast } from 'sonner';
import { Link } from '@/components/Link/Link';

interface Props {
  open: boolean;
  onClose: () => void;
  url: string;
}

export const ShareModal: React.FC<Props> = ({ open, onClose, url }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      className='flex items-center justify-center w-[70%]'
      height='min-h-[180px]'
    >
      <div className='flex flex-col gap-4 items-center h-full w-full'>
        <h2 className='font-bold text-lg mb-4 text-black'>Поделиться</h2>
        <div className='flex flex-col gap-2 w-full'>
          <button
            onClick={() => {
              navigator.clipboard.writeText(url);
              toast.success('Ссылка скопирована');
            }}
            className='rounded-xl py-2 px-4 bg-white shadow-md flex items-center justify-center w-full cursor-pointer hover:opacity-75 transition-all  ease-in-out'
          >
            <div className='flex gap-3 items-center'>
              <ShareIcon width={24} height={24} className='text-gray-800' />
              <span className='text-gray-800 font-semibold text-xs sm:text-sm lg:text-base'>
                Скопировать ссылку
              </span>
            </div>
          </button>
          <Link
            href={`https://t.me/share/url?url=${url}`}
            target='_blank'
            rel='noopener noreferrer'
            className='rounded-xl py-2 px-4 bg-white shadow-md flex items-center justify-center w-full cursor-pointer hover:opacity-75 transition-all  ease-in-out'
          >
            <div className='flex gap-3 items-center'>
              <TgIcon2 width={24} height={24} className='text-gray-800' />
              <span className='text-gray-800 font-semibold text-xs sm:text-sm lg:text-base'>
                Отправить в Telegram
              </span>
            </div>
          </Link>
        </div>
      </div>
    </Modal>
  );
};
