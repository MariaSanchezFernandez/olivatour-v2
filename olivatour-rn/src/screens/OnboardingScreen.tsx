import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

const PAGES = [
  {
    key: '1',
    title: '¿Crees que conoces Jaén?',
    image: require('../assets/images/MapaCortado.png'),
    imageStyle: { width: width * 0.75, height: height * 0.45 },
  },
  {
    key: '2',
    title: 'Descubre nuestra provincia a fondo',
    image: require('../assets/images/onboarding-slide2.png'),
    imageStyle: { width: width * 0.72, height: height * 0.48 },
  },
  {
    key: '3',
    title: 'De una manera totalmente innovadora',
    image: require('../assets/images/PueblosOnBoarding.png'),
    imageStyle: { width: width * 0.70, height: height * 0.50 },
  },
];

export default function OnboardingScreen({ onFinish }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const renderPage = ({ item, index }: { item: typeof PAGES[0]; index: number }) => (
    <View style={styles.page}>
      <Text style={styles.pageTitle}>{item.title}</Text>
      <Image source={item.image} style={item.imageStyle} resizeMode="contain" />
    </View>
  );

  const handleScroll = (e: any) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentPage(page);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={item => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Última página: OlivaTour con botones */}
      {currentPage === PAGES.length - 1 ? null : null}

      {/* Dots de paginación */}
      <View style={styles.dotsContainer}>
        {[...PAGES, { key: 'last' }].map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentPage === index ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* Si estamos en la última página de PAGES, mostrar botones */}
      {currentPage === PAGES.length - 1 && (
        <View style={styles.buttonsContainer}>
          <Text style={styles.logoText}>OlivaTour</Text>
          <Text style={styles.subtitleText}>¿Te apuntas a conocer Jaén?</Text>
          <TouchableOpacity style={styles.button} onPress={onFinish}>
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={onFinish}>
            <Text style={styles.buttonText}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.verdeFondo,
  },
  page: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  pageTitle: {
    fontFamily: 'Urbanist-Light',
    fontSize: 24,
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 20,
    color: Colors.black,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
    gap: 10,
  },
  dot: {
    borderRadius: 5,
    height: 10,
  },
  dotActive: {
    width: 40,
    backgroundColor: Colors.verdeOscuro,
  },
  dotInactive: {
    width: 10,
    backgroundColor: Colors.verdeClaro,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 56,
    color: Colors.verdeOscuro,
    marginBottom: 4,
  },
  subtitleText: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 20,
    marginBottom: 24,
    color: Colors.black,
  },
  button: {
    backgroundColor: Colors.verdeSeleccionado,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 14,
    width: '100%',
    alignItems: 'center',
  },
  buttonSecondary: {
    marginBottom: 0,
  },
  buttonText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 18,
    color: Colors.white,
  },
});
