import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { COLORS, CATEGORY_COLORS } from '@/constants/colors';
import { publicationAPI, Publication } from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface PublicationCardProps {
  publication: Publication;
  currentUserId: string;
  onReply: (publicationId: string) => void;
  onLikeChange: (publicationId: string, newCount: number) => void;
  onRefresh?: () => void;
}

export const PublicationCard: React.FC<PublicationCardProps> = ({
  publication,
  currentUserId,
  onReply,
  onLikeChange,
  onRefresh,
}) => {
  const [localLikes, setLocalLikes] = useState(publication.likes);
  const [hasLiked, setHasLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(publication.createdAt), {
    addSuffix: true,
    locale: es,
  });

  const handleLike = async () => {
    if (liking) return;

    setLiking(true);
    const newCount = hasLiked ? localLikes - 1 : localLikes + 1;
    setLocalLikes(newCount);
    setHasLiked(!hasLiked);

    try {
      await publicationAPI.toggleLike(publication._id, currentUserId);
      onLikeChange(publication._id, newCount);
    } catch (error) {
      // Revert on error
      setLocalLikes(localLikes);
      setHasLiked(!hasLiked);
      Alert.alert('Error', 'No se pudo procesar el like');
      console.error('Error liking publication:', error);
    } finally {
      setLiking(false);
    }
  };

  const categoryColor = CATEGORY_COLORS[publication.category] || COLORS.accent;

  return (
    <View style={styles.card}>
      {/* Header with user info */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {publication.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>{publication.username}</Text>
            <Text style={styles.time}>{timeAgo}</Text>
          </View>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryText}>{publication.category}</Text>
        </View>
      </View>

      {/* Movie Name Section */}
      <View style={styles.movieSection}>
        <Text style={styles.movieIcon}>⭐</Text>
        <Text style={styles.movieName}>{publication.movieName}</Text>
      </View>

      {/* Comment/Review Text */}
      <Text style={styles.commentText}>{publication.text}</Text>

      {/* Interactions */}
      <View style={styles.interactions}>
        <TouchableOpacity
          style={styles.interactionBtn}
          onPress={handleLike}
          disabled={liking}
          activeOpacity={0.7}
        >
          <Text style={styles.interactionIcon}>{hasLiked ? '👍' : '🤍'}</Text>
          <Text style={styles.interactionCount}>{localLikes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionBtn}
          onPress={() => onReply(publication._id)}
          activeOpacity={0.7}
        >
          <Text style={styles.interactionIcon}>💬</Text>
          <Text style={styles.interactionCount}>{publication.replies}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.interactionBtn} activeOpacity={0.7}>
          <Text style={styles.interactionIcon}>👁️</Text>
          <Text style={styles.interactionCount}>{publication.views}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.secondaryPurple,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.darkBg,
    fontWeight: '700',
    fontSize: 16,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  time: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  categoryText: {
    color: COLORS.darkBg,
    fontWeight: '600',
    fontSize: 11,
  },
  movieSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  movieIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  movieName: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  commentText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  interactions: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.textTertiary,
  },
  interactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  interactionIcon: {
    fontSize: 16,
  },
  interactionCount: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
});
