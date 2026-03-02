import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
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

if (Platform.OS !== 'web') {
  const SplashScreenExpo = require('expo-splash-screen');
  SplashScreenExpo.preventAutoHideAsync().catch(() => {});
}

type AuthFlow = 'login' | 'register' | 'recover';

const TAB_ITEMS = [
  { icon: '⭐', label: 'Comarcas' },
  { icon: '🏠', label: 'Inicio' },
  { icon: '🗺',  label: 'Mapa' },
  { icon: '👤', label: 'Perfil' },
];

function Sidebar({ activeTab, onTabPress }: { activeTab: number; onTabPress: (i: number) => void }) {
  return (
    <View style={sidebarSt.container}>
      <View style={sidebarSt.logoRow}>
        <Image
          source={require('./src/assets/images/Group 134.png')}
          style={sidebarSt.logoImg}
          resizeMode="contain"
        />
        <Text style={sidebarSt.logoText}>OlivaTour</Text>
      </View>

      <View style={sidebarSt.nav}>
        {TAB_ITEMS.map((item, index) => {
          const active = activeTab === index;
          return (
            <TouchableOpacity
              key={index}
              style={[sidebarSt.navItem, active && sidebarSt.navItemActive]}
              onPress={() => onTabPress(index)}
              activeOpacity={0.75}
            >
              <Text style={sidebarSt.navIcon}>{item.icon}</Text>
              <Text style={[sidebarSt.navLabel, active && sidebarSt.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function MainApp() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { loadData, setCurrentTab, currentTab } = useApp();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [showSplash, setShowSplash] = useState(() => {
    if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined') {
      return !sessionStorage.getItem('olivatour_splash');
    }
    return true;
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authFlow, setAuthFlow] = useState<AuthFlow>('login');

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated]);

  const handleSplashFinish = useCallback(() => {
    if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('olivatour_splash', '1');
    }
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

  const screens = (
    <>
      {currentTab === 0 && <LogrosScreen />}
      {currentTab === 1 && <InicioScreen onGoToMapa={() => setCurrentTab(2)} onGoToLogros={() => setCurrentTab(0)} />}
      {currentTab === 2 && <MapaScreen />}
      {currentTab === 3 && <PerfilScreen />}
    </>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopRoot}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.verdeSeleccionado} />
        <Sidebar activeTab={currentTab} onTabPress={setCurrentTab} />
        <View style={styles.desktopMain}>
          {/* El mapa ocupa el 100% del ancho disponible sin restriccion */}
          <View style={[styles.desktopContent, currentTab === 2 && styles.desktopContentFull]}>
            {screens}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.verdeFondo} />
      <View style={styles.screenContainer}>{screens}</View>
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

  useEffect(() => {
    if ((fontsLoaded || fontsError) && Platform.OS !== 'web') {
      const SplashScreenExpo = require('expo-splash-screen');
      SplashScreenExpo.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontsError]);

  if (!fontsLoaded && !fontsError && Platform.OS === 'web') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.verdeOscuro} />
        <Text style={styles.loadingText}>Cargando OlivaTour...</Text>
      </View>
    );
  }

  if (!fontsLoaded && !fontsError) return null;

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

// ── Sidebar styles ──────────────────────────────────────────
const sidebarSt = StyleSheet.create({
  container: {
    width: 220,
    backgroundColor: Colors.verdeSeleccionado,
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 44,
    paddingHorizontal: 8,
    gap: 10,
  },
  logoImg: {
    width: 34,
    height: 34,
  },
  logoText: {
    fontFamily: 'Urbanist-Bold',
    fontSize: 20,
    color: Colors.white,
  },
  nav: {
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  navIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  navLabel: {
    fontFamily: 'Urbanist-SemiBold',
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
  },
  navLabelActive: {
    color: Colors.white,
  },
});

// ── App styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: Colors.verdeFondo,
  },
  screenContainer: {
    flex: 1,
  },
  desktopRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.verdeFondo,
  },
  desktopMain: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.verdeFondo,
  },
  desktopContent: {
    flex: 1,
    width: '100%',
    maxWidth: 1000,
  },
  desktopContentFull: {
    maxWidth: 99999,
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
