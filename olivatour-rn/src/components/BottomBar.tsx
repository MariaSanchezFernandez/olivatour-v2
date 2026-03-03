import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../constants/colors';

interface Props {
  activeTab: number;
  onTabPress: (tab: number) => void;
}

const ACTIVE = Colors.verdeOscuro;
const INACTIVE = '#9E9E9E';

function IconLogros({ active }: { active: boolean }) {
  const c = active ? ACTIVE : INACTIVE;
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26Z"
        fill={active ? c : 'none'}
        stroke={c}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconInicio({ active }: { active: boolean }) {
  const c = active ? ACTIVE : INACTIVE;
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z"
        fill={active ? c : 'none'}
        stroke={c}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function IconMapa({ active }: { active: boolean }) {
  const c = active ? ACTIVE : INACTIVE;
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 4L3 7V20L9 17L15 20L21 17V4L15 7L9 4Z"
        stroke={c}
        fill={active ? c + '22' : 'none'}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path d="M9 4V17" stroke={c} strokeWidth={1.4} />
      <Path d="M15 7V20" stroke={c} strokeWidth={1.4} />
    </Svg>
  );
}

function IconPerfil({ active }: { active: boolean }) {
  const c = active ? ACTIVE : INACTIVE;
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
      <Circle
        cx={12} cy={8} r={4}
        fill={active ? c : 'none'}
        stroke={c}
        strokeWidth={1.8}
      />
      <Path
        d="M4 20C4 16.69 7.58 14 12 14C16.42 14 20 16.69 20 20"
        stroke={c}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

const TABS = [
  { label: 'Comarcas', Icon: IconLogros },
  { label: 'Inicio',   Icon: IconInicio },
  { label: 'Mapa',     Icon: IconMapa },
  { label: 'Perfil',   Icon: IconPerfil },
];

export default function BottomBar({ activeTab, onTabPress }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {TABS.map((tab, index) => {
          const active = activeTab === index;
          return (
            <TouchableOpacity
              key={index}
              style={styles.tab}
              onPress={() => onTabPress(index)}
              activeOpacity={0.7}
            >
              <tab.Icon active={active} />
              <Text style={[styles.label, active && styles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 20,
    elevation: 14,
    ...(Platform.OS === 'web' ? {
      position: 'fixed' as any,
      bottom: 10,
      left: 16,
      right: 16,
      marginHorizontal: 0,
      marginBottom: 0,
      zIndex: 1000,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    } as any : {}),
  },
  bar: {
    flexDirection: 'row',
    height: 58,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 6,
    gap: 3,
  },
  label: {
    fontFamily: 'Urbanist-Regular',
    fontSize: 10,
    color: INACTIVE,
  },
  labelActive: {
    fontFamily: 'Urbanist-SemiBold',
    color: ACTIVE,
  },
});
