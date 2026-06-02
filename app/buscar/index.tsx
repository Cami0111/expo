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
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ContentItem {
  _id?: string;
  id?: string;
  title: string;
  thumbnailUrl?: string;
  year?: string | number;
  genre?: string;
  type?: string;
  duration?: string;
}

export default function BuscarScreen() {
  const { userId } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
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

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/search?title=${encodeURIComponent(q.trim())}`);
      const d = res.data;
      setResults(Array.isArray(d) ? d : (d.results ?? d.data ?? []));
    } catch (err: any) {
      console.log('Search error:', err.response?.status, JSON.stringify(err.response?.data));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search — wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      doSearch(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const navigateToContent = (item: ContentItem) => {
    const id = item._id ?? item.id;
    if (id) router.push(`/pelicula/${id}` as any);
  };

  const renderItem = ({ item }: { item: ContentItem }) => {
    const meta = [
      item.type === 'movie' ? 'Película' : item.type === 'series' ? 'Serie' : item.type,
      item.year?.toString(),
      item.genre,
    ].filter(Boolean).join(' · ');

    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => navigateToContent(item)}
        activeOpacity={0.8}
      >
        {item.thumbnailUrl ? (
          <Image
            source={{ uri: item.thumbnailUrl }}
            style={styles.thumbnail}
            contentFit="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Ionicons name="film-outline" size={24} color={Colors.ACCENT_PRIMARY} />
          </View>
        )}
        <View style={styles.resultInfo}>
          <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
          {meta ? <Text style={styles.resultMeta} numberOfLines={1}>{meta}</Text> : null}
          {item.duration ? (
            <Text style={styles.resultDuration}>{item.duration}</Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.TEXT_MUTED} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buscar</Text>
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

      <View style={styles.container}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.TEXT_MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar peliculas, series..."
            placeholderTextColor={Colors.TEXT_MUTED}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => doSearch(query)}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <Ionicons name="close-circle" size={18} color={Colors.TEXT_MUTED} />
            </TouchableOpacity>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.ACCENT_PRIMARY} />
          </View>
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item, idx) => item._id ?? item.id ?? `r-${idx}`}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          />
        ) : searched && !loading ? (
          <View style={styles.emptyState}>
            <View style={styles.iconWrap}>
              <Ionicons name="search-outline" size={44} color={Colors.ACCENT_PRIMARY} />
            </View>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptySub}>
              No encontramos nada para "{query}"
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.iconWrap}>
              <Ionicons name="search-outline" size={44} color={Colors.ACCENT_PRIMARY} />
            </View>
            <Text style={styles.emptyTitle}>Busca tu proxima pelicula</Text>
            <Text style={styles.emptySub}>
              Escribe el titulo de una pelicula o serie para comenzar
            </Text>
          </View>
        )}
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BG_CARD,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
    marginBottom: 20,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.TEXT_PRIMARY },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 90,
    borderRadius: 8,
  },
  thumbnailPlaceholder: {
    backgroundColor: Colors.BG_SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: { flex: 1, gap: 4 },
  resultTitle: { color: Colors.TEXT_PRIMARY, fontSize: 14, fontWeight: '700' },
  resultMeta: { color: Colors.TEXT_MUTED, fontSize: 12 },
  resultDuration: { color: Colors.TEXT_MUTED, fontSize: 11 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingBottom: 80,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.ACCENT_PRIMARY + '28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.TEXT_PRIMARY },
  emptySub: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
});
