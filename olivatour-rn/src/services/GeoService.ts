const MAX_DISTANCE_METERS = 500;

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type GeoResult =
  | { ok: true; distance: number }
  | { ok: false; reason: 'permission_denied' | 'unavailable' | 'timeout' | 'too_far'; distance?: number };

export function geoErrorMessage(result: GeoResult & { ok: false }, placeName?: string): string {
  switch (result.reason) {
    case 'permission_denied':
      return 'Necesitamos acceso a tu ubicacion. Activala en los permisos del navegador e intentalo de nuevo.';
    case 'unavailable':
      return 'Tu dispositivo no permite geolocalización.';
    case 'timeout':
      return 'No pudimos obtener tu ubicacion. Intentalo de nuevo.';
    case 'too_far': {
      const dist = result.distance!;
      const formatted = dist >= 1000 ? `${(dist / 1000).toFixed(1)} km` : `${Math.round(dist)} m`;
      return `Debes estar fisicamente en ${placeName ?? 'este lugar'} para desbloquearlo. Estas a ${formatted}.`;
    }
  }
}

export async function verifyProximity(targetLat: number, targetLng: number): Promise<GeoResult> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return { ok: false, reason: 'unavailable' };
  }

  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const dist = haversineDistance(
          pos.coords.latitude,
          pos.coords.longitude,
          targetLat,
          targetLng
        );
        if (dist <= MAX_DISTANCE_METERS) {
          resolve({ ok: true, distance: dist });
        } else {
          resolve({ ok: false, reason: 'too_far', distance: dist });
        }
      },
      err => {
        if (err.code === 1) resolve({ ok: false, reason: 'permission_denied' });
        else if (err.code === 3) resolve({ ok: false, reason: 'timeout' });
        else resolve({ ok: false, reason: 'unavailable' });
      },
      { timeout: 10000, maximumAge: 30000, enableHighAccuracy: true }
    );
  });
}
