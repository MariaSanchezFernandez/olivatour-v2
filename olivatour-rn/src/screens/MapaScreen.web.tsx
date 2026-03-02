import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Colors } from '../constants/colors';
import { MAPBOX_TOKEN, MAPBOX_STYLE, JAEN_CENTER, JAEN_ZOOM } from '../constants/api';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { LugarInteres } from '../types';
import DetalleLugarScreen from './detail/DetalleLugarScreen';

const TIPO_IMAGES: Record<string, any> = {
  calles:      require('../assets/images/Calles.png'),
  castillos:   require('../assets/images/Castillos.png'),
  iglesias:    require('../assets/images/Iglesias.png'),
  monumentos:  require('../assets/images/Monumentos.png'),
  museos:      require('../assets/images/Museos.png'),
  paisajes:    require('../assets/images/Paisajes.png'),
  yacimientos: require('../assets/images/Yacimientos.png'),
  otro:        require('../assets/images/Otro.png'),
};

const TIPO_LABEL: Record<string, string> = {
  castillos:   'Castillos',
  iglesias:    'Iglesias',
  monumentos:  'Monumentos',
  museos:      'Museos',
  paisajes:    'Paisajes',
  yacimientos: 'Yacimientos',
  calles:      'Calles',
  otro:        'Otro',
};

// Mostrar lugares de interés a partir de este nivel de zoom
const MIN_ZOOM_LUGARES = 9;

export default function MapaScreen() {
  const { comarcas, lugares, userLogros, loadUserLogros } = useApp();
  const { userId, userToken } = useAuth();
  const { toggleVisita } = useApp();

  const [viewState, setViewState] = useState({
    longitude: JAEN_CENTER.longitude,
    latitude:  JAEN_CENTER.latitude,
    zoom:      JAEN_ZOOM,
  });
  const [selectedLugar, setSelectedLugar] = useState<LugarInteres | null>(null);
  const [showMedallaPopup, setShowMedallaPopup] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const showLugares = viewState.zoom >= MIN_ZOOM_LUGARES;

  // Cargar logros del usuario para marcar los visitados
  useEffect(() => {
    if (userId && userToken) {
      loadUserLogros(userId, userToken);
    }
  }, [userId, userToken]);

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

        {/* Marcadores de comarca — al hacer zoom desaparecen */}
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

        {/* Marcadores de lugares de interes — aparecen al hacer zoom (>= 9) */}
        {showLugares && lugares.map(lugar => {
          if (!lugar.latitud || !lugar.longitud) return null;
          const visitado = isVisitado(lugar);
          const tipoImg = TIPO_IMAGES[lugar.tipo] ?? TIPO_IMAGES['otro'];
          return (
            <Marker
              key={`lugar-${lugar.id}`}
              longitude={lugar.longitud}
              latitude={lugar.latitud}
            >
              <TouchableOpacity
                style={[styles.lugarMarker, visitado && styles.lugarMarkerVisitado]}
                onPress={() => setSelectedLugar(lugar)}
              >
                <Image source={tipoImg} style={styles.lugarIcon} resizeMode="contain" />
              </TouchableOpacity>
            </Marker>
          );
        })}
      </Map>

      {/* Leyenda de tipos (solo cuando hay lugares visibles) */}
      {showLugares && (
        <View style={styles.legend}>
          {Object.entries(TIPO_LABEL).map(([tipo, label]) => (
            <View key={tipo} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: TIPO_COLORS[tipo] }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Pista de zoom cuando el usuario no ha hecho zoom */}
      {!showLugares && (
        <View style={styles.zoomHint}>
          <Text style={styles.zoomHintText}>Acerca el mapa para ver los lugares de interes</Text>
        </View>
      )}

      {/* Boton volver a Jaen */}
      <TouchableOpacity style={styles.resetButton} onPress={resetToJaen}>
        <Text style={styles.resetButtonText}>Volver a Jaen</Text>
      </TouchableOpacity>

      {/* Popup lugar visitado */}
      {showMedallaPopup && (
        <View style={styles.medallaPopup}>
          <Text style={styles.medallaText}>Lugar visitado - has ganado una medalla</Text>
        </View>
      )}

      {/* Pantalla de detalle del lugar de interes */}
      {selectedLugar && (
        <DetalleLugarScreen
          lugar={selectedLugar}
          userLogros={userLogros}
          visible={!!selectedLugar}
          onClose={() => setSelectedLugar(null)}
          onToggleVisita={async (lugar) => {
            if (!userId || !userToken || !lugar.logro?.id) return;
            setTogglingId(lugar.id);
            const success = await toggleVisita(userId, lugar.logro.id, userToken);
            setTogglingId(null);
            if (success) {
              setShowMedallaPopup(true);
              setTimeout(() => setShowMedallaPopup(false), 3000);
            }
          }}
        />
      )}
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.verdeOscuro,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    cursor: 'pointer' as any,
  },
  lugarMarkerVisitado: {
    opacity: 0.5,
    borderColor: Colors.grayMedium,
  },
  lugarIcon: {
    width: 22,
    height: 22,
  },
  legend: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.93)',
    borderRadius: 12,
    padding: 10,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  },
  zoomHint: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 100,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
});
