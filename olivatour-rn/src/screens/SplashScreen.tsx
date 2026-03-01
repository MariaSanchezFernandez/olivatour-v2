import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, StatusBar } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.verdeFondo} />
      {/* Círculos decorativos que evocan las hojas de olivo del diseño iOS */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.content}>
        <Image
          source={require('../assets/images/appstore.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>OlivaTour</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.verdeFondo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: Colors.verdeClaro,
    opacity: 0.15,
    top: -100,
    left: -80,
  },
  decorCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.verdeOscuro,
    opacity: 0.1,
    bottom: -60,
    right: -60,
  },
  content: {
    alignItems: 'center',
    marginTop: -100,
  },
  logo: {
    width: 200,
    height: 200,
  },
  title: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 64,
    color: Colors.verdeOscuro,
    marginTop: -20,
  },
});
