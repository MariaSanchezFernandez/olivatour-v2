// API base URL — Railway (solo para endpoints JSON, no para archivos estáticos)
export const API_BASE_URL = 'https://olivatour-v2-production.up.railway.app';

// CDN para imágenes — jsDelivr sirve archivos del repo de GitHub vía CDN global
export const IMAGES_BASE_URL = 'https://cdn.jsdelivr.net/gh/MariaSanchezFernandez/olivatour-v2@main/public';

export const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9zZWJvcnJhcyIsImEiOiJjbTlkMjNwd2kwN3p3MmpyN2I2NzBwN3J6In0.CmuXAe3kjmRUJ4pU_R5NMA';
export const MAPBOX_STYLE = 'mapbox://styles/joseborras/cma8jmmet00gx01qodbr0075u';

// Coordenadas centro de Jaén
export const JAEN_CENTER = { longitude: -3.7849, latitude: 37.7796 };
export const JAEN_ZOOM = 8;

export const ENDPOINTS = {
  // Auth
  register: '/api/user',
  login: '/api/user/login',
  logout: '/api/user/logout',
  getUser: '/api/user',
  getUserById: (id: number) => `/api/user/${id}`,
  forgotPassword: '/api/password/forgot',
  resetPassword: '/api/password/reset',

  // Datos
  comarcas: '/api/comarcas',
  poblaciones: '/api/poblaciones',
  lugares: '/api/lugares',
  lugaresPorPoblacion: (id: number) => `/api/lugares/poblacion/${id}`,
  lugaresPorComarca: (id: number) => `/api/comarcas/${id}/lugares`,

  // Logros
  userLogros: (userId: number) => `/api/usuarios/${userId}/logros`,
  toggleLogro: (userId: number, logroId: number) => `/api/usuarios/${userId}/logros/${logroId}`,
  porcentajeComarca: (comarcaId: number, userId: number) => `/api/comarcas/${comarcaId}/porcentaje/${userId}`,

  // Imágenes
  imagenesComarcas: '/api/imagenes/comarcas',
  imagenesPoblaciones: (id: number) => `/api/imagenes/poblaciones/${id}`,
  escudoPoblacion: (id: number) => `/api/poblaciones/${id}/escudo`,
  imagenesLogros: '/api/imagenes/logros',
};
