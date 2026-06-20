import { TOKEN_KEY } from './constants';

export const storage = {
  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    sessionStorage.removeItem(TOKEN_KEY);
  },
};
