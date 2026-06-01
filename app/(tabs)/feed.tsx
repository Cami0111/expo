import { CreatePublicationModal } from '@/components/publications/CreatePublicationModal';
import { PublicationCard } from '@/components/publications/PublicationCard';
import { ReplyModal } from '@/components/publications/ReplyModal';
import { TopMoviesList } from '@/components/publications/TopMoviesList';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/context/auth-context';
import { usePublications } from '@/hooks/usePublications';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function FeedScreen() {
  const { userId, isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    publications,
    loading,
    error,
    loadPublications,
    refreshPublications,
    updateLike,
  } = usePublications({ page: 1, limit: 20 });

  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedPublicationId, setSelectedPublicationId] = useState<string | null>(null);
  const [selectedMovieName, setSelectedMovieName] = useState('');

  useEffect(() => {
    loadPublications();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPublications();
    setRefreshing(false);
  };

  const handleCreateSuccess = async () => {
    setCreateModalVisible(false);
    await loadPublications();
  };

  const handleReplyPress = (publicationId: string, movieName: string) => {
    setSelectedPublicationId(publicationId);
    setSelectedMovieName(movieName);
    setReplyModalVisible(true);
  };

  const handleReplySuccess = async () => {
    setReplyModalVisible(false);
    await refreshPublications();
  };

  const handleMoviePress = (movieName: string) => {
    console.log('Movie pressed:', movieName);
  };

  if ((loading || authLoading) && publications.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Por favor inicia sesión</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Feed de Películas',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.textPrimary,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
        }}
      />

      {/* Create Publication Button */}
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => setCreateModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.createBtnIcon}>+</Text>
        <Text style={styles.createBtnText}>Crear Publicación</Text>
      </TouchableOpacity>

      {/* Error State */}
      {error && !loading && publications.length === 0 && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadPublications()}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Publications Feed */}
      {publications.length > 0 ? (
        <FlatList
          data={publications}
          renderItem={({ item }) => (
            <PublicationCard
              publication={item}
              currentUserId={userId || 'unknown'}
              onReply={(id) => handleReplyPress(id, item.movieName)}
              onLikeChange={updateLike}
            />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<TopMoviesList onMoviePress={handleMoviePress} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay publicaciones</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.accent}
              progressBackgroundColor={COLORS.darkBg}
            />
          }
          scrollIndicatorInsets={{ right: 1 }}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <TopMoviesList onMoviePress={handleMoviePress} />
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📽️</Text>
            <Text style={styles.emptyText}>Sé el primero en publicar</Text>
            <Text style={styles.emptySubText}>
              Crea una publicación sobre tu película favorita
            </Text>
          </View>
        </View>
      )}

      {/* Create Publication Modal */}
      <CreatePublicationModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSuccess={handleCreateSuccess}
        userId={userId || 'unknown'}
        username="Usuario"
      />

      {/* Reply Modal */}
      <ReplyModal
        visible={replyModalVisible}
        publicationId={selectedPublicationId}
        movieName={selectedMovieName}
        onClose={() => setReplyModalVisible(false)}
        onSuccess={handleReplySuccess}
        userId={userId || 'unknown'}
        username="Usuario"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  createBtn: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  createBtnIcon: {
    fontSize: 24,
    color: COLORS.darkBg,
    fontWeight: 'bold',
  },
  createBtnText: {
    color: COLORS.darkBg,
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryBtnText: {
    color: COLORS.darkBg,
    fontWeight: '700',
    fontSize: 14,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
