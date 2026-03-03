// Tipos de datos que replican los modelos del proyecto iOS

export interface UserData {
  id?: number;
  name?: string;
  email?: string;
  username?: string;
  surname?: string;
  edad?: string;
  idioma?: number;
}

export interface UserRegistrationRequest {
  username: string;
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface UserLoginRequest {
  email_or_username: string;
  password: string;
}

export interface UserLoginResponse {
  message?: string;
  token?: string;
  user?: UserData;
}

export interface UserRegistrationResponse {
  message: string;
  user: UserData;
}

export interface Comarca {
  id: number;
  nombre: string;
  nombreNormalizado?: string;
  latitud: number;
  longitud: number;
  created_at?: string;
  updated_at?: string;
  poblaciones?: Poblacion[];
  fotos?: Foto[];
}

export interface Poblacion {
  id: number;
  nombre: string;
  nombreNormalizado?: string;
  descripcion1?: string;
  descripcion2?: string;
  latitud: number;
  longitud: number;
  viewport_ne_lat?: number;
  viewport_ne_lng?: number;
  viewport_sw_lat?: number;
  viewport_sw_lng?: number;
  comarca_id: number;
  comarca?: Comarca;
  escudo?: string;
  imagen_escudo?: string;
  lugares?: LugarInteres[];
  fotos?: Foto[];
}

export interface LugarInteres {
  id: number;
  nombre: string;
  nombreNormalizado?: string;
  descripcionUno?: string;
  descripcionDos?: string;
  tipo: TipoLugar;
  latitud: number;
  longitud: number;
  viewport_ne_lat?: number;
  viewport_ne_lng?: number;
  viewport_sw_lat?: number;
  viewport_sw_lng?: number;
  poblacion_id: number;
  poblacion?: Poblacion;
  poblacion_nombre?: string;
  fotos?: Foto[];
  logro?: Logro;
  imagen_medalla?: string;
  visitado?: boolean;
}

export type TipoLugar = 'calles' | 'castillos' | 'iglesias' | 'monumentos' | 'museos' | 'paisajes' | 'yacimientos' | 'otro';

export interface Logro {
  id: number;
  titulo?: string;
  descripcion?: string;
  tipo?: 'comarca' | 'poblacion' | 'lugar';
  icono?: string;
  logroable_id?: number;
  logroable_type?: string;
  pivot?: {
    fecha_desbloqueo?: string;
  };
}

export interface Foto {
  id: number;
  url: string;
  fotoable_type?: string;
  fotoable_id?: number;
}

export interface PorcentajeComarca {
  comarcaId: number;
  porcentaje: number;
}

export interface ImagenPoblacion {
  id: number;
  poblacion: string;
  imagen: string | null;
  nombreNormalizado: string | null;
}

// Tipos para la navegación
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  RecoverPassword1: undefined;
  RecoverPassword2: { email: string };
};

export type MainTabParamList = {
  Logros: undefined;
  Inicio: undefined;
  Mapa: undefined;
  Perfil: undefined;
};
