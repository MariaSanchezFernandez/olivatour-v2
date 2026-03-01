import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  userToken: string | null;
  userName: string | null;
  userEmail: string | null;
  userId: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, name: string, email: string, id: number) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    userToken: null,
    userName: null,
    userEmail: null,
    userId: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [token, name, email, id] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('userName'),
        AsyncStorage.getItem('userEmail'),
        AsyncStorage.getItem('userId'),
      ]);

      setState({
        userToken: token,
        userName: name,
        userEmail: email,
        userId: id ? parseInt(id) : null,
        isAuthenticated: !!token,
        isLoading: false,
      });
    } catch {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (token: string, name: string, email: string, id: number) => {
    await Promise.all([
      AsyncStorage.setItem('userToken', token),
      AsyncStorage.setItem('userName', name),
      AsyncStorage.setItem('userEmail', email),
      AsyncStorage.setItem('userId', id.toString()),
    ]);

    setState({
      userToken: token,
      userName: name,
      userEmail: email,
      userId: id,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem('userToken'),
      AsyncStorage.removeItem('userName'),
      AsyncStorage.removeItem('userEmail'),
      AsyncStorage.removeItem('userId'),
    ]);

    setState({
      userToken: null,
      userName: null,
      userEmail: null,
      userId: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
