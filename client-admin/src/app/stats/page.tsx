'use client';

import { useState, useEffect } from 'react';
import { getStats } from '@/api/stats/methods';
import { Stats } from '@/api/stats/models';
import { StatsCard } from '@/components/StatsCard/StatsCard';
import { COLORS } from '@/constants/ui';
import { useNotification } from '@/hooks/useNotification';
import { Notification } from '@/components/ui/Notification/Notification';
import { usePageTitle } from '@/components/AuthWrapper';
import { LoadingState } from '@/types/common';

export default function StatsPage() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        error: null
    });

    const { notification, showNotification } = useNotification();
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Статистика');
    }, [setPageTitle]);

    const loadStats = async () => {
        try {
            setLoadingState({ isLoading: true, error: null });
            const response = await getStats();
            setStats(response);
        } catch (err: any) {
            const errorMessage = err.message || 'Не удалось загрузить статистику';
            setLoadingState({ isLoading: false, error: errorMessage });
            showNotification({
                message: errorMessage,
                type: 'error'
            });
        } finally {
            setLoadingState({ isLoading: false, error: null });
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    if (loadingState.isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <div>Загрузка статистики...</div>
            </div>
        );
    }

    if (loadingState.error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                color: COLORS.ERROR.DARK
            }}>
                <div>{loadingState.error}</div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <div>Нет данных для отображения</div>
            </div>
        );
    }

    return (
        <>
            <div style={{
                padding: '24px',
                backgroundColor: '#f9fafb',
                minHeight: '100vh'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '32px',
                        margin: '0 0 32px 0'
                    }}>
                        Статистика платформы
                    </h1>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '24px',
                        marginBottom: '32px'
                    }}>
                        <StatsCard
                            title="Количество пользователей"
                            value={stats.usersCount.toLocaleString()}
                            color={COLORS.ERROR.DARK}
                        />

                        <StatsCard
                            title="Количество объявлений"
                            value={stats.productsCount.toLocaleString()}
                            color={COLORS.SUCCESS.DARK}
                        />

                        <StatsCard
                            title="Среднее количество объявлений на пользователя"
                            value={stats.averageProductsPerUser.toFixed(2)}
                            color={COLORS.ERROR.DARK}
                        />
                    </div>
                </div>
            </div>

            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={notification.onClose}
                />
            )}
        </>
    );
}
