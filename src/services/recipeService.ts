import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meal, MealPreview, Category } from '../types/recipe';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface ServiceResult<T> {
  data: T;
  fromCache: boolean;
  error?: string;
}

async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

async function writeCache<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // fallo de caché no es crítico
  }
}

async function readStaleCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const msg = error.message.toLowerCase();
    return msg.includes('network') || msg.includes('fetch') || msg.includes('failed');
  }
  return false;
}

async function fetchJSON<T>(url: string, cacheKey: string): Promise<ServiceResult<T>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
    }
    const json: T = await response.json();
    await writeCache(cacheKey, json);
    return { data: json, fromCache: false };
  } catch (error: unknown) {
    // Intentar caché al fallar
    const stale = await readStaleCache<T>(cacheKey);
    if (stale !== null) {
      return { data: stale, fromCache: true };
    }
    const errorMsg = isNetworkError(error)
      ? 'Sin conexión a internet y sin datos en caché.'
      : (error instanceof Error ? error.message : 'Error desconocido');
    return { data: null as unknown as T, fromCache: false, error: errorMsg };
  }
}

export const recipeService = {
  async searchMeals(query: string): Promise<{ meals: MealPreview[]; fromCache: boolean; error?: string }> {
    const key = `cache_search_${query.toLowerCase().trim()}`;
    const cached = await readCache<{ meals: MealPreview[] | null }>(key);
    if (cached !== null) {
      return { meals: cached.meals ?? [], fromCache: true };
    }
    const result = await fetchJSON<{ meals: MealPreview[] | null }>(
      `${BASE_URL}/search.php?s=${encodeURIComponent(query)}`,
      key
    );
    return { meals: result.data?.meals ?? [], fromCache: result.fromCache, error: result.error };
  },

  async getMealById(idMeal: string): Promise<{ meal: Meal | null; fromCache: boolean; error?: string }> {
    const key = `cache_detail_${idMeal}`;
    const cached = await readCache<{ meals: Meal[] | null }>(key);
    if (cached !== null) {
      return { meal: cached.meals?.[0] ?? null, fromCache: true };
    }
    const result = await fetchJSON<{ meals: Meal[] | null }>(
      `${BASE_URL}/lookup.php?i=${idMeal}`,
      key
    );
    return { meal: result.data?.meals?.[0] ?? null, fromCache: result.fromCache, error: result.error };
  },

  async getCategories(): Promise<{ categories: Category[]; fromCache: boolean; error?: string }> {
    const key = 'cache_categories';
    const cached = await readCache<{ categories: Category[] }>(key);
    if (cached !== null) {
      return { categories: cached.categories ?? [], fromCache: true };
    }
    const result = await fetchJSON<{ categories: Category[] }>(
      `${BASE_URL}/categories.php`,
      key
    );
    return { categories: result.data?.categories ?? [], fromCache: result.fromCache, error: result.error };
  },

  async filterByCategory(category: string): Promise<{ meals: MealPreview[]; fromCache: boolean; error?: string }> {
    const key = `cache_filter_${category.toLowerCase()}`;
    const cached = await readCache<{ meals: MealPreview[] | null }>(key);
    if (cached !== null) {
      return { meals: cached.meals ?? [], fromCache: true };
    }
    const result = await fetchJSON<{ meals: MealPreview[] | null }>(
      `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`,
      key
    );
    return { meals: result.data?.meals ?? [], fromCache: result.fromCache, error: result.error };
  },
};
