import AsyncStorage from '@react-native-async-storage/async-storage';
import { Comarca, Poblacion, LugarInteres, Logro } from '../types';

const KEYS = {
  comarcas: 'cache_comarcas',
  poblaciones: 'cache_poblaciones',
  lugares: 'cache_lugares',
  userLogros: (userId: number) => `cache_logros_${userId}`,
  cacheTimestamp: 'cache_timestamp',
};

class CacheManager {
  private static instance: CacheManager;

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  async saveComarcas(comarcas: Comarca[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.comarcas, JSON.stringify(comarcas));
    await AsyncStorage.setItem(KEYS.cacheTimestamp, Date.now().toString());
  }

  async getComarcas(): Promise<Comarca[] | null> {
    const data = await AsyncStorage.getItem(KEYS.comarcas);
    return data ? JSON.parse(data) : null;
  }

  async savePoblaciones(poblaciones: Poblacion[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.poblaciones, JSON.stringify(poblaciones));
  }

  async getPoblaciones(): Promise<Poblacion[] | null> {
    const data = await AsyncStorage.getItem(KEYS.poblaciones);
    return data ? JSON.parse(data) : null;
  }

  async saveLugares(lugares: LugarInteres[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.lugares, JSON.stringify(lugares));
  }

  async getLugares(): Promise<LugarInteres[] | null> {
    const data = await AsyncStorage.getItem(KEYS.lugares);
    return data ? JSON.parse(data) : null;
  }

  async saveUserLogros(userId: number, logros: Logro[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.userLogros(userId), JSON.stringify(logros));
  }

  async getUserLogros(userId: number): Promise<Logro[] | null> {
    const data = await AsyncStorage.getItem(KEYS.userLogros(userId));
    return data ? JSON.parse(data) : null;
  }

  async hasValidCache(): Promise<boolean> {
    const timestamp = await AsyncStorage.getItem(KEYS.cacheTimestamp);
    if (!timestamp) return false;
    const age = Date.now() - parseInt(timestamp);
    // Cache válida por 24 horas
    return age < 24 * 60 * 60 * 1000;
  }

  async clearCache(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = (keys as readonly string[]).filter(k => k.startsWith('cache_'));
    await Promise.all(cacheKeys.map(k => AsyncStorage.removeItem(k)));
  }
}

export default CacheManager.getInstance();
