import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { comunidadAPI } from '@/services/comunidadAPI';

interface TopSectionProps {
  publicaciones: any[];
}

export const TopMoviesSection: React.FC<TopSectionProps> = ({ publicaciones }) => {
  const [topMovies, setTopMovies] = useState<{ pelicula: string; menciones: number }[]>([]);

  useEffect(() => {
    const cargar = async () => {
      const data = await comunidadAPI.obtenerTopPeliculas(5);
      setTopMovies(data);
    };
    cargar();
  }, [publicaciones]);

  if (topMovies.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Top Películas</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.list}>
        {topMovies.map((movie, idx) => (
          <View key={idx} style={styles.item}>
            <View style={styles.icon}>
              <Text style={styles.iconText}>⭐</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.itemTitle} numberOfLines={2}>{movie.pelicula}</Text>
              <Text style={styles.itemCount}>{movie.menciones} menciones</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export const TopGenresSection: React.FC<TopSectionProps> = ({ publicaciones }) => {
  const [topGenres, setTopGenres] = useState<{ genero: string; cantidad: number }[]>([]);

  useEffect(() => {
    const cargar = async () => {
      const data = await comunidadAPI.obtenerTopGeneros(4);
      setTopGenres(data);
    };
    cargar();
  }, [publicaciones]);

  const genreIcons: Record<string, string> = {
    'Ester eggs': '🥚',
    'Reseña': '✍️',
    'Discusión': '💬',
    'Teoría': '🔍',
    'Crítica': '⭐',
  };

  const genreColors: Record<string, string> = {
    'Ester eggs': '#FF6B6B',
    'Reseña': '#4ECDC4',
    'Discusión': '#45B7D1',
    'Teoría': '#FFA07A',
    'Crítica': '#98D8C8',
  };

  if (topGenres.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Géneros Populares</Text>
      <View style={styles.grid}>
        {topGenres.map((genre, idx) => (
          <View
            key={idx}
            style={[
              styles.genreItem,
              {
                backgroundColor: genreColors[genre.genero] + '20',
                borderColor: genreColors[genre.genero],
              },
            ]}
          >
            <Text style={styles.genreIcon}>{genreIcons[genre.genero]}</Text>
            <Text style={styles.genreTitle}>{genre.genero}</Text>
            <Text style={[styles.genreCount, { color: genreColors[genre.genero] }]}>
              {genre.cantidad}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  list: {
    flexDirection: 'row',
  },
  item: {
    backgroundColor: Colors.BG_CARD,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 140,
    borderWidth: 1,
    borderColor: Colors.BORDER_COLOR,
  },
  icon: {
    fontSize: 28,
    marginBottom: 8,
  },
  iconText: {
    fontSize: 28,
  },
  info: {
    gap: 4,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
  },
  itemCount: {
    fontSize: 11,
    color: Colors.TEXT_SECONDARY,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  genreItem: {
    flex: 1,
    minWidth: '48%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  genreIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  genreTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.TEXT_PRIMARY,
    textAlign: 'center',
  },
  genreCount: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
});
