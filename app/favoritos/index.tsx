import { api } from '@/api/config';
import SlideMenu from '@/components/slide-menu';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FilterType = 'favoritos' | 'porver';

interface Movie {
  id: string;
  title: string;
  posterUrl?: string;
  poster?: string;
  year?: number;
}

const NUM_COLUMNS = 3;

export default function FavoritosScreen() {
  const [filter, setFilter] = useState<FilterType>('favoritos');
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [favRes, watchRes] = await Promise.allSettled([
        api.get('/favorites'),
        api.get('/watchlist'),
      ]);
      if (favRes.status === 'fulfilled') {
        const d = favRes.value.data;
        setFavorites(Array.isArray(d) ? d : (d.movies ?? d.data ?? []));
      }
      if (watchRes.status === 'fulfilled') {
        const d = watchRes.value.data;
        setWatchlist(Array.isArray(d) ? d : (d.movies ?? d.data ?? []));
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

  const renderMovie = ({ item }: { item: Movie }) => {
    const uri = item.posterUrl ?? item.poster;
    return (
      <TouchableOpacity style={styles.gridItem} activeOpacity={0.8}>
        {uri ? (
          <Image source={{ uri }} style={styles.gridPoster} contentFit="cover" />
        ) : (
          <View style={[styles.gridPoster, styles.gridPlaceholder]}>
            <Ionicons name="film-outline" size={24} color={Colors.ACCENT_PRIMARY} />
          </View>
        )}
        <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis favoritos</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="person-circle-outline" size={28} color={Colors.ACCENT_PRIMARY} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.ACCENT_PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(item) => item.id}
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
                style={[styles.filterBtn, filter === 'porver' && styles.filterBtnActive]}
                onPress={() => setFilter('porver')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={filter === 'porver' ? Colors.TEXT_PRIMARY : Colors.ACCENT_PRIMARY}
                />
                <Text style={[styles.filterBtnText, filter === 'porver' && styles.filterBtnTextActive]}>
                  Por Ver
                </Text>
                <View style={[styles.countBadge, filter === 'porver' && styles.countBadgeActive]}>
                  <Text style={[styles.countText, filter === 'porver' && styles.countTextActive]}>
                    {watchlist.length}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterBtn, filter === 'favoritos' && styles.filterBtnActive]}
                onPress={() => setFilter('favoritos')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={filter === 'favoritos' ? 'heart' : 'heart-outline'}
                  size={18}
                  color={filter === 'favoritos' ? Colors.TEXT_PRIMARY : Colors.ACCENT_PRIMARY}
                />
                <Text style={[styles.filterBtnText, filter === 'favoritos' && styles.filterBtnTextActive]}>
                  Favoritos
                </Text>
                <View style={[styles.countBadge, filter === 'favoritos' && styles.countBadgeActive]}>
                  <Text style={[styles.countText, filter === 'favoritos' && styles.countTextActive]}>
                    {favorites.length}
                  </Text>
                </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.BG_CARD,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 7,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  filterBtnActive: {
    backgroundColor: Colors.ACCENT_PRIMARY,
    borderColor: Colors.ACCENT_PRIMARY,
  },
  filterBtnText: { fontSize: 14, fontWeight: '700', color: Colors.ACCENT_PRIMARY },
  filterBtnTextActive: { color: Colors.TEXT_PRIMARY },
  countBadge: {
    backgroundColor: Colors.ACCENT_PRIMARY + '28',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  countText: { fontSize: 12, fontWeight: '700', color: Colors.ACCENT_PRIMARY },
  countTextActive: { color: Colors.TEXT_PRIMARY },
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
