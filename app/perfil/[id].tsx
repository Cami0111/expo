import { api } from '@/api/config';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import FollowersModal from '@/components/FollowersModal';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LOGROS = [
  { id: '1', name: 'Binge Watcher', desc: 'Haz visto 50 películas' },
  { id: '2', name: 'Crítico', desc: 'Haz escrito 20 reseñas' },
  { id: '3', name: 'Estrella de la comunidad', desc: 'Haz recibido 500 likes' },
  { id: '4', name: 'Maestro del género', desc: 'Haz visto 20 comedias' },
];

interface PublicProfile {
  _id?: string;
  id?: string;
  username?: string;
  display_name?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  reviewsCount?: number;
  followersCount?: number;
  followingCount?: number;
  followers?: any[];
  following?: any[];
  isFollowing?: boolean;
  achievements?: string[];
}

interface Movie {
  _id?: string;
  id?: string;
  title: string;
  thumbnailUrl?: string;
  posterUrl?: string;
  poster?: string;
  type?: string;
  year?: string | number;
}

export default function PublicPerfilScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following' | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFullContent = async (item: any): Promise<Movie | null> => {
    const contentId = item.id ?? item._id ?? item.contentId;
    if (!contentId) return item;
    try {
      if (item.type === 'series') {
        const res = await api.get(`/series/${contentId}`);
        return res.data;
      }
      try {
        const res = await api.get(`/movies/${contentId}`);
        return res.data;
      } catch {
        const res = await api.get(`/series/${contentId}`);
        return res.data;
      }
    } catch { return item; }
  };

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [profileRes, favsRes, followersRes, followingRes, postsRes] =
        await Promise.allSettled([
          api.get(`/users/${id}`),
          api.get(`/users/${id}/favorites`),
          api.get(`/users/${id}/followers`),
          api.get(`/users/${id}/following`),
          api.get(`/users/${id}/posts`),
        ]);

      if (profileRes.status === 'fulfilled') {
        const data = profileRes.value.data;
        setProfile(data);
        setIsFollowing(data.isFollowing ?? false);
      }
      if (favsRes.status === 'fulfilled') {
        const d = favsRes.value.data;
        const items: any[] = Array.isArray(d) ? d : (d.data ?? []);
        const full = await Promise.all(items.map(fetchFullContent));
        setFavorites(full.filter(Boolean) as Movie[]);
      }
      if (followersRes.status === 'fulfilled') {
        const d = followersRes.value.data;
        setFollowersCount(Array.isArray(d) ? d.length : (d.count ?? d.total ?? 0));
      }
      if (followingRes.status === 'fulfilled') {
        const d = followingRes.value.data;
        setFollowingCount(Array.isArray(d) ? d.length : (d.count ?? d.total ?? 0));
      }
      if (postsRes.status === 'fulfilled') {
        const d = postsRes.value.data;
        setPosts(Array.isArray(d) ? d : (d.posts ?? d.data ?? []));
      }
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleFollow = async () => {
    if (!id || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.post(`/users/${id}/unfollow`);
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await api.post(`/users/${id}/follow`);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch {}
    finally { setFollowLoading(false); }
  };

  const isOwnProfile = id === userId;
  const displayName = profile?.display_name ?? profile?.displayName ?? profile?.username ?? 'Usuario';
  const initial = displayName.charAt(0).toUpperCase();

  const stats = [
    { label: 'Reseñas', value: profile?.reviewsCount ?? 0 },
    { label: 'Películas', value: favorites.length },
    { label: 'Seguidores', value: followersCount },
    { label: 'Siguiendo', value: followingCount },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.ACCENT_PRIMARY} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{displayName}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.ACCENT_PRIMARY} />}
      >
        {/* Banner + Avatar */}
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
          {!isOwnProfile && (
            <TouchableOpacity
              style={[styles.followBtn, isFollowing && styles.followBtnActive]}
              onPress={handleFollow}
              disabled={followLoading}
              activeOpacity={0.85}
            >
              {followLoading ? (
                <ActivityIndicator size="small" color={isFollowing ? Colors.ACCENT_PRIMARY : '#fff'} />
              ) : (
                <Text style={[styles.followBtnText, isFollowing && styles.followBtnTextActive]}>
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((s) => {
            const tappable = s.label === 'Seguidores' || s.label === 'Siguiendo';
            const Wrapper = tappable ? TouchableOpacity : View;
            return (
              <Wrapper
                key={s.label}
                style={styles.statBox}
                {...(tappable ? {
                  onPress: () => setFollowModalType(s.label === 'Seguidores' ? 'followers' : 'following'),
                  activeOpacity: 0.7,
                } : {})}
              >
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </Wrapper>
            );
          })}
        </View>

        {/* Logros */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trophy-outline" size={20} color={Colors.ACCENT_SECONDARY} />
            <Text style={[styles.sectionTitle, { color: Colors.ACCENT_SECONDARY }]}>Logros</Text>
          </View>
          <View style={styles.logrosGrid}>
            {!profile?.achievements || profile.achievements.length === 0 ? (
              <Text style={styles.emptyText}>Sin logros aún</Text>
            ) : (
              profile.achievements.map((achievement, idx) => (
                <View key={idx.toString()} style={styles.logroCard}>
                  <Text style={styles.logroName}>🏆 {achievement}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Favoritos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="heart-outline" size={20} color={Colors.TEXT_PRIMARY} />
            <Text style={styles.sectionTitle}>Favoritos</Text>
          </View>
          {favorites.length === 0 ? (
            <Text style={styles.emptyText}>Sin contenido</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {favorites.map((m, idx) => (
                <TouchableOpacity
                  key={m._id ?? m.id ?? idx.toString()}
                  style={styles.posterCard}
                  onPress={() => { const mid = m._id ?? m.id; if (mid) router.push(`/pelicula/${mid}` as any); }}
                  activeOpacity={0.8}
                >
                  {m.thumbnailUrl ?? m.posterUrl ?? m.poster ? (
                    <Image source={{ uri: (m.thumbnailUrl ?? m.posterUrl ?? m.poster)! }} style={styles.posterImg} contentFit="cover" />
                  ) : (
                    <View style={[styles.posterImg, styles.posterPlaceholder]}>
                      <Ionicons name="film-outline" size={28} color={Colors.ACCENT_PRIMARY} />
                    </View>
                  )}
                  <Text style={styles.posterTitle} numberOfLines={2}>{m.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
        {/* Actividad Reciente */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up-outline" size={20} color={Colors.TEXT_PRIMARY} />
            <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          </View>
          {posts.length === 0 ? (
            <Text style={styles.emptyText}>Sin actividad aún</Text>
          ) : (
            posts.slice(0, 5).map((p: any, idx: number) => {
              const pId = p._id ?? p.id ?? p.postId ?? `p-${idx}`;
              const text = p.descripcion ?? p.contenido ?? p.text ?? '';
              const film = p.tituloFilme ?? p.pelicula ?? p.contentId ?? '';
              const category = p.categoriaPublicacion ?? p.categoria ?? p.category ?? '';
              return (
                <View key={pId} style={styles.actCard}>
                  {category ? <Text style={styles.actCategory}>{category}</Text> : null}
                  {film ? <Text style={styles.actFilm}>🎬 {film}</Text> : null}
                  {text ? <Text style={styles.actText} numberOfLines={2}>{text}</Text> : null}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {followModalType !== null && id ? (
        <FollowersModal
          visible={!!followModalType}
          onClose={() => setFollowModalType(null)}
          userId={Array.isArray(id) ? id[0] : id}
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
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.TEXT_PRIMARY },

  bannerSection: { height: 160, position: 'relative' },
  banner: { position: 'absolute', top: 0, left: 0, right: 0, height: 120, backgroundColor: Colors.ACCENT_PRIMARY },
  avatarWrap: {
    position: 'absolute', bottom: 0, left: 20,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.ACCENT_PRIMARY,
    borderWidth: 3, borderColor: Colors.BG_PRIMARY,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarImg: { width: 80, height: 80 },
  avatarInitial: { color: Colors.TEXT_PRIMARY, fontSize: 32, fontWeight: '800' },

  profileInfo: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, gap: 4 },
  displayName: { fontSize: 20, fontWeight: '700', color: Colors.TEXT_PRIMARY },
  username: { fontSize: 13, color: Colors.TEXT_SECONDARY },
  bio: { fontSize: 14, color: Colors.TEXT_SECONDARY, marginTop: 4, lineHeight: 20 },

  followBtn: {
    marginTop: 10, alignSelf: 'flex-start',
    paddingHorizontal: 24, paddingVertical: 8,
    borderRadius: 20, backgroundColor: Colors.ACCENT_PRIMARY,
  },
  followBtnActive: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.ACCENT_PRIMARY },
  followBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  followBtnTextActive: { color: Colors.ACCENT_PRIMARY },

  statsRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginVertical: 20 },
  statBox: { flex: 1, backgroundColor: Colors.BG_CARD, borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '700', color: Colors.TEXT_PRIMARY },
  statLabel: { fontSize: 11, color: Colors.TEXT_SECONDARY, marginTop: 2, textAlign: 'center' },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.TEXT_PRIMARY },
  emptyText: { color: Colors.TEXT_MUTED, fontSize: 13 },

  logrosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  logroCard: { backgroundColor: Colors.BG_CARD, borderRadius: 10, padding: 12, width: '47%', gap: 4 },
  logroName: { color: Colors.TEXT_PRIMARY, fontSize: 13, fontWeight: '700' },
  logroDesc: { color: Colors.TEXT_MUTED, fontSize: 11 },

  posterCard: { width: 120, marginRight: 12 },
  posterImg: { width: 120, height: 180, borderRadius: 12, marginBottom: 6 },
  posterPlaceholder: { backgroundColor: Colors.BG_SECONDARY, alignItems: 'center', justifyContent: 'center' },
  posterTitle: { color: Colors.TEXT_PRIMARY, fontSize: 11, textAlign: 'center', paddingHorizontal: 6 },

  actCard: { backgroundColor: Colors.BG_CARD, borderRadius: 10, padding: 12, marginBottom: 8, gap: 4 },
  actCategory: { color: Colors.ACCENT_PRIMARY, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  actFilm: { color: Colors.TEXT_SECONDARY, fontSize: 12 },
  actText: { color: Colors.TEXT_PRIMARY, fontSize: 13 },
});
