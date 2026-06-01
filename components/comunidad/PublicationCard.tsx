import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { PublicacionData } from '@/services/comunidadAPI';
import { useComunidad } from '@/context/comunidad-context';
import { CommentSection } from './CommentSection';

interface PublicationCardProps {
  publication: PublicacionData;
  currentUserId: string;
}

const GENRE_COLORS: Record<string, string> = {
  'Ester eggs': '#FF6B6B',
  'Reseña': '#4ECDC4',
  'Discusión': '#45B7D1',
  'Teoría': '#FFA07A',
  'Crítica': '#98D8C8',
};

export const PublicationCard: React.FC<PublicationCardProps> = ({
  publication,
  currentUserId,
}) => {
  const { toggleLikePublicacion, agregarComentario, toggleLikeComentario, agregarReply } = useComunidad();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [liking, setLiking] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const hasLiked = publication.usuariosQueLikearon.includes(currentUserId);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await toggleLikePublicacion(publication.id, currentUserId);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLiking(false);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => router.push(`/perfil/${publication.usuarioId}`)}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{publication.usuario.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>{publication.usuario}</Text>
            <Text style={styles.timestamp}>{publication.timestamp}</Text>
          </View>
        </TouchableOpacity>
        <View style={[styles.genreBadge, { backgroundColor: GENRE_COLORS[publication.genero] }]}>
          <Text style={styles.genreText}>{publication.genero}</Text>
        </View>
      </View>

      {/* Movie */}
      <View style={styles.movieSection}>
        <Text style={styles.movieIcon}>⭐</Text>
        <Text style={styles.movieName}>{publication.pelicula}</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>{publication.descripcion}</Text>

      {/* Interactions */}
      <View style={styles.interactions}>
        <TouchableOpacity
          style={styles.interactionBtn}
          onPress={handleLike}
          disabled={liking}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Text style={styles.interactionIcon}>{hasLiked ? '❤️' : '🤍'}</Text>
          </Animated.View>
          <Text style={styles.interactionCount}>{publication.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.interactionBtn}
          onPress={() => setShowComments(!showComments)}
        >
          <Text style={styles.interactionIcon}>💬</Text>
          <Text style={styles.interactionCount}>{publication.comentarios.length}</Text>
        </TouchableOpacity>
      </View>

      {/* Comments Section */}
      {showComments && (
        <CommentSection
          publication={publication}
          currentUserId={currentUserId}
          onAddComment={agregarComentario}
          onToggleLike={toggleLikeComentario}
          onAddReply={agregarReply}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
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
    backgroundColor: Colors.ACCENT_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    color: Colors.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 14,
  },
  timestamp: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 12,
    marginTop: 2,
  },
  genreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  genreText: {
    color: '#FFF',
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
    color: Colors.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 14,
  },
  description: {
    color: Colors.TEXT_PRIMARY,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  interactions: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER_COLOR,
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
    color: Colors.TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '600',
  },
});
