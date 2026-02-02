const TG_PLATFORM_PARAM = 'tgWebAppPlatform';

export type TelegramWindow = Window &
  typeof globalThis & {
    Telegram?: {
      WebApp?: {
        initData?: string;
        platform?: string;
      };
    };
  };

function getTelegramWebApp() {
  if (typeof window === 'undefined') return null;
  const tg = (window as TelegramWindow).Telegram;
  return tg?.WebApp ?? null;
}

export function isTelegramMiniApp(): boolean {
  if (typeof window === 'undefined') return false;

  const tg = (window as any).Telegram?.WebApp;

  // 1. WebApp API существует
  if (!tg) return false;

  // 2. Есть initData или initDataUnsafe
  if (tg.initData || tg.initDataUnsafe?.user || tg.initDataUnsafe?.query_id) {
    return true;
  }

  return false;
}

export function getTelegramPlatform(): string | null {
  return getTelegramWebApp()?.platform ?? null;
}

export function getTelegramRawInitData(): string | null {
  return getTelegramWebApp()?.initData ?? null;
}
