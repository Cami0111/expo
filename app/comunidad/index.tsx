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
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── Types ──────────────────────────────────────────────────
interface Post {
  postId?: string;
  _id?: string;
  id?: string;
  userId?: string;
  nombreCreador?: string;
  autor?: string;
  categoriaPublicacion?: string;
  categoria?: string;
  category?: string;
  descripcion?: string;
  contenido?: string;
  text?: string;
  tituloFilme?: string;
  pelicula?: string;
  contentId?: string;
  likes?: number;
  likesCount?: number;
  comments?: number;
  comentarios?: number;
  createdAt?: string;
  tiempoPublicacion?: string;
}

// ── Helpers ────────────────────────────────────────────────
const getPostId = (p: Post) => p.postId ?? p._id ?? p.id ?? '';
const getAuthor = (p: any) =>
  p.nombreCreador ?? p.displayName ?? p.display_name ??
  p.autor ?? p.username ?? p.userName ??
  (p.userId ? `User_${p.userId.slice(-4)}` : 'Anónimo');

const getCommentAuthor = (c: any) =>
  c.nombreCreador ?? c.displayName ?? c.display_name ??
  c.autor ?? c.username ?? c.userName ??
  (c.userId ? `User_${c.userId.slice(-4)}` : 'Usuario');
const getCategory = (p: Post) =>
  p.categoriaPublicacion ?? p.categoria ?? p.category ?? 'Discusión';
const getDescription = (p: Post) => p.descripcion ?? p.contenido ?? p.text ?? '';
const getFilm = (p: Post) => p.tituloFilme ?? p.pelicula ?? p.contentId ?? '';
const getLikes = (p: Post) => p.likes ?? p.likesCount ?? 0;
const getComments = (p: Post) => p.comments ?? p.comentarios ?? 0;

function formatTime(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return 'Justo ahora';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Discusión': '#a855f7',
  'Teoría': '#22d3ee',
  'Crítica': '#ec4899',
  'Reseña': '#fbbf24',
  'Easter Eggs': '#818cf8',
  'Recomendación': '#10b981',
};

const CATEGORIES = ['Discusión', 'Teoría', 'Crítica', 'Reseña', 'Easter Eggs', 'Recomendación'];

