import { ASSETS_LINK } from '@/config/constants';

export function toImageSrc(
  url?: string | null,
  fallback = '/images/fallback.png',
): string {
  if (!url) return fallback;

  if (/^https?:\/\//i.test(url)) return url;

  if (url.startsWith('/')) return url;

  const base = (ASSETS_LINK || '').replace(/\/+$/, '');
  const path = url.replace(/^\/+/, '');

  if (base) return `${base}/${path}`;

  return fallback;
}
