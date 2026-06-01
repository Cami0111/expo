import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { PublicacionData, ComentarioData, ReplyData } from '@/services/comunidadAPI';

interface CommentSectionProps {
  publication: PublicacionData;
  currentUserId: string;
  onAddComment: (pubId: string, usuario: string, usuarioId: string, contenido: string) => Promise<void>;
  onToggleLike: (pubId: string, comId: string, usuarioId: string) => Promise<void>;
  onAddReply: (pubId: string, comId: string, usuario: string, usuarioId: string, respondiendo_a: string, contenido: string) => Promise<void>;
}

const CommentItem: React.FC<{
  comment: ComentarioData;
  publication: PublicacionData;
  currentUserId: string;
  onToggleLike: (pubId: string, comId: string, usuarioId: string) => Promise<void>;
  onAddReply: (pubId: string, comId: string, usuario: string, usuarioId: string, respondiendo_a: string, contenido: string) => Promise<void>;
  level?: number;
}> = ({ comment, publication, currentUserId, onToggleLike, onAddReply, level = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [liking, setLiking] = useState(false);

  const hasLiked = comment.usuariosQueLikearon.includes(currentUserId);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      await onToggleLike(publication.id, comment.id, currentUserId);
    } finally {
      setLiking(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await onAddReply(publication.id, comment.id, 'Derik', currentUserId, comment.usuario, replyText);
    setReplyText('');
    setShowReplyForm(false);
  };

  const marginLeft = level * 16;

  return (
    <View>
      <View style={[styles.comment, { marginLeft }]}>
        <TouchableOpacity
          style={styles.commentAvatar}
          onPress={() => router.push(`/perfil/${comment.usuarioId}`)}
        >
          <Text style={styles.avatarText}>{comment.usuario.charAt(0).toUpperCase()}</Text>
        </TouchableOpacity>
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <TouchableOpacity onPress={() => router.push(`/perfil/${comment.usuarioId}`)}>
              <Text style={styles.commentUsername}>{comment.usuario}</Text>
            </TouchableOpacity>
            <Text style={styles.commentTime}>{comment.timestamp}</Text>
          </View>
          <Text style={styles.commentText}>{comment.contenido}</Text>
          <View style={styles.commentActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike} disabled={liking}>
              <Text>{hasLiked ? '❤️' : '🤍'}</Text>
              <Text style={styles.actionCount}>{comment.likes}</Text>
            </TouchableOpacity>
            {level < 2 && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setShowReplyForm(!showReplyForm)}
              >
                <Ionicons name="chatbubble-outline" size={14} color={Colors.TEXT_SECONDARY} />
                <Text style={styles.actionText}>Responder</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Reply Form */}
      {showReplyForm && (
        <View style={[styles.replyForm, { marginLeft: marginLeft + 16 }]}>
          <TextInput
            style={styles.replyInput}
            placeholder={`Responder a ${comment.usuario}...`}
            placeholderTextColor={Colors.TEXT_MUTED}
            value={replyText}
            onChangeText={setReplyText}
          />
          <View style={styles.replyActions}>
            <TouchableOpacity
              style={[styles.replyBtn, !replyText.trim() && styles.replyBtnDisabled]}
              onPress={handleReply}
              disabled={!replyText.trim()}
            >
              <Text style={styles.replyBtnText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Nested Replies */}
      {comment.replies.map((reply) => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          publication={publication}
          currentUserId={currentUserId}
          onToggleLike={onToggleLike}
          onAddReply={onAddReply}
          level={level + 1}
          parentCommentId={comment.id}
        />
      ))}
    </View>
  );
};

const ReplyItem: React.FC<{
  reply: ReplyData;
  publication: PublicacionData;
  currentUserId: string;
  onToggleLike: (pubId: string, comId: string, usuarioId: string) => Promise<void>;
  onAddReply: (pubId: string, comId: string, usuario: string, usuarioId: string, respondiendo_a: string, contenido: string) => Promise<void>;
  level: number;
  parentCommentId: string;
}> = ({ reply, publication, currentUserId, onToggleLike, onAddReply, level, parentCommentId }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [liking, setLiking] = useState(false);

  const hasLiked = reply.usuariosQueLikearon.includes(currentUserId);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    try {
      await onToggleLike(publication.id, reply.id, currentUserId);
    } finally {
      setLiking(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    await onAddReply(publication.id, parentCommentId, 'Derik', currentUserId, reply.usuario, replyText);
    setReplyText('');
    setShowReplyForm(false);
  };

  const marginLeft = level * 16;

  return (
    <View>
      <View style={[styles.comment, { marginLeft }]}>
        <TouchableOpacity
          style={styles.commentAvatar}
          onPress={() => router.push(`/perfil/${reply.usuarioId}`)}
        >
          <Text style={styles.avatarText}>{reply.usuario.charAt(0).toUpperCase()}</Text>
        </TouchableOpacity>
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <TouchableOpacity onPress={() => router.push(`/perfil/${reply.usuarioId}`)}>
              <Text style={styles.commentUsername}>
                {reply.usuario} <Text style={styles.respondingTo}>respondiendo a {reply.respondiendo_a}</Text>
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.commentText}>{reply.contenido}</Text>
          <View style={styles.commentActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleLike} disabled={liking}>
              <Text>{hasLiked ? '❤️' : '🤍'}</Text>
              <Text style={styles.actionCount}>{reply.likes}</Text>
            </TouchableOpacity>
            {level < 3 && (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setShowReplyForm(!showReplyForm)}
              >
                <Ionicons name="chatbubble-outline" size={14} color={Colors.TEXT_SECONDARY} />
                <Text style={styles.actionText}>Responder</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {showReplyForm && (
        <View style={[styles.replyForm, { marginLeft: marginLeft + 16 }]}>
          <TextInput
            style={styles.replyInput}
            placeholder={`Responder a ${reply.usuario}...`}
            placeholderTextColor={Colors.TEXT_MUTED}
            value={replyText}
            onChangeText={setReplyText}
          />
          <View style={styles.replyActions}>
            <TouchableOpacity
              style={[styles.replyBtn, !replyText.trim() && styles.replyBtnDisabled]}
              onPress={handleReply}
              disabled={!replyText.trim()}
            >
              <Text style={styles.replyBtnText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {reply.replies.map((nestedReply) => (
        <ReplyItem
          key={nestedReply.id}
          reply={nestedReply}
          publication={publication}
          currentUserId={currentUserId}
          onToggleLike={onToggleLike}
          onAddReply={onAddReply}
          level={level + 1}
          parentCommentId={parentCommentId}
        />
      ))}
    </View>
  );
};

export const CommentSection: React.FC<CommentSectionProps> = ({
  publication,
  currentUserId,
  onAddComment,
  onToggleLike,
  onAddReply,
}) => {
  const [newComment, setNewComment] = useState('');
  const [adding, setAdding] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setAdding(true);
    try {
      await onAddComment(publication.id, 'Derik', currentUserId, newComment);
      setNewComment('');
    } finally {
      setAdding(false);
    }
  };

  return (
    <View style={styles.section}>
      {/* Formulario para nuevo comentario */}
      <View style={styles.newCommentForm}>
        <TextInput
          style={styles.newCommentInput}
          placeholder="Añade un comentario..."
          placeholderTextColor={Colors.TEXT_MUTED}
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !newComment.trim() && styles.sendBtnDisabled]}
          onPress={handleAddComment}
          disabled={adding || !newComment.trim()}
        >
          <Ionicons name="send" size={16} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Lista de comentarios */}
      {publication.comentarios.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          publication={publication}
          currentUserId={currentUserId}
          onToggleLike={onToggleLike}
          onAddReply={onAddReply}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER_COLOR,
  },
  newCommentForm: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  newCommentInput: {
    flex: 1,
    backgroundColor: Colors.BG_PRIMARY,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.TEXT_PRIMARY,
    maxHeight: 80,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.ACCENT_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  comment: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.ACCENT_PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUsername: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  respondingTo: {
    fontSize: 10,
    color: Colors.TEXT_SECONDARY,
    fontWeight: '400',
  },
  commentTime: {
    fontSize: 10,
    color: Colors.TEXT_SECONDARY,
  },
  commentText: {
    fontSize: 12,
    color: Colors.TEXT_PRIMARY,
    lineHeight: 16,
    marginBottom: 6,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 10,
    color: Colors.TEXT_SECONDARY,
  },
  actionText: {
    fontSize: 10,
    color: Colors.TEXT_SECONDARY,
  },
  replyForm: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    marginTop: -8,
  },
  replyInput: {
    flex: 1,
    backgroundColor: Colors.BG_PRIMARY,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    color: Colors.TEXT_PRIMARY,
    maxHeight: 60,
  },
  replyActions: {
    justifyContent: 'center',
  },
  replyBtn: {
    backgroundColor: Colors.ACCENT_PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  replyBtnDisabled: {
    opacity: 0.5,
  },
  replyBtnText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
