import { AuthUser } from '@/types/user';

const TOKEN_KEY = 'token';
const USER_DATA_KEY = 'userData';

export const authStorage = {
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  setUserData: (userData: AuthUser) => {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  },

  getUserData: (): AuthUser | null => {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  },

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  }
};
