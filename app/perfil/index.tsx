import { api } from '@/api/config';
import EditProfileModal from '@/components/EditProfileModal';
import FollowersModal from '@/components/FollowersModal';
import SlideMenu from '@/components/slide-menu';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
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
  _id?: string;
  username: string;
  display_name?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  reviewsCount?: number;
  moviesCount?: number;
  watchlistCount?: number;
  followersCount?: number;
  followingCount?: number;
  followers?: string[];
  following?: string[];
  achievements?: string[];
}

interface Movie {
  _id?: string;
  id: string;
  title: string;
  posterUrl?: string;
  poster?: string;
  image?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  year?: number;
  type?: string;
  duration?: number;
}

interface ActivityItem {
  _id?: string;
  id?: string;
  movieTitle?: string;
  rating?: number;
  movie?: { title: string };
  createdAt?: string;
  descripcion?: string;
  contenido?: string;
  text?: string;
  tituloFilme?: string;
  pelicula?: string;
  categoriaPublicacion?: string;
  categoria?: string;
  category?: string;
  likes?: number;
}


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

function PosterCard({ movie, onPress }: { movie: Movie; onPress?: () => void }) {
  const uri = movie.posterUrl ?? movie.poster ?? movie.image ?? movie.thumbnailUrl ?? movie.thumbnail;
  return (
    <TouchableOpacity style={posterSt.card} onPress={onPress} activeOpacity={0.8}>
      {uri ? (
        <Image source={{ uri }} style={posterSt.img} contentFit="cover" />
      ) : (
        <View style={[posterSt.img, posterSt.placeholder]}>
          <Ionicons name="film-outline" size={28} color={Colors.ACCENT_PRIMARY} />
        </View>
      )}
      <Text style={posterSt.title} numberOfLines={2}>{movie.title}</Text>
    </TouchableOpacity>
  );
}
const posterSt = StyleSheet.create({
  card: { width: 120, marginRight: 12 },
  img: { width: 120, height: 180, borderRadius: 12, marginBottom: 6 },
  placeholder: { backgroundColor: Colors.BG_SECONDARY, alignItems: 'center', justifyContent: 'center' },
  title: { color: Colors.TEXT_PRIMARY, fontSize: 11, textAlign: 'center', paddingHorizontal: 6, paddingBottom: 6 },
});

