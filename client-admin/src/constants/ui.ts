export const COLORS = {
  PRIMARY: '#6D3FE6',
  GRAY: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  SUCCESS: {
    LIGHT: '#dcfce7',
    DARK: '#166534',
  },
  ERROR: {
    LIGHT: '#fee2e2',
    DARK: '#991b1b',
  },
  WHITE: '#ffffff',
} as const;

export const SPACING = {
  XS: '4px',
  SM: '8px',
  MD: '12px',
  LG: '16px',
  XL: '20px',
  XXL: '24px',
} as const;

export const BORDER_RADIUS = {
  SM: '4px',
  MD: '8px',
  LG: '12px',
} as const;

export const SHADOWS = {
  SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
} as const;

export const TRANSITIONS = {
  DEFAULT: 'all 0.2s ease',
  SLOW: 'all 0.3s ease',
} as const;

export const Z_INDEX = {
  MODAL_BACKDROP: 1000,
  MODAL: 1001,
  NOTIFICATION: 1002,
} as const;