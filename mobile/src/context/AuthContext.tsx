import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const { data } = await api.get<User>('/users/me');
      setUser(data);
    } catch (e: any) {
      // Only clear the session on an actual auth failure (invalid/expired token).
      // Network errors (no response) leave the cached user/tokens intact so a
      // retry can succeed once connectivity returns.
      if (e.response?.status === 401) {
        setUser(null);
      }
    }
  }

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        await refreshUser();
      }
      setLoading(false);
    })();
  }, []);

  async function storeTokens(access_token: string, refresh_token: string) {
    await AsyncStorage.setMany({
      access_token,
      refresh_token,
    });
  }

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    await storeTokens(data.access_token, data.refresh_token);
    await refreshUser();
  }

  async function register(name: string, email: string, password: string) {
    const { data } = await api.post('/auth/register', { name, email, password });
    await storeTokens(data.access_token, data.refresh_token);
    await refreshUser();
  }

  async function logout() {
    await AsyncStorage.removeMany(['access_token', 'refresh_token']);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
