// Tipos para la comunidad
export interface ReplyData {
  id: string;
  usuario: string;
  usuarioId: string;
  respondiendo_a: string;
  contenido: string;
  likes: number;
  usuariosQueLikearon: string[];
  replies: ReplyData[];
  timestamp: string;
}

export interface ComentarioData {
  id: string;
  usuario: string;
  usuarioId: string;
  contenido: string;
  likes: number;
  usuariosQueLikearon: string[];
  replies: ReplyData[];
  timestamp: string;
}

export interface PublicacionData {
  id: string;
  usuario: string;
  usuarioId: string;
  timestamp: string;
  pelicula: string;
  genero: 'Ester eggs' | 'Reseña' | 'Discusión' | 'Teoría' | 'Crítica';
  descripcion: string;
  likes: number;
  usuariosQueLikearon: string[];
  comentarios: ComentarioData[];
}

const STORAGE_KEY = 'stave_comunidad';

const obtenerDatos = (): { publicaciones: PublicacionData[] } => {
  try {
    if (typeof window === 'undefined') return { publicaciones: [] };
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { publicaciones: [] };
  } catch {
    return { publicaciones: [] };
  }
};

const guardarDatos = (data: { publicaciones: PublicacionData[] }) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const comunidadAPI = {
  // Crear publicación
  crearPublicacion: async (
    usuario: string,
    usuarioId: string,
    pelicula: string,
    genero: string,
    descripcion: string
  ): Promise<PublicacionData> => {
    const data = obtenerDatos();
    const newPub: PublicacionData = {
      id: 'pub_' + Date.now(),
      usuario,
      usuarioId,
      timestamp: new Date().toLocaleString('es-ES'),
      pelicula,
      genero: genero as any,
      descripcion,
      likes: 0,
      usuariosQueLikearon: [],
      comentarios: [],
    };
    data.publicaciones.unshift(newPub);
    guardarDatos(data);
    return newPub;
  },

  // Obtener todas las publicaciones
  obtenerPublicaciones: async (): Promise<PublicacionData[]> => {
    const data = obtenerDatos();
    return data.publicaciones;
  },

  // Toggle like en publicación
  toggleLikePublicacion: async (pubId: string, usuarioId: string): Promise<void> => {
    const data = obtenerDatos();
    const pub = data.publicaciones.find(p => p.id === pubId);
    if (pub) {
      const index = pub.usuariosQueLikearon.indexOf(usuarioId);
      if (index > -1) {
        pub.usuariosQueLikearon.splice(index, 1);
        pub.likes = Math.max(0, pub.likes - 1);
      } else {
        pub.usuariosQueLikearon.push(usuarioId);
        pub.likes += 1;
      }
      guardarDatos(data);
    }
  },

  // Agregar comentario
  agregarComentario: async (
    pubId: string,
    usuario: string,
    usuarioId: string,
    contenido: string
  ): Promise<ComentarioData> => {
    const data = obtenerDatos();
    const pub = data.publicaciones.find(p => p.id === pubId);
    if (!pub) throw new Error('Publicación no encontrada');

    const newComment: ComentarioData = {
      id: 'com_' + Date.now(),
      usuario,
      usuarioId,
      contenido,
      likes: 0,
      usuariosQueLikearon: [],
      replies: [],
      timestamp: new Date().toLocaleString('es-ES'),
    };
    pub.comentarios.push(newComment);
    guardarDatos(data);
    return newComment;
  },

  // Toggle like en comentario (recursivo)
  toggleLikeComentario: async (pubId: string, comId: string, usuarioId: string): Promise<void> => {
    const data = obtenerDatos();
    const pub = data.publicaciones.find(p => p.id === pubId);
    if (!pub) return;

    const toggleRecursive = (comments: ComentarioData[]) => {
      for (const com of comments) {
        if (com.id === comId) {
          const index = com.usuariosQueLikearon.indexOf(usuarioId);
          if (index > -1) {
            com.usuariosQueLikearon.splice(index, 1);
            com.likes = Math.max(0, com.likes - 1);
          } else {
            com.usuariosQueLikearon.push(usuarioId);
            com.likes += 1;
          }
          return;
        }
        if (com.replies.length > 0) {
          toggleRecursive(com.replies as any);
        }
      }
    };
    toggleRecursive(pub.comentarios);
    guardarDatos(data);
  },

  // Agregar reply
  agregarReply: async (
    pubId: string,
    comId: string,
    usuario: string,
    usuarioId: string,
    respondiendo_a: string,
    contenido: string
  ): Promise<ReplyData> => {
    const data = obtenerDatos();
    const pub = data.publicaciones.find(p => p.id === pubId);
    if (!pub) throw new Error('Publicación no encontrada');

    const newReply: ReplyData = {
      id: 'reply_' + Date.now(),
      usuario,
      usuarioId,
      respondiendo_a,
      contenido,
      likes: 0,
      usuariosQueLikearon: [],
      replies: [],
      timestamp: new Date().toLocaleString('es-ES'),
    };

    const findAndAddReply = (comments: ComentarioData[]): boolean => {
      for (const com of comments) {
        if (com.id === comId) {
          com.replies.push(newReply);
          return true;
        }
        if (com.replies.length > 0 && findAndAddReply(com.replies as any)) {
          return true;
        }
      }
      return false;
    };

    findAndAddReply(pub.comentarios);
    guardarDatos(data);
    return newReply;
  },

  // Obtener películas más citadas
  obtenerTopPeliculas: async (limit: number = 5): Promise<{ pelicula: string; menciones: number }[]> => {
    const data = obtenerDatos();
    const conteo: Record<string, number> = {};

    data.publicaciones.forEach(pub => {
      conteo[pub.pelicula] = (conteo[pub.pelicula] || 0) + 1;
      pub.comentarios.forEach(com => {
        // Los comentarios no tienen película, solo las publicaciones
      });
    });

    return Object.entries(conteo)
      .map(([pelicula, menciones]) => ({ pelicula, menciones }))
      .sort((a, b) => b.menciones - a.menciones)
      .slice(0, limit);
  },

  // Obtener géneros más usados
  obtenerTopGeneros: async (limit: number = 4): Promise<{ genero: string; cantidad: number }[]> => {
    const data = obtenerDatos();
    const conteo: Record<string, number> = {};

    data.publicaciones.forEach(pub => {
      conteo[pub.genero] = (conteo[pub.genero] || 0) + 1;
      pub.comentarios.forEach(() => {
        // Los comentarios no tienen género
      });
    });

    return Object.entries(conteo)
      .map(([genero, cantidad]) => ({ genero, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, limit);
  },
};
