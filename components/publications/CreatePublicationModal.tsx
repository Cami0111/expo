import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { publicationAPI } from '@/services/api';

const CATEGORIES = ['Discusión', 'Crítica', 'Teoría', 'Noticias'];

interface CreatePublicationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  username: string;
}

export const CreatePublicationModal: React.FC<CreatePublicationModalProps> = ({
  visible,
  onClose,
  onSuccess,
  userId,
  username,
}) => {
  const [movieName, setMovieName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'Discusión' | 'Crítica' | 'Teoría' | 'Noticias'>('Discusión');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!movieName.trim() || !comment.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await publicationAPI.create({
        movieName: movieName.trim(),
        category: selectedCategory,
        text: comment.trim(),
        userId,
      });

      Alert.alert('Éxito', '¡Publicación creada exitosamente!');
      setMovieName('');
      setComment('');
      setSelectedCategory('Discusión');
      onClose();
      onSuccess();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'No se pudo crear la publicación. Intenta de nuevo.';
      Alert.alert('Error', message);
      console.error('Error creating publication:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMovieName('');
    setComment('');
    setSelectedCategory('Discusión');
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
            <Text style={styles.title}>Crear Publicación</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Movie Name Input */}
            <Text style={styles.label}>Nombre de la película</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Echoes Tomorrow"
              placeholderTextColor={COLORS.textSecondary}
              value={movieName}
              onChangeText={setMovieName}
              editable={!loading}
            />

            {/* Category Selection */}
            <Text style={styles.label}>Categoría</Text>
            <View style={styles.categoryContainer}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryBtn,
                    selectedCategory === cat && styles.categoryBtnActive,
                  ]}
                  onPress={() => setSelectedCategory(cat as any)}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === cat && styles.categoryTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment Text Area */}
            <Text style={styles.label}>Tu comentario</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Escribe tu opinión, análisis o comentario..."
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={6}
              value={comment}
              onChangeText={setComment}
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
                <Text style={styles.submitBtnText}>Publicar</Text>
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
    flex: 0.85,
    backgroundColor: COLORS.darkBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  closeBtn: {
    fontSize: 28,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
    marginBottom: 10,
    marginTop: 16,
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
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.secondaryPurple,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  categoryBtnActive: {
    backgroundColor: COLORS.activeState,
    borderColor: COLORS.textPrimary,
  },
  categoryText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.textPrimary,
  },
  submitBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
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
