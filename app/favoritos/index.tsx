import { api } from '@/api/config';
import SlideMenu from '@/components/slide-menu';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FilterType = 'favoritos' | 'porver';

interface ContentItem {
  _id?: string;
  id?: string;
  title: string;
  thumbnailUrl?: string;
  year?: string | number;
  genre?: string;
  type?: string;
}

const NUM_COLUMNS = 3;

async function fetchFullContent(
  item: { contentId: string; type?: string }
): Promise<ContentItem | null> {
  if (item.type === 'series') {
    try {
      const res = await api.get(`/series/${item.contentId}`);
      return res.data ?? null;
    } catch { return null; }
  }
  try {
    const res = await api.get(`/movies/${item.contentId}`);
    return res.data ?? null;
  } catch { }
  try {
    const res = await api.get(`/series/${item.contentId}`);
    return res.data ?? null;
  } catch { }
  return null;
}

export default function FavoritosScreen() {
  const { userId } = useAuth();
  const [filter, setFilter] = useState<FilterType>('favoritos');
  const [favorites, setFavorites] = useState<ContentItem[]>([]);
  const [watchlist, setWatchlist] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    api.get('/users/profile')
      .then(res => {
        const url = res.data?.avatarUrl;
        if (url && url.length > 0) setAvatarUrl(url);
      })
      .catch(() => {});
  }, [userId]);

  const fetchData = useCallback(async () => {
    try {
      const [favRes, watchRes] = await Promise.allSettled([
        api.get('/favorites'),
        api.get('/watchlist'),
      ]);

      if (favRes.status === 'fulfilled') {
        const d = favRes.value.data;
        const items = Array.isArray(d) ? d : (d.data ?? []);
        const full = await Promise.all(
          items.map((item: any) => fetchFullContent({
            contentId: item.id ?? item._id,
            type: item.type,
          }))
        );
        setFavorites(full.filter((r): r is ContentItem => r !== null));
      }
      if (watchRes.status === 'fulfilled') {
        const d = watchRes.value.data;
        const items = Array.isArray(d) ? d : (d.data ?? []);
        const full = await Promise.all(
          items.map((item: any) => fetchFullContent({
            contentId: item.id ?? item._id,
            type: item.type,
          }))
        );
        setWatchlist(full.filter((r): r is ContentItem => r !== null));
      }
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const displayed = filter === 'favoritos' ? favorites : watchlist;

  const renderMovie = ({ item }: { item: ContentItem }) => (
    <Pressable style={styles.gridItem} onPress={() => router.push(`/pelicula/${item._id ?? item.id}`)}>
      {item.thumbnailUrl ? (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.gridPoster} contentFit="cover" />
      ) : (
        <View style={[styles.gridPoster, styles.gridPlaceholder]}>
          <Ionicons name="film-outline" size={24} color={Colors.ACCENT_PRIMARY} />
        </View>
      )}
      <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis favoritos</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 32, height: 32, borderRadius: 16 }}
              contentFit="cover"
            />
          ) : (
            <Ionicons name="person-circle-outline" size={28} color={Colors.ACCENT_PRIMARY} />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.ACCENT_PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item, idx) => item._id ?? item.id ?? `item-${idx}`}
          renderItem={renderMovie}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.ACCENT_PRIMARY}
            />
          }
          ListHeaderComponent={
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[
                  styles.filterBtn,
                  { backgroundColor: filter === 'porver' ? '#821EED' : '#2C2EAC' },
                ]}
                onPress={() => setFilter('porver')}
                activeOpacity={0.8}
              >
                <Text style={styles.filterCount}>{watchlist.length}</Text>
                <Text style={styles.filterLabel}>Por Ver</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterBtn,
                  { backgroundColor: filter === 'favoritos' ? '#821EED' : '#B62C2E' },
                ]}
                onPress={() => setFilter('favoritos')}
                activeOpacity={0.8}
              >
                <Text style={styles.filterCount}>{favorites.length}</Text>
                <Text style={styles.filterLabel}>Favoritos</Text>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name={filter === 'favoritos' ? 'heart-outline' : 'time-outline'}
                size={52}
                color={Colors.TEXT_MUTED}
              />
              <Text style={styles.emptyTitle}>
                {filter === 'favoritos' ? 'No tienes favoritos aun' : 'Tu lista Por Ver esta vacia'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {filter === 'favoritos'
                  ? 'Marca peliculas como favoritas para verlas aqui'
                  : 'Agrega peliculas a tu lista para verlas despues'}
              </Text>
            </View>
          }
        />
      )}

      <SlideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BG_PRIMARY },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  listContent: { padding: 20, paddingBottom: 40 },
  columnWrapper: { gap: 8, marginBottom: 8 },
  filterRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  filterBtn: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  filterCount: { color: '#fff', fontSize: 28, fontWeight: '700' },
  filterLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  gridItem: { flex: 1 },
  gridPoster: { width: '100%', aspectRatio: 2 / 3, borderRadius: 10, marginBottom: 6 },
  gridPlaceholder: {
    backgroundColor: Colors.BG_CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridTitle: { fontSize: 10, color: Colors.TEXT_SECONDARY, textAlign: 'center', fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingTop: 56, paddingHorizontal: 32, gap: 12 },
  emptyTitle: { color: Colors.TEXT_PRIMARY, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { color: Colors.TEXT_SECONDARY, fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
