import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StatusBar, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useFonts } from 'expo-font';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppProvider, useApp } from './src/context/AppContext';

import SplashScreenComp from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import RecoverPasswordScreen from './src/screens/auth/RecoverPasswordScreen';
import InicioScreen from './src/screens/InicioScreen';
import LogrosScreen from './src/screens/LogrosScreen';
import MapaScreen from './src/screens/MapaScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import BottomBar from './src/components/BottomBar';
import { Colors } from './src/constants/colors';

// Solo usar expo-splash-screen en nativo
if (Platform.OS !== 'web') {
  const SplashScreenExpo = require('expo-splash-screen');
  SplashScreenExpo.preventAutoHideAsync().catch(() => {});
}

type AuthFlow = 'login' | 'register' | 'recover';

function MainApp() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { loadData, setCurrentTab, currentTab } = useApp();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authFlow, setAuthFlow] = useState<AuthFlow>('login');

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
    if (!isAuthenticated) setShowOnboarding(true);
  }, [isAuthenticated]);

  if (showSplash || authLoading) {
    return <SplashScreenComp onFinish={handleSplashFinish} />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onFinish={() => { setShowOnboarding(false); setAuthFlow('login'); }} />;
  }

  if (!isAuthenticated) {
    if (authFlow === 'register') return <RegisterScreen onNavigateToLogin={() => setAuthFlow('login')} />;
    if (authFlow === 'recover') return <RecoverPasswordScreen onNavigateToLogin={() => setAuthFlow('login')} />;
    return (
      <LoginScreen
        onNavigateToRegister={() => setAuthFlow('register')}
        onNavigateToRecover={() => setAuthFlow('recover')}
      />
    );
  }

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.verdeFondo} />
      <View style={styles.screenContainer}>
        {currentTab === 0 && <LogrosScreen />}
        {currentTab === 1 && <InicioScreen onGoToMapa={() => setCurrentTab(2)} onGoToLogros={() => setCurrentTab(0)} />}
        {currentTab === 2 && <MapaScreen />}
        {currentTab === 3 && <PerfilScreen />}
      </View>
      <BottomBar activeTab={currentTab} onTabPress={setCurrentTab} />
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontsError] = useFonts({
    'Urbanist-Regular': require('./src/assets/fonts/Urbanist-Regular.ttf'),
    'Urbanist-Bold': require('./src/assets/fonts/Urbanist-Bold.ttf'),
    'Urbanist-SemiBold': require('./src/assets/fonts/Urbanist-SemiBold.ttf'),
    'Urbanist-Medium': require('./src/assets/fonts/Urbanist-Medium.ttf'),
    'Urbanist-Light': require('./src/assets/fonts/Urbanist-Light.ttf'),
    'Urbanist-ExtraBold': require('./src/assets/fonts/Urbanist-ExtraBold.ttf'),
    'Urbanist-Black': require('./src/assets/fonts/Urbanist-Black.ttf'),
  });

  // Ocultar splash nativo cuando las fuentes estén listas
  useEffect(() => {
    if ((fontsLoaded || fontsError) && Platform.OS !== 'web') {
      const SplashScreenExpo = require('expo-splash-screen');
      SplashScreenExpo.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontsError]);

  // En web: mostrar spinner mientras cargan las fuentes
  if (!fontsLoaded && !fontsError && Platform.OS === 'web') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.verdeOscuro} />
        <Text style={styles.loadingText}>Cargando OlivaTour...</Text>
      </View>
    );
  }

  // En nativo: esperar sin bloquear si hay error de fuente
  if (!fontsLoaded && !fontsError) {
    return null;
  }

  return (
    <AuthProvider>
      <AppProvider>
        <View style={{ flex: 1 }}>
          <MainApp />
        </View>
      </AppProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: Colors.verdeFondo,
  },
  screenContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.verdeFondo,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.verdeOscuro,
  },
});
