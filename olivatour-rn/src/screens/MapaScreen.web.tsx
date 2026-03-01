import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Colors } from '../constants/colors';
import { MAPBOX_TOKEN, MAPBOX_STYLE, JAEN_CENTER, JAEN_ZOOM } from '../constants/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { LugarInteres, Poblacion } from '../types';
import AppDataService from '../services/AppDataService';

const TIPO_COLORS: Record<string, string> = {
  castillos: '#8B4513',
  iglesias: '#4A90D9',
  monumentos: '#9B59B6',
  museos: '#E67E22',
  paisajes: '#27AE60',
  yacimientos: '#C0392B',
  calles: '#7F8C8D',
  otro: '#95A5A6',
};

interface Props {
  onGoToTab?: (tab: number) => void;
}

export default function MapaScreen({ }: Props) {
  const { comarcas } = useApp();
  const { userId, userToken } = useAuth();
  const [viewState, setViewState] = useState({
    longitude: JAEN_CENTER.longitude,
    latitude: JAEN_CENTER.latitude,
    zoom: JAEN_ZOOM,
  });
  const [selectedPoblacion, setSelectedPoblacion] = useState<Poblacion | null>(null);
  const [selectedLugar, setSelectedLugar] = useState<LugarInteres | null>(null);
  const [lugaresDetalle, setLugaresDetalle] = useState<LugarInteres[]>([]);
  const [loadingLugares, setLoadingLugares] = useState(false);
  const [showMedallaPopup, setShowMedallaPopup] = useState(false);

  const handleSelectComarca = async (comarca: any) => {
    setViewState(prev => ({
      ...prev,
      longitude: comarca.longitud,
      latitude: comarca.latitud,
      zoom: 11,
    }));
  };

  const handleToggleVisita = async (lugar: LugarInteres) => {
    if (!userId || !userToken || !lugar.logro?.id) return;
    const success = await AppDataService.toggleLogro(userId, lugar.logro.id, userToken);
    if (success) {
      setShowMedallaPopup(true);
      setTimeout(() => setShowMedallaPopup(false), 3000);
    }
  };

  const resetToJaen = () => {
    setViewState({
      longitude: JAEN_CENTER.longitude,
      latitude: JAEN_CENTER.latitude,
      zoom: JAEN_ZOOM,
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

        {comarcas.map(comarca => (
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
      </Map>

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

      {/* Modal detalle lugar de interés */}
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
              <ScrollView>
                <View style={styles.tipoTagContainer}>
                  <View style={[styles.tipoTag, { backgroundColor: TIPO_COLORS[selectedLugar.tipo] ?? Colors.grayMedium }]}>
                    <Text style={styles.tipoTagText}>{selectedLugar.tipo}</Text>
                  </View>
                </View>
                <Text style={styles.modalTitle}>{selectedLugar.nombre}</Text>
                {selectedLugar.descripcionUno && (
                  <Text style={styles.modalDesc}>{selectedLugar.descripcionUno}</Text>
                )}
                {selectedLugar.descripcionDos && (
                  <Text style={styles.modalDesc}>{selectedLugar.descripcionDos}</Text>
                )}
                <Text style={styles.modalCoords}>
                  📍 {selectedLugar.latitud?.toFixed(5)}, {selectedLugar.longitud?.toFixed(5)}
                </Text>
                <TouchableOpacity style={styles.visitarButton} onPress={() => handleToggleVisita(selectedLugar)}>
                  <Text style={styles.visitarText}>
                    {selectedLugar.visitado ? '✓ Visitado' : '📍 Marcar como visitado'}
                  </Text>
                </TouchableOpacity>
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
    marginBottom: 10,
  },
  tipoTag: {
    alignSelf: 'flex-start',
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
  visitarText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 16,
    color: Colors.white,
  },
});
