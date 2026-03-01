import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Image,
  Animated,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Comarca, LugarInteres, Logro, ImagenPoblacion } from '../types';
import AppDataService from '../services/AppDataService';
import { API_BASE_URL } from '../constants/api';

interface PorcentajeMap {
  [comarcaId: number]: number;
}

const PERCENTAGE_IMAGES: { [key: number]: any } = {
  0: require('../assets/images/0.png'),
  10: require('../assets/images/10.png'),
  20: require('../assets/images/20.png'),
  30: require('../assets/images/30.png'),
  40: require('../assets/images/40.png'),
  50: require('../assets/images/50.png'),
  60: require('../assets/images/60.png'),
  70: require('../assets/images/70.png'),
  80: require('../assets/images/80.png'),
  90: require('../assets/images/90.png'),
  100: require('../assets/images/100.png'),
};

const TIPO_IMAGES: { [key: string]: any } = {
  calles: require('../assets/images/Calles.png'),
  castillos: require('../assets/images/Castillos.png'),
  iglesias: require('../assets/images/Iglesias.png'),
  monumentos: require('../assets/images/Monumentos.png'),
  museos: require('../assets/images/Museos.png'),
  paisajes: require('../assets/images/Paisajes.png'),
  yacimientos: require('../assets/images/Yacimientos.png'),
  otro: require('../assets/images/Otro.png'),
};

const TIPO_LABEL: { [key: string]: string } = {
  calles: 'Calles',
  castillos: 'Castillos',
  iglesias: 'Iglesias',
  monumentos: 'Monumentos',
  museos: 'Museos',
  paisajes: 'Paisajes',
  yacimientos: 'Yacimientos',
  otro: 'Otro',
};

function getPorcentajeImage(pct: number) {
  const rounded = Math.floor(pct / 10) * 10;
  return PERCENTAGE_IMAGES[rounded] ?? PERCENTAGE_IMAGES[0];
}

function getImageUri(imageStr: string | null | undefined): string | null {
  if (!imageStr) return null;
  if (imageStr.startsWith('http')) return imageStr;
  return `${API_BASE_URL}${imageStr}`;
}

