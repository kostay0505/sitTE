'use client';
import { TG_LINK } from '@/config/constants';
import { TgIcon } from '../common/SvgIcon';

export const QuestionsSection = () => (
  <>
    {/* Мобильная версия */}
    <a
      className='md:hidden w-full p-3 flex justify-center items-center gap-10 rounded-2xl bg-primary-green disabled:opacity-70'
      href={TG_LINK}
      target='_blank'
      rel='noopener noreferrer'
    >
      <span className='text-normal text-white'>
        Остались вопросы
        <br /> пиши нам!
      </span>
      <TgIcon className='w-10 h-10' />
    </a>

    {/* Десктопная версия */}
    <div className='hidden md:flex w-full bg-primary-green rounded-2xl items-center justify-between p-10'>
      <div>
        <div className='text-white text-2xl font-light mb-4'>
          Остались вопросы
        </div>
        <div className='text-white text-base font-light max-w-xl'>
          Заполните форму обратной связи с интересующими вас вопросами и мы
          свяжемся с вами удобным для вас способом
        </div>
      </div>
      <a
        href={TG_LINK}
        target='_blank'
        rel='noopener noreferrer'
        className='bg-gray-200 text-primary-green min-w-48 h-12 flex items-center justify-center px-8 rounded-lg text-lg font-medium shadow-none hover:bg-gray-300 transition'
      >
        Напиши нам
      </a>
    </div>
  </>
);
