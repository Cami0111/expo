import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '@/constants/colors';
import { publicationAPI, TopMovie } from '@/services/api';

interface TopMoviesListProps {
  onMoviePress: (movieName: string) => void;
}

export const TopMoviesList: React.FC<TopMoviesListProps> = ({ onMoviePress }) => {
  const [movies, setMovies] = useState<TopMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTopMovies();
  }, []);

  const loadTopMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await publicationAPI.getTopMovies(10);
      setMovies(response.data);
    } catch (err: any) {
      console.error('Error loading top movies:', err);
      setError('No se pudieron cargar las películas top');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadTopMovies}>
          <Text style={styles.retryBtnText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (movies.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay películas disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎬 Top Películas</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {movies.map((movie, index) => (
          <TouchableOpacity
            key={movie.movieName}
            style={styles.movieCard}
            onPress={() => onMoviePress(movie.movieName)}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>
                {movie.icon || ['🎬', '🎞️', '📽️', '🎭', '🌟', '✨', '🎪', '🎨', '🎯', '🏆'][index % 10]}
              </Text>
            </View>
            <Text style={styles.movieName} numberOfLines={2}>
              {movie.movieName}
            </Text>
            <Text style={styles.count}>{movie.count} posts</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
  movieCard: {
    width: 110,
    marginRight: 12,
    backgroundColor: COLORS.secondaryPurple,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.accent,
    alignItems: 'center',
  },
  iconContainer: {
    width: '100%',
    height: 60,
    backgroundColor: COLORS.activeState,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 32,
  },
  movieName: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  count: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: COLORS.darkBg,
    fontWeight: '700',
    fontSize: 13,
  },
  emptyContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
