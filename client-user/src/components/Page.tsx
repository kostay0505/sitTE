'use client';

import { backButton } from '@tma.js/sdk-react';
import { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function Page({
  children,
  back = true,
  onBackClick,
}: PropsWithChildren<{
  back?: boolean;
  onBackClick?: () => void;
}>) {
  const router = useRouter();

 if (backButton.isSupported()) {
  useEffect(() => {
    if (back || onBackClick) {
      backButton.show();
    } else {
      backButton.hide();
    }
  }, [back, onBackClick]);

  useEffect(() => {
    return backButton.onClick(() => {
      if (onBackClick) {
        onBackClick();
      } else {
        router.back();
      }
    });
  }, [router, onBackClick]);
 }

  return <>{children}</>;
}