function HistoryCard({ movie, onPress }: { movie: Movie; onPress?: () => void }) {
  const uri = movie.posterUrl ?? movie.poster ?? movie.image ?? movie.thumbnailUrl ?? movie.thumbnail;
  const meta = [movie.type, movie.year, movie.duration ? `${movie.duration} min` : null]
    .filter(Boolean).join(' · ');
  return (
    <TouchableOpacity style={histSt.card} onPress={onPress} activeOpacity={0.8}>
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
    </TouchableOpacity>
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
  const title = item.movie?.title ?? item.movieTitle ?? item.tituloFilme ?? item.pelicula ?? '';
  const text = item.descripcion ?? item.contenido ?? item.text ?? '';
  const category = item.categoriaPublicacion ?? item.categoria ?? item.category ?? '';
  const dateStr = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short' })
    : null;
  return (
    <View style={actSt.card}>
      {category ? (
        <Text style={{ color: Colors.ACCENT_PRIMARY, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
          {category}
        </Text>
      ) : null}
      {title ? <Text style={actSt.title}>🎬 {title}</Text> : null}
      {item.rating && item.rating > 0 ? <StarRow rating={item.rating} /> : null}
      {text ? <Text style={actSt.desc} numberOfLines={2}>{text}</Text> : null}
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
  desc: { color: Colors.TEXT_SECONDARY, fontSize: 12, lineHeight: 18 },
  time: { color: Colors.TEXT_MUTED, fontSize: 11 },
});

export default function PerfilScreen() {
  const { userId } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following' | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [history, setHistory] = useState<Movie[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFullContent = async (item: { contentId: string; type?: string }): Promise<Movie | null> => {
    if (item.type === 'series') {
      try {
        const res = await api.get(`/series/${item.contentId}`);
        return res.data ?? null;
      } catch { return null; }
    }
    try {
      const res = await api.get(`/movies/${item.contentId}`);
      return res.data ?? null;
    } catch {}
    try {
      const res = await api.get(`/series/${item.contentId}`);
      return res.data ?? null;
    } catch {}
    return null;
  };

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, favRes, watchRes, histRes, actRes] = await Promise.allSettled([
        api.get('/users/profile'),
        api.get('/favorites'),
        api.get('/watchlist'),
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
        const items = Array.isArray(d) ? d : (d.data ?? []);
        const full = await Promise.all(
          items.map((item: any) => fetchFullContent({
            contentId: item.id ?? item._id,
            type: item.type,
          }))
        );
        setFavorites(full.filter((r): r is Movie => r !== null));
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
        setWatchlist(full.filter((r): r is Movie => r !== null));
      }
      if (histRes.status === 'fulfilled') {
        const d = histRes.value.data;
        const raw: any[] = Array.isArray(d) ? d : (d.movies ?? d.data ?? []);
        const resolved = await Promise.all(
          raw.map(async (item: any) => {
            if (typeof item === 'string') {
              try {
                const res = await api.get(`/movies/${item}`);
                return res.data;
              } catch {
                try {
                  const res = await api.get(`/series/${item}`);
                  return res.data;
                } catch {
                  return null;
                }
              }
            }
            return item;
          })
        );
        setHistory(resolved.filter((r): r is Movie => r !== null && (r._id ?? r.id)));
      }
      if (actRes.status === 'fulfilled') {
        const d = actRes.value.data;
        console.log('POSTS RAW:', JSON.stringify(d).slice(0, 300));
        setActivity(Array.isArray(d) ? d : (d.posts ?? d.data ?? []));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const displayName = profile?.display_name ?? profile?.displayName ?? profile?.username ?? 'Usuario';
  const initial = displayName.charAt(0).toUpperCase();

  const followersCount = profile?.followersCount ?? profile?.followers?.length ?? 0;
  const followingCount = profile?.followingCount ?? profile?.following?.length ?? 0;

  const stats: Array<{ label: string; value: number; onPress?: () => void }> = [
    { label: 'Reseñas', value: profile?.reviewsCount ?? activity.length },
    { label: 'Películas', value: profile?.moviesCount ?? favorites.length },
    { label: 'Seguidores', value: followersCount, onPress: () => setFollowModalType('followers') },
    { label: 'Siguiendo', value: followingCount, onPress: () => setFollowModalType('following') },
  ];

  const navToMovie = (movie: Movie) => {
    const id = (movie._id ?? movie.id ?? '').toString();
    if (id) router.push((`/pelicula/${id}`) as any);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.headerBar}>
        <Text style={styles.appName}>Stave</Text>
        <TouchableOpacity
          style={styles.avatarBtn}
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={{ width: 40, height: 40, borderRadius: 20 }} contentFit="cover" />
          ) : (
            <Text style={styles.avatarBtnText}>{initial}</Text>
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.ACCENT_PRIMARY} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
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

          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text style={styles.username}>@{profile?.username ?? 'usuario'}</Text>
            {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
            <TouchableOpacity style={styles.editRow} onPress={() => setEditVisible(true)}>
              <Ionicons name="pencil-outline" size={16} color={Colors.ACCENT_PRIMARY} />
              <Text style={styles.editText}>Editar perfil</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            {stats.map((s) =>
              s.onPress ? (
                <TouchableOpacity key={s.label} style={styles.statBox} onPress={s.onPress} activeOpacity={0.7}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </TouchableOpacity>
              ) : (
                <View key={s.label} style={styles.statBox}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              )
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader icon="trophy-outline" label="Logros" color={Colors.ACCENT_SECONDARY} />
            <View style={styles.logrosGrid}>
              {(profile?.achievements ?? []).length === 0 ? (
                <Text style={styles.emptyText}>Sin logros aún</Text>
              ) : (
                (profile?.achievements ?? []).map((achievement, idx) => (
                  <View key={idx.toString()} style={styles.logroCard}>
                    <Text style={styles.logroName}>🏆 {achievement}</Text>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader icon="heart-outline" label="Favoritos" />
            {favorites.length === 0 ? (
              <Text style={styles.emptyText}>Sin contenido</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {favorites.map((m, index) => (
                  <PosterCard
                    key={m._id ?? m.id ?? index.toString()}
                    movie={m}
                    onPress={() => navToMovie(m)}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader icon="list-outline" label="Por ver" />
            {watchlist.length === 0 ? (
              <Text style={styles.emptyText}>Sin contenido</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {watchlist.map((m, index) => (
                  <PosterCard
                    key={m._id ?? m.id ?? index.toString()}
                    movie={m}
                    onPress={() => navToMovie(m)}
                  />
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <SectionHeader icon="time-outline" label="Historial" />
            {history.length === 0 ? (
              <Text style={styles.emptyText}>Sin contenido</Text>
            ) : (
              history.slice(0, 10).map((m, index) => (
                <HistoryCard
                  key={m._id ?? m.id ?? index.toString()}
                  movie={m}
                  onPress={() => navToMovie(m)}
                />
              ))
            )}
          </View>

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
        currentDisplayName={profile?.display_name ?? profile?.displayName ?? profile?.username ?? ''}
        currentBio={profile?.bio ?? ''}
        currentAvatarUrl={profile?.avatarUrl ?? ''}
        onSaved={(dn: string, bio: string) => {
          setProfile((p) => (p ? { ...p, displayName: dn, display_name: dn, bio } : p));
          setEditVisible(false);
        }}
      />
      {followModalType !== null && userId ? (
        <FollowersModal
          visible={!!followModalType}
          onClose={() => setFollowModalType(null)}
          userId={userId}
          type={followModalType}
        />
      ) : null}
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

  logrosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
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
