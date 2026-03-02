import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Colors } from '../constants/colors';
import { MAPBOX_TOKEN, MAPBOX_STYLE, JAEN_CENTER, JAEN_ZOOM } from '../constants/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { LugarInteres } from '../types';

const TIPO_COLORS: Record<string, string> = {
  castillos:  '#8B4513',
  iglesias:   '#4A90D9',
  monumentos: '#9B59B6',
  museos:     '#E67E22',
  paisajes:   '#27AE60',
  yacimientos:'#C0392B',
  calles:     '#7F8C8D',
  otro:       '#95A5A6',
};

const TIPO_EMOJI: Record<string, string> = {
  castillos:  '🏰',
  iglesias:   '⛪',
  monumentos: '🗿',
  museos:     '🏛',
  paisajes:   '🌿',
  yacimientos:'⛏',
  calles:     '🛤',
  otro:       '📍',
};

// Por encima de este zoom se muestran los lugares de interés
const MIN_ZOOM_LUGARES = 10;

export default function MapaScreen() {
  const { comarcas, lugares, userLogros, toggleVisita } = useApp();
  const { userId, userToken } = useAuth();

  const [viewState, setViewState] = useState({
    longitude: JAEN_CENTER.longitude,
    latitude:  JAEN_CENTER.latitude,
    zoom:      JAEN_ZOOM,
  });
  const [selectedLugar, setSelectedLugar] = useState<LugarInteres | null>(null);
  const [showMedallaPopup, setShowMedallaPopup] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const showLugares = viewState.zoom >= MIN_ZOOM_LUGARES;

  const isVisitado = (lugar: LugarInteres): boolean => {
    if (!lugar.logro) return false;
    return userLogros.some(l => l.id === lugar.logro!.id);
  };

  const handleSelectComarca = (comarca: any) => {
    setViewState(prev => ({
      ...prev,
      longitude: comarca.longitud,
      latitude:  comarca.latitud,
      zoom:      11,
    }));
  };

  const handleToggleVisita = async () => {
    if (!selectedLugar || !userId || !userToken || !selectedLugar.logro?.id) return;
    setTogglingId(selectedLugar.id);
    const success = await toggleVisita(userId, selectedLugar.logro.id, userToken);
    setTogglingId(null);
    if (success) {
      setShowMedallaPopup(true);
      setTimeout(() => setShowMedallaPopup(false), 3000);
    }
  };

  const resetToJaen = () => {
    setViewState({
      longitude: JAEN_CENTER.longitude,
      latitude:  JAEN_CENTER.latitude,
      zoom:      JAEN_ZOOM,
    });
  };

  return (
    <View style={styles.container}>
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' } as any}
        mapStyle={MAPBOX_STYLE}
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />

        {/* Marcadores de comarca — visibles cuando zoom < MIN_ZOOM_LUGARES */}
        {!showLugares && comarcas.map(comarca => (
          <Marker
            key={`comarca-${comarca.id}`}
            longitude={comarca.longitud}
            latitude={comarca.latitud}
          >
            <TouchableOpacity
              style={styles.comarcaMarker}
              onPress={() => handleSelectComarca(comarca)}
            >
              <Text style={styles.comarcaMarkerText}>{comarca.nombre}</Text>
            </TouchableOpacity>
          </Marker>
        ))}

        {/* Marcadores de lugares de interés — visibles al hacer zoom */}
        {showLugares && lugares.map(lugar => {
          if (!lugar.latitud || !lugar.longitud) return null;
          const visitado = isVisitado(lugar);
          const color = TIPO_COLORS[lugar.tipo] ?? Colors.grayMedium;
          const emoji = TIPO_EMOJI[lugar.tipo] ?? '📍';
          return (
            <Marker
              key={`lugar-${lugar.id}`}
              longitude={lugar.longitud}
              latitude={lugar.latitud}
            >
              <TouchableOpacity
                style={[styles.lugarMarker, { backgroundColor: color, opacity: visitado ? 0.55 : 1 }]}
                onPress={() => setSelectedLugar(lugar)}
              >
                <Text style={styles.lugarEmoji}>{emoji}</Text>
              </TouchableOpacity>
            </Marker>
          );
        })}
      </Map>

      {/* Leyenda de tipos (visible al hacer zoom) */}
      {showLugares && (
        <View style={styles.legend}>
          {Object.entries(TIPO_EMOJI).map(([tipo, emoji]) => (
            <View key={tipo} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: TIPO_COLORS[tipo] }]} />
              <Text style={styles.legendText}>{emoji} {tipo}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Pista de zoom */}
      {!showLugares && (
        <View style={styles.zoomHint}>
          <Text style={styles.zoomHintText}>🔍 Haz zoom para ver los lugares de interés</Text>
        </View>
      )}

      {/* Botón volver a Jaén */}
      <TouchableOpacity style={styles.resetButton} onPress={resetToJaen}>
        <Text style={styles.resetButtonText}>🗺 Jaén</Text>
      </TouchableOpacity>

      {/* Popup medalla */}
      {showMedallaPopup && (
        <View style={styles.medallaPopup}>
          <Text style={styles.medallaText}>🏅 ¡Lugar visitado! Has ganado una medalla</Text>
        </View>
      )}

      {/* Bottom sheet — detalle lugar */}
      <Modal
        visible={!!selectedLugar}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedLugar(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedLugar(null)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            {selectedLugar && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.tipoTagContainer}>
                  <View style={[styles.tipoTag, { backgroundColor: TIPO_COLORS[selectedLugar.tipo] ?? Colors.grayMedium }]}>
                    <Text style={styles.tipoTagText}>
                      {TIPO_EMOJI[selectedLugar.tipo]} {selectedLugar.tipo}
                    </Text>
                  </View>
                  {isVisitado(selectedLugar) && (
                    <View style={styles.visitadoBadge}>
                      <Text style={styles.visitadoBadgeText}>✓ Visitado</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.modalTitle}>{selectedLugar.nombre}</Text>
                {selectedLugar.descripcionUno ? (
                  <Text style={styles.modalDesc}>{selectedLugar.descripcionUno}</Text>
                ) : null}
                {selectedLugar.descripcionDos ? (
                  <Text style={styles.modalDesc}>{selectedLugar.descripcionDos}</Text>
                ) : null}
                <Text style={styles.modalCoords}>
                  📍 {selectedLugar.latitud?.toFixed(5)}, {selectedLugar.longitud?.toFixed(5)}
                </Text>
                {selectedLugar.logro && (
                  <TouchableOpacity
                    style={[styles.visitarButton, isVisitado(selectedLugar) && styles.visitarButtonDone]}
                    onPress={handleToggleVisita}
                    disabled={togglingId === selectedLugar.id}
                  >
                    <Text style={styles.visitarText}>
                      {togglingId === selectedLugar.id
                        ? '...'
                        : isVisitado(selectedLugar)
                          ? '✓ Visitado — quitar marca'
                          : '📍 Marcar como visitado'}
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  comarcaMarker: {
    backgroundColor: Colors.verdeOscuro,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    cursor: 'pointer' as any,
  },
  comarcaMarkerText: {
    color: Colors.white,
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 12,
  },
  lugarMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    cursor: 'pointer' as any,
  },
  lugarEmoji: {
    fontSize: 14,
  },
  legend: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 11,
    color: Colors.grayDark,
    textTransform: 'capitalize',
  },
  zoomHint: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  zoomHintText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    color: Colors.grayDark,
  },
  resetButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  resetButtonText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 14,
    color: Colors.verdeOscuro,
  },
  medallaPopup: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.verdeSeleccionado,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  medallaText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 15,
    color: Colors.white,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.nuevoVerde,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: Colors.grayDark,
  },
  tipoTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  tipoTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tipoTagText: {
    fontFamily: 'Urbanist-Medium',
    fontSize: 12,
    color: Colors.white,
    textTransform: 'capitalize',
  },
  visitadoBadge: {
    backgroundColor: Colors.verdeSeleccionado,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  visitadoBadgeText: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 12,
    color: Colors.white,
  },
  modalTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 22,
    color: Colors.verdeOscuro,
    marginBottom: 10,
    paddingRight: 30,
  },
  modalDesc: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 15,
    color: Colors.grayDark,
    lineHeight: 24,
    marginBottom: 10,
  },
  modalCoords: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 13,
    color: Colors.grayMedium,
    marginTop: 8,
    marginBottom: 16,
  },
  visitarButton: {
    backgroundColor: Colors.verdeSeleccionado,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  visitarButtonDone: {
    backgroundColor: Colors.grayMedium,
  },
  visitarText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 16,
    color: Colors.white,
  },
});
