import { BASE_URL } from '@/api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthState {
  token: string | null;
  userId: string | null;
  username: string | null;
  isLoading: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    userId: null,
    username: null,
    isLoading: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('stave_token');
        const userId = await AsyncStorage.getItem('stave_userId');
        const username = await AsyncStorage.getItem('stave_username');
        setState({ token, userId, username, isLoading: false });
      } catch {
        setState({ token: null, userId: null, username: null, isLoading: false });
      }
    })();
  }, []);

  const saveSession = async (token: string, userId: string, username: string) => {
    await AsyncStorage.setItem('stave_token', token);
    await AsyncStorage.setItem('stave_userId', userId);
    await AsyncStorage.setItem('stave_username', username);
    setState(prev => ({ ...prev, token, userId, username }));
  };

  const login = async (data: LoginData) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? 'Credenciales inválidas');
    }

    const body = await res.json();
    const token = body.token ?? body.access_token ?? body.jwt;
    const userId = body.userId ?? body.user?._id ?? body.user?.id;

    if (!token) throw new Error('El servidor no devolvió un token');

    const payload = decodeJwtPayload(token);
    const username = payload?.username ?? data.username;

    await saveSession(token, userId ?? '', username ?? '');
  };

  const register = async (data: RegisterData) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? 'Error al registrarse');
    }

    // Mismo formato de respuesta que login
    const body = await res.json();
    const token = body.token ?? body.access_token ?? body.jwt;
    const userId = body.userId ?? body.user?._id ?? body.user?.id;

    if (!token) throw new Error('El servidor no devolvió un token');

    const payload = decodeJwtPayload(token);
    const username = payload?.username ?? data.username;

    await saveSession(token, userId ?? '', username ?? '');
  };

  const logout = async () => {
    await AsyncStorage.removeItem('stave_token');
    await AsyncStorage.removeItem('stave_userId');
    await AsyncStorage.removeItem('stave_username');
    setState(prev => ({ ...prev, token: null, userId: null, username: null }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: !!state.token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
