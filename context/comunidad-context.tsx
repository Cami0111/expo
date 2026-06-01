import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { comunidadAPI, PublicacionData } from '@/services/comunidadAPI';

interface ComunidadContextType {
  publicaciones: PublicacionData[];
  isLoading: boolean;
  crearPublicacion: (usuario: string, usuarioId: string, pelicula: string, genero: string, descripcion: string) => Promise<void>;
  toggleLikePublicacion: (pubId: string, usuarioId: string) => Promise<void>;
  agregarComentario: (pubId: string, usuario: string, usuarioId: string, contenido: string) => Promise<void>;
  agregarReply: (pubId: string, comId: string, usuario: string, usuarioId: string, respondiendo_a: string, contenido: string) => Promise<void>;
  toggleLikeComentario: (pubId: string, comId: string, usuarioId: string) => Promise<void>;
  refrescar: () => Promise<void>;
}

const ComunidadContext = createContext<ComunidadContextType | undefined>(undefined);

export function ComunidadProvider({ children }: { children: ReactNode }) {
  const [publicaciones, setPublicaciones] = useState<PublicacionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar publicaciones al iniciar
  useEffect(() => {
    cargarPublicaciones();
  }, []);

  const cargarPublicaciones = async () => {
    try {
      setIsLoading(true);
      const data = await comunidadAPI.obtenerPublicaciones();
      setPublicaciones(data);
    } catch (error) {
      console.error('Error cargando publicaciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const crearPublicacion = async (usuario: string, usuarioId: string, pelicula: string, genero: string, descripcion: string) => {
    try {
      const newPub = await comunidadAPI.crearPublicacion(usuario, usuarioId, pelicula, genero, descripcion);
      setPublicaciones([newPub, ...publicaciones]);
    } catch (error) {
      console.error('Error creando publicación:', error);
      throw error;
    }
  };

  const toggleLikePublicacion = async (pubId: string, usuarioId: string) => {
    try {
      await comunidadAPI.toggleLikePublicacion(pubId, usuarioId);
      const data = await comunidadAPI.obtenerPublicaciones();
      setPublicaciones(data);
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  };

  const agregarComentario = async (pubId: string, usuario: string, usuarioId: string, contenido: string) => {
    try {
      await comunidadAPI.agregarComentario(pubId, usuario, usuarioId, contenido);
      const data = await comunidadAPI.obtenerPublicaciones();
      setPublicaciones(data);
    } catch (error) {
      console.error('Error agregando comentario:', error);
      throw error;
    }
  };

  const toggleLikeComentario = async (pubId: string, comId: string, usuarioId: string) => {
    try {
      await comunidadAPI.toggleLikeComentario(pubId, comId, usuarioId);
      const data = await comunidadAPI.obtenerPublicaciones();
      setPublicaciones(data);
    } catch (error) {
      console.error('Error toggling like comentario:', error);
      throw error;
    }
  };

  const agregarReply = async (pubId: string, comId: string, usuario: string, usuarioId: string, respondiendo_a: string, contenido: string) => {
    try {
      await comunidadAPI.agregarReply(pubId, comId, usuario, usuarioId, respondiendo_a, contenido);
      const data = await comunidadAPI.obtenerPublicaciones();
      setPublicaciones(data);
    } catch (error) {
      console.error('Error agregando reply:', error);
      throw error;
    }
  };

  const refrescar = async () => {
    await cargarPublicaciones();
  };

  return (
    <ComunidadContext.Provider
      value={{
        publicaciones,
        isLoading,
        crearPublicacion,
        toggleLikePublicacion,
        agregarComentario,
        agregarReply,
        toggleLikeComentario,
        refrescar,
      }}
    >
      {children}
    </ComunidadContext.Provider>
  );
}

export function useComunidad() {
  const ctx = useContext(ComunidadContext);
  if (!ctx) throw new Error('useComunidad debe usarse dentro de ComunidadProvider');
  return ctx;
}
