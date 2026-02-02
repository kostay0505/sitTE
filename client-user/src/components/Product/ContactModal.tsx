'use client';

import React from 'react';
import { Modal } from '../common/Modal/Modal';
import { TgIcon2, EmailIcon, PhoneIcon } from '../common/SvgIcon';
import { toast } from 'sonner';
import { Link } from '@/components/Link/Link';
import { TG_USER_LINK } from '@/config/constants';

interface Props {
  open: boolean;
  onClose: () => void;
  username: string | null;
  email: string | null;
  phone: string | null;
}

export const ContactModal: React.FC<Props> = ({
  open,
  onClose,
  username,
  email,
  phone,
}) => {
  const handleCopyEmail = () => {
    if (email) {
      navigator.clipboard.writeText(email);
      toast.success('Email скопирован');
    }
  };

  const handleCopyPhone = () => {
    if (phone) {
      navigator.clipboard.writeText(phone);
      toast.success('Телефон скопирован');
    }
  };

  const hasAnyContact = username || email || phone;

  return (
    <Modal
      open={open}
      onClose={onClose}
      className='flex items-center justify-center w-[70%]'
      height='h-auto'
    >
      <div className='flex flex-col gap-4 items-center h-full w-full py-4'>
        <h2 className='font-bold text-lg mb-4 text-black'>Связаться</h2>
        <div className='flex flex-col gap-2 w-full'>
          {username && (
            <Link
              href={`${TG_USER_LINK}${username}`}
              target='_blank'
              rel='noopener noreferrer'
              className='rounded-xl py-2 px-4 bg-white shadow-md flex items-center justify-center w-full cursor-pointer hover:opacity-75 transition-all ease-in-out'
            >
              <div className='flex gap-3 items-center'>
                <TgIcon2 width={24} height={24} className='text-gray-800' />
                <span className='text-gray-800 font-semibold text-xs sm:text-sm lg:text-base'>
                  Связаться в Telegram
                </span>
              </div>
            </Link>
          )}

          {email && (
            <button
              onClick={handleCopyEmail}
              className='rounded-xl py-2 px-4 bg-white shadow-md flex items-center justify-center w-full cursor-pointer hover:opacity-75 transition-all ease-in-out'
            >
              <div className='flex gap-3 items-center'>
                <EmailIcon width={24} height={24} className='text-gray-800' />
                <span className='text-gray-800 font-semibold text-xs sm:text-sm lg:text-base'>
                  Связаться по Email
                </span>
              </div>
            </button>
          )}

          {phone && (
            <button
              onClick={handleCopyPhone}
              className='rounded-xl py-2 px-4 bg-white shadow-md flex items-center justify-center w-full cursor-pointer hover:opacity-75 transition-all ease-in-out'
            >
              <div className='flex gap-3 items-center'>
                <PhoneIcon width={24} height={24} className='text-gray-800' />
                <span className='text-gray-800 font-semibold text-xs sm:text-sm lg:text-base'>
                  Связаться по телефону
                </span>
              </div>
            </button>
          )}

          {!hasAnyContact && (
            <div className='text-gray-500 text-center py-4'>
              Контактная информация недоступна
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
