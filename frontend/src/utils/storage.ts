import { REMEMBER_ME_KEY, TOKEN_KEY } from './constants';

/** Preference only — never stores JWT. Refresh lives in HttpOnly cookie. */
export const storage = {
  getRememberMe(): boolean {
    return localStorage.getItem(REMEMBER_ME_KEY) === '1';
  },

  setRememberMe(value: boolean): void {
    if (value) {
      localStorage.setItem(REMEMBER_ME_KEY, '1');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  },

  /** Remove legacy JWT storage keys from older app versions. */
  clearLegacyTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },

  clearAuthPreferences(): void {
    localStorage.removeItem(REMEMBER_ME_KEY);
    this.clearLegacyTokens();
  },
};