const cmst = StyleSheet.create({
  section: { marginTop: 12, borderTopWidth: 1, borderTopColor: Colors.BORDER_COLOR, paddingTop: 12, gap: 12 },
  comment: { flexDirection: 'row', gap: 10 },
  commentAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.ACCENT_PRIMARY, alignItems: 'center', justifyContent: 'center' },
  commentAvatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  commentBody: { flex: 1, gap: 2 },
  commentAuthor: { color: Colors.TEXT_PRIMARY, fontSize: 12, fontWeight: '700' },
  commentText: { color: Colors.TEXT_SECONDARY, fontSize: 13 },
  commentActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  commentAction: { color: Colors.TEXT_MUTED, fontSize: 11 },
  reply: { marginLeft: 12, marginTop: 6, padding: 8, backgroundColor: Colors.BG_SECONDARY, borderRadius: 8 },
  replyAuthor: { color: Colors.TEXT_PRIMARY, fontSize: 11, fontWeight: '700' },
  replyText: { color: Colors.TEXT_SECONDARY, fontSize: 12 },
  replyInput: { flexDirection: 'row', gap: 8, marginTop: 8 },
  addComment: { flexDirection: 'row', gap: 8, marginTop: 4 },
  input: {
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  sendBtn: {
    backgroundColor: Colors.ACCENT_PRIMARY,
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ── PostCard component ─────────────────────────────────────
function PostCard({
  post,
  currentUserId,
  currentUserName,
  onLike,
  onDelete,
}: {
  post: Post;
  currentUserId?: string;
  currentUserName?: string;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(getLikes(post));
  const [resolvedAuthor, setResolvedAuthor] = useState(getAuthor(post));
  const postId = getPostId(post);
  const category = getCategory(post);
  const description = getDescription(post);
  const film = getFilm(post);
  const initial = resolvedAuthor.charAt(0).toUpperCase();
  const badgeColor = CATEGORY_COLORS[category] ?? '#a855f7';
  const isOwner = !!(currentUserId && post.userId && post.userId === currentUserId);
  const timeStr = formatTime(post.createdAt ?? post.tiempoPublicacion);

  useEffect(() => {
    const raw = getAuthor(post);
    if ((raw === 'Anónimo' || raw.startsWith('User_')) && post.userId) {
      api.get(`/users/${post.userId}`)
        .then(res => {
          const u = res.data;
          const name = u.displayName ?? u.display_name ?? u.username ?? raw;
          setResolvedAuthor(name);
        })
        .catch(() => { });
    } else {
      setResolvedAuthor(raw);
    }
  }, [post]);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const loadComments = async () => {
    if (!postId) return;
    setLoadingComments(true);
    try {
      const res = await api.get(`/community/posts/${postId}/comments`);
      const d = res.data;
      setComments(Array.isArray(d) ? d : (d.comments ?? d.data ?? []));
    } catch {
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (!showComments) loadComments();
    setShowComments(v => !v);
  };

  const handleAddComment = async () => {
    const trimmed = commentText.trim();
    if (!trimmed) return;
    try {
      await api.post(`/community/posts/${postId}/comments`, {
        text: trimmed,
        userName: currentUserName ?? 'Usuario',
      });
      setCommentText('');
      await loadComments();
    } catch (err: any) {
      console.log('COMMENT ERROR:', err.response?.status, JSON.stringify(err.response?.data));
      const msg = err.response?.data?.message;
      Alert.alert('Error', Array.isArray(msg) ? msg.join(', ') : (msg ?? 'No se pudo comentar'));
    }
  };

  const handleReply = async (commentId: string) => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    try {
      await api.post(`/community/comments/${commentId}/reply`, {
        text: trimmed,
        userName: currentUserName ?? 'Usuario',
      });
      setReplyText('');
      setReplyingTo(null);
      await loadComments();
    } catch (err: any) {
      console.log('REPLY ERROR:', err.response?.status, JSON.stringify(err.response?.data));
      const msg = err.response?.data?.message;
      Alert.alert('Error', Array.isArray(msg) ? msg.join(', ') : (msg ?? 'No se pudo responder'));
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try { await api.post(`/community/comments/${commentId}/like`); } catch { }
  };

  const handleLike = () => {
    setLiked((v) => !v);
    setLikeCount((v) => liked ? v - 1 : v + 1);
    onLike(postId);
  };

  const handleDelete = () => {
    Alert.alert('Eliminar', '¿Eliminar esta publicación?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/community/posts/${postId}`);
            onDelete(postId);
          } catch { }
        },
      },
    ]);
  };

  return (
    <View style={pst.card}>
      <View style={pst.header}>
        <Pressable
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}
          onPress={() => {
            if (!post.userId) return;
            if (post.userId === currentUserId) {
              router.push('/perfil' as any);
            } else {
              router.push(`/perfil/${post.userId}` as any);
            }
          }}
        >
          <View style={pst.avatarCircle}>
            <Text style={pst.avatarText}>{initial}</Text>
          </View>
          <View style={pst.authorInfo}>
            <Text style={pst.authorName}>{resolvedAuthor}</Text>
            {timeStr ? <Text style={pst.timeText}>{timeStr}</Text> : null}
          </View>
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {isOwner && (
            <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
          <View style={[pst.badge, { backgroundColor: badgeColor + '33' }]}>
            <Text style={[pst.badgeText, { color: badgeColor }]}>{category}</Text>
          </View>
        </View>
      </View>

      {film ? <Text style={pst.film}>🎬 {film}</Text> : null}
      {description ? <Text style={pst.description}>{description}</Text> : null}

      <View style={pst.footer}>
        <TouchableOpacity style={pst.action} onPress={handleLike}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={16} color={liked ? '#ef4444' : Colors.TEXT_MUTED} />
          <Text style={pst.actionText}>{likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={pst.action} onPress={handleToggleComments}>
          <Ionicons name="chatbubble-outline" size={16} color={Colors.TEXT_MUTED} />
          <Text style={pst.actionText}>{getComments(post)}</Text>
        </TouchableOpacity>
      </View>

      {showComments && (
        <View style={cmst.section}>
          {loadingComments ? (
            <ActivityIndicator size="small" color={Colors.ACCENT_PRIMARY} />
          ) : (
            <>
              {comments.map((c: any, idx: number) => {
                const cId = c._id ?? c.id ?? `c-${idx}`;
                const cAuthor = getCommentAuthor(c);
                const cText = c.descripcion ?? c.contenido ?? c.text ?? '';
                const cInitial = cAuthor.charAt(0).toUpperCase();
                return (
                  <View key={cId} style={cmst.comment}>
                    <View style={cmst.commentAvatar}>
                      <Text style={cmst.commentAvatarText}>{cInitial}</Text>
                    </View>
                    <View style={cmst.commentBody}>
                      <Text style={cmst.commentAuthor}>{cAuthor}</Text>
                      <Text style={cmst.commentText}>{cText}</Text>
                      <View style={cmst.commentActions}>
                        <TouchableOpacity onPress={() => handleLikeComment(cId)}>
                          <Text style={cmst.commentAction}>❤ {c.likes ?? 0}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setReplyingTo(replyingTo === cId ? null : cId)}>
                          <Text style={cmst.commentAction}>Responder</Text>
                        </TouchableOpacity>
                      </View>
                      {(c.replies ?? []).map((r: any, rIdx: number) => (
                        <View key={r._id ?? rIdx} style={cmst.reply}>
                          <Text style={cmst.replyAuthor}>{getCommentAuthor(r)}</Text>
                          <Text style={cmst.replyText}>{r.descripcion ?? r.text ?? ''}</Text>
                        </View>
                      ))}
                      {replyingTo === cId && (
                        <View style={cmst.replyInput}>
                          <TextInput
                            style={cmst.input}
                            value={replyText}
                            onChangeText={setReplyText}
                            placeholder="Escribe una respuesta..."
                            placeholderTextColor={Colors.TEXT_MUTED}
                          />
                          <TouchableOpacity onPress={() => handleReply(cId)} style={cmst.sendBtn}>
                            <Ionicons name="send" size={16} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
              <View style={cmst.addComment}>
                <TextInput
                  style={[cmst.input, { flex: 1 }]}
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Escribe un comentario..."
                  placeholderTextColor={Colors.TEXT_MUTED}
                />
                <TouchableOpacity onPress={handleAddComment} style={cmst.sendBtn}>
                  <Ionicons name="send" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const pst = StyleSheet.create({
  card: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 10,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.ACCENT_PRIMARY,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  authorInfo: { flex: 1 },
  authorName: { color: Colors.TEXT_PRIMARY, fontWeight: '700', fontSize: 13 },
  timeText: { color: Colors.TEXT_MUTED, fontSize: 11, marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  film: { color: Colors.TEXT_SECONDARY, fontSize: 12 },
  description: { color: Colors.TEXT_PRIMARY, fontSize: 14, lineHeight: 20 },
  footer: { flexDirection: 'row', gap: 16, paddingTop: 4 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { color: Colors.TEXT_MUTED, fontSize: 12 },
});

// ── CreatePostModal component ──────────────────────────────
function CreatePostModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [category, setCategory] = useState('Discusión');
  const [text, setText] = useState('');
  const [film, setFilm] = useState('');
  const [contentType, setContentType] = useState<'movie' | 'series'>('movie');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Escribe algo en tu publicación');
      return;
    }
    setLoading(true);
    try {
      await api.post('/community/posts', {
        category,
        text: text.trim(),
        contentId: film.trim(),
        contentType,
      });
      onCreated();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'No se pudo publicar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={cst.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={cst.sheet}>
        <View style={cst.modalHeader}>
          <Text style={cst.modalTitle}>Crear Publicación</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={cst.label}>Categoría</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[cst.catBtn, category === cat && { backgroundColor: Colors.ACCENT_PRIMARY }]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[cst.catBtnText, category === cat && { color: '#fff' }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={cst.label}>Descripción</Text>
          <TextInput
            style={[cst.input, { height: 100, textAlignVertical: 'top' }]}
            value={text}
            onChangeText={setText}
            placeholder="Escribe tu publicación..."
            placeholderTextColor={Colors.TEXT_MUTED}
            multiline
            numberOfLines={4}
            maxLength={500}
          />

          <Text style={cst.label}>Película o Serie (opcional)</Text>
          <TextInput
            style={cst.input}
            value={film}
            onChangeText={setFilm}
            placeholder="Nombre de la película o serie"
            placeholderTextColor={Colors.TEXT_MUTED}
          />

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            {(['movie', 'series'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[cst.catBtn, contentType === t && { backgroundColor: Colors.ACCENT_PRIMARY }]}
                onPress={() => setContentType(t)}
              >
                <Text style={[cst.catBtnText, contentType === t && { color: '#fff' }]}>
                  {t === 'movie' ? 'Película' : 'Serie'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[cst.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={cst.submitText}>Publicar</Text>}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const cst = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: Colors.BG_SECONDARY,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.TEXT_PRIMARY },
  label: { fontSize: 12, fontWeight: '600', color: Colors.TEXT_SECONDARY, marginBottom: 8, textTransform: 'uppercase' },
  input: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
    marginBottom: 16,
  },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.BG_CARD,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  catBtnText: { color: Colors.TEXT_SECONDARY, fontSize: 13, fontWeight: '600' },
  submitBtn: {
    backgroundColor: Colors.ACCENT_PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

// ── Main Screen ────────────────────────────────────────────
export default function ComunidadScreen() {
  const { userId, username } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'top'>('feed');
  const [filmFilter, setFilmFilter] = useState('');
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

  const loadFeed = useCallback(async () => {
    try {
      const res = await api.get('/community/feed');
      const d = res.data;
      setPosts(Array.isArray(d) ? d : (d.posts ?? d.data ?? []));
    } catch (err: any) {
      console.log('Feed error:', err.response?.status, JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const onRefresh = () => { setRefreshing(true); loadFeed(); };

  const handleLike = async (postId: string) => {
    setPosts(prev => prev.map(p =>
      getPostId(p) === postId ? { ...p, likes: getLikes(p) + 1 } : p
    ));
    try { await api.post(`/community/posts/${postId}/like`); } catch { }
  };

  const handleDelete = (postId: string) => {
    setPosts(prev => prev.filter(p => getPostId(p) !== postId));
  };

  const handleCreated = async () => {
    setShowCreate(false);
    setLoading(true);
    await loadFeed();
  };

  const topPosts = [...posts].sort((a, b) => getLikes(b) - getLikes(a)).slice(0, 4);

  const groupMap: Record<string, number> = {};
  posts.forEach(p => {
    const cat = getCategory(p);
    groupMap[cat] = (groupMap[cat] || 0) + 1;
  });
  const groups = Object.entries(groupMap).slice(0, 3);

  const displayedPosts = (() => {
    let filtered = posts;
    if (activeCategory) {
      filtered = filtered.filter(p => getCategory(p) === activeCategory);
    }
    if (filmFilter.trim()) {
      const q = filmFilter.toLowerCase();
      filtered = filtered.filter(p =>
        getFilm(p).toLowerCase().includes(q) ||
        getDescription(p).toLowerCase().includes(q)
      );
    }
    if (activeTab === 'top') {
      filtered = [...filtered].sort((a, b) => getLikes(b) - getLikes(a));
    }
    return filtered;
  })();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.headerBar}>
        <Text style={styles.appName}>Comunidad</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
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
          data={displayedPosts}
          keyExtractor={(item, idx) => getPostId(item) || `post-${idx}`}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              currentUserId={userId ?? undefined}
              currentUserName={username ?? undefined}
              onLike={handleLike}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.ACCENT_PRIMARY} />
          }
          ListHeaderComponent={
            <View>
              <View style={styles.heroCard}>
                <View style={styles.heroIcon}>
                  <Ionicons name="people" size={32} color="#fff" />
                </View>
                <Text style={styles.heroTitle}>Comunidad Stave</Text>
                <Text style={styles.heroSub}>Conéctate con otros amantes del cine</Text>
              </View>

              <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)}>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.createBtnText}>Crear Publicación</Text>
              </TouchableOpacity>

              {topPosts.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Top</Text>
                  {topPosts.map((p, idx) => (
                    <View key={getPostId(p) || idx} style={[styles.topItem, idx === 0 && styles.topItemFirst]}>
                      <Text style={styles.topItemText} numberOfLines={1}>
                        🎬 {getFilm(p) || getDescription(p).slice(0, 40)}
                      </Text>
                      <Text style={styles.topItemCount}>{getLikes(p)} likes</Text>
                    </View>
                  ))}
                </View>
              )}

              {groups.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Grupos</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {groups.map(([name, count]) => (
                      <View key={name} style={styles.groupChip}>
                        <Text style={styles.groupChipText}>{name}</Text>
                        <Text style={styles.groupChipCount}>{count}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                {(['feed', 'top'] as const).map(tab => (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                      {tab === 'feed' ? 'Reciente' : 'Top'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    style={[styles.filterChip, !activeCategory && styles.filterChipActive]}
                    onPress={() => setActiveCategory(null)}
                  >
                    <Text style={[styles.filterChipText, !activeCategory && styles.filterChipTextActive]}>Todos</Text>
                  </TouchableOpacity>
                  {Object.keys(CATEGORY_COLORS).map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.filterChip, activeCategory === cat && styles.filterChipActive]}
                      onPress={() => setActiveCategory(activeCategory === cat ? null : cat)}
                    >
                      <Text style={[styles.filterChipText, activeCategory === cat && styles.filterChipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.searchRow}>
                <Ionicons name="search-outline" size={16} color={Colors.TEXT_MUTED} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  value={filmFilter}
                  onChangeText={setFilmFilter}
                  placeholder="Buscar por película o serie..."
                  placeholderTextColor={Colors.TEXT_MUTED}
                  clearButtonMode="while-editing"
                />
                {filmFilter ? (
                  <TouchableOpacity onPress={() => setFilmFilter('')}>
                    <Ionicons name="close-circle" size={16} color={Colors.TEXT_MUTED} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <Text style={styles.sectionTitle}>Publicaciones</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={52} color={Colors.TEXT_MUTED} />
              <Text style={styles.emptyTitle}>No hay publicaciones aún</Text>
              <Text style={styles.emptySub}>Sé el primero en crear una</Text>
              <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)}>
                <Text style={styles.createBtnText}>Crear Publicación</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {showCreate && (
        <CreatePostModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />
      )}

      <SlideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BG_PRIMARY },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_COLOR,
  },
  appName: { fontSize: 18, fontWeight: '700', color: Colors.TEXT_PRIMARY },
  listContent: { padding: 16, paddingBottom: 40 },

  heroCard: {
    backgroundColor: Colors.ACCENT_PRIMARY,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  heroIcon: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, textAlign: 'center' },

  createBtn: {
    backgroundColor: Colors.ACCENT_PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  createBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.TEXT_PRIMARY, marginBottom: 10 },

  topItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.BG_CARD,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  topItemFirst: { borderLeftWidth: 3, borderLeftColor: Colors.ACCENT_PRIMARY },
  topItemText: { color: Colors.TEXT_PRIMARY, fontSize: 13, flex: 1 },
  topItemCount: { color: Colors.TEXT_MUTED, fontSize: 12 },

  groupChip: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupChipText: { color: Colors.TEXT_PRIMARY, fontSize: 13, fontWeight: '600' },
  groupChipCount: { color: Colors.TEXT_MUTED, fontSize: 11 },

  emptyState: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyTitle: { color: Colors.TEXT_PRIMARY, fontSize: 16, fontWeight: '700' },
  emptySub: { color: Colors.TEXT_SECONDARY, fontSize: 13 },

  tabBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.BG_CARD, borderWidth: 1, borderColor: Colors.BORDER_COLOR },
  tabBtnActive: { backgroundColor: Colors.ACCENT_PRIMARY, borderColor: Colors.ACCENT_PRIMARY },
  tabBtnText: { color: Colors.TEXT_MUTED, fontSize: 13, fontWeight: '600' },
  tabBtnTextActive: { color: '#fff' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.BG_CARD, borderWidth: 1, borderColor: Colors.BORDER_COLOR },
  filterChipActive: { backgroundColor: Colors.ACCENT_PRIMARY, borderColor: Colors.ACCENT_PRIMARY },
  filterChipText: { color: Colors.TEXT_MUTED, fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BG_CARD,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.TEXT_PRIMARY,
  },
});
