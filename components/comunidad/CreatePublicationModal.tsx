import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useComunidad } from '@/context/comunidad-context';
import { useAuth } from '@/context/auth-context';

const GENEROS = [
  'Ester eggs',
  'Reseña',
  'Discusión',
  'Teoría',
  'Crítica',
  'Análisis',
  'Predicción',
  'Meme',
  'Fan Art',
  'Spoiler',
  'Recomendación',
  'Opinión',
  'Noticia',
  'Pregunta',
  'Trivia',
];

interface CreatePublicationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreatePublicationModal: React.FC<CreatePublicationModalProps> = ({ visible, onClose }) => {
  const { crearPublicacion } = useComunidad();
  const { userId } = useAuth();
  const [pelicula, setPelicula] = useState('');
  const [genero, setGenero] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGeneros, setShowGeneros] = useState(false);

  const handleCrear = async () => {
    if (!pelicula.trim()) {
      Alert.alert('Error', 'Selecciona una película');
      return;
    }
    if (!genero.trim()) {
      Alert.alert('Error', 'Selecciona un género');
      return;
    }
    if (!descripcion.trim()) {
      Alert.alert('Error', 'Escribe tu opinión');
      return;
    }

    setLoading(true);
    try {
      await crearPublicacion('Derik', userId || 'user_1', pelicula, genero, descripcion);
      setDescripcion('');
      setPelicula('');
      setGenero('');
      Alert.alert('Éxito', 'Publicación creada');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la publicación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={Colors.TEXT_PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.title}>Nueva Publicación</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Película */}
          <Text style={styles.label}>Película o Serie</Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe el nombre de la película o serie..."
            placeholderTextColor={Colors.TEXT_MUTED}
            value={pelicula}
            onChangeText={setPelicula}
          />

          {/* Género */}
          <Text style={[styles.label, { marginTop: 16 }]}>Tipo de comentario</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowGeneros(!showGeneros)}
          >
            <Text style={[styles.dropdownText, !genero && styles.placeholder]}>
              {genero || 'Selecciona un tipo'}
            </Text>
            <Ionicons name={showGeneros ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.ACCENT_PRIMARY} />
          </TouchableOpacity>
          {showGeneros && (
            <ScrollView style={styles.dropdownList} scrollEnabled nestedScrollEnabled>
              {GENEROS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setGenero(g);
                    setShowGeneros(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{g}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Descripción */}
          <Text style={[styles.label, { marginTop: 16 }]}>Tu opinión</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Escribe tu opinión, teoría o comentario..."
            placeholderTextColor={Colors.TEXT_MUTED}
            multiline
            numberOfLines={6}
            value={descripcion}
            onChangeText={setDescripcion}
          />

          {/* Botón */}
          <TouchableOpacity
            style={[styles.btnCrear, loading && { opacity: 0.6 }]}
            onPress={handleCrear}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnText}>Publicar</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_PRIMARY,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_COLOR,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
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
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.BG_CARD,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.TEXT_PRIMARY,
  },
  placeholder: {
    color: Colors.TEXT_MUTED,
  },
  dropdownList: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
    overflow: 'hidden',
    maxHeight: 280,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_COLOR,
  },
  dropdownItemText: {
    fontSize: 14,
    color: Colors.TEXT_PRIMARY,
  },
  textarea: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.TEXT_PRIMARY,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  btnCrear: {
    backgroundColor: Colors.ACCENT_PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
