import { router } from 'expo-router';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Logo */}
      <View style={styles.logoWrapper}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>STAVE</Text>
        </View>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Aquí Puedes iniciar sesión{'\n'}de forma segura</Text>

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push('/auth/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push('/auth/register')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Registrarse</Text>
        </TouchableOpacity>

        {/* Star icon */}
        <Text style={styles.star}>★</Text>
      </View>
    </SafeAreaView>
  );
}

const BG       = '#1C0A3A';
const CARD_BG  = '#3B1F6A';
const BTN_LOGIN  = '#6B2FA0';
const BTN_REG    = '#5A2580';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
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
    paddingBottom: 30,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 22,
  },
  btnPrimary: {
    width: '100%',
    backgroundColor: BTN_LOGIN,
    borderRadius: 40,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  btnSecondary: {
    width: '100%',
    backgroundColor: BTN_REG,
    borderRadius: 40,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  star: {
    fontSize: 28,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
});
