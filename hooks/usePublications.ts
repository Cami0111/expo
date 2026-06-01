import { useState, useCallback } from 'react';
import { publicationAPI, Publication } from '@/services/api';

interface UsePublicationsOptions {
  page?: number;
  limit?: number;
}

export const usePublications = (options: UsePublicationsOptions = {}) => {
  const { page = 1, limit = 20 } = options;
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(page);

  const loadPublications = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await publicationAPI.getAll(pageNum, limit);
      setPublications(response.data);
      setCurrentPage(pageNum);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Error al cargar publicaciones';
      setError(message);
      console.error('Error loading publications:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const refreshPublications = useCallback(async () => {
    await loadPublications(currentPage);
  }, [currentPage, loadPublications]);

  const updateLike = useCallback((publicationId: string, newLikeCount: number) => {
    setPublications((prev) =>
      prev.map((pub) =>
        pub._id === publicationId ? { ...pub, likes: newLikeCount } : pub
      )
    );
  }, []);

  const removePublication = useCallback((publicationId: string) => {
    setPublications((prev) => prev.filter((pub) => pub._id !== publicationId));
  }, []);

  return {
    publications,
    loading,
    error,
    currentPage,
    loadPublications,
    refreshPublications,
    updateLike,
    removePublication,
  };
};
