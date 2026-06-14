import {
  collection, doc, setDoc, deleteDoc,
  query, where, onSnapshot, getDocs,
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { Favorito } from '../types/recipe';

const COL = 'favorites';

export const favoritesService = {
  async addFavorite(
    fav: Omit<Favorito, 'id' | 'createdAt' | 'photoUrl'>,
    localPhotoUri?: string
  ): Promise<string> {
    // doc() genera el ID localmente sin esperar red → retorno inmediato
    const docRef = doc(collection(firestore, COL));

    // setDoc sin await: Firestore escribe en caché local al instante
    // y sincroniza con el servidor en segundo plano
    setDoc(docRef, {
      ...fav,
      photoUrl: localPhotoUri ?? null,
      createdAt: new Date().toISOString(),
    }).catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      console.error('[Firestore] addFavorite falló:', msg);
    });

    return docRef.id;
  },

  async removeFavorite(docId: string, _userId: string, _idMeal: string): Promise<void> {
    await deleteDoc(doc(firestore, COL, docId));
  },

  subscribeFavorites(userId: string, callback: (favorites: Favorito[]) => void): () => void {
    const q = query(collection(firestore, COL), where('userId', '==', userId));
    return onSnapshot(q, (snapshot) => {
      const favorites: Favorito[] = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Favorito, 'id'>),
      }));
      callback(favorites);
    });
  },

  async isFavorite(userId: string, idMeal: string): Promise<{ isFav: boolean; docId: string | null }> {
    const q = query(
      collection(firestore, COL),
      where('userId', '==', userId),
      where('idMeal', '==', idMeal)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return { isFav: false, docId: null };
    return { isFav: true, docId: snapshot.docs[0].id };
  },
};
