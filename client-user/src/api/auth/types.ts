export type CreateTokenDto = {
  initDataRaw: string;
  ip: string;
};

export type CreateTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export type RefreshTokenDto = {
  refreshToken: string;
};

export type RefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
};

export type EmailRegisterDto = {
  email: string;
  password: string;
};

export type EmailRegisterResponse = {
  message: string;
};

export type EmailConfirmDto = {
  email: string;
  code: string;
};

export type EmailConfirmResponse = {
  message: string;
};

export type ResendEmailConfirmDto = {
  email: string;
};

export type ResendEmailConfirmResponse = {
  message: string;
};

export type EmailLoginDto = {
  email: string;
  password: string;
};

export type EmailLoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export type ForgotPasswordDto = {
  email: string;
};

export type ForgotPasswordResponse = {
  message?: string;
};

export type ResetPasswordDto = {
  email: string;
  code: string;
  newPassword: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export type TelegramAuthDto = {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

export type TelegramAuthResponse = {
  accessToken: string;
  refreshToken: string;
};
