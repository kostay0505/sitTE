'use client';

import { ErrorPage } from '@/components/ErrorPage';

export default function NotFound() {
  const error = new Error('Страница не найдена');

  return <ErrorPage error={error} />;
}
