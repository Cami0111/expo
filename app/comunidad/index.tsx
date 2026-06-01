import SlideMenu from '@/components/slide-menu';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FEATURES = [
  { icon: 'chatbubbles-outline', label: 'Foros', desc: 'Discute sobre tus peliculas favoritas', color: '#5856D6' },
  { icon: 'trophy-outline', label: 'Rankings', desc: 'Las mejores valoradas por la comunidad', color: '#FF9500' },
  { icon: 'newspaper-outline', label: 'Noticias', desc: 'Lo ultimo del mundo del cine', color: '#34C759' },
] as const;

export default function ComunidadScreen() {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comunidad</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="person-circle-outline" size={28} color={Colors.ACCENT_PRIMARY} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.heroBanner}>
          <View style={styles.heroIcon}>
            <Ionicons name="people" size={36} color={Colors.TEXT_PRIMARY} />
          </View>
          <Text style={styles.heroTitle}>Comunidad Stave</Text>
          <Text style={styles.heroSub}>Conecta con otros amantes del cine</Text>
        </View>

        <Text style={styles.sectionTitle}>Proximamente</Text>

        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <TouchableOpacity key={f.label} style={styles.featureCard} activeOpacity={0.8}>
              <View style={[styles.featureIcon, { backgroundColor: f.color + '2A' }]}>
                <Ionicons name={f.icon as any} size={22} color={f.color} />
              </View>
              <View style={styles.featureInfo}>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.TEXT_MUTED} />
            </TouchableOpacity>
          ))}
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_COLOR,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.TEXT_PRIMARY },
  container: { flex: 1, padding: 20 },
  heroBanner: {
    backgroundColor: Colors.ACCENT_PRIMARY,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 28,
    gap: 10,
  },
  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { color: Colors.TEXT_PRIMARY, fontSize: 22, fontWeight: '800' },
  heroSub: { color: Colors.TEXT_SECONDARY, fontSize: 13, textAlign: 'center' },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 14,
  },
  featureList: { gap: 10 },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BG_CARD,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureInfo: { flex: 1 },
  featureLabel: { fontSize: 15, fontWeight: '700', color: Colors.TEXT_PRIMARY, marginBottom: 2 },
  featureDesc: { fontSize: 12, color: Colors.TEXT_SECONDARY },
});
