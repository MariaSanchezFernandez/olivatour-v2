import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { Colors } from '../constants/colors';
import { CURIOSIDADES_JAEN } from '../constants/curiosidades';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { IMAGES_BASE_URL } from '../constants/api';
import { Comarca } from '../types';

interface Props {
  onGoToMapa: () => void;
  onGoToLogros: () => void;
}

function ComarcaImageCard({ comarca, onPress }: { comarca: Comarca; onPress: () => void }) {
  const imgUri = `${IMAGES_BASE_URL}/imagenes/comarcas/image/${encodeURIComponent(comarca.nombre)}.png`;
  return (
    <TouchableOpacity style={cardSt.card} onPress={onPress} activeOpacity={0.88}>
      <Image source={{ uri: imgUri }} style={cardSt.img} resizeMode="cover" />
      <View style={cardSt.gradient} />
    </TouchableOpacity>
  );
}

const cardSt = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    height: 100,
    position: 'relative',
    backgroundColor: Colors.nuevoVerde,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  img: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(19,42,19,0.55) 100%)' as any,
    backgroundColor: 'rgba(19,42,19,0.2)',
  } as any,
});

export default function InicioScreen({ onGoToMapa, onGoToLogros }: Props) {
  const { userName } = useAuth();
  const { comarcas, isLoading, loadData } = useApp();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
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
      <View style={[styles.header, isDesktop && styles.headerDesktop]}>
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

      {/* Comarcas recientes — mismas tarjetas de imagen que LogrosScreen (iOS: height 100) */}
      {top3Comarcas.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Comarcas</Text>
            <TouchableOpacity onPress={onGoToLogros}>
              <Text style={styles.seeAll}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          {top3Comarcas.map(comarca => (
            <ComarcaImageCard
              key={comarca.id}
              comarca={comarca}
              onPress={onGoToLogros}
            />
          ))}
        </View>
      )}

      {/* Curiosidades de Jaén */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>¿Crees que conoces Jaén?</Text>
          <TouchableOpacity onPress={refreshCuriosidad} style={styles.refreshButton}>
            <Text style={styles.refreshText}>Otra</Text>
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
  headerDesktop: {
    paddingTop: 32,
  },
  greeting: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 36,
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
    borderRadius: 20,
    overflow: 'hidden',
    height: 220,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  mapaImage: {
    width: '100%',
    height: '100%',
  },
  mapaOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapaButtonText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 22,
    color: Colors.white,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 22,
    color: Colors.verdeOscuro,
  },
  seeAll: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 15,
    color: Colors.verdeOscuro,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: Colors.nuevoVerde,
    borderRadius: 10,
  },
  refreshText: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
    color: Colors.verdeOscuro,
  },
  curiosidadCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  curiosidadText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    color: Colors.verdeOscuro,
    lineHeight: 26,
  },
});
