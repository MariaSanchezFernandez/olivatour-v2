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
import { Comarca, LugarInteres, Logro, ImagenPoblacion } from '../types';
import AppDataService from '../services/AppDataService';
import { IMAGES_BASE_URL } from '../constants/api';
import { verifyProximity, geoErrorMessage } from '../services/GeoService';

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

function getPorcentajeImage(pct: number) {
  const rounded = Math.floor(pct / 10) * 10;
  return PERCENTAGE_IMAGES[rounded] ?? PERCENTAGE_IMAGES[0];
}

// Encodes path segments (handles accents and spaces) while preserving slashes
function getImageUri(imageStr: string | null | undefined): string | null {
  if (!imageStr) return null;
  if (imageStr.startsWith('http')) return imageStr;
  const encoded = imageStr.split('/').map(s => encodeURIComponent(s)).join('/');
  return `${IMAGES_BASE_URL}${encoded}`;
}

// City photo from poblacionImagenes folder using nombreNormalizado
function getCityPhotoUri(nombreNormalizado: string | null | undefined): string | null {
  if (!nombreNormalizado) return null;
  return `${IMAGES_BASE_URL}/imagenes/poblacion/poblacionImagenes/${encodeURIComponent(nombreNormalizado)}_0.jpg`;
}

export default function LogrosScreen() {
  const { comarcas, isLoading, loadData } = useApp();
  const { userId, userToken } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [porcentajes, setPorcentajes] = useState<PorcentajeMap>({});

  // Nivel 1: comarca seleccionada → lista de ciudades
  const [selectedComarca, setSelectedComarca] = useState<Comarca | null>(null);
  const [poblacionesComarca, setPoblacionesComarca] = useState<ImagenPoblacion[]>([]);
  const [lugaresComarca, setLugaresComarca] = useState<LugarInteres[]>([]);
  const [userLogros, setUserLogros] = useState<Logro[]>([]);
  const [loadingComarcaData, setLoadingComarcaData] = useState(false);

  // Nivel 2: ciudad seleccionada → medallas
  const [selectedPoblacion, setSelectedPoblacion] = useState<ImagenPoblacion | null>(null);

  // Nivel 3: medalla seleccionada → popup detalle
  const [selectedLugar, setSelectedLugar] = useState<LugarInteres | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoToggling, setGeoToggling] = useState(false);

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
    setLoadingComarcaData(true);
    setPoblacionesComarca([]);
    setLugaresComarca([]);
    try {
      const [poblaciones, lugares, logros] = await Promise.all([
        AppDataService.fetchImagenesPoblaciones(comarca.id),
        AppDataService.fetchLugaresPorComarca(comarca.id),
        userId && userToken
          ? AppDataService.fetchUserLogros(userId, userToken)
          : Promise.resolve([]),
      ]);
      setPoblacionesComarca(Array.isArray(poblaciones) ? poblaciones.filter(p => p.imagen) : []);
      setUserLogros(Array.isArray(logros) ? logros : []);
      setLugaresComarca(Array.isArray(lugares) ? lugares : []);
    } catch {
      setPoblacionesComarca([]);
      setLugaresComarca([]);
    } finally {
      setLoadingComarcaData(false);
    }
  };

  // Medallas filtradas por la ciudad seleccionada
  const lugaresForPoblacion = useMemo(() => {
    if (!selectedPoblacion) return [];
    return lugaresComarca.filter(l => l.poblacion_nombre === selectedPoblacion.poblacion);
  }, [lugaresComarca, selectedPoblacion]);

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

  // ─── Render: card de comarca (sin texto encima, solo imagen + badge pct) ──
  const renderComarca = ({ item }: { item: Comarca }) => {
    const pct = porcentajes[item.id] ?? 0;
    const imgUri = `${IMAGES_BASE_URL}/imagenes/comarcas/image/${encodeURIComponent(item.nombre)}.png?v=2`;
    return (
      <TouchableOpacity
        style={styles.comarcaCard}
        onPress={() => handleComarcaPress(item)}
        activeOpacity={0.88}
      >
        <Image source={{ uri: imgUri }} style={styles.comarcaImg} resizeMode="cover" />
        <View style={styles.pctBadge}>
          <Image source={getPorcentajeImage(pct)} style={styles.pctBadgeImg} resizeMode="contain" />
        </View>
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
      <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Comarcas</Text>

      <FlatList
        data={comarcas}
        renderItem={renderComarca}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={[styles.list, isDesktop && styles.listDesktop]}
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

      {/* ── MODAL 1: Ciudades de la comarca ── */}
      <Modal
        visible={!!selectedComarca}
        animationType="slide"
        onRequestClose={() => { setSelectedComarca(null); setPoblacionesComarca([]); }}
      >
        <View style={styles.modalScreen}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => { setSelectedComarca(null); setPoblacionesComarca([]); }}
            >
              <Text style={styles.backText}>‹ Volver</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle} numberOfLines={1}>
              {selectedComarca?.nombre}
            </Text>
            <View style={{ width: 70 }} />
          </View>

          {loadingComarcaData ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.verdeOscuro} />
              <Text style={styles.loadingText}>Cargando ciudades...</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.ciudadesList}>
              {poblacionesComarca.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay ciudades disponibles</Text>
                </View>
              ) : (
                poblacionesComarca.map(pob => {
                  const escudoUri = getImageUri(pob.imagen);
                  return (
                    <TouchableOpacity
                      key={pob.id}
                      style={styles.ciudadCard}
                      onPress={() => setSelectedPoblacion(pob)}
                      activeOpacity={0.78}
                    >
                      <View style={styles.ciudadEscudoWrap}>
                        {escudoUri ? (
                          <Image
                            source={{ uri: escudoUri }}
                            style={styles.ciudadEscudo}
                            resizeMode="contain"
                          />
                        ) : (
                          <View style={styles.ciudadEscudoPlaceholder} />
                        )}
                      </View>
                      <Text style={styles.ciudadNombre}>{pob.poblacion}</Text>
                      <Text style={styles.ciudadChevron}>›</Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>

        {/* ── MODAL 2: Medallas de la ciudad ── */}
        <Modal
          visible={!!selectedPoblacion}
          animationType="slide"
          onRequestClose={() => { setSelectedLugar(null); setSelectedPoblacion(null); }}
        >
          <View style={styles.modalScreen}>
            {/* Cabecera ciudad — hero photo + escudo + nombre (estilo iOS DetalleMonedaLogros) */}
            <View style={styles.medallasHeader}>
              {/* Foto de la ciudad como hero background */}
              {selectedPoblacion?.nombreNormalizado ? (
                <Image
                  source={{ uri: getCityPhotoUri(selectedPoblacion.nombreNormalizado)! }}
                  style={styles.medallasHeroImg}
                  resizeMode="cover"
                />
              ) : null}
              {/* Gradiente sobre la foto */}
              <View style={styles.medallasHeroGradient} />
              {/* Back button */}
              <TouchableOpacity
                style={styles.medallasBackBtn}
                onPress={() => { setSelectedLugar(null); setSelectedPoblacion(null); }}
              >
                <Text style={styles.backText}>‹ Volver</Text>
              </TouchableOpacity>
              {/* Escudo + nombre ciudad + comarca */}
              <View style={styles.medallasHeroContent}>
                {selectedPoblacion?.imagen ? (
                  <Image
                    source={{ uri: getImageUri(selectedPoblacion.imagen)! }}
                    style={styles.ciudadHeroEscudo}
                    resizeMode="contain"
                  />
                ) : null}
                <Text style={styles.medallasHeaderCity}>{selectedPoblacion?.poblacion}</Text>
                <Text style={styles.medallasHeaderComarca}>{selectedComarca?.nombre}</Text>
              </View>
            </View>

            {/* Grid 2 columnas — replica iOS */}
            <ScrollView contentContainerStyle={styles.medallasGrid}>
              {lugaresForPoblacion.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay medallas para esta ciudad</Text>
                </View>
              ) : (
                (() => {
                  const rows: LugarInteres[][] = [];
                  for (let i = 0; i < lugaresForPoblacion.length; i += 2) {
                    rows.push(lugaresForPoblacion.slice(i, i + 2));
                  }
                  return rows.map((row, ri) => (
                    <View key={ri} style={styles.medallaRow2}>
                      {row.map(lugar => {
                        const visitado = isLugarVisitado(lugar);
                        const medalUri = getImageUri(lugar.imagen_medalla);
                        const tipoImg = TIPO_IMAGES[lugar.tipo] ?? TIPO_IMAGES['otro'];
                        return (
                          <TouchableOpacity
                            key={lugar.id}
                            style={styles.medallaCell2}
                            onPress={() => setSelectedLugar(lugar)}
                            activeOpacity={0.75}
                          >
                            <View style={styles.medallaImgWrap2}>
                              {medalUri ? (
                                <Image
                                  source={{ uri: medalUri }}
                                  style={styles.medallaImg2}
                                  resizeMode="contain"
                                />
                              ) : (
                                <Image
                                  source={tipoImg}
                                  style={styles.medallaImg2}
                                  resizeMode="contain"
                                />
                              )}
                              {!visitado && <View style={styles.medallaOverlay2} />}
                            </View>
                            <Text style={styles.medallaNombre2} numberOfLines={2}>
                              {lugar.nombre}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                      {row.length < 2 && <View style={styles.medallaCell2} />}
                    </View>
                  ));
                })()
              )}
            </ScrollView>
          </View>

          {/* ── POPUP: Detalle de lugar/medalla ── */}
          <Modal
            visible={!!selectedLugar}
            animationType="fade"
            transparent
            onRequestClose={() => { setSelectedLugar(null); setGeoError(null); }}
          >
            <View style={styles.detalleOverlay}>
              <View style={styles.detalleCard}>
                <TouchableOpacity
                  style={styles.detalleClose}
                  onPress={() => { setSelectedLugar(null); setGeoError(null); }}
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
                      <>
                        {geoError ? (
                          <Text style={styles.geoErrorText}>{geoError}</Text>
                        ) : null}
                        <TouchableOpacity
                          style={[
                            styles.toggleButton,
                            isLugarVisitado(selectedLugar) && styles.toggleButtonVisitado,
                            geoToggling && styles.toggleButtonDisabled,
                          ]}
                          disabled={geoToggling}
                          onPress={async () => {
                            setGeoError(null);
                            const wasVisitado = isLugarVisitado(selectedLugar);
                            if (!wasVisitado) {
                              setGeoToggling(true);
                              const lat = parseFloat(String(selectedLugar.latitud));
                              const lng = parseFloat(String(selectedLugar.longitud));
                              if (!isNaN(lat) && !isNaN(lng)) {
                                const result = await verifyProximity(lat, lng);
                                if (!result.ok) {
                                  setGeoError(geoErrorMessage(result, selectedLugar.nombre));
                                  setGeoToggling(false);
                                  return;
                                }
                              }
                              setGeoToggling(false);
                            }
                            handleToggleVisita(selectedLugar);
                            setSelectedLugar(null);
                            setGeoError(null);
                          }}
                        >
                          {geoToggling ? (
                            <ActivityIndicator color={Colors.white} size="small" />
                          ) : (
                            <Text style={styles.toggleButtonText}>
                              {isLugarVisitado(selectedLugar)
                                ? 'Visitado — Quitar'
                                : 'Marcar como visitado'}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </>
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
  listDesktop: {
    paddingHorizontal: 40,
    maxWidth: 760,
    alignSelf: 'center' as any,
    width: '100%',
  },

  // ── Comarca card (solo imagen + badge, sin texto) ──
  comarcaCard: {
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    height: 160,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
    backgroundColor: Colors.nuevoVerde,
  },
  comarcaImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  pctBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  pctBadgeImg: {
    width: 52,
    height: 52,
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

  // ── Lista de ciudades ──
  ciudadesList: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  ciudadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  ciudadEscudoWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.verdeFondo,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  ciudadEscudo: {
    width: 56,
    height: 56,
  },
  ciudadEscudoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.nuevoVerde,
  },
  ciudadNombre: {
    flex: 1,
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 17,
    color: Colors.verdeOscuro,
  },
  ciudadChevron: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 22,
    color: Colors.grayMedium,
    marginLeft: 8,
  },

  // ── Cabecera pantalla medallas (nivel 2) — hero photo estilo iOS ──
  medallasHeader: {
    height: 260,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: Colors.verdeOscuro,
  },
  medallasHeroImg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },
  medallasHeroGradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 100%)' as any,
    backgroundColor: 'rgba(0,0,0,0.4)',
  } as any,
  medallasBackBtn: {
    position: 'absolute',
    top: 52,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
  },
  medallasHeroContent: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  ciudadHeroEscudo: {
    width: 90,
    height: 90,
    marginBottom: 8,
  },
  medallasHeaderCity: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 26,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 2,
  },
  medallasHeaderComarca: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },

  // ── Grid 2 columnas medallas (replica iOS) ──
  medallasGrid: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  medallaRow2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  medallaCell2: {
    width: '48%',
    alignItems: 'center',
  },
  medallaImgWrap2: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  medallaImg2: {
    width: 130,
    height: 130,
  },
  medallaOverlay2: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  medallaNombre2: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 13,
    color: Colors.grayDark,
    textAlign: 'center',
    lineHeight: 17,
    maxWidth: 130,
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
    width: 110,
    height: 110,
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
  toggleButtonDisabled: {
    opacity: 0.7,
  },
  geoErrorText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 18,
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
