import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { mockUsers } from '@/mock';

export type UserRole = User['role'];

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (username: string, password: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const roleConfig: Record<string, { label: string; homePath: string; icon: string }> = {
  director: { label: '院长', homePath: '/director/dashboard', icon: '👨‍💼' },
  nurse: { label: '护士', homePath: '/director/health', icon: '👩‍⚕️' },
  caregiver: { label: '护工', homePath: '/caregiver/tasks', icon: '🧑‍🦯' },
  family: { label: '家属', homePath: '/family/home', icon: '👨‍👩‍👧' },
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (username: string, password: string, role?: UserRole) => {
        set({ loading: true, error: null });
        try {
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const user = mockUsers.find(u => u.username === username);
          if (!user) {
            set({ error: '用户不存在', loading: false });
            return false;
          }
          if (user.password !== password) {
            set({ error: '密码错误', loading: false });
            return false;
          }
          
          if (role && user.role !== role) {
            set({ error: '该账号角色不匹配', loading: false });
            return false;
          }

          const token = `token_${user.id}_${Date.now()}`;
          set({
            isAuthenticated: true,
            user,
            token,
            loading: false,
            error: null,
          });
          return true;
        } catch (err) {
          set({ error: '登录失败，请稍后重试', loading: false });
          return false;
        }
      },

      logout: () => {
        set({ ...initialState });
        localStorage.removeItem('auth-storage');
      },

      hasRole: (role: string) => {
        const { user } = get();
        if (!user) return false;
        return user.role === role;
      },

      hasAnyRole: (roles: string[]) => {
        return roles.some(r => get().hasRole(r));
      },

      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);
