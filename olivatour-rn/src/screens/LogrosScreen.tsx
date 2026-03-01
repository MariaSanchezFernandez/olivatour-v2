import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { Colors } from '../constants/colors';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Comarca } from '../types';
import AppDataService from '../services/AppDataService';

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

function getPorcentajeImage(pct: number) {
  const rounded = Math.floor(pct / 10) * 10;
  return PERCENTAGE_IMAGES[rounded] ?? PERCENTAGE_IMAGES[0];
}

export default function LogrosScreen() {
  const { comarcas, isLoading, loadData } = useApp();
  const { userId, userToken } = useAuth();
  const [porcentajes, setPorcentajes] = useState<PorcentajeMap>({});
  const [selectedComarca, setSelectedComarca] = useState<Comarca | null>(null);

  useEffect(() => {
    if (comarcas.length > 0 && userId && userToken) {
      fetchPorcentajes();
    }
  }, [comarcas, userId]);

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

  const renderComarca = ({ item }: { item: Comarca }) => {
    const pct = porcentajes[item.id] ?? 0;
    return (
      <TouchableOpacity
        style={styles.comarcaCard}
        onPress={() => setSelectedComarca(item)}
        activeOpacity={0.8}
      >
        <Image
          source={getPorcentajeImage(pct)}
          style={styles.porcentajeImage}
          resizeMode="contain"
        />
        <View style={styles.comarcaInfo}>
          <Text style={styles.comarcaName}>{item.nombre}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.progressText}>{pct}% completado</Text>
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

      {/* Modal detalle comarca */}
      <Modal
        visible={!!selectedComarca}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedComarca(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedComarca(null)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            {selectedComarca && (
              <ScrollView>
                <Text style={styles.modalTitle}>{selectedComarca.nombre}</Text>
                <Text style={styles.modalSubtitle}>
                  Progreso: {porcentajes[selectedComarca.id] ?? 0}%
                </Text>
                <View style={styles.progressBarLarge}>
                  <View
                    style={[
                      styles.progressFillLarge,
                      { width: `${porcentajes[selectedComarca.id] ?? 0}%` },
                    ]}
                  />
                </View>
                <Text style={styles.modalCoords}>
                  📍 {selectedComarca.latitud?.toFixed(4)}, {selectedComarca.longitud?.toFixed(4)}
                </Text>
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
    minHeight: 300,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.grayLight,
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
  modalTitle: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 24,
    color: Colors.verdeOscuro,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    color: Colors.grayDark,
    marginBottom: 12,
  },
  progressBarLarge: {
    height: 10,
    backgroundColor: Colors.nuevoVerde,
    borderRadius: 5,
    marginBottom: 16,
  },
  progressFillLarge: {
    height: '100%',
    backgroundColor: Colors.verdeClaro,
    borderRadius: 5,
  },
  modalCoords: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    color: Colors.grayMedium,
  },
});
