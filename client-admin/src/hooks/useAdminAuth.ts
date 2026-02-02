'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '../api/api';

export function useAdminAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            setLoading(true);

            // Если находимся на публичной странице, не делаем запрос
            if (pathname === '/login') {
                setIsAuthenticated(null);
                setLoading(false);
                return;
            }

            try {
                // Делаем простой запрос к защищённому endpoint для проверки
                await api.get('/accounts');
                setIsAuthenticated(true);
            } catch (error: any) {
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [pathname]);

    const refresh = async () => {
        setLoading(true);

        try {
            // Пытаемся обновить токены
            await api.post('/auth/admin/refresh');
            setIsAuthenticated(true);
        } catch (error) {
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    return {
        isAuthenticated,
        loading,
        refresh
    };
} 