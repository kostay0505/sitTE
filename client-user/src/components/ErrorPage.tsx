'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className='w-full min-h-screen flex flex-col items-center justify-center px-4 bg-[#F5F5FA] gap-6'>
      <Image
        src={'/images/logo.png'}
        width={181}
        height={181}
        alt='Logo'
        priority
        objectFit='contain'
        unoptimized
      />
      <h1 className='text-xl font-medium text-black text-center'>
        Страница не найдена
      </h1>
    </main>
  );
}
