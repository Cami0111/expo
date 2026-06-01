import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { publicationAPI } from '@/services/api';

interface ReplyModalProps {
  visible: boolean;
  publicationId: string | null;
  movieName?: string;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  username: string;
}

export const ReplyModal: React.FC<ReplyModalProps> = ({
  visible,
  publicationId,
  movieName = '',
  onClose,
  onSuccess,
  userId,
  username,
}) => {
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!replyText.trim() || !publicationId) {
      Alert.alert('Error', 'Por favor escribe una respuesta');
      return;
    }

    setLoading(true);
    try {
      await publicationAPI.addReply(publicationId, {
        text: replyText.trim(),
        userId,
      });

      Alert.alert('Éxito', '¡Respuesta publicada!');
      setReplyText('');
      onClose();
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'No se pudo publicar la respuesta.';
      Alert.alert('Error', message);
      console.error('Error posting reply:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReplyText('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Responder</Text>
              {movieName && (
                <Text style={styles.subtitle}>Sobre: {movieName}</Text>
              )}
            </View>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* User Info */}
            <View style={styles.userSection}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>
                  {username.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.userName}>{username}</Text>
            </View>

            {/* Reply Input */}
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Escribe tu respuesta..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={6}
              value={replyText}
              onChangeText={setReplyText}
              editable={!loading}
              textAlignVertical="top"
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.darkBg} size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Responder</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    flex: 0.65,
    backgroundColor: COLORS.darkBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.accent,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  closeBtn: {
    fontSize: 28,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userAvatar: {
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
  userName: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    backgroundColor: COLORS.secondaryPurple,
    borderRadius: 12,
    padding: 15,
    color: COLORS.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  textArea: {
    minHeight: 120,
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: COLORS.darkBg,
    fontSize: 16,
    fontWeight: '700',
  },
});
