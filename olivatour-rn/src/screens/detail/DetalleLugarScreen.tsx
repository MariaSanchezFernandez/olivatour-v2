import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { LugarInteres, Logro, Foto } from '../../types';
import { IMAGES_BASE_URL, API_BASE_URL } from '../../constants/api';
import { verifyProximity, geoErrorMessage } from '../../services/GeoService';

const TIPO_IMAGES: Record<string, any> = {
  calles:      require('../../assets/images/Calles.png'),
  castillos:   require('../../assets/images/Castillos.png'),
  iglesias:    require('../../assets/images/Iglesias.png'),
  monumentos:  require('../../assets/images/Monumentos.png'),
  museos:      require('../../assets/images/Museos.png'),
  paisajes:    require('../../assets/images/Paisajes.png'),
  yacimientos: require('../../assets/images/Yacimientos.png'),
  otro:        require('../../assets/images/Otro.png'),
};

const TIPO_LABEL: Record<string, string> = {
  calles:      'Calles',
  castillos:   'Castillos',
  iglesias:    'Iglesias',
  monumentos:  'Monumentos',
  museos:      'Museos',
  paisajes:    'Paisajes',
  yacimientos: 'Yacimientos',
  otro:        'Otro',
};

const TIPO_COLORS: Record<string, string> = {
  castillos:   '#8B4513',
  iglesias:    '#4A90D9',
  monumentos:  '#9B59B6',
  museos:      '#E67E22',
  paisajes:    '#27AE60',
  yacimientos: '#C0392B',
  calles:      '#7F8C8D',
  otro:        '#95A5A6',
};

