import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
  clearSession,
  setTokens,
} from '../services/api';
import { authService } from '../services/auth.service';
import type { RegisterData, UserProfile } from '../services/auth.service';

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  needsProfileCompletion: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: () => void;
  loginWithWebAuthn: (email: string) => Promise<void>;
  registerWebAuthn: () => Promise<void>;
  updateProfile: (data: { name?: string; program?: string; semester?: string }) => Promise<void>;
  handleOAuthCallback: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function saveUser(user: UserProfile): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function loadSavedUser(): UserProfile | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [user, setUser] = useState<UserProfile | null>(loadSavedUser);
  const [loading, setLoading] = useState(false);

  const doLogout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    const handler = () => doLogout();
    window.addEventListener('uptgo:auth-expired', handler);
    return () => window.removeEventListener('uptgo:auth-expired', handler);
  }, [doLogout]);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token && !user) {
      authService.getMe().then(setUser).catch(doLogout);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      setTokens(res.accessToken, res.refreshToken);
      saveUser(res.user);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    try {
      const res = await authService.register(data);
      setTokens(res.accessToken, res.refreshToken);
      saveUser(res.user);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(() => {
    authService.loginWithGoogle();
  }, []);

  const loginWithWebAuthn = useCallback(async (email: string) => {
    setLoading(true);
    try {
      const res = await authService.loginWithWebAuthn(email);
      setTokens(res.accessToken, res.refreshToken);
      saveUser(res.user);
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const registerWebAuthn = useCallback(async () => {
    await authService.registerWebAuthn();
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; program?: string; semester?: string }) => {
    const updated = await authService.updateProfile(data);
    saveUser(updated);
    setUser(updated);
  }, []);

  const handleOAuthCallback = useCallback(async (accessToken: string, refreshToken: string) => {
    setLoading(true);
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      const profile = await authService.getMe();
      saveUser(profile);
      setUser(profile);
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, []);

  const needsProfileCompletion = !!user && !user.program;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        needsProfileCompletion,
        login,
        register,
        loginWithGoogle,
        loginWithWebAuthn,
        registerWebAuthn,
        updateProfile,
        handleOAuthCallback,
        logout: doLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
