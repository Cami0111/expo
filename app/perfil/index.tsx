import { api } from '@/api/config';
import EditProfileModal from '@/components/EditProfileModal';
import SlideMenu from '@/components/slide-menu';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  reviewsCount?: number;
  moviesCount?: number;
  watchlistCount?: number;
  followersCount?: number;
}

interface Movie {
  _id?: string;
  id: string;
  title: string;
  posterUrl?: string;
  poster?: string;
  year?: number;
  type?: string;
  duration?: number;
}

interface ActivityItem {
  _id?: string;
  id: string;
  movieTitle?: string;
  rating: number;
  movie?: { title: string };
  createdAt?: string;
}

const LOGROS = [
  { id: '1', name: 'Binge Watcher', desc: 'Haz visto 50 películas' },
  { id: '2', name: 'Crítico', desc: 'Haz escrito 20 reseñas' },
  { id: '3', name: 'Estrella de la comunidad', desc: 'Haz recibido 500 likes' },
  { id: '4', name: 'Maestro del género', desc: 'Haz visto 20 comedias' },
];

function StarRow({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: max }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < Math.round(rating) ? 'star' : 'star-outline'}
          size={12}
          color={i < Math.round(rating) ? Colors.STAR_COLOR : Colors.TEXT_MUTED}
        />
      ))}
    </View>
  );
}

function SectionHeader({ icon, label, color }: { icon: any; label: string; color?: string }) {
  return (
    <View style={sh.row}>
      <Ionicons name={icon} size={20} color={color ?? Colors.TEXT_PRIMARY} />
      <Text style={[sh.title, color ? { color } : null]}>{label}</Text>
    </View>
  );
}
const sh = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.TEXT_PRIMARY },
});

function PosterCard({ movie }: { movie: Movie }) {
  const uri = movie.posterUrl ?? movie.poster;
  return (
    <View style={posterSt.card}>
      {uri ? (
        <Image source={{ uri }} style={posterSt.img} contentFit="cover" />
      ) : (
        <View style={[posterSt.img, posterSt.placeholder]}>
          <Ionicons name="film-outline" size={28} color={Colors.ACCENT_PRIMARY} />
        </View>
      )}
      <Text style={posterSt.title} numberOfLines={2}>{movie.title}</Text>
    </View>
  );
}
const posterSt = StyleSheet.create({
  card: { width: 160, marginRight: 12 },
  img: { width: 160, height: 220, borderRadius: 12, marginBottom: 6 },
  placeholder: { backgroundColor: Colors.BG_SECONDARY, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.TEXT_PRIMARY, fontSize: 11, textAlign: 'center', paddingHorizontal: 6, paddingBottom: 6 },
});

function HistoryCard({ movie }: { movie: Movie }) {
  const uri = movie.posterUrl ?? movie.poster;
  const meta = [movie.type, movie.year, movie.duration ? `${movie.duration} min` : null]
    .filter(Boolean).join(' · ');
  return (
    <View style={histSt.card}>
      {uri ? (
        <Image source={{ uri }} style={histSt.thumb} contentFit="cover" />
      ) : (
        <View style={[histSt.thumb, histSt.thumbPh]}>
          <Ionicons name="film-outline" size={20} color={Colors.ACCENT_PRIMARY} />
        </View>
      )}
      <View style={histSt.info}>
        <Text style={histSt.title} numberOfLines={2}>{movie.title}</Text>
        {meta ? <Text style={histSt.meta}>{meta}</Text> : null}
        <StarRow rating={0} />
      </View>
    </View>
  );
}
const histSt = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    gap: 12,
  },
  thumb: { width: 80, height: 60, borderRadius: 8 },
  thumbPh: { backgroundColor: Colors.BG_CARD, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 4 },
  title: { color: Colors.TEXT_PRIMARY, fontSize: 14, fontWeight: '700' },
  meta: { color: Colors.TEXT_MUTED, fontSize: 12 },
});

function ActivityCard({ item }: { item: ActivityItem }) {
  const title = item.movie?.title ?? item.movieTitle ?? 'Película';
  const dateStr = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })
    : null;
  return (
    <View style={actSt.card}>
      <Text style={actSt.title}>Reseña de {title}</Text>
      <StarRow rating={item.rating} />
      {dateStr ? <Text style={actSt.time}>{dateStr}</Text> : null}
    </View>
  );
}
const actSt = StyleSheet.create({
  card: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 10,
    marginBottom: 10,
    padding: 14,
    gap: 6,
  },
  title: { color: Colors.TEXT_PRIMARY, fontSize: 13, fontWeight: '700' },
  time: { color: Colors.TEXT_MUTED, fontSize: 11 },
});

