import { useAuth } from '@/context/auth-context';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const MENU_WIDTH = Math.min(width * 0.78, 300);

const MENU_ITEMS = [
  { label: 'Principal', icon: 'home-outline', route: '/home/home', replace: true },
  { label: 'Buscar', icon: 'search-outline', route: '/buscar', replace: false },
  { label: 'Favoritos', icon: 'heart-outline', route: '/favoritos', replace: false },
  { label: 'Comunidad', icon: 'people-outline', route: '/comunidad', replace: false },
  { label: 'Perfil', icon: 'person-outline', route: '/perfil', replace: false },
] as const;

interface SlideMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function SlideMenu({ visible, onClose }: SlideMenuProps) {
  const { logout, userId } = useAuth();
  const insets = useSafeAreaInsets();
  const translateX = useRef(new Animated.Value(MENU_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.6,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: MENU_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const navigate = (route: string, replace = false) => {
    onClose();
    setTimeout(() => {
      if (replace) router.replace(route as any);
      else router.push(route as any);
    }, 50);
  };

  const handleLogout = () => {
    onClose();
    setTimeout(logout, 50);
  };

  const initials = userId ? userId.slice(0, 2).toUpperCase() : 'ST';

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.menu,
          { transform: [{ translateX }], paddingTop: insets.top + 16 },
        ]}
      >
        <View style={styles.menuHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.appName}>Stave</Text>
            <Text style={styles.appSub}>Cine · Critica · Comunidad</Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={22} color={Colors.TEXT_SECONDARY} />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.navItems}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.navItem}
              onPress={() => navigate(item.route, item.replace)}
              activeOpacity={0.7}
            >
              <View style={styles.navIconWrap}>
                <Ionicons name={item.icon as any} size={20} color={Colors.ACCENT_PRIMARY} />
              </View>
              <Text style={styles.navLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.TEXT_MUTED} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Cerrar sesion</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  menu: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: Colors.BG_PRIMARY,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.ACCENT_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.TEXT_PRIMARY,
    fontWeight: '700',
    fontSize: 16,
  },
  headerInfo: { flex: 1 },
  appName: {
    color: Colors.TEXT_PRIMARY,
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  appSub: {
    color: Colors.TEXT_SECONDARY,
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.BORDER_COLOR,
    marginHorizontal: 20,
    marginVertical: 8,
  },
  navItems: { paddingVertical: 8 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 13,
    gap: 14,
  },
  navIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.ACCENT_PRIMARY + '28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    flex: 1,
    color: Colors.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
    marginTop: 8,
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: '600',
  },
});
