export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (!password) {
    errors.push('Пароль обязателен');
    return { isValid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов');
  }

  if (password.length > 64) {
    errors.push('Пароль должен содержать максимум 64 символа');
  }

  if (!/[A-Za-z]/.test(password)) {
    errors.push('Пароль должен содержать минимум одну латинскую букву');
  }

  if (!/\d/.test(password)) {
    errors.push('Пароль должен содержать минимум одну цифру');
  }

  if (!/^[A-Za-z0-9!@#$%^&*()\-_+=.,?]+$/.test(password)) {
    errors.push(
      'Пароль может содержать только латинские буквы, цифры и спецсимволы: ! @ # $ % ^ & * ( ) - _ + = . , ?',
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getPasswordErrorMessage(
  validationResult: PasswordValidationResult,
): string {
  if (validationResult.errors.length === 0) {
    return '';
  }
  return validationResult.errors[0];
}
