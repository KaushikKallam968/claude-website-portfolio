/**
 * Session storage, used only in the visitor's own browser. Every access tolerates storage being blocked
 * (private windows, strict settings): the site then simply forgets between pages.
 */
export const KEYS = {
  events: 'kk:events',
  sessionStart: 'kk:start',
  notesHidden: 'kk:notes',
  notesKnown: 'kk:notes-known',
  livePaused: 'kk:paused',
  restore: 'kk:restore',
  introSeen: 'kk:intro',
  expandFrom: 'kk:expand',
  lastCase: 'kk:last-case',
  origin: (caseId: string) => `kk:origin:${caseId}`,
} as const;

export const session = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = sessionStorage.getItem(key);
      return v === null ? fallback : (JSON.parse(v) as T);
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage blocked: nothing persists */
    }
  },
  remove(key: string) {
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* storage blocked */
    }
  },
};
