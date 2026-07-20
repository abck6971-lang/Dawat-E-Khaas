import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoriteState {
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],
      
      toggleFavorite: (id: string) => set((state) => {
        const isFav = state.favoriteIds.includes(id);
        if (isFav) {
          return { favoriteIds: state.favoriteIds.filter(fId => fId !== id) };
        } else {
          return { favoriteIds: [...state.favoriteIds, id] };
        }
      }),
      
      isFavorite: (id: string) => get().favoriteIds.includes(id),
    }),
    {
      name: 'favorite-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
