import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  Animated,
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

function ComarcaCarouselCard({ comarca, onPress }: { comarca: Comarca; onPress: () => void }) {
  const imgUri = `${IMAGES_BASE_URL}/imagenes/comarcas/image/${encodeURIComponent(comarca.nombre)}.png?v=2`;
  return (
    <TouchableOpacity style={cardSt.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: imgUri }} style={cardSt.img} resizeMode="cover" />
    </TouchableOpacity>
  );
}

const cardSt = StyleSheet.create({
  card: {
    width: 200,
    height: 130,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: Colors.nuevoVerde,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    elevation: 3,
  },
  img: {
    width: '100%',
    height: '100%',
  },
});

export default function InicioScreen({ onGoToMapa, onGoToLogros }: Props) {
  const { userName } = useAuth();
  const { comarcas, isLoading, loadData } = useApp();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [curiosidadIndex, setCuriosidadIndex] = useState(
    Math.floor(Math.random() * CURIOSIDADES_JAEN.length)
  );
  const curiosidadOpacity = useRef(new Animated.Value(1)).current;

  const refreshCuriosidad = () => {
    Animated.timing(curiosidadOpacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * CURIOSIDADES_JAEN.length);
      } while (nextIndex === curiosidadIndex && CURIOSIDADES_JAEN.length > 1);
      setCuriosidadIndex(nextIndex);
      Animated.timing(curiosidadOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
    });
  };

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
        <Text style={styles.subtitle}>Descubre la provincia de Jaén</Text>
      </View>

      {/* Botón al mapa */}
      <TouchableOpacity onPress={onGoToMapa} style={styles.mapaButton} activeOpacity={0.85}>
        <Image
          source={require('../assets/images/PortadaMapa.png')}
          style={styles.mapaImage}
          resizeMode="cover"
        />
        <View style={styles.mapaOverlay}>
          <Text style={styles.mapaLabel}>Mapa interactivo</Text>
          <Text style={styles.mapaButtonText}>Abrir Mapa de Jaén</Text>
        </View>
      </TouchableOpacity>

      {/* Comarcas — carrusel horizontal con todas las comarcas */}
      {comarcas.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Comarcas</Text>
            <TouchableOpacity onPress={onGoToLogros}>
              <Text style={styles.seeAll}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
          >
            {comarcas.map(comarca => (
              <ComarcaCarouselCard
                key={comarca.id}
                comarca={comarca}
                onPress={onGoToLogros}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Curiosidades — estilo iOS: fondo verdeSeleccionado, texto blanco, fade al cambiar */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>¿Sabías que...?</Text>
          <TouchableOpacity onPress={refreshCuriosidad} style={styles.refreshButton}>
            <Text style={styles.refreshText}>Otra</Text>
          </TouchableOpacity>
        </View>
        <Animated.View style={[styles.curiosidadCard, { opacity: curiosidadOpacity }]}>
          <Text style={styles.curiosidadText}>
            {CURIOSIDADES_JAEN[curiosidadIndex]}
          </Text>
        </Animated.View>
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
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    color: Colors.grayDark,
  },

  // ── Botón mapa ──
  mapaButton: {
    marginHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
    height: 220,
    marginBottom: 32,
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
    backgroundColor: 'rgba(0,0,0,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  mapaLabel: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  mapaButtonText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 24,
    color: Colors.white,
  },

  // ── Secciones ──
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 24,
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

  // ── Carrusel comarcas ──
  carouselContent: {
    paddingHorizontal: 24,
    paddingBottom: 4,
  },

  // ── Curiosidades ──
  refreshButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: Colors.verdeSeleccionado,
    borderRadius: 10,
  },
  refreshText: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 13,
    color: Colors.white,
  },
  curiosidadCard: {
    marginHorizontal: 24,
    backgroundColor: Colors.verdeSeleccionado,
    borderRadius: 20,
    padding: 24,
    minHeight: 140,
    justifyContent: 'center',
    shadowColor: Colors.verdeOscuro,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  curiosidadText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 17,
    color: Colors.white,
    lineHeight: 27,
    textAlign: 'center',
  },
});