export default function LogrosScreen() {
  const { comarcas, isLoading, loadData } = useApp();
  const { userId, userToken } = useAuth();
  const [porcentajes, setPorcentajes] = useState<PorcentajeMap>({});

  // Nivel 1: Comarca seleccionada → pantalla de poblaciones
  const [selectedComarca, setSelectedComarca] = useState<Comarca | null>(null);
  const [imagenesPoblaciones, setImagenesPoblaciones] = useState<ImagenPoblacion[]>([]);
  const [loadingPoblaciones, setLoadingPoblaciones] = useState(false);

  // Nivel 2: Poblacion seleccionada → pantalla de medallas
  const [selectedPoblacion, setSelectedPoblacion] = useState<ImagenPoblacion | null>(null);
  const [lugaresPoblacion, setLugaresPoblacion] = useState<LugarInteres[]>([]);
  const [userLogros, setUserLogros] = useState<Logro[]>([]);
  const [loadingLugares, setLoadingLugares] = useState(false);

  // Nivel 3: Lugar seleccionado → popup detalle
  const [selectedLugar, setSelectedLugar] = useState<LugarInteres | null>(null);

  // Popup medalla ganada
  const [medallaGanada, setMedallaGanada] = useState<LugarInteres | null>(null);
  const medallaOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (comarcas.length > 0 && userId && userToken) {
      fetchPorcentajes();
    }
  }, [comarcas, userId]);

  useEffect(() => {
    if (medallaGanada) {
      Animated.sequence([
        Animated.timing(medallaOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(1800),
        Animated.timing(medallaOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setMedallaGanada(null));
    }
  }, [medallaGanada]);

  const fetchPorcentajes = async () => {
    if (!userId || !userToken) return;
    const results: PorcentajeMap = {};
    await Promise.allSettled(
      comarcas.map(async comarca => {
        try {
          const pct = await AppDataService.fetchPorcentajeComarca(comarca.id, userId, userToken);
          results[comarca.id] = pct;
        } catch {
          results[comarca.id] = 0;
        }
      })
    );
    setPorcentajes(results);
  };

  // Abrir pantalla de poblaciones de una comarca
  const handleComarcaPress = async (comarca: Comarca) => {
    setSelectedComarca(comarca);
    setLoadingPoblaciones(true);
    setImagenesPoblaciones([]);
    try {
      const data = await AppDataService.fetchImagenesPoblaciones(comarca.id);
      setImagenesPoblaciones(data);
    } catch {
      setImagenesPoblaciones([]);
    } finally {
      setLoadingPoblaciones(false);
    }
  };

  // Abrir pantalla de medallas de una poblacion
  const handlePoblacionPress = async (poblacion: ImagenPoblacion) => {
    setSelectedPoblacion(poblacion);
    setLoadingLugares(true);
    setLugaresPoblacion([]);
    try {
      const [lugares, logros] = await Promise.all([
        AppDataService.fetchLugaresPorPoblacion(poblacion.id),
        userId && userToken
          ? AppDataService.fetchUserLogros(userId, userToken)
          : Promise.resolve([]),
      ]);
      setUserLogros(logros);
      setLugaresPoblacion(lugares);
    } catch {
      setLugaresPoblacion([]);
    } finally {
      setLoadingLugares(false);
    }
  };

  const isLugarVisitado = (lugar: LugarInteres): boolean => {
    // Comprobar por logro.id del lugar vs IDs de logros del usuario
    if (lugar.logro?.id) {
      return userLogros.some(l => l.id === lugar.logro!.id);
    }
    // Fallback: comprobar por logroable_id
    return userLogros.some(
      l => (l.logroable_type || '').includes('LugarInteres') && l.logroable_id === lugar.id
    );
  };

  const handleToggleVisita = async (lugar: LugarInteres) => {
    if (!lugar.logro?.id || !userId || !userToken) return;

    const wasVisited = isLugarVisitado(lugar);

    // Optimistic update
    if (!wasVisited) {
      setUserLogros(prev => [
        ...prev,
        { ...lugar.logro!, pivot: { fecha_desbloqueo: new Date().toISOString() } },
      ]);
      setMedallaGanada(lugar);
    } else {
      setUserLogros(prev => prev.filter(l => l.id !== lugar.logro!.id));
    }

    try {
      await AppDataService.toggleLogro(userId, lugar.logro.id, userToken);
      fetchPorcentajes();
    } catch {
      // Revert on error
      if (!wasVisited) {
        setUserLogros(prev => prev.filter(l => l.id !== lugar.logro!.id));
      } else {
        setUserLogros(prev => [...prev, lugar.logro!]);
      }
    }
  };

  // ─── Render: lista de comarcas ────────────────────────────────────────────
  const renderComarca = ({ item }: { item: Comarca }) => {
    const pct = porcentajes[item.id] ?? 0;
    return (
      <TouchableOpacity
        style={styles.comarcaCard}
        onPress={() => handleComarcaPress(item)}
        activeOpacity={0.8}
      >
        <Image source={getPorcentajeImage(pct)} style={styles.porcentajeImage} resizeMode="contain" />
        <View style={styles.comarcaInfo}>
          <Text style={styles.comarcaName}>{item.nombre}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
          </View>
          <Text style={styles.progressText}>{pct}% completado</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  // ─── Render: card de poblacion ────────────────────────────────────────────
  const renderPoblacion = ({ item }: { item: ImagenPoblacion }) => {
    const imageUri = getImageUri(item.imagen);
    return (
      <TouchableOpacity
        style={styles.poblacionCard}
        onPress={() => handlePoblacionPress(item)}
        activeOpacity={0.8}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.poblacionImage} resizeMode="cover" />
        ) : (
          <View style={[styles.poblacionImage, styles.poblacionImagePlaceholder]}>
            <Text style={styles.poblacionImageEmoji}>🏘️</Text>
          </View>
        )}
        <View style={styles.poblacionNameContainer}>
          <Text style={styles.poblacionName} numberOfLines={2}>
            {item.poblacion}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Render: medalla de lugar ─────────────────────────────────────────────
  const renderMedalla = ({ item }: { item: LugarInteres }) => {
    const visitado = isLugarVisitado(item);
    const medalUri = getImageUri(item.imagen_medalla);
    const tipoImg = TIPO_IMAGES[item.tipo] ?? TIPO_IMAGES['otro'];

    return (
      <TouchableOpacity
        style={styles.medallaCell}
        onPress={() => setSelectedLugar(item)}
        activeOpacity={0.75}
      >
        <View style={[styles.medallaImageWrap, !visitado && styles.medallaNoVisitada]}>
          {medalUri ? (
            <Image source={{ uri: medalUri }} style={styles.medallaImage} resizeMode="contain" />
          ) : (
            <Image source={tipoImg} style={styles.medallaImage} resizeMode="contain" />
          )}
          {visitado && (
            <View style={styles.medallaCheck}>
              <Text style={styles.medallaCheckText}>✓</Text>
            </View>
          )}
        </View>
        <Text style={styles.medallaNombre} numberOfLines={2}>
          {item.nombre}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading && comarcas.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.verdeOscuro} />
        <Text style={styles.loadingText}>Cargando comarcas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comarcas</Text>

      <FlatList
        data={comarcas}
        renderItem={renderComarca}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => loadData(true)}
            tintColor={Colors.verdeOscuro}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay comarcas disponibles</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => loadData(true)}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* ── MODAL 1: Poblaciones de la comarca ── */}
      <Modal
        visible={!!selectedComarca}
        animationType="slide"
        onRequestClose={() => {
          setSelectedPoblacion(null);
          setSelectedComarca(null);
        }}
      >
        <View style={styles.modalScreen}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setSelectedPoblacion(null);
                setSelectedComarca(null);
              }}
            >
              <Text style={styles.backText}>‹ Volver</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle} numberOfLines={1}>
              {selectedComarca?.nombre}
            </Text>
            <View style={{ width: 70 }} />
          </View>

          {loadingPoblaciones ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.verdeOscuro} />
              <Text style={styles.loadingText}>Cargando pueblos...</Text>
            </View>
          ) : (
            <FlatList
              data={imagenesPoblaciones}
              renderItem={renderPoblacion}
              keyExtractor={item => item.id.toString()}
              numColumns={2}
              columnWrapperStyle={styles.poblacionRow}
              contentContainerStyle={styles.poblacionList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay pueblos disponibles</Text>
                </View>
              }
            />
          )}
        </View>

        {/* ── MODAL 2 (anidado): Medallas de la poblacion ── */}
        <Modal
          visible={!!selectedPoblacion}
          animationType="slide"
          onRequestClose={() => setSelectedPoblacion(null)}
        >
          <View style={styles.modalScreen}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  setSelectedLugar(null);
                  setSelectedPoblacion(null);
                }}
              >
                <Text style={styles.backText}>‹ Volver</Text>
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                {selectedPoblacion?.poblacion}
              </Text>
              <View style={{ width: 70 }} />
            </View>

            {loadingLugares ? (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.verdeOscuro} />
                <Text style={styles.loadingText}>Cargando logros...</Text>
              </View>
            ) : (
              <FlatList
                data={lugaresPoblacion}
                renderItem={renderMedalla}
                keyExtractor={item => item.id.toString()}
                numColumns={3}
                columnWrapperStyle={styles.medallaRow}
                contentContainerStyle={styles.medallaList}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No hay logros disponibles</Text>
                  </View>
                }
              />
            )}
          </View>

          {/* ── MODAL 3 (anidado): Detalle del lugar ── */}
          <Modal
            visible={!!selectedLugar}
            animationType="fade"
            transparent
            onRequestClose={() => setSelectedLugar(null)}
          >
            <View style={styles.detalleOverlay}>
              <View style={styles.detalleCard}>
                <TouchableOpacity
                  style={styles.detalleClose}
                  onPress={() => setSelectedLugar(null)}
                >
                  <Text style={styles.detalleCloseText}>✕</Text>
                </TouchableOpacity>

                {selectedLugar && (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Imagen del tipo / medalla */}
                    <View style={styles.detalleMedallaWrap}>
                      {getImageUri(selectedLugar.imagen_medalla) ? (
                        <Image
                          source={{ uri: getImageUri(selectedLugar.imagen_medalla)! }}
                          style={styles.detalleMedallaImg}
                          resizeMode="contain"
                        />
                      ) : (
                        <Image
                          source={TIPO_IMAGES[selectedLugar.tipo] ?? TIPO_IMAGES['otro']}
                          style={styles.detalleMedallaImg}
                          resizeMode="contain"
                        />
                      )}
                    </View>

                    {/* Tipo */}
                    <Text style={styles.detalleTipo}>
                      {TIPO_LABEL[selectedLugar.tipo] ?? selectedLugar.tipo}
                    </Text>

                    {/* Nombre */}
                    <Text style={styles.detalleNombre}>{selectedLugar.nombre}</Text>

                    {/* Descripciones */}
                    {selectedLugar.descripcionUno ? (
                      <Text style={styles.detalleDesc}>{selectedLugar.descripcionUno}</Text>
                    ) : null}
                    {selectedLugar.descripcionDos ? (
                      <Text style={styles.detalleDesc}>{selectedLugar.descripcionDos}</Text>
                    ) : null}

                    {/* Botón toggle visita */}
                    {selectedLugar.logro?.id ? (
                      <TouchableOpacity
                        style={[
                          styles.toggleButton,
                          isLugarVisitado(selectedLugar) && styles.toggleButtonVisitado,
                        ]}
                        onPress={() => {
                          handleToggleVisita(selectedLugar);
                          setSelectedLugar(null);
                        }}
                      >
                        <Text style={styles.toggleButtonText}>
                          {isLugarVisitado(selectedLugar)
                            ? '✓ Visitado — Quitar'
                            : '+ Marcar como visitado'}
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                  </ScrollView>
                )}
              </View>
            </View>
          </Modal>
        </Modal>
      </Modal>

      {/* ── Popup: Medalla ganada ── */}
      {medallaGanada && (
        <Animated.View style={[styles.medallaGanadaPopup, { opacity: medallaOpacity }]}>
          <Text style={styles.medallaGanadaEmoji}>🏅</Text>
          <Text style={styles.medallaGanadaTitulo}>¡Medalla conseguida!</Text>
          <Text style={styles.medallaGanadaNombre} numberOfLines={2}>
            {medallaGanada.nombre}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.verdeFondo,
  },
  title: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 28,
    color: Colors.verdeOscuro,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },

  // ── Comarca card ──
  comarcaCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  porcentajeImage: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  comarcaInfo: {
    flex: 1,
  },
  comarcaName: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 17,
    color: Colors.verdeOscuro,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.nuevoVerde,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.verdeClaro,
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    color: Colors.grayMedium,
  },
  chevron: {
    fontSize: 24,
    color: Colors.grayMedium,
    marginLeft: 8,
  },

  // ── Modal pantalla completa ──
  modalScreen: {
    flex: 1,
    backgroundColor: Colors.verdeFondo,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    width: 70,
  },
  backText: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    color: Colors.verdeOscuro,
  },
  modalHeaderTitle: {
    flex: 1,
    fontFamily: 'Urbanist-Bold',
    fontSize: 18,
    color: Colors.verdeOscuro,
    textAlign: 'center',
  },

  // ── Poblaciones grid ──
  poblacionList: {
    padding: 16,
    paddingBottom: 40,
  },
  poblacionRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  poblacionCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  poblacionImage: {
    width: '100%',
    height: 110,
  },
  poblacionImagePlaceholder: {
    backgroundColor: Colors.nuevoVerde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poblacionImageEmoji: {
    fontSize: 40,
  },
  poblacionNameContainer: {
    padding: 10,
  },
  poblacionName: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 14,
    color: Colors.verdeOscuro,
    textAlign: 'center',
  },

  // ── Medallas grid ──
  medallaList: {
    padding: 16,
    paddingBottom: 40,
  },
  medallaRow: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  medallaCell: {
    width: '31%',
    alignItems: 'center',
  },
  medallaImageWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.nuevoVerde,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  medallaNoVisitada: {
    opacity: 0.35,
  },
  medallaImage: {
    width: 56,
    height: 56,
  },
  medallaCheck: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.verdeClaro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medallaCheckText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: 'Urbanist-Bold',
  },
  medallaNombre: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 11,
    color: Colors.grayDark,
    textAlign: 'center',
    lineHeight: 14,
  },

  // ── Detalle lugar (popup centrado) ──
  detalleOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  detalleCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
  },
  detalleClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  detalleCloseText: {
    fontSize: 16,
    color: Colors.grayDark,
  },
  detalleMedallaWrap: {
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  detalleMedallaImg: {
    width: 90,
    height: 90,
  },
  detalleTipo: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 13,
    color: Colors.grayMedium,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  detalleNombre: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 22,
    color: Colors.verdeOscuro,
    textAlign: 'center',
    marginBottom: 16,
  },
  detalleDesc: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 15,
    color: Colors.grayDark,
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'justify',
  },
  toggleButton: {
    backgroundColor: Colors.verdeSeleccionado,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  toggleButtonVisitado: {
    backgroundColor: Colors.grayMedium,
  },
  toggleButtonText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 15,
    color: Colors.white,
  },

  // ── Estados ──
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.verdeFondo,
  },
  loadingText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    color: Colors.grayDark,
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    color: Colors.grayMedium,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.verdeSeleccionado,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 16,
    color: Colors.white,
  },

  // ── Popup medalla ganada ──
  medallaGanadaPopup: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: Colors.verdeSeleccionado,
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    minWidth: 220,
  },
  medallaGanadaEmoji: {
    fontSize: 40,
    marginBottom: 6,
  },
  medallaGanadaTitulo: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 18,
    color: Colors.white,
    marginBottom: 4,
  },
  medallaGanadaNombre: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    color: Colors.verdeFondo,
    textAlign: 'center',
    maxWidth: 200,
  },
});
