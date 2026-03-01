import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
} from 'react-native';
import { Colors } from '../constants/colors';
import { CURIOSIDADES_JAEN } from '../constants/curiosidades';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface Props {
  onGoToMapa: () => void;
  onGoToLogros: () => void;
}

export default function InicioScreen({ onGoToMapa, onGoToLogros }: Props) {
  const { userName } = useAuth();
  const { comarcas, isLoading, loadData } = useApp();
  const [curiosidadIndex, setCuriosidadIndex] = useState(
    Math.floor(Math.random() * CURIOSIDADES_JAEN.length)
  );

  const refreshCuriosidad = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * CURIOSIDADES_JAEN.length);
    } while (nextIndex === curiosidadIndex && CURIOSIDADES_JAEN.length > 1);
    setCuriosidadIndex(nextIndex);
  };

  const top3Comarcas = comarcas.slice(0, 3);
  const nombreMostrado = userName?.split(' ')[0] ?? 'Explorador';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={() => loadData(true)} />
      }
    >
      {/* Saludo */}
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola, {nombreMostrado}!</Text>
        <Text style={styles.subtitle}>
          Accede al mapa para empezar esta aventura
        </Text>
      </View>

      {/* Botón al mapa */}
      <TouchableOpacity onPress={onGoToMapa} style={styles.mapaButton} activeOpacity={0.85}>
        <Image
          source={require('../assets/images/PortadaMapa.png')}
          style={styles.mapaImage}
          resizeMode="cover"
        />
        <View style={styles.mapaOverlay}>
          <Text style={styles.mapaButtonText}>Abrir Mapa de Jaén</Text>
        </View>
      </TouchableOpacity>

      {/* Logros recientes */}
      {top3Comarcas.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Comarcas</Text>
            <TouchableOpacity onPress={onGoToLogros}>
              <Text style={styles.seeAll}>Ver todas →</Text>
            </TouchableOpacity>
          </View>
          {top3Comarcas.map(comarca => (
            <View key={comarca.id} style={styles.comarcaCard}>
              <Text style={styles.comarcaName}>{comarca.nombre}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '0%' }]} />
              </View>
              <Text style={styles.progressText}>0% completado</Text>
            </View>
          ))}
        </View>
      )}

      {/* Curiosidades de Jaén */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>¿Crees que conoces Jaén?</Text>
          <TouchableOpacity onPress={refreshCuriosidad} style={styles.refreshButton}>
            <Text style={styles.refreshIcon}>🔄</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.curiosidadCard}>
          <Text style={styles.curiosidadText}>
            {CURIOSIDADES_JAEN[curiosidadIndex]}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.verdeFondo,
  },
  content: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 32,
    color: Colors.verdeOscuro,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    color: Colors.grayDark,
  },
  mapaButton: {
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  mapaImage: {
    width: '100%',
    height: '100%',
  },
  mapaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapaButtonText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 20,
    color: Colors.white,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 20,
    color: Colors.verdeOscuro,
  },
  seeAll: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    color: Colors.verdeOscuro,
  },
  refreshButton: {
    padding: 4,
  },
  refreshIcon: {
    fontSize: 20,
  },
  comarcaCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  comarcaName: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    color: Colors.verdeOscuro,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.nuevoVerde,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.verdeClaro,
    borderRadius: 3,
  },
  progressText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    color: Colors.grayMedium,
  },
  curiosidadCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  curiosidadText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    color: Colors.black,
    lineHeight: 26,
  },
});
