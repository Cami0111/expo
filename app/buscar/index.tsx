import SlideMenu from '@/components/slide-menu';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BuscarScreen() {
  const [query, setQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buscar</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="person-circle-outline" size={28} color={Colors.ACCENT_PRIMARY} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.TEXT_MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar peliculas, series..."
            placeholderTextColor={Colors.TEXT_MUTED}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.TEXT_MUTED} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.emptyState}>
          <View style={styles.iconWrap}>
            <Ionicons name="search-outline" size={44} color={Colors.ACCENT_PRIMARY} />
          </View>
          <Text style={styles.emptyTitle}>Busca tu proxima pelicula</Text>
          <Text style={styles.emptySub}>
            Escribe el titulo de una pelicula o serie para comenzar
          </Text>
        </View>
      </View>

      <SlideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.BG_PRIMARY },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_COLOR,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.TEXT_PRIMARY },
  container: { flex: 1, padding: 20 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.BG_CARD,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
    marginBottom: 32,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.TEXT_PRIMARY },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingBottom: 80,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Colors.ACCENT_PRIMARY + '28',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.TEXT_PRIMARY },
  emptySub: {
    fontSize: 14,
    color: Colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
  },
});
