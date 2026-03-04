export const ENVIRONMENT_CONFIG = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
} as const;

export type EnvironmentConfig = typeof ENVIRONMENT_CONFIG;
