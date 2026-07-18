import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api';
import { queryKeys } from '@/hooks/queryKeys';
import {
  getPermissionsForRole,
  hasPermission as checkPermission,
  type Permission,
} from '@/constants/permissions';
import { storage } from '@/utils/storage';
import { tokenMemory } from '@/utils/tokenMemory';
import type { AuthProfile, AuthUser, LoginPayload, Organization, Role } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  organization: Organization | null;
  role: Role | null;
  permissions: Permission[];
  isSuperAdmin: boolean;
  hasPermission: (permission: Permission) => boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      storage.clearLegacyTokens();

      if (tokenMemory.get()) {
        if (!cancelled) {
          setHasSession(true);
          setBootstrapped(true);
        }
        return;
      }

      const token = await authApi.refresh();
      if (cancelled) return;

      setHasSession(Boolean(token));
      setBootstrapped(true);
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    enabled: bootstrapped && hasSession,
    retry: false,
  });

  useEffect(() => {
    if (isError) {
      tokenMemory.clear();
      setHasSession(false);
    }
  }, [isError]);

  const login = useCallback(
    async (payload: LoginPayload): Promise<AuthProfile> => {
      const result = await authApi.login(payload);
      storage.setRememberMe(Boolean(payload.rememberMe));
      setHasSession(true);

      const authProfile: AuthProfile = {
        user: result.user,
        organization: result.organization,
        role: result.role,
      };

      queryClient.setQueryData(queryKeys.auth.me, authProfile);
      return authProfile;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      storage.clearAuthPreferences();
      tokenMemory.clear();
      setHasSession(false);
      queryClient.clear();
    }
  }, [queryClient]);

  const role = profile?.role ?? null;
  const permissions = useMemo(() => getPermissionsForRole(role), [role]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: profile?.user ?? null,
      organization: profile?.organization ?? null,
      role,
      permissions,
      isSuperAdmin: role === 'super_admin',
      hasPermission: (permission: Permission) => checkPermission(role, permission),
      isAuthenticated: hasSession && Boolean(profile?.user),
      isLoading: !bootstrapped || (hasSession && isLoading),
      login,
      logout,
    }),
    [profile, role, permissions, hasSession, bootstrapped, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
