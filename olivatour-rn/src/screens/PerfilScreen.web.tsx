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

async function geocodePostalCode(cp: string): Promise<{ lng: number; lat: number } | null> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cp)}.json?country=ES&types=postcode&access_token=${MAPBOX_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;
    const [lng, lat] = feature.center;
    return { lng, lat };
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
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  // Cargar foto y CP persistidos
  useEffect(() => {
    (async () => {
      const savedPhoto = await AsyncStorage.getItem(STORAGE_KEY_PHOTO);
      const savedCp = await AsyncStorage.getItem(STORAGE_KEY_CP);
      if (savedPhoto) setPhotoUri(savedPhoto);
      if (savedCp) {
        setCodigoPostal(savedCp);
        const coords = await geocodePostalCode(savedCp);
        if (coords) setMapCenter({ longitude: coords.lng, latitude: coords.lat });
      }
    })();
  }, []);

  const handleSaveCodigo = async () => {
    setEditandoCodigo(false);
    if (codigoPostal.length === 5) {
      await AsyncStorage.setItem(STORAGE_KEY_CP, codigoPostal);
      const coords = await geocodePostalCode(codigoPostal);
      if (coords) setMapCenter({ longitude: coords.lng, latitude: coords.lat });
    }
  };

  // Abrir selector de archivo de forma nativa en web (sin JSX <input>)
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

      {/* ── Mapa centrado en el codigo postal ── */}
      <View style={styles.mapHeader}>
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
            <View style={styles.mapPinDot} />
          </Marker>
        </Map>

        {/* Overlay oscuro tenue */}
        <View style={styles.mapOverlay} />

        {/* Avatar solapado en la parte inferior del header */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity style={styles.avatarOuter} onPress={handlePickPhoto} activeOpacity={0.85}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarInitials}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Text style={styles.avatarEditText}>+</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Datos del usuario ── */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{userName ?? 'Usuario'}</Text>
        <Text style={styles.userEmail}>{userEmail ?? ''}</Text>

        {/* Codigo postal */}
        <View style={styles.codigoRow}>
          {editandoCodigo ? (
            <>
              <TextInput
                style={styles.codigoInput}
                value={codigoPostal}
                onChangeText={setCodigoPostal}
                keyboardType="numeric"
                maxLength={5}
                autoFocus
                placeholder="23400"
                onSubmitEditing={handleSaveCodigo}
              />
              <TouchableOpacity onPress={handleSaveCodigo} style={styles.codigoSave}>
                <Text style={styles.codigoSaveText}>Guardar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={() => setEditandoCodigo(true)} style={styles.codigoButton}>
              <Text style={styles.codigoLabel}>Codigo postal: </Text>
              <Text style={styles.codigoValue}>{codigoPostal || 'Anadir'}</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.photoHint}>Pulsa en tu foto para cambiarla</Text>
      </View>

      {/* ── Comarcas exploradas ── */}
      {top3Comarcas.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comarcas exploradas</Text>
          {top3Comarcas.map((comarca: any) => (
            <View key={comarca.id} style={styles.comarcaRow}>
              <View style={styles.comarcaDot} />
              <Text style={styles.comarcaName}>{comarca.nombre}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Info de cuenta ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informacion de cuenta</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>ID de usuario</Text>
          <Text style={styles.infoValue}>#{userId ?? '—'}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{userEmail ?? '—'}</Text>
        </View>
      </View>

      {/* ── Cerrar sesion ── */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesion</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.verdeFondo,
  },
  content: {
    paddingBottom: 60,
  },
  mapHeader: {
    height: 220,
    position: 'relative',
    overflow: 'hidden',
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(19,42,19,0.12)',
    pointerEvents: 'none',
  } as any,
  mapPinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.verdeSeleccionado,
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -40,
    left: 24,
    zIndex: 10,
  },
  avatarOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    borderColor: Colors.white,
    overflow: 'hidden',
    backgroundColor: Colors.verdeOscuro,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    cursor: 'pointer' as any,
  },
  avatarImg: {
    width: 88,
    height: 88,
  },
  avatarInitials: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 30,
    color: Colors.white,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: Colors.verdeSeleccionado,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  avatarEditText: {
    color: Colors.white,
    fontFamily: 'Urbanist-Bold',
    fontSize: 16,
    lineHeight: 20,
  },
  userInfo: {
    paddingHorizontal: 24,
    paddingTop: 58,
    paddingBottom: 20,
  },
  userName: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 24,
    color: Colors.verdeOscuro,
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    color: Colors.grayDark,
    marginBottom: 12,
  },
  codigoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  codigoButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codigoLabel: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 15,
    color: Colors.grayDark,
  },
  codigoValue: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 15,
    color: Colors.verdeOscuro,
    textDecorationLine: 'underline',
  },
  codigoInput: {
    borderWidth: 1,
    borderColor: Colors.verdeOscuro,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontFamily: 'Urbanist-Regular',
    fontSize: 15,
    width: 100,
    backgroundColor: Colors.white,
  },
  codigoSave: {
    marginLeft: 10,
    backgroundColor: Colors.verdeSeleccionado,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  codigoSaveText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 13,
    color: Colors.white,
  },
  photoHint: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    color: Colors.grayMedium,
    marginTop: 2,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 18,
    color: Colors.verdeOscuro,
    marginBottom: 12,
  },
  comarcaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  comarcaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.verdeClaro,
    marginRight: 10,
  },
  comarcaName: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 15,
    color: Colors.grayDark,
  },
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  infoLabel: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 15,
    color: Colors.grayDark,
  },
  infoValue: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 15,
    color: Colors.verdeOscuro,
  },
  logoutButton: {
    marginHorizontal: 24,
    marginTop: 10,
    backgroundColor: Colors.error,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 16,
    color: Colors.white,
  },
});
