import { getUserScopedKey } from '../types';
import { getProgress, saveProgress } from './api';

const USE_BACKEND = import.meta.env.VITE_USE_BACKEND !== 'false';

// Storage key generators for different tools
export function getComparisonStorageKey(expName: string, userId: string | null): string {
  return getUserScopedKey(`audio_comparison_tags_${expName}`, userId);
}

export function getABTestStorageKey(expName: string, userId: string | null): string {
  return getUserScopedKey(`audio_abtest_selection_${expName}`, userId);
}

export function getABTestBlindModeKey(expName: string, userId: string | null): string {
  return getUserScopedKey(`abtest_blind_mode_${expName}`, userId);
}

export function getMOSSStorageKey(expName: string, userId: string | null): string {
  return getUserScopedKey(`audio_mos_scores_${expName}`, userId);
}

// ==================== Backend Sync Storage ====================

export async function loadProgressFromBackend<T>(
  tool: 'comparison' | 'abtest' | 'mos',
  expName: string,
  userId: string
): Promise<T | null> {
  if (!USE_BACKEND || !userId) return null;
  
  try {
    const response = await getProgress(tool, expName, userId);
    return response.data as T;
  } catch (err) {
    console.error('Failed to load from backend:', err);
    return null;
  }
}

export async function saveProgressToBackend<T>(
  tool: 'comparison' | 'abtest' | 'mos',
  expName: string,
  userId: string,
  data: T
): Promise<void> {
  if (!USE_BACKEND || !userId) return;
  
  try {
    await saveProgress(tool, expName, userId, data);
  } catch (err) {
    console.error('Failed to save to backend:', err);
  }
}

// ==================== Local Storage (Fallback) ====================

export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    // key is already user-scoped, use it directly
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to local storage:', err);
  }
}

export function loadFromLocalStorage<T>(key: string): T | null {
  try {
    // key is already user-scoped, use it directly
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to load from local storage:', err);
    return null;
  }
}

// ==================== Hybrid Storage (Backend + Local) ====================

export async function loadProgress<T>(
  tool: 'comparison' | 'abtest' | 'mos',
  expName: string,
  userId: string | null,
  storageKey: string
): Promise<T | null> {
  // Try backend first if available and user is logged in
  if (USE_BACKEND && userId) {
    const backendData = await loadProgressFromBackend<T>(tool, expName, userId);
    if (backendData !== null) {
      // Also sync to localStorage as backup
      saveToLocalStorage(storageKey, backendData);
      return backendData;
    }
  }
  
  // Fall back to localStorage
  return loadFromLocalStorage<T>(storageKey);
}

export async function saveProgressHybrid<T>(
  tool: 'comparison' | 'abtest' | 'mos',
  expName: string,
  userId: string | null,
  storageKey: string,
  data: T
): Promise<void> {
  // Always save to localStorage
  saveToLocalStorage(storageKey, data);
  
  // Also save to backend if available and user is logged in
  if (USE_BACKEND && userId) {
    await saveProgressToBackend(tool, expName, userId, data);
  }
}
