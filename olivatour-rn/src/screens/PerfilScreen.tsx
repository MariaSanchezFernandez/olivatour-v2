import React, { useState } from 'react';
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
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import UserService from '../services/UserService';

export default function PerfilScreen() {
  const { userName, userEmail, userId, userToken, logout } = useAuth();
  const { comarcas } = useApp();
  const [codigoPostal, setCodigoPostal] = useState('23400');
  const [editandoCodigo, setEditandoCodigo] = useState(false);

  const top3Comarcas = comarcas.slice(0, 3);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              if (userToken) await UserService.logoutUser(userToken);
            } catch {
              // Forzamos logout local aunque falle la API
            } finally {
              await logout();
            }
          },
        },
      ]
    );
  };

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header con foto */}
      <View style={styles.header}>
        {/* Fondo mapa simulado */}
        <View style={styles.mapBackground}>
          <Text style={styles.mapPlaceholder}>🗺 Jaén</Text>
        </View>

        {/* Avatar con iniciales */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
      </View>

      {/* Datos del usuario */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{userName ?? 'Usuario'}</Text>
        <Text style={styles.userEmail}>{userEmail ?? ''}</Text>

        {/* Código postal */}
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
              />
              <TouchableOpacity
                onPress={() => setEditandoCodigo(false)}
                style={styles.codigoSave}
              >
                <Text style={styles.codigoSaveText}>Guardar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={() => setEditandoCodigo(true)} style={styles.codigoButton}>
              <Text style={styles.codigoLabel}>📬 Código postal: </Text>
              <Text style={styles.codigoValue}>{codigoPostal}</Text>
              <Text style={styles.codigoEdit}> ✏️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Comarcas recientes */}
      {top3Comarcas.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comarcas exploradas</Text>
          {top3Comarcas.map(comarca => (
            <View key={comarca.id} style={styles.comarcaRow}>
              <Text style={styles.comarcaDot}>●</Text>
              <Text style={styles.comarcaName}>{comarca.nombre}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ID de usuario */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de cuenta</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>ID de usuario</Text>
          <Text style={styles.infoValue}>#{userId ?? '—'}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{userEmail ?? '—'}</Text>
        </View>
      </View>

      {/* Botón logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
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
    paddingBottom: 40,
  },
  header: {
    height: 200,
    position: 'relative',
  },
  mapBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.nuevoVerde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholder: {
    fontSize: 40,
    opacity: 0.5,
  },
  avatarContainer: {
    position: 'absolute',
    bottom: -40,
    left: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.verdeOscuro,
    borderWidth: 4,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 28,
    color: Colors.white,
  },
  userInfo: {
    paddingHorizontal: 24,
    paddingTop: 54,
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
  },
  codigoEdit: {
    fontSize: 14,
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
    backgroundColor: Colors.white,
  },
  codigoSave: {
    marginLeft: 10,
    backgroundColor: Colors.verdeSeleccionado,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  codigoSaveText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 13,
    color: Colors.white,
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
    color: Colors.verdeClaro,
    fontSize: 12,
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
