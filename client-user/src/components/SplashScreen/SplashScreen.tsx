import Image from 'next/image';

export function SplashScreen() {
  return (
    <main className='w-full min-h-screen flex items-center justify-center px-4 bg-[#F5F5FA]'>
      <Image
        src={'/images/logo.png'}
        width={181}
        height={181}
        alt='Home Icon'
        priority
        objectFit='contain'
        unoptimized
      />
    </main>
  );
}
