'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '../api/api';

// Module-level cache — persists across navigations within the same session
let authCache: boolean | null = null;

export function useAdminAuth() {
    const pathname = usePathname();
    const isLogin = pathname === '/login';

    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(authCache);
    const [loading, setLoading] = useState(authCache === null && !isLogin);

    useEffect(() => {
        if (isLogin) {
            setLoading(false);
            return;
        }

        // Already have a cached result — no spinner, no request
        if (authCache !== null) {
            setIsAuthenticated(authCache);
            setLoading(false);
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                await api.get('/accounts');
                if (!cancelled) {
                    authCache = true;
                    setIsAuthenticated(true);
                }
            } catch {
                if (!cancelled) {
                    authCache = false;
                    setIsAuthenticated(false);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refresh = async () => {
        setLoading(true);
        try {
            await api.post('/auth/admin/refresh');
            authCache = true;
            setIsAuthenticated(true);
        } catch {
            authCache = false;
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        authCache = null;
    };

    return { isAuthenticated, loading, refresh, logout };
} 