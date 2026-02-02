'use client';

import React from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';
import { telegramAuth } from '@/api/auth/methods';
import { saveTokens } from '@/api/auth/tokenStorage';

declare global {
  interface Window {
    onTelegramAuth: (user: any) => void;
  }
}

interface TgConfirmModalProps {
  open: boolean;
  onClose: () => void;
  value: string;
}

export const TgConfirmModal: React.FC<TgConfirmModalProps> = ({
  open,
  onClose,
  value,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !value || !containerRef.current) {
      return;
    }
    containerRef.current.innerHTML = '';

    const button = document.createElement('script');
    button.async = true;
    button.src = 'https://telegram.org/js/telegram-widget.js?22';
    button.setAttribute('data-telegram-login', value);
    button.setAttribute('data-size', 'large');
    button.setAttribute('data-radius', '20');
    button.setAttribute('data-onauth', 'onTelegramAuth(user)');

    containerRef.current.appendChild(button);

    window.onTelegramAuth = async function (user) {
      try {
        const response = await telegramAuth({
          id: user.id.toString(),
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
        });

        saveTokens(response);
        toast.success('Аккаунт успешно подтвержден');
        onClose();
        
      } catch (error: any) {
        toast.error('Аккаунт уже использует другой email, напишите в тех поддержку @metamodernismus');
      }
    };

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [open, value, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      height='h-auto max-h-[80vh]'
      className='w-11/12 max-w-md'
    >
      <div className='flex flex-col gap-4 h-full'>
        <h2 className='text-lg font-semibold text-gray-900 text-center'>
          Привязать телеграм
        </h2>
        <div
          ref={containerRef}
          id='telegram-widget-container'
          className='w-full h-full flex items-center justify-center'
        ></div>
      </div>
    </Modal>
  );
};

export const ButtonTelegramAuth = () => {};
