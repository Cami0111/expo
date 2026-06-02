import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn('Error retrieving auth token:', error);
  }
  return config;
});

export interface Publication {
  _id: string;
  movieName: string;
  category: 'Discusión' | 'Crítica' | 'Teoría' | 'Noticias';
  text: string;
  userId: string;
  username: string;
  likes: number;
  replies: number;
  views: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePublicationData {
  movieName: string;
  category: 'Discusión' | 'Crítica' | 'Teoría' | 'Noticias';
  text: string;
  userId: string;
}

export interface TopMovie {
  movieName: string;
  count: number;
  icon?: string;
}

export interface Reply {
  _id: string;
  parentId: string;
  text: string;
  userId: string;
  username: string;
  createdAt: string;
}

export const publicationAPI = {
  // Create a new publication
  create: async (data: CreatePublicationData) => {
    return apiClient.post('/publications', data);
  },

  // Get all publications (paginated)
  getAll: async (page = 1, limit = 20) => {
    return apiClient.get('/publications', {
      params: { page, limit },
    });
  },

  // Get top movies
  getTopMovies: async (limit = 10) => {
    return apiClient.get('/publications/top-movies', {
      params: { limit },
    });
  },

  // Toggle like on a publication
  toggleLike: async (publicationId: string, userId: string) => {
    return apiClient.post(`/publications/${publicationId}/like`, { userId });
  },

  // Post a reply to a publication
  addReply: async (publicationId: string, data: { text: string; userId: string }) => {
    return apiClient.post(`/publications/${publicationId}/replies`, data);
  },

  // Get replies for a publication
  getReplies: async (publicationId: string) => {
    return apiClient.get(`/publications/${publicationId}/replies`);
  },

  // Get publications by movie name
  getByMovieName: async (movieName: string, page = 1, limit = 20) => {
    return apiClient.get(`/publications/movie/${movieName}`, {
      params: { page, limit },
    });
  },
};

export default apiClient;
