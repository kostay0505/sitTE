'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  title: string;
  path: string;
  icon?: string;
}

const navigationItems: NavItem[] = [
  { title: '📊 Статистика',              path: '/stats' },
  { title: '👤 Аккаунты',               path: '/accounts' },
  { title: '👥 Пользователи',           path: '/users' },
  { title: '🏷️ Бренды',                path: '/brands' },
  { title: '📂 Категории',              path: '/categories' },
  { title: '🏙️ Города',                path: '/cities' },
  { title: '🌍 Страны',                 path: '/countries' },
  { title: '📦 Товары',                 path: '/products' },
  { title: '📄 Резюме',                 path: '/resumes' },
  { title: '💼 Вакансии',               path: '/vacancies' },
  { title: '📧 Подписки',               path: '/newsletter-subscriptions' },
  { title: '🖼️ Контент сайта',         path: '/site-content' },
  { title: '💬 Поддержка',              path: '/support' },
];

interface SideNavProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export const SideNav = ({ isMobile = false, onClose }: SideNavProps) => {
  const pathname = usePathname();

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      overflowY: 'auto',
    }}>
      {isMobile && (
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'none', border: 'none', fontSize: '24px',
          cursor: 'pointer', color: '#374151',
        }}>×</button>
      )}

      {/* Logo */}
      <div style={{ padding: '0 20px', marginBottom: '32px' }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '800',
          letterSpacing: '0.08em',
          color: '#1e293b',
          textTransform: 'uppercase',
          lineHeight: 1.2,
        }}>
          Touring<br />Expert
        </div>
        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', letterSpacing: '0.05em' }}>
          Admin Panel
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navigationItems.map(item => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  style={{
                    display: 'block',
                    padding: '10px 20px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '400',
                    color: isActive ? '#1e293b' : '#475569',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.6)' : 'transparent',
                    borderLeft: isActive ? '3px solid #334155' : '3px solid transparent',
                    borderRadius: isActive ? '0 10px 10px 0' : '0',
                    transition: 'all 0.15s ease',
                    marginRight: '12px',
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