function getImageUri(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${IMAGES_BASE_URL}${url}`;
}

interface Props {
  lugar: LugarInteres;
  userLogros: Logro[];
  visible: boolean;
  onClose: () => void;
  onToggleVisita: (lugar: LugarInteres) => Promise<void>;
}

export default function DetalleLugarScreen({
  lugar,
  userLogros,
  visible,
  onClose,
  onToggleVisita,
}: Props) {
  const [toggling, setToggling] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [fotos, setFotos] = useState<Foto[]>(lugar.fotos ?? []);

  // Fetch full lugar detail to get fotos when the sheet opens
  useEffect(() => {
    if (!visible) return;
    setFotos(lugar.fotos ?? []);
    fetch(`${API_BASE_URL}/api/lugares/${lugar.id}`, {
      headers: { 'Accept': 'application/json' },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.fotos?.length) setFotos(data.fotos); })
      .catch(() => {});
  }, [visible, lugar.id]);

  const isVisitado = (): boolean => {
    if (!lugar.logro) return false;
    return userLogros.some(l => l.id === lugar.logro!.id);
  };

  const handleToggle = async () => {
    setGeoError(null);

    // Solo verificar ubicacion al marcar (no al desmarcar)
    if (!visitado) {
      setToggling(true);
      const lat = parseFloat(String(lugar.latitud));
      const lng = parseFloat(String(lugar.longitud));
      if (!isNaN(lat) && !isNaN(lng)) {
        const result = await verifyProximity(lat, lng);
        if (!result.ok) {
          setGeoError(geoErrorMessage(result, lugar.nombre));
          setToggling(false);
          return;
        }
      }
    }

    setToggling(true);
    await onToggleVisita(lugar);
    setToggling(false);
  };

  const tipoColor = TIPO_COLORS[lugar.tipo] ?? Colors.grayMedium;
  const tipoLabel = TIPO_LABEL[lugar.tipo] ?? lugar.tipo;
  const tipoImg = TIPO_IMAGES[lugar.tipo] ?? TIPO_IMAGES['otro'];
  const medallaUri = getImageUri(lugar.imagen_medalla);
  const visitado = isVisitado();

  const fotoUris = fotos.map(f => getImageUri(f.url)).filter(Boolean) as string[];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Fondo oscuro — tap para cerrar */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Bottom sheet */}
        <View style={styles.sheet}>
          {/* Tirador */}
          <View style={styles.handle} />

          {/* Pill del tipo con color */}
          <View style={[styles.tipoPill, { backgroundColor: tipoColor }]}>
            <Text style={styles.tipoPillText}>{tipoLabel}</Text>
          </View>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Icono / medalla */}
            <View style={[styles.iconWrap, visitado && styles.iconWrapVisitado]}>
              {medallaUri ? (
                <Image source={{ uri: medallaUri }} style={styles.iconImg} resizeMode="contain" />
              ) : (
                <Image source={tipoImg} style={styles.iconImg} resizeMode="contain" />
              )}
            </View>

            {/* Badge visitado */}
            {visitado && (
              <View style={styles.visitadoBadge}>
                <Text style={styles.visitadoBadgeText}>Visitado</Text>
              </View>
            )}

            {/* Nombre */}
            <Text style={styles.nombre}>{lugar.nombre}</Text>

            {/* Pueblo (si lo tiene) */}
            {lugar.poblacion_nombre ? (
              <Text style={styles.pueblo}>{lugar.poblacion_nombre}</Text>
            ) : null}

            {/* Descripciones */}
            {lugar.descripcionUno ? (
              <Text style={styles.desc}>{lugar.descripcionUno}</Text>
            ) : null}
            {lugar.descripcionDos ? (
              <Text style={styles.desc}>{lugar.descripcionDos}</Text>
            ) : null}

            {/* Galería de fotos */}
            {fotoUris.length > 0 && (
              <View style={styles.galeriaSection}>
                <Text style={styles.galeriaTitle}>Fotos</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.galeriaScroll}
                >
                  {fotoUris.map((uri, i) => (
                    <Image
                      key={i}
                      source={{ uri }}
                      style={styles.fotoItem}
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Coordenadas */}
            <Text style={styles.coordsText}>
              {parseFloat(String(lugar.latitud)).toFixed(5)},  {parseFloat(String(lugar.longitud)).toFixed(5)}
            </Text>
          </ScrollView>

          {/* Botón toggle — fijo en la parte inferior */}
          {lugar.logro && (
            <View style={styles.bottomBar}>
              {geoError ? (
                <Text style={styles.geoErrorText}>{geoError}</Text>
              ) : null}
              <TouchableOpacity
                style={[styles.toggleBtn, visitado && styles.toggleBtnVisitado]}
                onPress={handleToggle}
                disabled={toggling}
              >
                {toggling ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.toggleBtnText}>
                    {visitado ? 'Visitado — quitar marca' : 'Marcar como visitado'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: Colors.verdeFondo,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '82%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D0D0',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  tipoPill: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 4,
  },
  tipoPillText: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 13,
    color: Colors.white,
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  scroll: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconWrapVisitado: {
    backgroundColor: Colors.nuevoVerde,
  },
  iconImg: {
    width: 72,
    height: 72,
  },
  visitadoBadge: {
    backgroundColor: Colors.verdeSeleccionado,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  visitadoBadgeText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 13,
    color: Colors.white,
  },
  nombre: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 24,
    color: Colors.verdeOscuro,
    textAlign: 'center',
    marginBottom: 4,
  },
  pueblo: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    color: Colors.grayMedium,
    textAlign: 'center',
    marginBottom: 14,
  },
  desc: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 15,
    color: Colors.grayDark,
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'justify',
    width: '100%',
  },
  galeriaSection: {
    width: '100%',
    marginTop: 4,
    marginBottom: 12,
  },
  galeriaTitle: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    color: Colors.verdeOscuro,
    marginBottom: 10,
  },
  galeriaScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  fotoItem: {
    width: 180,
    height: 120,
    borderRadius: 12,
    backgroundColor: Colors.nuevoVerde,
  },
  coordsText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 12,
    color: Colors.grayMedium,
    marginTop: 4,
    marginBottom: 8,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    backgroundColor: Colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.nuevoVerde,
  },
  geoErrorText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 18,
  },
  toggleBtn: {
    backgroundColor: Colors.verdeSeleccionado,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  toggleBtnVisitado: {
    backgroundColor: Colors.grayMedium,
  },
  toggleBtnText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 16,
    color: Colors.white,
  },
});
