import { api } from '@/api/config';
import { Colors } from '@/constants/theme';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  currentDisplayName: string;
  currentBio: string;
  currentAvatarUrl?: string;
  onSaved: (displayName: string, bio: string) => void;
}

export default function EditProfileModal({
  visible,
  onClose,
  currentDisplayName,
  currentBio,
  currentAvatarUrl,
  onSaved,
}: Props) {
  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [bio, setBio] = useState(currentBio);
  const [avatarUri, setAvatarUri] = useState(currentAvatarUrl ?? '');
  const [avatarBase64, setAvatarBase64] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setDisplayName(currentDisplayName);
      setBio(currentBio);
      setAvatarUri(currentAvatarUrl ?? '');
      setAvatarBase64('');
    }
  }, [visible, currentDisplayName, currentBio, currentAvatarUrl]);

  const initial = displayName.charAt(0).toUpperCase() || '?';

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setAvatarUri(asset.uri);
      if (asset.base64) {
        const mime = asset.mimeType ?? 'image/jpeg';
        setAvatarBase64(`data:${mime};base64,${asset.base64}`);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const body: any = {
        display_name: displayName.trim(),
        bio: bio.trim(),
      };
      if (avatarBase64) {
        body.avatarUrl = avatarBase64;
      } else if (avatarUri && avatarUri.startsWith('https://')) {
        body.avatarUrl = avatarUri;
      }
      await api.put('/users/profile', body);
      onSaved(displayName.trim(), bio.trim());
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      const detail = Array.isArray(msg) ? msg.join(', ') : (msg ?? 'No se pudo guardar');
      Alert.alert('Error', `${detail}`);
      console.log('Save error:', JSON.stringify(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.centeredView}>
        <View style={styles.card}>
          <Text style={styles.title}>Editar perfil</Text>

          {/* Avatar row */}
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImg} contentFit="cover" />
              ) : (
                <Text style={styles.avatarText}>{initial}</Text>
              )}
            </View>
            <View style={styles.avatarInfo}>
              <TouchableOpacity
                style={styles.pickImageBtn}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                <Text style={styles.pickImageText}>📷 Subir desde galería</Text>
              </TouchableOpacity>
              <Text style={styles.avatarUrlHint}>— o pega una URL —</Text>
              <TextInput
                style={styles.avatarUrlInput}
                value={avatarBase64 ? '' : avatarUri}
                onChangeText={(v) => { setAvatarUri(v); setAvatarBase64(''); }}
                placeholder="https://i.imgur.com/tu-foto.jpg"
                placeholderTextColor={Colors.TEXT_MUTED}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>
          </View>

          {/* Display name input */}
          <Text style={styles.label}>Nombre de usuario</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Tu nombre"
            placeholderTextColor={Colors.TEXT_MUTED}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={40}
          />

          {/* Bio input */}
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={bio}
            onChangeText={setBio}
            placeholder="Cuéntanos algo sobre ti..."
            placeholderTextColor={Colors.TEXT_MUTED}
            multiline
            numberOfLines={3}
            maxLength={160}
          />

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, loading && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.saveText}>Guardar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  centeredView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'box-none',
  },
  card: {
    width: '85%',
    backgroundColor: Colors.BG_CARD,
    borderRadius: 20,
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 20,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.ACCENT_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.TEXT_PRIMARY, fontSize: 24, fontWeight: '800' },
  avatarImg: { width: 60, height: 60, borderRadius: 30 },
  avatarInfo: { flex: 1, gap: 6 },
  avatarUrlInput: {
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
    color: Colors.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  avatarUrlHint: { color: Colors.TEXT_MUTED, fontSize: 11 },
  pickImageBtn: {
    backgroundColor: Colors.ACCENT_PRIMARY,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  pickImageText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.TEXT_SECONDARY,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.BG_SECONDARY,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
    marginBottom: 16,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  cancelText: { color: Colors.TEXT_SECONDARY, fontSize: 15, fontWeight: '600' },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.ACCENT_PRIMARY,
  },
  saveText: { color: Colors.TEXT_PRIMARY, fontSize: 15, fontWeight: '700' },
});
