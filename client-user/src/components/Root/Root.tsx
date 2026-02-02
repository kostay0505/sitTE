'use client';

import { type PropsWithChildren, useEffect, useState } from 'react';
import { initData, useLaunchParams, useSignal } from '@tma.js/sdk-react';
import { isTMA } from '@tma.js/bridge';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorPage } from '@/components/ErrorPage';
import { useDidMount } from '@/hooks/useDidMount';
import { useClientOnce } from '@/hooks/useClientOnce';
import { init } from '@/core/init';

import './styles.css';
import { useCheckUser } from '@/hooks/useCheckUser';
import { LoadingDots } from '@/components/LoadingDots';
import { usePopup } from '@/hooks/usePopup';
import { SplashScreen } from '../SplashScreen/SplashScreen';
import { useConsentAgreement } from '@/hooks/useConsentAgreement';
import { WelcomeScreen } from '../WelcomeScreen';

// Компонент для отображения экрана загрузки
function LoadingScreen() {
  const style = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  };

  return (
    <div className='root__loading' style={style}>
      <LoadingDots />
    </div>
  );
}

function RootInner({ children }: PropsWithChildren) {
  if (isTMA()) {
    const lp = useLaunchParams();

    const [checking, setChecking] = useState(true);
    const { showPopup } = usePopup();

    // Инициализация библиотеки
    useClientOnce(() => {
      init();
    });

    const initDataUser = useSignal(initData.user);
    const { consentAccepted, accept, isLoading } = useConsentAgreement();

    const userCheckCompleted = useCheckUser();

    useEffect(() => {
      if (userCheckCompleted) {
        setChecking(false);
      }
    }, [userCheckCompleted, initDataUser, showPopup]);

    if (isLoading || checking) {
      return <LoadingScreen />;
    }

    if (!consentAccepted) {
      return <WelcomeScreen onAccept={accept} />;
    }

    return children;
  }

  const { showPopup } = usePopup();

  const initDataUser = useSignal(initData.user);
  const { consentAccepted, accept, isLoading } = useConsentAgreement();

  useEffect(() => {}, [initDataUser, showPopup]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!consentAccepted) {
    return <WelcomeScreen onAccept={accept} />;
  }

  return children;
}

export function Root(props: PropsWithChildren) {
  // Unfortunately, Telegram Mini Apps does not allow us to use all features of
  // the Server Side Rendering. That's why we are showing loader on the server
  // side.
  const didMount = useDidMount();

  return didMount ? (
    <ErrorBoundary fallback={ErrorPage}>
      <RootInner {...props} />
    </ErrorBoundary>
  ) : (
    <SplashScreen />
  );
}
