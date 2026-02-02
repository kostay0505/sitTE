'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { getTokens } from '@/api/auth/tokenStorage';
import { isTokenExpired } from '@/utils/tokenUtils';
import { ROUTES } from '@/config/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const isAuthorized = useAuthStore(s => s.isAuthorized);

  useEffect(() => {
    const tokens = getTokens();
    const hasValidToken =
      tokens && tokens.accessToken && !isTokenExpired(tokens.accessToken);

    if (!hasValidToken && !isAuthorized) {
      router.replace(ROUTES.HOME);
    }
  }, [isAuthorized, router]);

  const tokens = getTokens();
  const hasValidToken =
    tokens && tokens.accessToken && !isTokenExpired(tokens.accessToken);

  if (!hasValidToken && !isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
