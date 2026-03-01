import { API_BASE_URL, ENDPOINTS } from '../constants/api';
import { Comarca, Poblacion, LugarInteres, Logro } from '../types';
import CacheManager from './CacheManager';

class AppDataService {
  private static instance: AppDataService;

  static getInstance(): AppDataService {
    if (!AppDataService.instance) {
      AppDataService.instance = new AppDataService();
    }
    return AppDataService.instance;
  }

  async fetchComarcas(): Promise<Comarca[]> {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.comarcas}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al obtener comarcas');
    return response.json();
  }

  async fetchPoblaciones(): Promise<Poblacion[]> {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.poblaciones}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al obtener poblaciones');
    return response.json();
  }

  async fetchLugares(): Promise<LugarInteres[]> {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.lugares}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al obtener lugares');
    return response.json();
  }

  async fetchLugaresPorPoblacion(poblacionId: number): Promise<LugarInteres[]> {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.lugaresPorPoblacion(poblacionId)}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) throw new Error('Error al obtener lugares de la población');
    return response.json();
  }

  async fetchUserLogros(userId: number, token: string): Promise<Logro[]> {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.userLogros(userId)}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) return [];
    return response.json();
  }

  async toggleLogro(userId: number, logroId: number, token: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.toggleLogro(userId, logroId)}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.ok;
  }

  async fetchPorcentajeComarca(comarcaId: number, userId: number, token: string): Promise<number> {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.porcentajeComarca(comarcaId, userId)}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) return 0;
      const data = await response.json();
      return data.porcentaje ?? 0;
    } catch {
      return 0;
    }
  }

  // Inicializar y cachear todos los datos al arrancar
  async initializeData(forceRefresh = false): Promise<{
    comarcas: Comarca[];
    poblaciones: Poblacion[];
    lugares: LugarInteres[];
  }> {
    const hasCache = await CacheManager.hasValidCache();

    if (hasCache && !forceRefresh) {
      const [comarcas, poblaciones, lugares] = await Promise.all([
        CacheManager.getComarcas(),
        CacheManager.getPoblaciones(),
        CacheManager.getLugares(),
      ]);

      if (comarcas && poblaciones && lugares) {
        return { comarcas, poblaciones, lugares };
      }
    }

    const [comarcas, poblaciones, lugares] = await Promise.all([
      this.fetchComarcas(),
      this.fetchPoblaciones(),
      this.fetchLugares(),
    ]);

    await Promise.all([
      CacheManager.saveComarcas(comarcas),
      CacheManager.savePoblaciones(poblaciones),
      CacheManager.saveLugares(lugares),
    ]);

    return { comarcas, poblaciones, lugares };
  }
}

export default AppDataService.getInstance();
