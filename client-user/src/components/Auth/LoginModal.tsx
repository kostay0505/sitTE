'use client';

import React, { FormEvent, useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { loginWithEmail, telegramLogin } from '@/api/auth/methods';
import { saveTokens } from '@/api/auth/tokenStorage';
import { toast } from 'sonner';
import { getBotUsername } from '@/api/auth/methods';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenRegister: () => void;
  onOpenForgotPassword: () => void;
  onEmailUnconfirmed: (email: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  open,
  onClose,
  onSuccess,
  onOpenRegister,
  onOpenForgotPassword,
  onEmailUnconfirmed,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [credentialsError, setCredentialsError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [botUsername, setBotUsername] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onSuccessRef = useRef(onSuccess);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onCloseRef.current = onClose;
  }, [onSuccess, onClose]);

  useEffect(() => {
    const fetchBotUsername = async () => {
      try {
        const response = await getBotUsername();
        setBotUsername(response.username);
      } catch (error) {
        console.error('Failed to get bot username:', error);
        setBotUsername('');
      }
    };

    if (open) {
      fetchBotUsername();
    }
  }, [open]);

  useEffect(() => {
    if (!open || !botUsername || !containerRef.current) return;

    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '20');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    containerRef.current.appendChild(script);

    window.onTelegramAuth = async (user: any) => {
      try {
        const response = await telegramLogin({
          id: user.id.toString(),
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
        });

        saveTokens(response);
        toast.success('Вход выполнен успешно');
        onSuccessRef.current();
        onCloseRef.current();
      } catch (error: any) {
        toast.error(error?.message || 'Ошибка при входе через Telegram');
      }
    };

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [open, botUsername]);
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setCredentialsError('');

    if (!email.trim() || !password.trim()) {
      setCredentialsError('Неверный e-mail или пароль');
      return;
    }

    try {
      setIsSubmitting(true);
      const tokens = await loginWithEmail({
        email: email.trim(),
        password,
      });

      saveTokens(tokens);
      onSuccess();
      setEmail('');
      setPassword('');
      setCredentialsError('');
    } catch (error: any) {
      const message = error?.message || 'Не удалось выполнить вход';

      if (message === 'Email не подтверждён') {
        onClose();
        onEmailUnconfirmed(email.trim());
        return;
      }

      setCredentialsError(message || 'Неверный e-mail или пароль');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordClick = () => {
    onClose();
    onOpenForgotPassword();
  };

  const handleRegisterClick = () => {
    onClose();
    onOpenRegister();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      height='h-auto max-h-[80vh]'
      className='w-11/12 max-w-md'
    >
      <div className='flex flex-col gap-4 h-full'>
        <h2 className='text-lg font-semibold text-gray-900 text-center'>
          Войти
        </h2>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-3'>
            <div className='flex flex-col gap-1'>
              <Input
                label='E-mail'
                type='email'
                value={email}
                error={credentialsError}
                onChange={event => setEmail(event.target.value)}
              />
            </div>
            <div className='flex flex-col gap-1'>
              <Input
                label='Пароль'
                type='password'
                value={password}
                onChange={event => setPassword(event.target.value)}
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full mt-2 rounded-xl bg-primary-green text-white py-3 text-sm font-semibold transition hover:opacity-90 active:opacity-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
          >
            Войти
          </button>
        </form>

        <div className='flex flex-col gap-3'>
          <button
            type='button'
            onClick={handleForgotPasswordClick}
            className='text-sm text-primary-green underline underline-offset-2 self-start cursor-pointer'
          >
            Забыли пароль?
          </button>

          <button
            type='button'
            onClick={handleRegisterClick}
            className='w-full rounded-xl border border-primary-green text-primary-green py-3 text-sm font-semibold transition hover:bg-primary-green hover:text-white cursor-pointer'
          >
            Зарегистрироваться
          </button>

          <div
            ref={containerRef}
            id='telegram-widget-container'
            className='w-full flex items-center justify-center'
          />
        </div>
      </div>
    </Modal>
  );
};
