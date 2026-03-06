'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { COLORS, SPACING, TRANSITIONS } from '@/constants/ui';

interface NavItem {
  title: string;
  path: string;
  icon?: string;
}

const SIDEBAR_WIDTH = '250px';

const navigationItems: NavItem[] = [
  { title: 'Статистика', path: '/stats' },
  { title: 'Аккаунты', path: '/accounts' },
  { title: 'Пользователи', path: '/users' },
  { title: 'Бренды', path: '/brands' },
  { title: 'Категории', path: '/categories' },
  { title: 'Города', path: '/cities' },
  { title: 'Страны', path: '/countries' },
  { title: 'Товары', path: '/products' },
  { title: 'Резюме', path: '/resumes' },
  { title: 'Вакансии', path: '/vacancies' },
  { title: 'Подписки на рассылку', path: '/newsletter-subscriptions' },
  { title: 'Контент сайта', path: '/site-content' },
];

interface SideNavProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export const SideNav = ({ isMobile = false, onClose }: SideNavProps) => {
  const pathname = usePathname();

  return (
    <div data-sidenav style={{ width: SIDEBAR_WIDTH, backgroundColor: COLORS.GRAY[900], color: COLORS.WHITE, padding: `${SPACING.XL} 0`, boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)', height: '100vh', overflowY: 'auto' }}>

      {isMobile && (
        <button onClick={onClose} style={{ position: 'absolute', top: SPACING.MD, right: SPACING.MD, background: 'none', border: 'none', color: COLORS.WHITE, fontSize: '24px', cursor: 'pointer' }}>
          ×
        </button>
      )}

      <div style={{
        padding: `0 ${SPACING.XL}`,
        marginBottom: SPACING.XXL
      }}>
        <h1 style={{
          fontSize: '24px',
          margin: 0,
          fontWeight: '600'
        }}>
          Админ-панель
        </h1>
      </div>

      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navigationItems.map((item) => {
            const isActive = pathname === item.path;

            return (
              <li key={item.path} style={{ marginBottom: SPACING.SM }}>
                <Link
                  href={item.path}
                  style={{
                    display: 'block',
                    padding: `${SPACING.MD} ${SPACING.XL}`,
                    textDecoration: 'none',
                    color: isActive ? COLORS.WHITE : COLORS.GRAY[400],
                    backgroundColor: isActive ? COLORS.GRAY[700] : 'transparent',
                    borderLeft: isActive ? `4px solid ${COLORS.PRIMARY}` : '4px solid transparent',
                    fontSize: '16px',
                    transition: TRANSITIONS.DEFAULT,
                  }}
                >
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}; 