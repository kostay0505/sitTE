'use client';

import { PropsWithChildren, useEffect, useState, createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { SideNav } from './SideNav';
import { adminLogout } from '../api/auth/methods';
import { Button } from '@/components/ui/Button/Button';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/ui';

// Маршруты, которые не требуют авторизации
const PUBLIC_ROUTES = ['/login'];

// Контекст для управления заголовком страницы
interface PageTitleContextType {
    pageTitle: string;
    setPageTitle: (title: string) => void;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined);

export const usePageTitle = () => {
    const context = useContext(PageTitleContext);
    if (!context) {
        throw new Error('usePageTitle должен использоваться внутри AuthWrapper');
    }
    return context;
};

export function AuthWrapper({ children }: PropsWithChildren) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, loading } = useAdminAuth();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [pageTitle, setPageTitle] = useState('Административная панель');

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    useEffect(() => {
        if (!loading && !isPublicRoute && isAuthenticated === false) {
            router.push('/login');
        }
    }, [loading, isPublicRoute, isAuthenticated, router]);

    // Показываем загрузку пока проверяется авторизация
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: COLORS.GRAY[50],
                fontSize: '16px',
                color: COLORS.GRAY[500]
            }}>
                Проверка авторизации...
            </div>
        );
    }

    // Если это публичный маршрут, показываем содержимое без проверки авторизации
    if (isPublicRoute) {
        return <>{children}</>;
    }

    // Если пользователь не авторизован на защищенном маршруте
    if (!isAuthenticated) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: COLORS.GRAY[50],
                fontSize: '16px',
                color: COLORS.GRAY[500]
            }}>
                Перенаправление на страницу входа...
            </div>
        );
    }

    const handleLogout = async () => {
        try {
            await adminLogout();
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
        router.push('/login');
    };

    // Защищенный интерфейс с навигацией
    return (
        <PageTitleContext.Provider value={{ pageTitle, setPageTitle }}>
            <div style={{
                display: 'flex',
                minHeight: '100vh',
                backgroundColor: COLORS.GRAY[50]
            }}>
                <div className="desktop-sidenav">
                    <SideNav />
                </div>
                <main style={{ flex: 1, padding: SPACING.XL, overflow: 'auto', position: 'relative' }}>
                    {/* Заголовок с кнопкой выхода */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: SPACING.XL,
                        padding: SPACING.LG,
                        backgroundColor: COLORS.WHITE,
                        borderRadius: BORDER_RADIUS.MD,
                        boxShadow: SHADOWS.DEFAULT
                    }}>
                        <h1 style={{
                            margin: 0,
                            fontSize: '18px',
                            color: COLORS.GRAY[700],
                            fontWeight: '600'
                        }}>
                            {pageTitle}
                        </h1>
                        <Button
                            variant="danger"
                            onClick={handleLogout}
                        >
                            Выйти
                        </Button>
                    </div>
                    <div style={{ display: 'none', position: 'absolute', top: `-${SPACING.SM}`, left: `-${SPACING.SM}`, zIndex: 10 }} className="mobile-toggle">
                        <button onClick={() => setIsMobileNavOpen(true)} style={{ padding: SPACING.MD, background: 'none', border: 'none', cursor: 'pointer' }}>
                            <div style={{ width: '24px', height: '2px', background: COLORS.GRAY[900], margin: '4px 0' }} />
                            <div style={{ width: '24px', height: '2px', background: COLORS.GRAY[900], margin: '4px 0' }} />
                            <div style={{ width: '24px', height: '2px', background: COLORS.GRAY[900], margin: '4px 0' }} />
                        </button>
                    </div>
                    {children}
                </main>
                {isMobileNavOpen && (
                    <>
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 }} onClick={() => setIsMobileNavOpen(false)} />
                        <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 1001, width: '250px', display: 'block' }} >
                            <SideNav isMobile={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
                        </div>
                    </>
                )}
            </div>
        </PageTitleContext.Provider>
    );
} 