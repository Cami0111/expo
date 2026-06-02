import { api } from '@/api/config';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');

interface MovieDetail {
  _id?: string;
  id?: string;
  title: string;
  backdropUrl?: string;
  thumbnailUrl?: string;
  posterUrl?: string;
  poster?: string;
  image?: string;
  description?: string;
  genre?: string;
  type?: string;
  year?: string | number;
  duration?: string | number;
  rating?: number;
  streamUrl?: string;
  trailerUrl?: string;
}

export default function PeliculaScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { userId } = useAuth();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);
  const [togglingWatch, setTogglingWatch] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadMovie = async () => {
      try {
        let data: MovieDetail;
        try {
          const res = await api.get(`/movies/${id}`);
          data = res.data;
        } catch {
          const res = await api.get(`/series/${id}`);
          data = res.data;
        }
        setMovie(data);
      } catch (err: any) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    const checkLists = async () => {
      if (!userId) return;
      try {
        const [favRes, watchRes] = await Promise.allSettled([
          api.get('/favorites'),
          api.get('/watchlist'),
        ]);
        if (favRes.status === 'fulfilled') {
          const d = favRes.value.data;
          const list: any[] = Array.isArray(d) ? d : (d.data ?? []);
          setIsFavorite(list.some((f) => (f.contentId ?? f.id ?? f._id) === id));
        }
        if (watchRes.status === 'fulfilled') {
          const d = watchRes.value.data;
          const list: any[] = Array.isArray(d) ? d : (d.data ?? []);
          setIsWatchlisted(list.some((f) => (f.contentId ?? f.id ?? f._id) === id));
        }
      } catch { }
    };

    loadMovie();
    checkLists();
  }, [id, userId]);

  // derives "movie" or "series" from the loaded movie object
  const contentType = movie?.type === 'series' ? 'series' : 'movie';

  const toggleFavorite = async () => {
    if (togglingFav) return;
    setTogglingFav(true);
    const wasAlreadyFav = isFavorite;
    setIsFavorite(!wasAlreadyFav);
    try {
      if (wasAlreadyFav) {
        await api.delete('/favorites', { data: { contentId: id, contentType } });
      } else {
        await api.post('/favorites', { contentId: id, contentType });
      }
    } catch (err: any) {
      setIsFavorite(wasAlreadyFav);
      Alert.alert('Error', err.response?.data?.message ?? 'No se pudo actualizar favoritos');
    } finally {
      setTogglingFav(false);
    }
  };

  const toggleWatchlist = async () => {
    if (togglingWatch) return;
    setTogglingWatch(true);
    const wasWatchlisted = isWatchlisted;
    setIsWatchlisted(!wasWatchlisted);
    try {
      if (wasWatchlisted) {
        await api.delete('/watchlist', { data: { contentId: id, contentType } });
      } else {
        await api.post('/watchlist', { contentId: id, contentType });
      }
    } catch (err: any) {
      setIsWatchlisted(wasWatchlisted);
      Alert.alert('Error', err.response?.data?.message ?? 'No se pudo actualizar watchlist');
    } finally {
      setTogglingWatch(false);
    }
  };

  const handleWatch = async () => {
    try {
      if (movie?.type === 'series') {
        await api.get(`/watch/series/${id}/season/1/episode/1`);
      } else {
        await api.get(`/watch/movie/${id}`);
      }
    } catch { }
    const url = movie?.streamUrl ?? movie?.trailerUrl;
    if (url) {
      try { await Linking.openURL(url); } catch { }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.ACCENT_PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !movie) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={52} color={Colors.TEXT_MUTED} />
          <Text style={styles.errorText}>{'No se pudo cargar el contenido\nID: ' + id}</Text>
          <TouchableOpacity style={styles.backBtnOutlined} onPress={() => router.back()} activeOpacity={0.8}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const backdropUri = movie.backdropUrl ?? movie.thumbnailUrl ?? movie.posterUrl ?? movie.poster ?? movie.image;

  const meta = [
    movie.genre,
    movie.type === 'movie' ? 'Película' : movie.type === 'series' ? 'Serie' : movie.type,
    movie.year?.toString(),
    movie.duration ? `${movie.duration} min` : null,
  ].filter(Boolean).join(' · ');

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.backdropContainer}>
          {backdropUri ? (
            <Image source={{ uri: backdropUri }} style={styles.backdropImage} contentFit="cover" />
          ) : (
            <View style={styles.backdropFallback}>
              <Ionicons name="film-outline" size={64} color={Colors.TEXT_MUTED} />
            </View>
          )}
          <View style={styles.backdropOverlay} />
          <TouchableOpacity style={styles.backArrow} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {meta ? <Text style={styles.metaText}>{meta.toUpperCase()}</Text> : null}

          <Text style={styles.titleText}>{movie.title}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={Colors.STAR_COLOR} />
            <Text style={styles.ratingText}>
              {movie.rating && movie.rating > 0 ? `${movie.rating}/10` : 'Sin calificación'}
            </Text>
          </View>

          <Text style={styles.description}>
            {movie.description || 'Sin descripción disponible'}
          </Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.playBtn} activeOpacity={0.85} onPress={handleWatch}>
              <Text style={styles.playBtnText}>▶  Ver ahora</Text>
            </TouchableOpacity>

            {/* ❤️ Favorite button */}
            <TouchableOpacity
              style={[styles.iconBtn, isFavorite && styles.iconBtnFavActive]}
              onPress={toggleFavorite}
              disabled={togglingFav}
              activeOpacity={0.8}
            >
              {togglingFav ? (
                <ActivityIndicator size="small" color="#FF6B6B" />
              ) : (
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? '#FF6B6B' : '#ffffff'}
                />
              )}
            </TouchableOpacity>

            {/* 🔖 Watchlist button */}
            <TouchableOpacity
              style={[styles.iconBtn, isWatchlisted && styles.iconBtnWatchActive]}
              onPress={toggleWatchlist}
              disabled={togglingWatch}
              activeOpacity={0.8}
            >
              {togglingWatch ? (
                <ActivityIndicator size="small" color="#22C55E" />
              ) : (
                <Ionicons
                  name={isWatchlisted ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={isWatchlisted ? '#22C55E' : '#ffffff'}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.backBtnOutlined} onPress={() => router.back()} activeOpacity={0.8}>
              <Text style={styles.backBtnText}>← Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BG_PRIMARY },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  errorText: { color: Colors.TEXT_SECONDARY, fontSize: 15, textAlign: 'center' },

  backdropContainer: { width: SCREEN_W, height: 350, position: 'relative' },
  backdropImage: { width: SCREEN_W, height: 350 },
  backdropFallback: {
    width: SCREEN_W,
    height: 350,
    backgroundColor: Colors.BG_SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backArrow: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 12,
  },
  metaText: { color: Colors.TEXT_MUTED, fontSize: 12, letterSpacing: 0.5 },
  titleText: { color: Colors.TEXT_PRIMARY, fontSize: 28, fontWeight: '700', lineHeight: 34 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { color: Colors.STAR_COLOR, fontWeight: '700', fontSize: 15 },
  description: { color: Colors.TEXT_SECONDARY, fontSize: 14, lineHeight: 22 },

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  playBtn: {
    flex: 1,
    backgroundColor: '#821EED',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  playBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.BG_CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnFavActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.18)',
    borderWidth: 1.5,
    borderColor: '#FF6B6B',
  },
  iconBtnWatchActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.18)',
    borderWidth: 1.5,
    borderColor: '#22C55E',
  },
  backBtnOutlined: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});