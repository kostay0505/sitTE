'use client';

import { PropsWithChildren } from 'react';
import './_assets/globals.css';
import { AuthWrapper } from '@/components/AuthWrapper';

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <style jsx global>{`
          * {
            box-sizing: border-box;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .desktop-sidenav {
            display: none;
          }

          @media (min-width: 769px) {
            .desktop-sidenav {
              display: block;
            }
            .mobile-toggle {
              display: none !important;
            }
          }

          @media (max-width: 768px) {
            .mobile-toggle { display: block !important; }
          }
        `}</style>
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}
