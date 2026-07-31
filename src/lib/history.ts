import { PrescriptionDecodeResult } from '@/types/prescription';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  result: PrescriptionDecodeResult;
  thumbnail?: string; // base64 image thumbnail
}

const HISTORY_STORAGE_KEY = 'smart_rx_history_v1';
const MAX_HISTORY_ITEMS = 20;

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read prescription history:', err);
    return [];
  }
}

export function saveToHistory(result: PrescriptionDecodeResult, thumbnail?: string): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getHistory();
    const newEntry: HistoryEntry = {
      id: 'rx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
      result,
      thumbnail,
    };

    // Filter duplicates if any, prepending newest entry
    const updated = [newEntry, ...current].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save to prescription history:', err);
    return getHistory();
  }
}

export function deleteHistoryEntry(id: string): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getHistory();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete history item:', err);
    return getHistory();
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear prescription history:', err);
  }
}
