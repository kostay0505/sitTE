'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { toast } from 'sonner';

interface PasswordMergeModalProps {
  open: boolean;
  email: string;
  onClose: () => void;
  onSuccess: (email: string, password: string) => void;
}

export const PasswordMergeModal: React.FC<PasswordMergeModalProps> = ({
  open,
  email,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setPassword('');
      setPasswordError('');
    }
  }, [open]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError('');

    if (!password.trim()) {
      setPasswordError('Введите пароль');
      return;
    }

    try {
      setIsSubmitting(true);
      onSuccess(email, password);
    } catch (error: any) {
      const message = error?.message || '';
      setPasswordError(message || 'Неверный пароль. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
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
          Подтверждение пароля
        </h2>
        <p className='text-sm text-gray-700 text-center'>
          Для привязки email{' '}
          <span className='font-semibold break-all'>{email}</span> к вашему
          аккаунту необходимо ввести пароль от этого аккаунта.
        </p>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <Input
              label='Пароль'
              type='password'
              value={password}
              error={passwordError}
              onChange={event => setPassword(event.target.value)}
            />
          </div>

          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full rounded-xl bg-primary-green text-white py-3 text-sm font-semibold transition hover:opacity-90 active:opacity-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
          >
            Подтвердить
          </button>
        </form>
      </div>
    </Modal>
  );
};
