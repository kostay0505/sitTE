'use client';

import { useState } from 'react';
import { adminLogin } from '@/api/auth/methods';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/FormField/FormField';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/constants/ui';

interface LoginFormProps {
    onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!login.trim() || !password.trim()) {
            setError('Заполните все поля');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Получаем IP пользователя
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();

            await adminLogin({
                login: login.trim(),
                password: password.trim(),
                ip: ipData.ip || 'unknown'
            });

            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Ошибка авторизации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: COLORS.GRAY[50],
            padding: SPACING.XL
        }}>
            <form style={{
                backgroundColor: COLORS.WHITE,
                padding: SPACING.XXL,
                borderRadius: BORDER_RADIUS.LG,
                boxShadow: SHADOWS.LG,
                width: '100%',
                maxWidth: '400px'
            }} onSubmit={handleSubmit}>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: SPACING.XXL,
                    textAlign: 'center',
                    color: COLORS.GRAY[700]
                }}>Авторизация</h1>

                {error && (
                    <div style={{
                        backgroundColor: COLORS.ERROR.LIGHT,
                        color: COLORS.ERROR.DARK,
                        padding: SPACING.MD,
                        borderRadius: BORDER_RADIUS.MD,
                        marginBottom: SPACING.LG,
                        fontSize: '14px',
                        border: `1px solid ${COLORS.ERROR.DARK}`
                    }}>
                        {error}
                    </div>
                )}

                <Input
                    label="Логин"
                    name="login"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    placeholder="Введите логин"
                    disabled={loading}
                    autoComplete="username"
                    required
                />

                <Input
                    label="Пароль"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    disabled={loading}
                    autoComplete="current-password"
                    required
                />

                <Button
                    type="submit"
                    loading={loading}
                    size="lg"
                    style={{ width: '100%' }}
                >
                    Войти
                </Button>
            </form>
        </div>
    );
} 