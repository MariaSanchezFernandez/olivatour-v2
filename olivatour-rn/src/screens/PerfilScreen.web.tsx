import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import UserService from '../services/UserService';
import { MAPBOX_TOKEN, MAPBOX_STYLE } from '../constants/api';

const JAEN_DEFAULT = { longitude: -3.7849, latitude: 37.7796 };
const STORAGE_KEY_PHOTO = 'olivatour_profile_photo';
const STORAGE_KEY_CP = 'olivatour_codigo_postal';

async function geocodePostalCode(cp: string): Promise<{ lng: number; lat: number; name: string } | null> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cp)}.json?country=ES&types=postcode&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;
    const [lng, lat] = feature.center;
    // Extrae municipio y provincia del contexto
    const place = feature.context?.find((c: any) => c.id?.startsWith('place.'))?.text ?? '';
    const region = feature.context?.find((c: any) => c.id?.startsWith('region.'))?.text ?? '';
    const name = place && region ? `${place}, ${region}` : place || region || feature.place_name?.split(',')[0] || cp;
    return { lng, lat, name };
  } catch {
    return null;
  }
}

export default function PerfilScreen() {
  const { userName, userEmail, userId, userToken, logout } = useAuth();
  const { comarcas } = useApp();

  const [codigoPostal, setCodigoPostal] = useState('');
  const [editandoCodigo, setEditandoCodigo] = useState(false);
  const [mapCenter, setMapCenter] = useState(JAEN_DEFAULT);
  const [localityName, setLocalityName] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const savedPhoto = await AsyncStorage.getItem(STORAGE_KEY_PHOTO);
      const savedCp = await AsyncStorage.getItem(STORAGE_KEY_CP);
      if (savedPhoto) setPhotoUri(savedPhoto);
      if (savedCp) {
        setCodigoPostal(savedCp);
        const result = await geocodePostalCode(savedCp);
        if (result) {
          setMapCenter({ longitude: result.lng, latitude: result.lat });
          setLocalityName(result.name);
        }
      }
    })();
  }, []);

  const handleSaveCodigo = async () => {
    setEditandoCodigo(false);
    if (codigoPostal.length === 5) {
      await AsyncStorage.setItem(STORAGE_KEY_CP, codigoPostal);
      const result = await geocodePostalCode(codigoPostal);
      if (result) {
        setMapCenter({ longitude: result.lng, latitude: result.lat });
        setLocalityName(result.name);
      }
    }
  };

  const handlePickPhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUri = ev.target?.result as string;
        setPhotoUri(dataUri);
        await AsyncStorage.setItem(STORAGE_KEY_PHOTO, dataUri);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesion',
      'Estas seguro de que quieres cerrar sesion?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesion',
          style: 'destructive',
          onPress: async () => {
            try {
              if (userToken) await UserService.logoutUser(userToken);
            } catch {}
            await logout();
          },
        },
      ]
    );
  };

  const initials = userName
    ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const top3Comarcas = comarcas.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Hero: mapa + avatar ── */}
      <View style={styles.heroWrapper}>
        <View style={styles.mapContainer}>
          <Map
            longitude={mapCenter.longitude}
            latitude={mapCenter.latitude}
            zoom={12}
            style={{ width: '100%', height: '100%' } as any}
            mapStyle={MAPBOX_STYLE}
            mapboxAccessToken={MAPBOX_TOKEN}
            scrollZoom={false}
            dragPan={false}
            dragRotate={false}
            keyboard={false}
            doubleClickZoom={false}
            touchZoomRotate={false}
          >
            <Marker longitude={mapCenter.longitude} latitude={mapCenter.latitude}>
              <View style={styles.markerOuter}>
                <View style={styles.markerInner} />
              </View>
            </Marker>
          </Map>

          {/* Gradiente inferior */}
          <View style={styles.mapGradient} />

          {/* Etiqueta de localidad — estilo Apple Maps */}
          {localityName && (
            <View style={styles.localityBadge}>
              <View style={styles.localityDot} />
              <Text style={styles.localityText}>{localityName}</Text>
            </View>
          )}
        </View>

        {/* Avatar sobre el borde inferior del mapa */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity style={styles.avatarOuter} onPress={handlePickPhoto} activeOpacity={0.85}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarInitials}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.cameraIcon}>
            <Text style={styles.cameraIconText}>⊕</Text>
          </View>
        </View>
      </View>

      {/* ── Nombre y email ── */}
      <View style={styles.userInfoBlock}>
        <Text style={styles.userName}>{userName ?? 'Usuario'}</Text>
        <Text style={styles.userEmail}>{userEmail ?? ''}</Text>
      </View>

      {/* ── Ubicacion ── */}
      <View style={styles.card}>
        <Text style={styles.cardSectionLabel}>Mi ubicacion</Text>

        <View style={styles.cardRow}>
          <Text style={styles.cardRowLabel}>Codigo postal</Text>
          {editandoCodigo ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.codigoInput}
                value={codigoPostal}
                onChangeText={setCodigoPostal}
                keyboardType="numeric"
                maxLength={5}
                autoFocus
                placeholder="23400"
                placeholderTextColor={Colors.grayMedium}
                onSubmitEditing={handleSaveCodigo}
              />
              <TouchableOpacity onPress={handleSaveCodigo} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setEditandoCodigo(true)} activeOpacity={0.6}>
              <Text style={styles.cardRowValue}>{codigoPostal || 'Anadir'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {localityName && (
          <>
            <View style={styles.separator} />
            <View style={styles.cardRow}>
              <Text style={styles.cardRowLabel}>Localidad</Text>
              <Text style={styles.cardRowValue}>{localityName}</Text>
            </View>
          </>
        )}
      </View>

      {/* ── Comarcas exploradas ── */}
      {top3Comarcas.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>Comarcas exploradas</Text>
          {top3Comarcas.map((comarca: any, idx: number) => (
            <React.Fragment key={comarca.id}>
              {idx > 0 && <View style={styles.separator} />}
              <View style={styles.cardRow}>
                <View style={styles.comarcaDot} />
                <Text style={styles.comarcaName}>{comarca.nombre}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      )}

      {/* ── Informacion de cuenta ── */}
      <View style={styles.card}>
        <Text style={styles.cardSectionLabel}>Cuenta</Text>
        <View style={styles.cardRow}>
          <Text style={styles.cardRowLabel}>ID de usuario</Text>
          <Text style={styles.cardRowValue}>#{userId ?? '—'}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.cardRow}>
          <Text style={styles.cardRowLabel}>Email</Text>
          <Text style={[styles.cardRowValue, styles.cardRowValueSmall]}>{userEmail ?? '—'}</Text>
        </View>
      </View>

      {/* ── Cerrar sesion ── */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>Cerrar sesion</Text>
      </TouchableOpacity>

      <Text style={styles.photoHint}>Pulsa en tu foto para cambiarla</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.verdeFondo,
  },
  content: {
    paddingBottom: 80,
  },

  // ── Hero ──────────────────────────────────────────
  heroWrapper: {
    position: 'relative',
    marginBottom: 52,
  },
  mapContainer: {
    height: 240,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  mapGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    background: 'linear-gradient(to bottom, transparent, rgba(19,42,19,0.35))' as any,
    pointerEvents: 'none',
  } as any,

  // Etiqueta localidad al estilo Apple Maps
  localityBadge: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    backdropFilter: 'blur(12px)',
  } as any,
  localityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.verdeSeleccionado,
    marginRight: 7,
  },
  localityText: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 13,
    color: Colors.verdeSeleccionado,
    letterSpacing: 0.1,
  },

  // Marcador
  markerOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(94,110,55,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.verdeSeleccionado,
    borderWidth: 2.5,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
  },

  // Avatar
  avatarContainer: {
    position: 'absolute',
    bottom: -44,
    left: 20,
    zIndex: 10,
  },
  avatarOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: Colors.white,
    overflow: 'hidden',
    backgroundColor: Colors.verdeOscuro,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 8,
    cursor: 'pointer' as any,
  },
  avatarImg: {
    width: 90,
    height: 90,
  },
  avatarInitials: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 32,
    color: Colors.white,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: Colors.verdeClaro,
    borderRadius: 14,
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: Colors.white,
  },
  cameraIconText: {
    fontSize: 14,
    color: Colors.white,
    lineHeight: 18,
  },

  // ── Nombre ────────────────────────────────────────
  userInfoBlock: {
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 4,
  },
  userName: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 26,
    color: Colors.verdeOscuro,
    marginBottom: 3,
  },
  userEmail: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 15,
    color: Colors.grayDark,
  },

  // ── Tarjetas iOS-style ────────────────────────────
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSectionLabel: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 11,
    color: Colors.grayMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingTop: 8,
    paddingBottom: 4,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  cardRowLabel: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    color: Colors.grayDark,
  },
  cardRowValue: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 15,
    color: Colors.verdeOscuro,
  },
  cardRowValueSmall: {
    fontSize: 13,
    maxWidth: 200,
    textAlign: 'right',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.nuevoVerde,
    marginLeft: 0,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codigoInput: {
    borderWidth: 1,
    borderColor: Colors.verdeOscuro,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontFamily: 'Urbanist-Regular',
    fontSize: 15,
    width: 90,
    backgroundColor: Colors.verdeFondo,
    color: Colors.verdeOscuro,
  },
  saveBtn: {
    backgroundColor: Colors.verdeSeleccionado,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  saveBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 13,
    color: Colors.white,
  },

  // Comarcas dentro de la card
  comarcaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.verdeClaro,
    marginRight: 12,
  },
  comarcaName: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    color: Colors.grayDark,
    flex: 1,
  },

  // ── Logout ────────────────────────────────────────
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: Colors.error,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  logoutText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 16,
    color: Colors.white,
    letterSpacing: 0.2,
  },
  photoHint: {
    textAlign: 'center',
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    color: Colors.grayMedium,
    marginTop: 14,
  },
});
