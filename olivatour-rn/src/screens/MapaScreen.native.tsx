import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { JAEN_CENTER } from '../constants/api';

interface Props {
  onGoToTab?: (tab: number) => void;
}

export default function MapaScreen({ }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mapa de Jaén</Text>
      <Text style={styles.text}>
        El mapa interactivo está disponible en la versión web.{'\n\n'}
        Accede desde tu navegador para explorar todas las comarcas, pueblos y puntos de interés de Jaén.
      </Text>
      <Text style={styles.coords}>
        📍 Jaén, España{'\n'}
        {JAEN_CENTER.latitude}°N · {Math.abs(JAEN_CENTER.longitude)}°O
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.verdeFondo,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 28,
    color: Colors.verdeOscuro,
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 16,
    color: Colors.grayDark,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
  },
  coords: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 14,
    color: Colors.grayMedium,
    textAlign: 'center',
    lineHeight: 22,
  },
});
