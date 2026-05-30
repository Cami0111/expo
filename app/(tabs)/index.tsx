import { useAuth } from '@/context/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PURPLE = '#6C5CE7';

export default function HomeScreen() {
  const { userId } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Bienvenida */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.welcomeSmall}>Bienvenido a</Text>
            <Text style={styles.welcomeBig}>Stave 🎵</Text>
            <Text style={styles.welcomeSub}>Tu espacio musical</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Ionicons name="musical-notes" size={28} color={PURPLE} />
          </View>
        </View>

        {/* Sección rápida */}
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.quickRow}>
          <QuickCard icon="people-outline" label="Comunidad" color="#5856D6" />
          <QuickCard icon="person-outline" label="Perfil" color="#34C759" />
          <QuickCard icon="star-outline" label="Logros" color="#FF9500" />
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={PURPLE} />
          <Text style={styles.infoText}>
            Módulo de autenticación activo. ID de sesión: {userId?.slice(0, 8)}…
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickCard({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <TouchableOpacity style={styles.quickCard} activeOpacity={0.8}>
      <View style={[styles.quickIcon, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon as any} size={26} color={color} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8F7FF' },
  scroll: { padding: 20, paddingBottom: 40 },
  welcomeCard: {
    backgroundColor: PURPLE,
    borderRadius: 20,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  welcomeLeft: {},
  welcomeSmall: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  welcomeBig: { color: '#FFF', fontSize: 26, fontWeight: '800', marginVertical: 2 },
  welcomeSub: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 14,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3C3C43',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PURPLE + '12',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#3C3C43',
    lineHeight: 18,
  },
});