export default function PerfilScreen() {
  const { userId } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [history, setHistory] = useState<Movie[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, favRes, watchRes, histRes, actRes] = await Promise.allSettled([
        api.get('/users/profile'),
        api.get(`/users/${userId}/favorites`),
        api.get(`/users/${userId}/watchlist`),
        api.get('/users/history'),
        api.get(`/users/${userId}/posts`),
      ]);

      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.data);
      } else {
        setProfile({ id: userId ?? '', username: 'Usuario' });
      }
      if (favRes.status === 'fulfilled') {
        const d = favRes.value.data;
        setFavorites(Array.isArray(d) ? d : (d.movies ?? d.data ?? []));
      }
      if (watchRes.status === 'fulfilled') {
        const d = watchRes.value.data;
        setWatchlist(Array.isArray(d) ? d : (d.movies ?? d.data ?? []));
      }
      if (histRes.status === 'fulfilled') {
        const d = histRes.value.data;
        setHistory(Array.isArray(d) ? d : (d.movies ?? d.data ?? []));
      }
      if (actRes.status === 'fulfilled') {
        const d = actRes.value.data;
        setActivity(Array.isArray(d) ? d : (d.posts ?? d.data ?? []));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const displayName = profile?.displayName ?? profile?.username ?? 'Usuario';
  const initial = displayName.charAt(0).toUpperCase();

  const stats = [
    { label: 'Reseñas', value: profile?.reviewsCount ?? activity.length },
    { label: 'Películas', value: profile?.moviesCount ?? favorites.length },
    { label: 'Por Ver', value: profile?.watchlistCount ?? watchlist.length },
    { label: 'Seguidores', value: profile?.followersCount ?? 0 },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <Text style={styles.appName}>Stave</Text>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.avatarBtnText}>{initial}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.ACCENT_PRIMARY} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Banner + Avatar overlap container */}
          <View style={styles.bannerSection}>
            <View style={styles.banner} />
            <View style={styles.avatarWrap}>
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <Text style={styles.avatarInitial}>{initial}</Text>
              )}
            </View>
          </View>

          {/* Profile info */}
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.username}>@{profile?.username ?? 'usuario'}</Text>
            {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
            <TouchableOpacity style={styles.editRow} onPress={() => setEditVisible(true)}>
              <Ionicons name="pencil-outline" size={16} color={Colors.ACCENT_PRIMARY} />
              <Text style={styles.editText}>Editar perfil</Text>
            </TouchableOpacity>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statBox}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Logros */}
          <View style={styles.section}>
            <SectionHeader icon="trophy-outline" label="Logros" color={Colors.ACCENT_SECONDARY} />
            <View style={styles.logrosGrid}>
              {LOGROS.map((l) => (
                <View key={l.id} style={styles.logroCard}>
                  <Text style={styles.logroName}>{l.name}</Text>
                  <Text style={styles.logroDesc}>{l.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Favoritos */}
          <View style={styles.section}>
            <SectionHeader icon="heart-outline" label="Favoritos" />
            {favorites.length === 0 ? (
              <Text style={styles.emptyText}>Sin contenido</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {favorites.map((m, index) => (
                  <PosterCard key={m._id ?? m.id ?? index.toString()} movie={m} />
                ))}
              </ScrollView>
            )}
          </View>

          {/* Por Ver */}
          <View style={styles.section}>
            <SectionHeader icon="list-outline" label="Por ver" />
            {watchlist.length === 0 ? (
              <Text style={styles.emptyText}>Sin contenido</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {watchlist.map((m, index) => (
                  <PosterCard key={m._id ?? m.id ?? index.toString()} movie={m} />
                ))}
              </ScrollView>
            )}
          </View>

          {/* Historial */}
          <View style={styles.section}>
            <SectionHeader icon="time-outline" label="Historial" />
            {history.length === 0 ? (
              <Text style={styles.emptyText}>Sin contenido</Text>
            ) : (
              history.slice(0, 10).map((m, index) => (
                <HistoryCard key={m._id ?? m.id ?? index.toString()} movie={m} />
              ))
            )}
          </View>

          {/* Actividad Reciente */}
          <View style={styles.section}>
            <SectionHeader icon="trending-up-outline" label="Actividad Reciente" />
            {activity.length === 0 ? (
              <Text style={styles.emptyText}>Sin contenido</Text>
            ) : (
              activity.slice(0, 5).map((r, index) => (
                <ActivityCard key={r._id ?? r.id ?? index.toString()} item={r} />
              ))
            )}
          </View>
        </ScrollView>
      )}

      <SlideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
      <EditProfileModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        currentDisplayName={profile?.displayName ?? profile?.username ?? ''}
        currentBio={profile?.bio ?? ''}
        onSaved={(dn: string, bio: string) => {
          setProfile((p) => (p ? { ...p, displayName: dn, bio } : p));
          setEditVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BG_PRIMARY },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 40 },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.BG_PRIMARY,
  },
  appName: { fontSize: 24, fontWeight: '900', color: Colors.TEXT_PRIMARY },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.BG_CARD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtnText: { color: Colors.TEXT_PRIMARY, fontWeight: '700', fontSize: 16 },

  // Banner: 120px visible + 40px padding for avatar overlap = 160px total
  bannerSection: { height: 160, position: 'relative' },
  banner: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 120,
    backgroundColor: Colors.ACCENT_PRIMARY,
  },
  avatarWrap: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.ACCENT_PRIMARY,
    borderWidth: 3,
    borderColor: Colors.BG_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 80, height: 80 },
  avatarInitial: { color: Colors.TEXT_PRIMARY, fontSize: 32, fontWeight: '800' },

  profileInfo: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    gap: 4,
  },
  displayName: { fontSize: 20, fontWeight: '700', color: Colors.TEXT_PRIMARY },
  username: { fontSize: 13, color: Colors.TEXT_SECONDARY },
  bio: { fontSize: 14, color: Colors.TEXT_SECONDARY, marginTop: 4, lineHeight: 20 },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  editText: { fontSize: 13, color: Colors.ACCENT_PRIMARY, fontWeight: '600' },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginVertical: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '700', color: Colors.TEXT_PRIMARY },
  statLabel: { fontSize: 11, color: Colors.TEXT_SECONDARY, marginTop: 2, textAlign: 'center' },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  emptyText: { color: Colors.TEXT_MUTED, fontSize: 13 },

  logrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  logroCard: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 10,
    padding: 12,
    width: '47%',
    gap: 4,
  },
  logroName: { color: Colors.TEXT_PRIMARY, fontSize: 13, fontWeight: '700' },
  logroDesc: { color: Colors.TEXT_MUTED, fontSize: 11 },
});
