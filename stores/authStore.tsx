import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    token: string | null;
    user: { id: string; email: string; name: string; is_admin?: boolean } | null;
    setAuth: (token: string, user: { id: string; email: string; name: string; is_admin?: boolean }) => void;
    clearAuth: () => void;
  }

const useAuthStore = create<AuthState>()(
    persist(
      (set) => ({
        token: null,
        user: null,
        setAuth: (token, user) => set({ token, user }),
        clearAuth: () => set({ token: null, user: null }),
      }),
      {
        name: 'auth-storage', // Key for localStorage
      }
    )
);

export default useAuthStore;