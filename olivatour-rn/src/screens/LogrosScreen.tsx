import React, { useEffect, useState, useRef, useMemo } from 'react';
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
  useWindowDimensions,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Comarca, LugarInteres, Logro } from '../types';
import AppDataService from '../services/AppDataService';
import { IMAGES_BASE_URL } from '../constants/api';

interface PorcentajeMap {
  [comarcaId: number]: number;
}

const PERCENTAGE_IMAGES: { [key: number]: any } = {
  0:   require('../assets/images/0.png'),
  10:  require('../assets/images/10.png'),
  20:  require('../assets/images/20.png'),
  30:  require('../assets/images/30.png'),
  40:  require('../assets/images/40.png'),
  50:  require('../assets/images/50.png'),
  60:  require('../assets/images/60.png'),
  70:  require('../assets/images/70.png'),
  80:  require('../assets/images/80.png'),
  90:  require('../assets/images/90.png'),
  100: require('../assets/images/100.png'),
};

const TIPO_IMAGES: { [key: string]: any } = {
  calles:      require('../assets/images/Calles.png'),
  castillos:   require('../assets/images/Castillos.png'),
  iglesias:    require('../assets/images/Iglesias.png'),
  monumentos:  require('../assets/images/Monumentos.png'),
  museos:      require('../assets/images/Museos.png'),
  paisajes:    require('../assets/images/Paisajes.png'),
  yacimientos: require('../assets/images/Yacimientos.png'),
  otro:        require('../assets/images/Otro.png'),
};

const TIPO_LABEL: { [key: string]: string } = {
  calles:      'Calles',
  castillos:   'Castillos',
  iglesias:    'Iglesias',
  monumentos:  'Monumentos',
  museos:      'Museos',
  paisajes:    'Paisajes',
  yacimientos: 'Yacimientos',
  otro:        'Otro',
};

type SectionItem =
  | { type: 'header'; title: string; key: string }
  | { type: 'row'; items: LugarInteres[]; key: string };

function getPorcentajeImage(pct: number) {
  const rounded = Math.floor(pct / 10) * 10;
  return PERCENTAGE_IMAGES[rounded] ?? PERCENTAGE_IMAGES[0];
}

function getImageUri(imageStr: string | null | undefined): string | null {
  if (!imageStr) return null;
  if (imageStr.startsWith('http')) return imageStr;
  return `${IMAGES_BASE_URL}${imageStr}`;
}

