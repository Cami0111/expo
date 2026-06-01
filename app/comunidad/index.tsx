import SlideMenu from '@/components/slide-menu';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useComunidad } from '@/context/comunidad-context';
import { useAuth } from '@/context/auth-context';
import { CreatePublicationModal } from '@/components/comunidad/CreatePublicationModal';
import { PublicationCard } from '@/components/comunidad/PublicationCard';
import { TopMoviesSection, TopGenresSection } from '@/components/comunidad/TopSection';

export default function ComunidadScreen() {
  const { publicaciones, isLoading } = useComunidad();
  const { userId } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.ACCENT_PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={publicaciones}
          renderItem={({ item }) => (
            <PublicationCard publication={item} currentUserId={userId || 'user_1'} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.container}
          ListHeaderComponent={
            <>
              <View style={styles.heroBanner}>
                <View style={styles.heroIcon}>
                  <Ionicons name="people" size={36} color={Colors.TEXT_PRIMARY} />
                </View>
                <Text style={styles.heroTitle}>Comunidad Stave</Text>
                <Text style={styles.heroSub}>Conecta con otros amantes del cine</Text>
              </View>

              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => setCreateModalVisible(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={24} color="#FFF" />
                <Text style={styles.createBtnText}>Crear Publicación</Text>
              </TouchableOpacity>

              <TopMoviesSection publicaciones={publicaciones} />
              <TopGenresSection publicaciones={publicaciones} />

              {publicaciones.length > 0 && <Text style={styles.sectionTitle}>Publicaciones Recientes</Text>}
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay publicaciones aún</Text>
              <Text style={styles.emptySubtext}>Sé el primero en crear una</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => setCreateModalVisible(true)}
              >
                <Text style={styles.emptyBtnText}>Crear Publicación</Text>
              </TouchableOpacity>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <CreatePublicationModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  heroBanner: {
    backgroundColor: Colors.ACCENT_PRIMARY,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
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
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.ACCENT_PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 20,
    gap: 8,
  },
  createBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    marginBottom: 20,
  },
  emptyBtn: {
    backgroundColor: Colors.ACCENT_PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
