import { api } from '@/api/api';
import {
  CreateTokenDto,
  CreateTokenResponse,
  RefreshTokenDto,
  RefreshTokenResponse,
  EmailRegisterDto,
  EmailRegisterResponse,
  EmailConfirmDto,
  EmailConfirmResponse,
  ResendEmailConfirmDto,
  ResendEmailConfirmResponse,
  EmailLoginDto,
  EmailLoginResponse,
  ForgotPasswordDto,
  ForgotPasswordResponse,
  ResetPasswordDto,
  ResetPasswordResponse,
  TelegramAuthDto,
  TelegramAuthResponse,
} from '@/api/auth/types';
import { pickErrorMessage } from '@/utils/request';

export async function createToken(
  dto: CreateTokenDto,
): Promise<CreateTokenResponse> {
  try {
    const response = await api.post<CreateTokenResponse>(
      `/auth/token/create`,
      dto,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Не удалось создать токен',
    );
  }
}

export async function refreshToken(
  dto: RefreshTokenDto,
): Promise<RefreshTokenResponse> {
  try {
    const response = await api.post<RefreshTokenResponse>(
      `/auth/token/refresh`,
      dto,
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Не удалось обновить токен',
    );
  }
}

export async function registerEmailUser(
  dto: EmailRegisterDto,
): Promise<EmailRegisterResponse> {
  try {
    const response = await api.post<EmailRegisterResponse>(
      `/auth/register`,
      dto,
    );
    return response.data;
  } catch (error) {
    const message = pickErrorMessage(
      error,
      'Не удалось зарегистрировать пользователя',
    );
    throw new Error(message);
  }
}

export async function confirmEmail(
  dto: EmailConfirmDto,
): Promise<EmailConfirmResponse> {
  try {
    const response = await api.post<EmailConfirmResponse>(
      `/auth/confirm-email`,
      dto,
    );
    return response.data;
  } catch (error) {
    const message = pickErrorMessage(error, 'Не удалось подтвердить почту');
    throw new Error(message);
  }
}

export async function resendEmailConfirm(
  dto: ResendEmailConfirmDto,
): Promise<ResendEmailConfirmResponse> {
  try {
    const response = await api.post<ResendEmailConfirmResponse>(
      `/auth/confirm-email/resend`,
      dto,
    );
    return response.data;
  } catch (error) {
    const message = pickErrorMessage(
      error,
      'Не удалось отправить код подтверждения',
    );
    throw new Error(message);
  }
}

export async function loginWithEmail(
  dto: EmailLoginDto,
): Promise<EmailLoginResponse> {
  try {
    const response = await api.post<EmailLoginResponse>(`/auth/login`, dto);
    return response.data;
  } catch (error) {
    const message = pickErrorMessage(error, 'Не удалось выполнить вход');
    throw new Error(message);
  }
}

export async function sendForgotPasswordCode(
  dto: ForgotPasswordDto,
): Promise<ForgotPasswordResponse> {
  try {
    const response = await api.post<ForgotPasswordResponse>(
      `/auth/password/forgot`,
      dto,
    );
    return response.data;
  } catch (error) {
    const message = pickErrorMessage(
      error,
      'Не удалось отправить код восстановления',
    );
    throw new Error(message);
  }
}

export async function resetPasswordWithCode(
  dto: ResetPasswordDto,
): Promise<ResetPasswordResponse> {
  try {
    const response = await api.post<ResetPasswordResponse>(
      `/auth/password/reset`,
      dto,
    );
    return response.data;
  } catch (error) {
    const message = pickErrorMessage(
      error,
      'Не удалось сохранить новый пароль',
    );
    throw new Error(message);
  }
}

export async function telegramAuth(
  dto: TelegramAuthDto,
): Promise<TelegramAuthResponse> {
  try {
    const response = await api.post<TelegramAuthResponse>(
      `/auth/telegram/auth`,
      dto,
    );
    return response.data;
  } catch (error) {
    const message = pickErrorMessage(
      error,
      'Не удалось выполнить авторизацию через Telegram',
    );
    throw new Error(message);
  }
}

export async function telegramLogin(
  dto: TelegramAuthDto,
): Promise<TelegramAuthResponse> {
  try {
    const response = await api.post<TelegramAuthResponse>(
      `/auth/telegram/login`,
      dto,
    );
    return response.data;
  } catch (error) {
    const message = pickErrorMessage(error, 'Не удалось войти через Telegram');
    throw new Error(message);
  }
}

export async function getBotUsername(): Promise<{ username: string }> {
  try {
    const response = await api.get<{ username: string }>(
      '/auth/telegram/bot-username',
    );
    return response.data;
  } catch (error) {
    const message = pickErrorMessage(error, 'Не удалось получить имя бота');
    throw new Error(message);
  }
}