export default function LogrosScreen() {
  const { comarcas, isLoading, loadData } = useApp();
  const { userId, userToken } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [porcentajes, setPorcentajes] = useState<PorcentajeMap>({});

  // Comarca seleccionada → modal de medallas
  const [selectedComarca, setSelectedComarca] = useState<Comarca | null>(null);
  const [lugaresComarca, setLugaresComarca] = useState<LugarInteres[]>([]);
  const [userLogros, setUserLogros] = useState<Logro[]>([]);
  const [loadingLugares, setLoadingLugares] = useState(false);

  // Lugar seleccionado → popup detalle
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

  const handleComarcaPress = async (comarca: Comarca) => {
    setSelectedComarca(comarca);
    setLoadingLugares(true);
    setLugaresComarca([]);
    try {
      const [lugares, logros] = await Promise.all([
        AppDataService.fetchLugaresPorComarca(comarca.id),
        userId && userToken
          ? AppDataService.fetchUserLogros(userId, userToken)
          : Promise.resolve([]),
      ]);
      setUserLogros(logros);
      setLugaresComarca(lugares);
    } catch {
      setLugaresComarca([]);
    } finally {
      setLoadingLugares(false);
    }
  };

  const isLugarVisitado = (lugar: LugarInteres): boolean => {
    if (lugar.logro?.id) {
      return userLogros.some(l => l.id === lugar.logro!.id);
    }
    return userLogros.some(
      l => (l.logroable_type || '').includes('LugarInteres') && l.logroable_id === lugar.id
    );
  };

  const handleToggleVisita = async (lugar: LugarInteres) => {
    if (!lugar.logro?.id || !userId || !userToken) return;

    const wasVisited = isLugarVisitado(lugar);

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
      if (!wasVisited) {
        setUserLogros(prev => prev.filter(l => l.id !== lugar.logro!.id));
      } else {
        setUserLogros(prev => [...prev, lugar.logro!]);
      }
    }
  };

  // Agrupa las medallas por pueblo en filas de 3
  const sectionData = useMemo((): SectionItem[] => {
    const map = new Map<string, LugarInteres[]>();
    lugaresComarca.forEach(lugar => {
      const key = lugar.poblacion_nombre ?? 'Sin pueblo';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(lugar);
    });
    const result: SectionItem[] = [];
    map.forEach((items, title) => {
      result.push({ type: 'header', title, key: `h-${title}` });
      for (let i = 0; i < items.length; i += 3) {
        result.push({ type: 'row', items: items.slice(i, i + 3), key: `r-${title}-${i}` });
      }
    });
    return result;
  }, [lugaresComarca]);

  // ─── Render: lista de comarcas ───────────────────────────────────────────
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

  // ─── Render: medalla individual ──────────────────────────────────────────
  const renderMedallaItem = (lugar: LugarInteres) => {
    const visitado = isLugarVisitado(lugar);
    const medalUri = getImageUri(lugar.imagen_medalla);
    const tipoImg = TIPO_IMAGES[lugar.tipo] ?? TIPO_IMAGES['otro'];

    return (
      <TouchableOpacity
        key={lugar.id}
        style={styles.medallaCell}
        onPress={() => setSelectedLugar(lugar)}
        activeOpacity={0.75}
      >
        <View style={[styles.medallaImageWrap, !visitado && styles.medallaNoVisitada]}>
          {medalUri ? (
            <Image source={{ uri: medalUri }} style={styles.medallaImage} resizeMode="contain" />
          ) : (
            <Image source={tipoImg} style={styles.medallaImage} resizeMode="contain" />
          )}
          {visitado && <View style={styles.medallaCheck} />}
        </View>
        <Text style={styles.medallaNombre} numberOfLines={2}>{lugar.nombre}</Text>
      </TouchableOpacity>
    );
  };

  // ─── Render: fila/header de la sección ──────────────────────────────────
  const renderSectionItem = ({ item }: { item: SectionItem }) => {
    if (item.type === 'header') {
      return <Text style={styles.sectionTitle}>{item.title}</Text>;
    }
    return (
      <View style={styles.medallaRowContainer}>
        {item.items.map(lugar => renderMedallaItem(lugar))}
        {item.items.length < 3 &&
          Array.from({ length: 3 - item.items.length }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.medallaCell} />
          ))}
      </View>
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
      <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Comarcas</Text>

      <FlatList
        numColumns={isDesktop ? 2 : 1}
        key={isDesktop ? 'desktop' : 'mobile'}
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

      {/* ── MODAL: Medallas de la comarca ── */}
      <Modal
        visible={!!selectedComarca}
        animationType="slide"
        onRequestClose={() => {
          setSelectedLugar(null);
          setSelectedComarca(null);
        }}
      >
        <View style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setSelectedLugar(null);
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

          {loadingLugares ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.verdeOscuro} />
              <Text style={styles.loadingText}>Cargando medallas...</Text>
            </View>
          ) : (
            <FlatList
              data={sectionData}
              renderItem={renderSectionItem}
              keyExtractor={item => item.key}
              contentContainerStyle={styles.medallaList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay logros para esta comarca</Text>
                </View>
              }
            />
          )}
        </View>

        {/* ── MODAL anidado: Detalle del lugar ── */}
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

                  <Text style={styles.detalleTipo}>
                    {TIPO_LABEL[selectedLugar.tipo] ?? selectedLugar.tipo}
                  </Text>
                  <Text style={styles.detalleNombre}>{selectedLugar.nombre}</Text>

                  {selectedLugar.poblacion_nombre ? (
                    <Text style={styles.detallePueblo}>{selectedLugar.poblacion_nombre}</Text>
                  ) : null}

                  {selectedLugar.descripcionUno ? (
                    <Text style={styles.detalleDesc}>{selectedLugar.descripcionUno}</Text>
                  ) : null}
                  {selectedLugar.descripcionDos ? (
                    <Text style={styles.detalleDesc}>{selectedLugar.descripcionDos}</Text>
                  ) : null}

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
                          ? 'Visitado — Quitar'
                          : 'Marcar como visitado'}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </Modal>

      {/* ── Popup: Medalla ganada ── */}
      {medallaGanada && (
        <Animated.View style={[styles.medallaGanadaPopup, { opacity: medallaOpacity }]}>
          <Text style={styles.medallaGanadaTitulo}>Medalla conseguida</Text>
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
  titleDesktop: {
    paddingTop: 32,
    fontSize: 32,
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

  // ── Medallas grid ──
  medallaList: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 16,
    color: Colors.verdeOscuro,
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  medallaRowContainer: {
    flexDirection: 'row',
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
    opacity: 0.6,
    filter: 'grayscale(100%)' as any,
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
    fontSize: 14,
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
    marginBottom: 4,
  },
  detallePueblo: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 13,
    color: Colors.grayMedium,
    textAlign: 'center',
    marginBottom: 12,
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
