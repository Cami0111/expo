import { api, BASE_URL } from '@/api/config';
import SlideMenu from '@/components/slide-menu';
import { useAuth } from '@/context/auth-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG = '#1C0A3A';
const SURFACE = '#2A1050';
const PILL_ACTIVE = '#5B21B6';
const CARD_BG = '#C4C4C4';
const CARD_SURFACE = '#2A1550';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = '#C4B5FD';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = (SCREEN_W - 48 - 24) / 3;
const CARD_H = CARD_W * 1.35;

const TABS = ['Películas', 'Series'] as const;
type Tab = (typeof TABS)[number];

interface ContentItem {
  id: string;
  _id?: string;
  title: string;
  type: 'movie' | 'series';
  genre?: string;
  year?: number;
  thumbnailUrl?: string;
}

function useHomeData(token: string | null) {
  const [trending, setTrending] = useState<ContentItem[]>([]);
  const [recommended, setRecommended] = useState<ContentItem[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/home/trending`)
      .then(r => r.json())
      .then((data: any) => setTrending(Array.isArray(data) ? data : []))
      .catch(() => setTrending([]))
      .finally(() => setLoadingTrending(false));
  }, []);

  useEffect(() => {
    if (!token) {
      setLoadingRecommended(false);
      return;
    }
    fetch(`${BASE_URL}/home/recommended`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then((data: any) => setRecommended(Array.isArray(data) ? data : []))
      .catch(() => setRecommended([]))
      .finally(() => setLoadingRecommended(false));
  }, [token]);

  return { trending, recommended, loadingTrending, loadingRecommended };
}

export default function HomeScreen() {
  const { token, username } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('Películas');
  const [menuVisible, setMenuVisible] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api.get('/users/profile')
      .then(res => { if (res.data?.avatarUrl) setAvatarUrl(res.data.avatarUrl); })
      .catch(() => {});
  }, [token]);

  const { trending, recommended, loadingTrending, loadingRecommended } =
    useHomeData(token);

  const filterByTab = (items: ContentItem[]) => {
    if (activeTab === 'Películas') return items.filter(i => i.type === 'movie');
    if (activeTab === 'Series') return items.filter(i => i.type === 'series');
    return items;
  };

  const trendingFiltered = filterByTab(trending);
  const recommendedFiltered = filterByTab(recommended);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Stave</Text>
        <TouchableOpacity
          style={styles.avatarBtn}
          activeOpacity={0.7}
          onPress={() => setMenuVisible(true)}
        >
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={{ width: 44, height: 44, borderRadius: 22 }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person-circle-outline" size={36} color={TEXT_SECONDARY} />
          )}
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabPill, activeTab === tab && styles.tabPillActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Bienvenida */}
        <View style={styles.bubbleRow}>
          <View style={styles.bubble} />
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeLine1}>
              Hola <Text style={styles.welcomeUsername}>{username ?? 'usuario'}</Text>,
            </Text>
            <Text style={styles.welcomeLine2}>que te gustaría ver hoy?</Text>
          </View>
        </View>

        {/* Seguir viendo — si no hay recomendados usa trending */}
        <SectionBlock
          title="Seguir viendo"
          items={recommendedFiltered.length > 0 ? recommendedFiltered : trendingFiltered}
          loading={loadingRecommended || loadingTrending}
        />

        {/* Tendencia */}
        <SectionBlock
          title="Tendencia"
          items={trendingFiltered}
          loading={loadingTrending}
        />
      </ScrollView>

      <SlideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

function SectionBlock({
  title,
  items,
  loading,
}: {
  title: string;
  items: ContentItem[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <ActivityIndicator color={TEXT_SECONDARY} style={{ marginVertical: 16 }} />
      </View>
    );
  }

  if (items.length === 0) return null; // no mostrar placeholders grises

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.cardsRow}>
          {items.map((item) => (
            <TouchableOpacity
              key={item._id ?? item.id}
              style={styles.cardWrapper}
              activeOpacity={0.8}
              onPress={() =>
                router.push((`/pelicula/${item._id ?? item.id}`) as any)
              }
            >
              {item.thumbnailUrl ? (
                <Image
                  source={{ uri: item.thumbnailUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.cardImage, { backgroundColor: '#3D1F6E' }]} />
              )}
              <Text style={styles.cardLabel} numberOfLines={1}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 4,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  tabPillActive: { backgroundColor: PILL_ACTIVE },
  tabLabel: { fontSize: 14, fontWeight: '600', color: TEXT_SECONDARY },
  tabLabelActive: { color: TEXT_PRIMARY },

  scroll: { paddingBottom: 40 },

  bubbleRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 36,
  },
  welcomeText: {
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  welcomeLine1: {
    fontSize: 20,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    lineHeight: 28,
  },
  welcomeUsername: {
    fontWeight: '700',
    color: TEXT_SECONDARY,
  },
  welcomeLine2: {
    fontSize: 20,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    lineHeight: 28,
  },
  bubble: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: 'rgba(80, 30, 140, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.15)',
  },

  section: {
    paddingHorizontal: 16,
    marginBottom: 28,
    backgroundColor: CARD_SURFACE,
    borderRadius: 16,
    paddingVertical: 14,
    marginHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 12,
    marginLeft: 4,
  },
  cardsRow: { flexDirection: 'row', gap: 8 },

  cardWrapper: { width: CARD_W },
  cardImage: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 10,
    backgroundColor: CARD_BG,
    marginBottom: 6,
  },
  cardLabel: { fontSize: 11, color: TEXT_PRIMARY, fontWeight: '500' },
});