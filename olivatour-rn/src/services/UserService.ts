import { API_BASE_URL, ENDPOINTS } from '../constants/api';
import {
  UserRegistrationRequest,
  UserRegistrationResponse,
  UserLoginRequest,
  UserLoginResponse,
  UserData,
} from '../types';

export class UserError extends Error {
  constructor(
    public type: 'invalidURL' | 'networkError' | 'invalidResponse' | 'serverError' | 'unauthorized' | 'notFound',
    message: string
  ) {
    super(message);
    this.name = 'UserError';
  }
}

class UserService {
  async registerUser(userData: UserRegistrationRequest): Promise<UserRegistrationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.register}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.status === 201) {
        return data as UserRegistrationResponse;
      } else {
        throw new UserError('serverError', data.message || 'Error al registrar usuario');
      }
    } catch (error) {
      if (error instanceof UserError) throw error;
      throw new UserError('networkError', (error as Error).message);
    }
  }

  async loginUser(userData: UserLoginRequest): Promise<UserLoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.login}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.status === 200 || response.status === 201) {
        return data as UserLoginResponse;
      } else {
        throw new UserError('serverError', data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      if (error instanceof UserError) throw error;
      throw new UserError('networkError', (error as Error).message);
    }
  }

  async logoutUser(token: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.logout}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        throw new UserError('unauthorized', 'No autorizado');
      }
    } catch (error) {
      if (error instanceof UserError) throw error;
      throw new UserError('networkError', (error as Error).message);
    }
  }

  async getUserById(id: number, token: string): Promise<UserData> {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.getUserById(id)}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 200) return data as UserData;
      if (response.status === 401) throw new UserError('unauthorized', 'No autorizado');
      if (response.status === 404) throw new UserError('notFound', 'Usuario no encontrado');
      throw new UserError('serverError', data.message || 'Error del servidor');
    } catch (error) {
      if (error instanceof UserError) throw error;
      throw new UserError('networkError', (error as Error).message);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.forgotPassword}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new UserError('serverError', data.message || 'Error al enviar email');
      }
    } catch (error) {
      if (error instanceof UserError) throw error;
      throw new UserError('networkError', (error as Error).message);
    }
  }

  async resetPassword(email: string, token: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.resetPassword}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, token, password, password_confirmation: password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new UserError('serverError', data.message || 'Error al restablecer contraseña');
      }
    } catch (error) {
      if (error instanceof UserError) throw error;
      throw new UserError('networkError', (error as Error).message);
    }
  }
}

export default new UserService();
