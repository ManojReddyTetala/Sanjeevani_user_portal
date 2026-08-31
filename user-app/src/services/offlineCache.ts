const CACHE_PREFIX = 'sih_cache_';
const DEFAULT_TTL_MS = 15 * 60 * 1000;

export const setOfflineCache = <T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void => {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      expires_at: new Date(Date.now() + ttlMs).toISOString(),
      data
    };
    sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
  } catch (e) {
    console.warn('Failed to write offline cache:', e);
  }
};

export const getOfflineCache = <T>(key: string): { data: T; timestamp: string; is_stale: boolean } | null => {
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    const isStale = parsed.expires_at ? new Date(parsed.expires_at).getTime() < Date.now() : false;

    return {
      data: parsed.data,
      timestamp: parsed.timestamp,
      is_stale: isStale
    };
  } catch (e) {
    return null;
  }
};

export const clearSensitiveOfflineCache = (): void => {
  try {
    sessionStorage.clear();
  } catch (e) {}
};

interface PendingMutation {
  id: string;
  url: string;
  method: string;
  body: any;
  token?: string;
  timestamp: string;
}

const SYNC_QUEUE_KEY = 'sih_offline_sync_queue';

export const queueOfflineMutation = (url: string, method: string, body: any, token?: string): void => {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    const queue: PendingMutation[] = raw ? JSON.parse(raw) : [];
    queue.push({
      id: `mut_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      url,
      method,
      body,
      token,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.warn('Failed to queue offline mutation:', e);
  }
};

export const flushOfflineSyncQueue = async (): Promise<number> => {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    if (!raw) return 0;
    const queue: PendingMutation[] = JSON.parse(raw);
    if (queue.length === 0) return 0;

    let processedCount = 0;
    const remainingQueue: PendingMutation[] = [];

    for (const item of queue) {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (item.token) headers['Authorization'] = `Bearer ${item.token}`;

        const res = await fetch(item.url, {
          method: item.method,
          headers,
          body: JSON.stringify(item.body)
        });
        if (res.ok) {
          processedCount++;
        } else {
          remainingQueue.push(item);
        }
      } catch (e) {
        remainingQueue.push(item);
      }
    }

    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remainingQueue));
    return processedCount;
  } catch (e) {
    return 0;
  }
};
