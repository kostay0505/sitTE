'use client';

import React, { FormEvent, useState } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { registerEmailUser } from '@/api/auth/methods';
import { toast } from 'sonner';
import {
  validatePassword,
  getPasswordErrorMessage,
} from '@/utils/passwordValidation';

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onRegistered: (email: string, password: string) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  open,
  onClose,
  onOpenLogin,
  onRegistered,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [repeatPasswordError, setRepeatPasswordError] = useState('');
  const [commonError, setCommonError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setEmailError('');
    setPasswordError('');
    setRepeatPasswordError('');
    setCommonError('');

    let hasError = false;

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Укажите корректный адрес электронной почты');
      hasError = true;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(getPasswordErrorMessage(passwordValidation));
      hasError = true;
    }

    if (password !== repeatPassword) {
      setRepeatPasswordError('Пароли не совпадают');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setIsSubmitting(true);
      await registerEmailUser({
        email: email.trim(),
        password,
      });

      toast.success('Проверьте почту, код подтверждения отправлен');
      onRegistered(email.trim(), password);
      setEmail('');
      setPassword('');
      setRepeatPassword('');
    } catch (error: any) {
      const message = error?.message || '';

      if (message.includes('Email уже зарегистрирован')) {
        setCommonError(
          'Пользователь с такой почтой уже зарегистрирован. Воспользуйтесь входом или восстановлением пароля',
        );
      } else if (
        message.includes('превысили количество попыток') ||
        message.includes('превысили')
      ) {
        setCommonError(message);
      } else {
        setCommonError(
          message ||
            'Не удалось зарегистрировать пользователя. Попробуйте ещё раз',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginClick = () => {
    onClose();
    onOpenLogin();
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
          Регистрация
        </h2>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-3'>
            <div className='flex flex-col gap-1'>
              <Input
                label='E-mail'
                type='email'
                value={email}
                error={emailError}
                onChange={event => setEmail(event.target.value)}
              />
              {emailError && (
                <p className='mt-1 text-xs text-red-500'>{emailError}</p>
              )}
            </div>
            <div className='flex flex-col gap-1'>
              <Input
                label='Пароль'
                type='password'
                value={password}
                error={passwordError}
                onChange={event => setPassword(event.target.value)}
              />
            </div>
            <div className='flex flex-col gap-1'>
              <Input
                label='Повтор пароля'
                type='password'
                value={repeatPassword}
                error={repeatPasswordError}
                onChange={event => setRepeatPassword(event.target.value)}
              />
            </div>
          </div>

          {commonError && (
            <p className='text-xs text-red-500 text-center'>{commonError}</p>
          )}

          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full mt-2 rounded-xl bg-primary-green text-white py-3 text-sm font-semibold transition hover:opacity-90 active:opacity-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
          >
            Зарегистрироваться
          </button>
        </form>

        <button
          type='button'
          onClick={handleLoginClick}
          className='w-full rounded-xl border border-primary-green text-primary-green py-3 text-sm font-semibold transition hover:bg-primary-green hover:text-white cursor-pointer'
        >
          Войти
        </button>
      </div>
    </Modal>
  );
};
