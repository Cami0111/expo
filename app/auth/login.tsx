import { useAuth } from '@/context/auth-context';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { login } = useAuth();

  // El backend acepta username, no email — guardamos en "username"
  const [username, setUsername] = useState('');
  const [password, setPassword]   = useState('');
  const [keepSession, setKeepSession] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<{ username?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!username.trim()) e.username = 'Campo requerido';
    if (!password)        e.password  = 'Campo requerido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ username: username.trim(), password });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1, width: '100%', alignItems: 'center' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoWrapper}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>STAVE</Text>
            </View>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Iniciar sesión</Text>

            {/* Username / Correo */}
            <View style={styles.fieldWrapper}>
              <TextInput
                style={[styles.input, errors.username ? styles.inputError : null]}
                placeholder="Correo electrónico"
                placeholderTextColor="rgba(255,255,255,0.45)"
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={t => { setUsername(t); setErrors(e => ({ ...e, username: undefined })); }}
                returnKeyType="next"
              />
              {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
            </View>

            {/* Contraseña */}
            <View style={styles.fieldWrapper}>
              <TextInput
                style={[styles.input, errors.password ? styles.inputError : null]}
                placeholder="Contraseña"
                placeholderTextColor="rgba(255,255,255,0.45)"
                secureTextEntry
                value={password}
                onChangeText={t => { setPassword(t); setErrors(e => ({ ...e, password: undefined })); }}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Botón Ingresar */}
            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.btnText}>Ingresar</Text>
              }
            </TouchableOpacity>

            {/* Toggle mantener sesión */}
            <View style={styles.toggleRow}>
              <Switch
                value={keepSession}
                onValueChange={setKeepSession}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#34C759' }}
                thumbColor="#FFF"
                style={styles.switch}
              />
              <Text style={styles.toggleText}>Mantener la sesion iniciada por 30 dias.</Text>
            </View>

            {/* Link a registro */}
            <View style={styles.linkRow}>
              <Text style={styles.linkGray}>No tienes una cuenta ? </Text>
              <TouchableOpacity onPress={() => router.replace('/auth/register')}>
                <Text style={styles.linkPurple}>Registrate</Text>
              </TouchableOpacity>
            </View>

            {/* Estrella */}
            <Text style={styles.star}>★</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const BG      = '#1C0A3A';
const CARD_BG = '#3B1F6A';
const BTN     = '#6B2FA0';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
  },
  scroll: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: -50,
    zIndex: 10,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F0EEE8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#111',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111',
    letterSpacing: 2,
  },
  card: {
    width: width - 40,
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingTop: 70,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 28,
    textAlign: 'center',
  },
  fieldWrapper: {
    width: '100%',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.4)',
    paddingVertical: 10,
    paddingHorizontal: 2,
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputError: {
    borderBottomColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 11,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 2,
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: BTN,
    borderRadius: 40,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  switch: {
    marginRight: 8,
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
  toggleText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    flex: 1,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  linkGray: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  linkPurple: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  star: {
    fontSize: 28,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
});
