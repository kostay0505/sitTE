'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import { Modal } from '@/components/common/Modal/Modal';
import { Input } from '@/components/common/Input/Input';
import { toast } from 'sonner';
import {
  resetPasswordWithCode,
  sendForgotPasswordCode,
} from '@/api/auth/methods';
import {
  validatePassword,
  getPasswordErrorMessage,
} from '@/utils/passwordValidation';

interface PasswordRecoveryModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
}

type RecoveryStep = 'request' | 'reset';

export const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<RecoveryStep>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const [passwordError, setPasswordError] = useState('');
  const [repeatPasswordError, setRepeatPasswordError] = useState('');
  const [commonError, setCommonError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep('request');
      setEmail('');
      setCode('');
      setPassword('');
      setRepeatPassword('');
      setPasswordError('');
      setRepeatPasswordError('');
    }
  }, [open]);

  const handleRequestSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setCommonError('');

    if (!email.trim()) {
      setCommonError('Укажите корректный адрес электронной почты');
      return;
    }

    try {
      setIsSubmitting(true);
      await sendForgotPasswordCode({ email: email.trim() });
      setStep('reset');
    } catch (error: any) {
      const message = error?.message || '';

      if (
        message.includes('превысили количество попыток') ||
        message.includes('превысили')
      ) {
        setCommonError(message);
      } else {
        setCommonError(
          message ||
            'Не удалось отправить код восстановления. Попробуйте ещё раз.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setPasswordError('');
    setRepeatPasswordError('');
    setCommonError('');

    let hasError = false;

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setPasswordError(getPasswordErrorMessage(passwordValidation));
      hasError = true;
    }

    if (password !== repeatPassword) {
      setRepeatPasswordError('Пароли не совпадают');
      hasError = true;
    }

    if (!/^[0-9A-F]{6}$/i.test(code.trim())) {
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPasswordWithCode({
        email: email.trim(),
        code: code.trim().toUpperCase(),
        newPassword: password,
      });

      toast.success('Пароль успешно изменён');
      onSuccess(email.trim());
    } catch (error: any) {
      const message = error?.message || '';

      if (message.includes('Неверный код')) {
        setCommonError('Неверный код. Попробуйте ещё раз.');
      } else if (
        message.includes('превысили количество попыток') ||
        message.includes('превысили')
      ) {
        setCommonError(message);
      } else {
        setCommonError(
          message || 'Не удалось сохранить новый пароль. Попробуйте ещё раз.',
        );
      }
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
          Восстановление пароля
        </h2>

        {step === 'request' && (
          <form onSubmit={handleRequestSubmit} className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <Input
                label='E-mail'
                type='email'
                value={email}
                onChange={event => setEmail(event.target.value)}
              />
            </div>

            {commonError && (
              <p className='text-xs text-red-500 text-center'>{commonError}</p>
            )}

            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full rounded-xl bg-primary-green text-white py-3 text-sm font-semibold transition hover:opacity-90 active:opacity-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
            >
              Отправить код
            </button>

            <p className='text-xs text-gray-600 text-center'>
              Если такой e-mail зарегистрирован, мы отправили на него код для
              восстановления пароля.
            </p>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetSubmit} className='flex flex-col gap-4'>
            <p className='text-xs text-gray-600 text-center'>
              Введите код из письма и новый пароль.
            </p>

            <div className='flex flex-col gap-3'>
              <div className='flex flex-col gap-1'>
                <Input
                  label='Код из письма'
                  value={code}
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

              <div className='flex flex-col gap-1'>
                <Input
                  label='Новый пароль'
                  type='password'
                  value={password}
                  error={passwordError}
                  onChange={event => setPassword(event.target.value)}
                />
              </div>

              <div className='flex flex-col gap-1'>
                <Input
                  label='Повтор нового пароля'
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
              className='w-full rounded-xl bg-primary-green text-white py-3 text-sm font-semibold transition hover:opacity-90 active:opacity-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
            >
              Сохранить новый пароль
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};
