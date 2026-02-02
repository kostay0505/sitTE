'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '../../components/LoginForm';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export default function LoginPage() {
    const router = useRouter();
    const { isAuthenticated, loading } = useAdminAuth();

    useEffect(() => {
        // Если пользователь уже авторизован, перенаправляем на главную
        if (isAuthenticated === true) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    // Показываем загрузку пока проверяется авторизация
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5'
            }}>
                <div>Загрузка...</div>
            </div>
        );
    }

    // Если уже авторизован, показываем загрузку до перенаправления
    if (isAuthenticated === true) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f5f5f5'
            }}>
                <div>Перенаправление...</div>
            </div>
        );
    }

    const handleLoginSuccess = () => {
        router.push('/');
    };

    return <LoginForm onSuccess={handleLoginSuccess} />;
} 