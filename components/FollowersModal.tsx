import { api } from '@/api/config';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_H } = Dimensions.get('window');

interface FollowUser {
  _id: string;
  username: string;
  display_name?: string;
  avatarUrl?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  userId: string;
  type: 'followers' | 'following';
}

export default function FollowersModal({ visible, onClose, userId, type }: Props) {
  const { userId: myUserId } = useAuth();
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [myFollowing, setMyFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!visible) return;
    setLoading(true);

    const load = async () => {
      try {
        const [listRes, followingRes] = await Promise.allSettled([
          api.get(`/users/${userId}/${type}`),
          api.get(`/users/${myUserId}/following`),
        ]);
        if (listRes.status === 'fulfilled') {
          const d = listRes.value.data;
          setUsers(Array.isArray(d) ? d : (d.users ?? d.data ?? []));
        }
        if (followingRes.status === 'fulfilled') {
          const d = followingRes.value.data;
          const list: FollowUser[] = Array.isArray(d) ? d : (d.users ?? d.data ?? []);
          setMyFollowing(new Set(list.map((u) => u._id)));
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [visible, userId, type, myUserId]);

  const toggleFollow = async (targetId: string) => {
    if (toggling.has(targetId)) return;
    setToggling((prev) => new Set(prev).add(targetId));
    const alreadyFollowing = myFollowing.has(targetId);
    try {
      if (alreadyFollowing) {
        await api.post(`/users/${targetId}/unfollow`);
        setMyFollowing((prev) => {
          const next = new Set(prev);
          next.delete(targetId);
          return next;
        });
      } else {
        await api.post(`/users/${targetId}/follow`);
        setMyFollowing((prev) => new Set(prev).add(targetId));
      }
    } catch {
      // Silent fail — no crash
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
    }
  };

  const title = type === 'followers' ? 'Seguidores' : 'Siguiendo';

  const renderUser = ({ item }: { item: FollowUser }) => {
    const isMe = item._id === myUserId;
    const following = myFollowing.has(item._id);
    const busy = toggling.has(item._id);
    const initial = (item.display_name ?? item.username ?? '?').charAt(0).toUpperCase();

    return (
      <View style={st.row}>
        <View style={st.avatar}>
          <Text style={st.avatarText}>{initial}</Text>
        </View>
        <View style={st.info}>
          <Text style={st.displayName} numberOfLines={1}>
            {item.display_name ?? item.username}
          </Text>
          <Text style={st.username} numberOfLines={1}>@{item.username}</Text>
        </View>
        {!isMe && (
          <TouchableOpacity
            style={[st.followBtn, following && st.followBtnActive]}
            onPress={() => toggleFollow(item._id)}
            disabled={busy}
            activeOpacity={0.8}
          >
            {busy ? (
              <ActivityIndicator size="small" color={following ? Colors.ACCENT_PRIMARY : '#fff'} />
            ) : (
              <Text style={[st.followBtnText, following && st.followBtnTextActive]}>
                {following ? 'Siguiendo' : 'Seguir'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={st.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={[st.sheet, { paddingBottom: insets.bottom + 16, maxHeight: SCREEN_H * 0.75 }]}>
        <View style={st.header}>
          <Text style={st.headerTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={24} color={Colors.TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>
        <View style={st.divider} />

        {loading ? (
          <View style={st.centered}>
            <ActivityIndicator size="large" color={Colors.ACCENT_PRIMARY} />
          </View>
        ) : users.length === 0 ? (
          <View style={st.centered}>
            <Text style={st.emptyText}>Sin usuarios</Text>
          </View>
        ) : (
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(item, index) => item._id ?? item.username ?? index.toString()}
            removeClippedSubviews={false}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
          />
        )}
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: Colors.BG_SECONDARY,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.TEXT_PRIMARY },
  divider: { height: 1, backgroundColor: Colors.BORDER_COLOR, marginHorizontal: 20 },
  centered: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { color: Colors.TEXT_MUTED, fontSize: 14 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.ACCENT_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  info: { flex: 1 },
  displayName: { color: Colors.TEXT_PRIMARY, fontWeight: '700', fontSize: 14 },
  username: { color: Colors.TEXT_MUTED, fontSize: 12, marginTop: 1 },

  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.ACCENT_PRIMARY,
    minWidth: 80,
    alignItems: 'center',
  },
  followBtnActive: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.ACCENT_PRIMARY,
  },
  followBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  followBtnTextActive: { color: Colors.ACCENT_PRIMARY },
});
