'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/routes';
import { useAuthStore } from '@/stores/authStore';

export const InfoSection = () => {
  const { push } = useRouter();
  const isAuthorized = useAuthStore(s => s.isAuthorized);
  const setAuthMode = useAuthStore(s => s.setAuthMode);

  const handleNavigate = (path: string, external: boolean = false) => {
    if (external) {
      window.open(path, '_blank');
    } else {
      if (!isAuthorized) {
        setAuthMode('login');
        return;
      }
      push(path);
    }
  };
  return (
    <div className='flex w-full rounded-2xl overflow-hidden '>
      <button
        className='group flex-1 min-h-[72px] flex flex-col md:justify-start justify-center relative bg-no-repeat bg-cover bg-center p-2 md:p-5 text-left transition hover:opacity-90 cursor-pointer
             before:absolute before:inset-0 before:bg-primary-green/70 before:z-0'
        style={{ backgroundImage: "url('/images/left.png')" }}
        onClick={() => handleNavigate('https://t.me/touringexpertnews ', true)}
      >
        <h3 className='text-white md:text-2xl text-xl font-semibold md:mb-3 drop-shadow-md wrap-break-word relative z-10'>
          Не нашли что искали?
        </h3>
        <p className='hidden md:flex text-white text-base drop-shadow-md w-full relative z-10'>
          Оформите заявку на необходимое Вам оборудование в личном кабинете и мы
          сделаем Вам ценовое предложение в кратчайшие сроки
        </p>
      </button>

      <button
        className='group flex-1 flex flex-col md:justify-start justify-center min-h-[72px] relative bg-no-repeat bg-cover bg-center p-2 md:p-5 text-left transition hover:opacity-90 cursor-pointer 
             before:absolute before:inset-0 before:bg-primary-green/70 before:z-0 '
        style={{ backgroundImage: "url('/images/right.png')" }}
        onClick={() => handleNavigate(ROUTES.CREATE_ADVERTISEMENT)}
      >
        <h3 className='text-white md:text-2xl text-xl font-semibold md:mb-3 drop-shadow-md wrap-break-word relative z-10'>
          Есть ненужное оборудование?
        </h3>
        <p className='hidden md:flex text-white text-base drop-shadow-md relative z-10'>
          Вы можете разместить своё оборудование для продажи на нашем портале
        </p>
      </button>
    </div>
  );
};
