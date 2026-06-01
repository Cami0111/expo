import SlideMenu from '@/components/slide-menu';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeTabScreen() {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.logo}>STAVE</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="person-circle-outline" size={34} color={Colors.ACCENT_PRIMARY} />
        </TouchableOpacity>
      </View>

      <View style={styles.centered}>
        <Ionicons name="film-outline" size={72} color={Colors.ACCENT_PRIMARY} />
        <Text style={styles.title}>Inicio</Text>
        <Text style={styles.message}>Esta sección estará disponible próximamente 🎬</Text>
        <Text style={styles.subtitle}>Estamos trabajando en algo increíble para ti</Text>
      </View>

      <SlideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BG_PRIMARY },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.TEXT_PRIMARY,
    letterSpacing: 2,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.TEXT_PRIMARY,
    marginTop: 20,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: Colors.ACCENT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },
});
