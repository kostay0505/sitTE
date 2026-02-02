'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { toast } from 'sonner';
import { confirmEmail, resendEmailConfirm } from '@/api/auth/methods';

interface EmailConfirmModalProps {
  open: boolean;
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const EmailConfirmModal: React.FC<EmailConfirmModalProps> = ({
  open,
  email,
  onClose,
  onSuccess,
}) => {
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!open) {
      setCode('');
      setCodeError('');
      setSecondsLeft(60);
    }
  }, [open]);

  useEffect(() => {
    if (!open || secondsLeft <= 0) {
      return;
    }

    const intervalId = window.setInterval(
      () => setSecondsLeft(previous => (previous > 0 ? previous - 1 : 0)),
      1000,
    );

    return () => window.clearInterval(intervalId);
  }, [open, secondsLeft]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setCodeError('');

    const trimmedCode = code.trim();

    if (!/^[0-9A-F]{6}$/i.test(trimmedCode)) {
      setCodeError('Неверный код. Попробуйте ещё раз.');
      return;
    }

    try {
      setIsSubmitting(true);
      await confirmEmail({
        email,
        code: trimmedCode.toUpperCase(),
      });

      toast.success('Регистрация успешно завершена');
      onSuccess();
    } catch (error: any) {
      const message = error?.message || '';

      if (message.includes('Неверный код')) {
        setCodeError('Неверный код. Попробуйте ещё раз.');
      } else if (message.includes('User not found')) {
        setCodeError('Пользователь с такой почтой не найден');
      } else if (
        message.includes('превысили количество попыток') ||
        message.includes('превысили')
      ) {
        setCodeError(message);
      } else {
        setCodeError(
          message || 'Не удалось подтвердить почту. Попробуйте ещё раз.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending) {
      return;
    }

    try {
      setIsResending(true);
      await resendEmailConfirm({ email });
      setSecondsLeft(60);
      toast.success('Новый код подтверждения отправлен');
    } catch (error: any) {
      const message = error?.message || '';
      if (
        message.includes('превысили количество попыток') ||
        message.includes('превысили')
      ) {
        setCodeError(message);
      } else {
        setCodeError(
          message ||
            'Не удалось отправить код подтверждения. Попробуйте ещё раз.',
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  const formattedTimer =
    secondsLeft > 0
      ? `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(
          secondsLeft % 60,
        ).padStart(2, '0')}`
      : '00:00';

  return (
    <Modal
      open={open}
      onClose={onClose}
      height='h-auto max-h-[80vh]'
      className='w-11/12 max-w-md'
    >
      <div className='flex flex-col gap-4 h-full'>
        <h2 className='text-lg font-semibold text-gray-900 text-center'>
          Подтверждение почты
        </h2>
        <p className='text-sm text-gray-700 text-center'>
          Мы отправили код подтверждения на адрес{' '}
          <span className='font-bold whitespace-nowrap'>{email}</span>. Введите код
          из письма, чтобы завершить регистрацию.
        </p>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <Input
              label='Код из письма'
              maxLength={6}
              value={code}
              error={codeError}
              onChange={event =>
                setCode(
                  event.target.value
                    .replace(/[^0-9a-zA-Z]/g, '')
                    .toUpperCase()
                    .slice(0, 6),
                )
              }
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

        <div className='flex flex-col gap-2 items-center'>
          <button
            type='button'
            onClick={handleResend}
            disabled={secondsLeft > 0 || isResending}
            className='text-sm text-primary-green disabled:text-gray-400 disabled:cursor-default underline underline-offset-2 cursor-pointer'
          >
            Отправить код ещё раз
          </button>
          {secondsLeft > 0 ? (
            <span className='text-xs text-gray-500'>
              Можно запросить новый код через {formattedTimer}
            </span>
          ) : (
            <span className='text-xs text-gray-500'>
              Срок действия кода истёк. Запросите новый код.
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
};
