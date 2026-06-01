import { api } from '@/api/config';
import { useAuth } from '@/context/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
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

const PURPLE = '#6C5CE7';
const BG = '#F8F7FF';
const CARD = '#FFFFFF';
const DARK_TEXT = '#1C1C1E';
const SECONDARY_TEXT = '#3C3C43';
const MUTED = '#8E8E93';
const BORDER = '#E5E5EA';

interface PublicProfile {
  id: string;
  username: string;
  bio?: string;
  avatar?: string;
  reviewsCount?: number;
  isFollowing?: boolean;
}

interface Movie {
  id: string;
  title: string;
  posterUrl?: string;
  poster?: string;
}

interface Post {
  id: string;
  movieTitle?: string;
  rating?: number;
  comment?: string;
  movie?: { title: string };
}

export default function PublicPerfilScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [profileRes, postsRes, favsRes, followersRes, followingRes] =
        await Promise.allSettled([
          api.get(`/users/${id}`),
          api.get(`/users/${id}/posts`),
          api.get(`/users/${id}/favorites`),
          api.get(`/users/${id}/followers`),
          api.get(`/users/${id}/following`),
        ]);

      if (profileRes.status === 'fulfilled') {
        const data = profileRes.value.data;
        setProfile(data);
        setIsFollowing(data.isFollowing ?? false);
      }
      if (postsRes.status === 'fulfilled') {
        const d = postsRes.value.data;
        setPosts(Array.isArray(d) ? d : (d.posts ?? d.data ?? []));
      }
      if (favsRes.status === 'fulfilled') {
        const d = favsRes.value.data;
        setFavorites(Array.isArray(d) ? d : (d.movies ?? d.data ?? []));
      }
      if (followersRes.status === 'fulfilled') {
        const d = followersRes.value.data;
        setFollowersCount(
          typeof d === 'number'
            ? d
            : d.count ?? d.total ?? (Array.isArray(d) ? d.length : 0),
        );
      }
      if (followingRes.status === 'fulfilled') {
        const d = followingRes.value.data;
        setFollowingCount(
          typeof d === 'number'
            ? d
            : d.count ?? d.total ?? (Array.isArray(d) ? d.length : 0),
        );
      }
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleFollow = async () => {
    if (!id || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await api.post(`/users/${id}/unfollow`);
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
      } else {
        await api.post(`/users/${id}/follow`);
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
      }
    } catch {
    } finally {
      setFollowLoading(false);
    }
  };

  const isOwnProfile = id === userId;

  const initials = profile?.username
    ? profile.username.slice(0, 2).toUpperCase()
    : 'US';

  const stats = [
    { label: 'Seguidores', value: followersCount },
    { label: 'Siguiendo', value: followingCount },
    { label: 'Resenas', value: profile?.reviewsCount ?? posts.length },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PURPLE} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PURPLE}
          />
        }
      >
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.username}>{profile?.username ?? 'Usuario'}</Text>
          {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

          {!isOwnProfile ? (
            <TouchableOpacity
              style={[styles.followBtn, isFollowing && styles.followBtnActive]}
              onPress={handleFollow}
              disabled={followLoading}
              activeOpacity={0.85}
            >
              {followLoading ? (
                <ActivityIndicator
                  size="small"
                  color={isFollowing ? PURPLE : '#FFF'}
                />
              ) : (
                <Text
                  style={[
                    styles.followBtnText,
                    isFollowing && styles.followBtnTextActive,
                  ]}
                >
                  {isFollowing ? 'Siguiendo' : 'Seguir'}
                </Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          {stats.map((s, i) => (
            <View
              key={s.label}
              style={[styles.statItem, i < stats.length - 1 && styles.statDivider]}
            >
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Favoritas */}
        <Text style={styles.sectionTitle}>Favoritas</Text>
        {favorites.length === 0 ? (
          <Text style={styles.emptyText}>Sin favoritas aun</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hListContent}
          >
            {favorites.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </ScrollView>
        )}

        {/* Resenas recientes */}
        <Text style={styles.sectionTitle}>Resenas Recientes</Text>
        {posts.length === 0 ? (
          <Text style={styles.emptyText}>Sin resenas aun</Text>
        ) : (
          posts.slice(0, 5).map((p) => <PostRow key={p.id} post={p} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MovieCard({ movie }: { movie: Movie }) {
  const uri = movie.posterUrl ?? movie.poster;
  return (
    <View style={styles.posterCard}>
      {uri ? (
        <Image source={{ uri }} style={styles.posterImg} contentFit="cover" />
      ) : (
        <View style={[styles.posterImg, styles.posterPlaceholder]}>
          <Ionicons name="film-outline" size={28} color={PURPLE} />
        </View>
      )}
      <Text style={styles.posterTitle} numberOfLines={2}>
        {movie.title}
      </Text>
    </View>
  );
}

function PostRow({ post }: { post: Post }) {
  const title = post.movie?.title ?? post.movieTitle ?? 'Pelicula';
  return (
    <View style={styles.reviewRow}>
      <View style={styles.reviewIconWrap}>
        <Ionicons name="star" size={16} color="#FF9500" />
      </View>
      <View style={styles.reviewInfo}>
        <Text style={styles.reviewTitle} numberOfLines={1}>
          {title}
        </Text>
        {post.comment ? (
          <Text style={styles.reviewComment} numberOfLines={1}>
            {post.comment}
          </Text>
        ) : null}
      </View>
      {post.rating != null ? (
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>{post.rating}/5</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  profileHeader: {
    alignItems: 'center',
    backgroundColor: PURPLE,
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { color: '#FFF', fontSize: 30, fontWeight: '800' },
  username: { color: '#FFF', fontSize: 20, fontWeight: '700', marginBottom: 6 },
  bio: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },

  followBtn: {
    marginTop: 14,
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    minWidth: 110,
    alignItems: 'center',
  },
  followBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  followBtnText: {
    color: PURPLE,
    fontWeight: '700',
    fontSize: 15,
  },
  followBtnTextActive: {
    color: '#FFF',
  },

  statsCard: {
    flexDirection: 'row',
    backgroundColor: CARD,
    marginHorizontal: 20,
    borderRadius: 16,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 28,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: DARK_TEXT },
  statLabel: { fontSize: 12, color: MUTED, marginTop: 3 },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: DARK_TEXT,
    marginBottom: 14,
    marginHorizontal: 20,
  },
  emptyText: {
    color: MUTED,
    fontSize: 13,
    marginHorizontal: 20,
    marginBottom: 24,
  },

  hListContent: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 4,
    marginBottom: 28,
  },

  posterCard: { width: 100 },
  posterImg: {
    width: 100,
    height: 150,
    borderRadius: 10,
    marginBottom: 6,
  },
  posterPlaceholder: {
    backgroundColor: PURPLE + '1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterTitle: {
    fontSize: 11,
    color: SECONDARY_TEXT,
    textAlign: 'center',
    fontWeight: '600',
  },

  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FF950018',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewInfo: { flex: 1 },
  reviewTitle: { fontSize: 14, fontWeight: '600', color: DARK_TEXT },
  reviewComment: { fontSize: 12, color: MUTED, marginTop: 2 },
  ratingBadge: {
    backgroundColor: PURPLE + '18',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: { fontSize: 12, fontWeight: '700', color: PURPLE },
});
