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

export default function RegisterScreen() {
  const { register } = useAuth();

  const [username, setUsername]         = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirm]   = useState('');
  const [acceptTerms, setAcceptTerms]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [errors, setErrors]             = useState<Record<string, string>>({});

  const clearError = (key: string) => setErrors(e => { const n = { ...e }; delete n[key]; return n; });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!username.trim())                    e.username = 'Campo requerido';
    if (!email.trim())                       e.email    = 'Campo requerido';
    else if (!/\S+@\S+\.\S+/.test(email))   e.email    = 'Email inválido';
    if (!password)                           e.password = 'Campo requerido';
    else if (password.length < 6)            e.password = 'M\u00ednimo 6 caracteres';
    if (password !== confirmPassword)        e.confirm  = 'Las contrase\u00f1as no coinciden';
    if (!acceptTerms)                        e.terms    = 'Debes aceptar los t\u00e9rminos';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error al registrarse', err.message ?? 'Ocurri\u00f3 un error inesperado');
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
            <Text style={styles.title}>Registrarse</Text>

            {/* Usuario */}
            <View style={styles.fieldWrapper}>
              <TextInput
                style={[styles.input, errors.username ? styles.inputError : null]}
                placeholder="Usuario"
                placeholderTextColor="rgba(255,255,255,0.45)"
                autoCapitalize="none"
                autoCorrect={false}
                value={username}
                onChangeText={t => { setUsername(t); clearError('username'); }}
                returnKeyType="next"
              />
              {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
            </View>

            {/* Email */}
            <View style={styles.fieldWrapper}>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                placeholder="Correo electrónico"
                placeholderTextColor="rgba(255,255,255,0.45)"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={email}
                onChangeText={t => { setEmail(t); clearError('email'); }}
                returnKeyType="next"
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            {/* Contrase\u00f1a */}
            <View style={styles.fieldWrapper}>
              <TextInput
                style={[styles.input, errors.password ? styles.inputError : null]}
                placeholder="Contraseña"
                placeholderTextColor="rgba(255,255,255,0.45)"
                secureTextEntry
                value={password}
                onChangeText={t => { setPassword(t); clearError('password'); }}
                returnKeyType="next"
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Confirmar contrase\u00f1a */}
            <View style={styles.fieldWrapper}>
              <TextInput
                style={[styles.input, errors.confirm ? styles.inputError : null]}
                placeholder="Confirmar contraseña"
                placeholderTextColor="rgba(255,255,255,0.45)"
                secureTextEntry
                value={confirmPassword}
                onChangeText={t => { setConfirm(t); clearError('confirm'); }}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              {errors.confirm ? <Text style={styles.errorText}>{errors.confirm}</Text> : null}
            </View>

            {/* Bot\u00f3n Registrarse */}
            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.btnText}>Registrarse</Text>
              }
            </TouchableOpacity>

            {/* Toggle t\u00e9rminos */}
            <View style={styles.toggleRow}>
              <Switch
                value={acceptTerms}
                onValueChange={v => { setAcceptTerms(v); clearError('terms'); }}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#34C759' }}
                thumbColor="#FFF"
                style={styles.switch}
              />
              <Text style={[styles.toggleText, errors.terms ? styles.toggleTextError : null]}>
                Aceptas terminos y condiciones
              </Text>
            </View>

            {/* Link a login */}
            <View style={styles.linkRow}>
              <Text style={styles.linkGray}>Ya tienes una cuenta ? </Text>
              <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                <Text style={styles.linkPurple}>Inicia Sesion</Text>
              </TouchableOpacity>
            </View>

            {/* Estrella */}
            <Text style={styles.star}> ★ </Text>
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
    marginBottom: 20,
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
  toggleTextError: {
    color: '#FF6B6B',
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
