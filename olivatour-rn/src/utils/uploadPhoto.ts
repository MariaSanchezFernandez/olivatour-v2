import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Sube una imagen (URI local o blob URL) a Firebase Storage
 * y devuelve la URL pública de descarga.
 *
 * @param uri   URI de la imagen (de expo-image-picker)
 * @param path  Ruta en Storage, ej: "users/42/profile.jpg"
 */
export async function uploadPhoto(uri: string, path: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
