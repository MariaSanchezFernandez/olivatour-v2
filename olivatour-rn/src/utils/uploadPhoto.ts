// Cloudinary — free tier: 25 GB storage, no credit card required
// 1. Crea una cuenta gratis en https://cloudinary.com
// 2. Copia tu "Cloud name" del dashboard
// 3. Ve a Settings → Upload → Add upload preset → Signing Mode: Unsigned
//    Guarda el nombre del preset aquí:
const CLOUDINARY_CLOUD_NAME = 'dowcdh9e9';
const CLOUDINARY_UPLOAD_PRESET = '0422f6d6-232f-4a9c-91d7-464b678dd1cf';

/**
 * Sube una imagen (URI local) a Cloudinary
 * y devuelve la URL pública de descarga.
 *
 * @param uri  URI de la imagen (de expo-image-picker)
 */
export async function uploadPhoto(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const formData = new FormData();
  formData.append('file', blob as any, 'photo.jpg');
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) throw new Error('Error al subir la foto a Cloudinary');

  const data = await res.json();
  return data.secure_url as string;
}
