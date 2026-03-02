import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { LugarInteres, Logro } from '../../types';
import { IMAGES_BASE_URL } from '../../constants/api';

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

  const isVisitado = (): boolean => {
    if (!lugar.logro) return false;
    return userLogros.some(l => l.id === lugar.logro!.id);
  };

  const handleToggle = async () => {
    setToggling(true);
    await onToggleVisita(lugar);
    setToggling(false);
  };

  const tipoColor = TIPO_COLORS[lugar.tipo] ?? Colors.grayMedium;
  const tipoLabel = TIPO_LABEL[lugar.tipo] ?? lugar.tipo;
  const tipoImg = TIPO_IMAGES[lugar.tipo] ?? TIPO_IMAGES['otro'];
  const medallaUri = getImageUri(lugar.imagen_medalla);
  const visitado = isVisitado();

  // Fotos del lugar
  const fotos = (lugar.fotos ?? []).map(f => getImageUri(f.url)).filter(Boolean) as string[];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header con color del tipo */}
        <View style={[styles.header, { backgroundColor: tipoColor }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTipo}>{tipoLabel}</Text>
          <View style={{ width: 70 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
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

          {/* Descripcion */}
          {lugar.descripcionUno ? (
            <Text style={styles.desc}>{lugar.descripcionUno}</Text>
          ) : null}
          {lugar.descripcionDos ? (
            <Text style={styles.desc}>{lugar.descripcionDos}</Text>
          ) : null}

          {/* Galeria de fotos */}
          {fotos.length > 0 && (
            <View style={styles.galeriaSection}>
              <Text style={styles.galeriaTitle}>Fotos</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galeriaScroll}
              >
                {fotos.map((uri, i) => (
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
          <View style={styles.coordsRow}>
            <Text style={styles.coordsText}>
              {lugar.latitud?.toFixed(5)},  {lugar.longitud?.toFixed(5)}
            </Text>
          </View>
        </ScrollView>

        {/* Boton toggle visita — fijo en la parte inferior */}
        {lugar.logro && (
          <View style={styles.bottomBar}>
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.verdeFondo,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backBtn: {
    padding: 8,
    width: 70,
  },
  backText: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 16,
    color: Colors.white,
  },
  headerTipo: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 17,
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  iconWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  iconWrapVisitado: {
    backgroundColor: Colors.nuevoVerde,
  },
  iconImg: {
    width: 80,
    height: 80,
  },
  visitadoBadge: {
    backgroundColor: Colors.verdeSeleccionado,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  visitadoBadgeText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 13,
    color: Colors.white,
  },
  nombre: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 26,
    color: Colors.verdeOscuro,
    textAlign: 'center',
    marginBottom: 16,
  },
  desc: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    color: Colors.grayDark,
    lineHeight: 26,
    marginBottom: 14,
    textAlign: 'justify',
    width: '100%',
  },
  galeriaSection: {
    width: '100%',
    marginTop: 8,
    marginBottom: 16,
  },
  galeriaTitle: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 17,
    color: Colors.verdeOscuro,
    marginBottom: 10,
  },
  galeriaScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  fotoItem: {
    width: 200,
    height: 140,
    borderRadius: 12,
    backgroundColor: Colors.nuevoVerde,
  },
  coordsRow: {
    marginTop: 8,
    marginBottom: 8,
  },
  coordsText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 13,
    color: Colors.grayMedium,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.nuevoVerde,
  },
  toggleBtn: {
    backgroundColor: Colors.verdeSeleccionado,
    borderRadius: 12,
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
