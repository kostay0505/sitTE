import type { PropsWithChildren } from 'react';
import type { Metadata, Viewport } from 'next';
import { Comfortaa } from 'next/font/google';

import { Root } from '@/components/Root/Root';
import { Toaster } from 'sonner';

// import 'normalize.css/normalize.css';
import './_assets/globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { Tabs } from '@/components/Tabs';

export const metadata: Metadata = {
  title: 'Touring expert',
  description: 'Touring expert',
};

const comfortaa = Comfortaa({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: 'white',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
};

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html className={comfortaa.className}>
      <body
        className={'text-white'}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Root>
          <QueryProvider>{children}</QueryProvider>
          <Toaster richColors position='top-center' />
          <Tabs />
        </Root>
        <div id='modal-root'></div>
      </body>
    </html>
  );
}
