import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Comarca, Poblacion, LugarInteres, Logro } from '../types';
import AppDataService from '../services/AppDataService';

interface AppContextType {
  comarcas: Comarca[];
  poblaciones: Poblacion[];
  lugares: LugarInteres[];
  userLogros: Logro[];
  isLoading: boolean;
  error: string | null;
  currentTab: number;
  setCurrentTab: (tab: number) => void;
  loadData: (forceRefresh?: boolean) => Promise<void>;
  loadUserLogros: (userId: number, token: string) => Promise<void>;
  toggleVisita: (userId: number, logroId: number, token: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [comarcas, setComarcas] = useState<Comarca[]>([]);
  const [poblaciones, setPoblaciones] = useState<Poblacion[]>([]);
  const [lugares, setLugares] = useState<LugarInteres[]>([]);
  const [userLogros, setUserLogros] = useState<Logro[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(1); // Inicio por defecto

  const loadData = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await AppDataService.initializeData(forceRefresh);
      setComarcas(data.comarcas);
      setPoblaciones(data.poblaciones);
      setLugares(data.lugares);
    } catch (e) {
      setError('Error al cargar los datos. Comprueba tu conexión.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserLogros = useCallback(async (userId: number, token: string) => {
    try {
      const logros = await AppDataService.fetchUserLogros(userId, token);
      setUserLogros(logros);
    } catch {
      // Silencioso — los logros se cargan en background
    }
  }, []);

  const toggleVisita = useCallback(async (userId: number, logroId: number, token: string): Promise<boolean> => {
    const success = await AppDataService.toggleLogro(userId, logroId, token);
    if (success) {
      // Recargar logros del usuario
      const logros = await AppDataService.fetchUserLogros(userId, token);
      setUserLogros(logros);
    }
    return success;
  }, []);

  return (
    <AppContext.Provider value={{
      comarcas, poblaciones, lugares, userLogros,
      isLoading, error, currentTab, setCurrentTab,
      loadData, loadUserLogros, toggleVisita,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
