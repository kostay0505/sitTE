'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/ui';
import { usePageTitle } from '@/components/AuthWrapper';

interface NavigationItem {
  href: string;
  label: string;
}

const navigationItems: NavigationItem[] = [
  {
    href: '/accounts',
    label: 'Управление аккаунтами',
  },
  {
    href: '/users',
    label: 'Управление пользователями',
  },
  {
    href: '/brands',
    label: 'Управление брендами',
  },
  {
    href: '/categories',
    label: 'Управление категориями',
  },
  {
    href: '/cities',
    label: 'Управление городами',
  },
  {
    href: '/countries',
    label: 'Управление странами',
  },
  {
    href: '/products',
    label: 'Управление товарами',
  },
  {
    href: '/resumes',
    label: 'Управление резюме',
  },
  {
    href: '/vacancies',
    label: 'Управление вакансиями',
  },
  {
    href: '/newsletter-subscriptions',
    label: 'Управление подписками на рассылку',
  },
];

export default function AdminPanel() {
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle('Административная панель');
  }, [setPageTitle]);

  return (
    <div>
      <div style={{
        display: 'grid',
        gap: SPACING.LG,
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
      }}>
        {navigationItems.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              backgroundColor: COLORS.WHITE,
              border: `1px solid ${COLORS.GRAY[200]}`,
              borderRadius: BORDER_RADIUS.LG,
              padding: SPACING.XXL,
              textDecoration: 'none',
              display: 'block',
              boxShadow: SHADOWS.SM,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = SHADOWS.MD;
              e.currentTarget.style.borderColor = COLORS.PRIMARY;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = SHADOWS.SM;
              e.currentTarget.style.borderColor = COLORS.GRAY[200];
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: SPACING.SM
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: COLORS.GRAY[900]
              }}>
                {label}
              </h3>
              <span style={{
                fontSize: '20px',
                color: COLORS.PRIMARY
              }}>
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 