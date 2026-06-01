import { BASE_URL } from '@/api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthState {
  token: string | null;
  userId: string | null;
  isLoading: boolean;
}

interface RegisterData {
  username: string;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    userId: null,
    isLoading: true,
  });

  // Cargar token guardado al iniciar
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('stave_token');
        const userId = await AsyncStorage.getItem('stave_userId');
        setState({ token, userId, isLoading: false });
      } catch {
        setState({ token: null, userId: null, isLoading: false });
      }
    })();
  }, []);

  const saveSession = async (token: string, userId: string) => {
    await AsyncStorage.setItem('stave_token', token);
    await AsyncStorage.setItem('stave_userId', userId);
    setState(prev => ({ ...prev, token, userId }));
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
    const token = body.access_token ?? body.token ?? body.jwt;
    const userId = body.userId ?? body.user?._id ?? body.user?.id ?? body.sub;

    if (!token) throw new Error('El servidor no devolvió un token');
    await saveSession(token, userId ?? '');
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

    const body = await res.json();
    const token = body.access_token ?? body.token ?? body.jwt;
    const userId = body.userId ?? body.user?._id ?? body.user?.id ?? body.sub;

    if (!token) throw new Error('El servidor no devolvió un token');
    await saveSession(token, userId ?? '');
  };

  const logout = async () => {
    await AsyncStorage.removeItem('stave_token');
    await AsyncStorage.removeItem('stave_userId');
    setState(prev => ({ ...prev, token: null, userId: null }));
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
