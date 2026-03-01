import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  onFinish: () => void;
}

const PAGES = [
  {
    key: '1',
    title: '¿Crees que conoces Jaén?',
    image: require('../assets/images/MapaCortado.png'),
  },
  {
    key: '2',
    title: 'Descubre nuestra provincia a fondo',
    image: require('../assets/images/onboarding-slide2.png'),
  },
  {
    key: '3',
    title: 'De una manera totalmente innovadora',
    image: require('../assets/images/PueblosOnBoarding.png'),
  },
];

export default function OnboardingScreen({ onFinish }: Props) {
  const [currentPage, setCurrentPage] = useState(0);
  const [containerWidth, setContainerWidth] = useState(Dimensions.get('window').width);
  const [containerHeight, setContainerHeight] = useState(Dimensions.get('window').height);
  const flatListRef = useRef<FlatList>(null);

  const isLastPage = currentPage === PAGES.length - 1;

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
    setContainerHeight(e.nativeEvent.layout.height);
  };

  const goToNext = () => {
    if (currentPage < PAGES.length - 1) {
      const next = currentPage + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentPage(next);
    }
  };

  const renderPage = ({ item }: { item: typeof PAGES[0] }) => (
    <View style={[styles.page, { width: containerWidth }]}>
      <Text style={styles.pageTitle}>{item.title}</Text>
      <Image
        source={item.image}
        style={{
          width: Math.min(containerWidth * 0.75, 560),
          height: Math.min(containerHeight * 0.45, 420),
        }}
        resizeMode="contain"
      />
    </View>
  );

  const handleScroll = (e: any) => {
    if (containerWidth === 0) return;
    const page = Math.round(e.nativeEvent.contentOffset.x / containerWidth);
    setCurrentPage(page);
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
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
        getItemLayout={(_, index) => ({
          length: containerWidth,
          offset: containerWidth * index,
          index,
        })}
      />

      {/* Dots de paginación */}
      <View style={styles.dotsRow}>
        {PAGES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentPage === index ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* Botones de acción */}
      <View style={styles.bottomArea}>
        {isLastPage ? (
          <>
            <Text style={styles.logoText}>OlivaTour</Text>
            <Text style={styles.subtitleText}>¿Te apuntas a conocer Jaén?</Text>
            <TouchableOpacity style={styles.button} onPress={onFinish}>
              <Text style={styles.buttonText}>Iniciar Sesión / Registrarse</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={goToNext}>
            <Text style={styles.nextButtonText}>Siguiente →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.verdeFondo,
  },
  page: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  pageTitle: {
    fontFamily: 'Urbanist-Light',
    fontSize: 26,
    textAlign: 'center',
    paddingHorizontal: 30,
    marginBottom: 24,
    color: Colors.black,
    maxWidth: 600,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
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
  bottomArea: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: Platform.OS === 'web' ? 40 : 60,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
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
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.verdeSeleccionado,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 18,
    color: Colors.white,
  },
  nextButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.verdeOscuro,
    alignItems: 'center',
  },
  nextButtonText: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 18,
    color: Colors.verdeOscuro,
  },
});
