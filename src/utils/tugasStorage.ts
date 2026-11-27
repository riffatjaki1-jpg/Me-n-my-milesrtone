import type { CelestialBodyId } from '../components/SolarSystemView';

export type TugasKind = 'pdf' | 'image' | 'file' | 'link' | 'note';

export interface StoredTugas {
  id: string;
  bodyId: CelestialBodyId;
  title: string;
  meta: string;
  summary: string;
  kind: TugasKind;
  fileName?: string;
  mimeType?: string;
  fileBlob?: Blob;
  externalUrl?: string;
  createdAt: number;
}

const DB_NAME = 'ascend-tugas-db';
const DB_VERSION = 1;
const STORE_NAME = 'assignments';

const memoryFallback: StoredTugas[] = [];

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by_bodyId', 'bodyId', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function loadTugasForBody(bodyId: CelestialBodyId): Promise<StoredTugas[]> {
  const db = await openDatabase();
  if (!db) {
    return memoryFallback
      .filter((item) => item.bodyId === bodyId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('by_bodyId');
      const req = index.getAll(bodyId);

      req.onsuccess = () => {
        const results = (req.result as StoredTugas[]) ?? [];
        results.sort((a, b) => a.createdAt - b.createdAt);
        resolve(results);
      };
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function saveTugas(tugas: StoredTugas): Promise<void> {
  const db = await openDatabase();
  if (!db) {
    memoryFallback.push(tugas);
    return;
  }

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(tugas);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('Failed to save assignment'));
    } catch (err) {
      reject(err);
    }
  });
}

export async function deleteTugas(id: string): Promise<void> {
  const db = await openDatabase();
  if (!db) {
    const idx = memoryFallback.findIndex((item) => item.id === id);
    if (idx !== -1) memoryFallback.splice(idx, 1);
    return;
  }

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('Failed to delete assignment'));
    } catch (err) {
      reject(err);
    }
  });
}
