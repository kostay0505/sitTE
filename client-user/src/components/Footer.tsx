'use client';

import React, { memo, useMemo, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';
import { TelegramIcon, VkIcon, WhatSapp } from './common/SvgIcon';
import { ROUTES } from '@/config/routes';
import { TELEGRAM_LINK, VK_LINK, WHATSAPP_LINK } from '@/config/constants';
import { Input } from './common/Input/Input';
import { toast } from 'sonner';

import { subscribeNewsletter } from '@/api/newsletter-subscription/methods';
import { isTMA } from '@tma.js/sdk-react';

interface FooterItemsLinks {
  path: string;
  label: string;
  text?: string;
}

interface FooterItemsIcons {
  path: string;
  external?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export const Footer: React.FC = memo(() => {
  const { push } = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNavigate = (tab: FooterItemsIcons) => {
    if (tab.external) {
      window.open(tab.path, '_blank');
    } else {
      push(tab.path);
    }
  };

  const footerItemsIcons: FooterItemsIcons[] = useMemo(() => {
    return [
      {
        path: TELEGRAM_LINK,
        external: true,
        icon: TelegramIcon,
      },
      {
        path: VK_LINK,
        external: true,
        icon: VkIcon,
      },
      {
        path: WHATSAPP_LINK,
        external: true,
        icon: WhatSapp,
      },
    ];
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Скопировано!');
    } catch (err) {
      toast.error('Ошибка копирования');
    }
  };

  const footerItemsLinks: FooterItemsLinks[] = useMemo(() => {
    return [
      {
        path: ROUTES.CATALOG,
        label: 'Каталог',
      },
      {
        path: ROUTES.CATALOG,
        label: 'Телефон',
        text: '+79995147159',
      },
      {
        path: ROUTES.CATALOG,
        label: 'email',
        text: 'klimenkonikita@touringexpertsale.com',
      },
    ];
  }, []);

  const handleSubscribe = async (event: FormEvent) => {
    event.preventDefault();
    setEmailError('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Укажите корректный адрес электронной почты');
      return;
    }

    try {
      setIsSubmitting(true);
      await subscribeNewsletter({ email: trimmedEmail });
      toast.success(
        'Спасибо! Мы будем присылать вам новости и обновления Touring Expert.',
      );
      setEmail('');
    } catch (error: any) {
      const message = error?.message || '';
      if (message.includes('уже подписан')) {
        setEmailError('Этот email уже подписан на рассылку');
      } else {
        setEmailError(
          message || 'Не удалось подписаться на рассылку. Попробуйте ещё раз.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={cn(
        'flex-col flex md:flex-row md:justify-between gap-4 w-full',
        'bg-primary-green p-4',
        `${isTMA() ? 'pb-[80px]' : 'pb-[130px]'}`,
        'md:pb-4',
      )}
    >
      <div className='max-w-[1200px] mx-auto w-full flex flex-col md:flex-row md:justify-between gap-4'>
        {' '}
        <div className='flex flex-col flex-1 gap-2 text-left '>
          <h1 className='text-white text-2xl font-bold'>Ссылки</h1>
          {footerItemsLinks.map((item, index) => {
            const Label = item.label;
            const Text = item.text;
            return (
              <div key={index}>
                {Text ? (
                  <div
                    onClick={() => copyToClipboard(Text)}
                    className='text-left hover:text-green-700 cursor-pointer w-full break-words'
                  >
                    {Label}: {Text}
                  </div>
                ) : (
                  <button
                    className='text-left hover:text-green-700 cursor-pointer '
                    onClick={() => handleNavigate(item)}
                  >
                    {Label}
                  </button>
                )}
              </div>
            );
          })}
          <div className='flex gap-2 mt-auto'>
            {footerItemsIcons.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  className='w-10 h-10 fill-white cursor-pointer hover:scale-110 transition-all duration-300'
                  onClick={() => handleNavigate(item)}
                >
                  {Icon && <Icon className='w-10 h-10 fill-white' />}
                </button>
              );
            })}
          </div>
        </div>
        <div className='hidden md:flex flex-col flex-2 gap-4 text-left'>
          <h1 className='text-white text-2xl text-center font-bold'>
            Новостная рассылка
          </h1>
          <p className='text-white text-center text-sm'>
            Подпишитесь на нашу рассылку и будьте в курсе горячих предложений,
            новостей и событий.
          </p>
          <form onSubmit={handleSubscribe} className='flex flex-col gap-2'>
            <div className='flex gap-2'>
              <Input
                label='Email'
                type='email'
                value={email}
                error={emailError}
                onChange={e => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type='submit'
                disabled={isSubmitting}
                className='bg-gray-200 text-primary-green flex items-center justify-center px-8 rounded-lg text-lg font-medium shadow-none hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Подписаться
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

Footer.displayName = 'Footer';
