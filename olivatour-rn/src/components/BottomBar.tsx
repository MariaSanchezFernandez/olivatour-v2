import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  activeTab: number;
  onTabPress: (tab: number) => void;
}

// Iconos unicode que replican los SF Symbols del iOS original
const ICONS = ['⭐', '🏠', '🗺', '👤'];
const ICONS_ACTIVE = ['⭐', '🏠', '🗺', '👤'];

export default function BottomBar({ activeTab, onTabPress }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.pill}>
        {ICONS.map((icon, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tabButton}
            onPress={() => onTabPress(index)}
            activeOpacity={0.7}
          >
            {activeTab === index ? (
              <View style={styles.activeCircle}>
                <Text style={styles.activeIcon}>{ICONS_ACTIVE[index]}</Text>
              </View>
            ) : (
              <Text style={styles.inactiveIcon}>{icon}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 30,
    paddingBottom: 20,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  pill: {
    backgroundColor: Colors.verdeOscuro,
    borderRadius: 30,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  activeCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  activeIcon: {
    fontSize: 22,
  },
  inactiveIcon: {
    fontSize: 22,
    opacity: 0.85,
  },
});
