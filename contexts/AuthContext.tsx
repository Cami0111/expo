import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  username: string | null;
  isLoading: boolean;
  isSignedIn: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on app start
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      // Check if user and token exist from previous session
      const [savedUser, token] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('authToken'),
      ]);

      if (savedUser && token) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error restoring user session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newUser: User, token: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem('user', JSON.stringify(newUser)),
        AsyncStorage.setItem('authToken', token),
      ]);
      setUser(newUser);
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem('user'),
        AsyncStorage.removeItem('authToken'),
      ]);
      setUser(null);
    } catch (error) {
      console.error('Error clearing user:', error);
      throw error;
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    username: user?.username ?? null,
    isLoading,
    isSignedIn: !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
