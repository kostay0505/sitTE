import { create } from 'zustand';

export type AuthModalMode =
  | 'none'
  | 'login'
  | 'register'
  | 'confirmEmail'
  | 'resetPassword';

interface AuthState {
  isAuthorized: boolean;
  authMode: AuthModalMode;
  authEmail: string;
  authPassword: string;
}

interface AuthActions {
  setAuthorized: (value: boolean) => void;
  setAuthMode: (mode: AuthModalMode) => void;
  setAuthEmail: (email: string) => void;
  setAuthPassword: (password: string) => void;
  resetAuthFlow: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>(set => ({
  isAuthorized: false,
  authMode: 'none',
  authEmail: '',
  authPassword: '',
  setAuthorized: value => set({ isAuthorized: value }),
  setAuthMode: authMode => set({ authMode }),
  setAuthEmail: authEmail => set({ authEmail }),
  setAuthPassword: authPassword => set({ authPassword }),
  resetAuthFlow: () =>
    set({
      authMode: 'none',
      authEmail: '',
      authPassword: '',
    }),
}));
