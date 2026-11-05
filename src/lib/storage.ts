const STORAGE_PREFIX = 'ruang-setelah-hujan'

export const STORAGE_KEYS = {
  preferences: `${STORAGE_PREFIX}:preferences`,
  scene: `${STORAGE_PREFIX}:scene`,
  song: `${STORAGE_PREFIX}:song`,
  quote: `${STORAGE_PREFIX}:quote`,
  lyrics: `${STORAGE_PREFIX}:lyrics`,
} as const

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    // Private browsing and blocked storage can throw on access.
    return null
  }
}

function namespacedKey(key: string): string {
  return key.startsWith(`${STORAGE_PREFIX}:`) ? key : `${STORAGE_PREFIX}:${key}`
}

/** Read JSON from localStorage without throwing during SSR or blocked storage. */
export function readJSON<T>(key: string, fallback: T = null as T): T {
  const storage = getLocalStorage()
  if (!storage) return fallback

  try {
    const raw = storage.getItem(namespacedKey(key))
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** Persist JSON and report whether the browser accepted the write. */
export function writeJSON<T>(key: string, value: T): boolean {
  const storage = getLocalStorage()
  if (!storage) return false

  try {
    const serialized = JSON.stringify(value)
    if (serialized === undefined) return false
    storage.setItem(namespacedKey(key), serialized)
    return true
  } catch {
    return false
  }
}

export function removeJSON(key: string): boolean {
  const storage = getLocalStorage()
  if (!storage) return false

  try {
    storage.removeItem(namespacedKey(key))
    return true
  } catch {
    return false
  }
}

export function hasJSON(key: string): boolean {
  const storage = getLocalStorage()
  if (!storage) return false

  try {
    return storage.getItem(namespacedKey(key)) !== null
  } catch {
    return false
  }
}

/** Update one stored JSON value atomically from the caller's point of view. */
export function updateJSON<T>(key: string, update: (current: T | undefined) => T): boolean {
  const current = hasJSON(key) ? readJSON<T | undefined>(key, undefined) : undefined
  return writeJSON(key, update(current))
}

/**
 * Subscribe to cross-tab changes for a key. The returned function removes the
 * listener and is safe to call more than once.
 */
export function subscribeJSON<T>(key: string, listener: (value: T | undefined) => void): () => void {
  if (typeof window === 'undefined') return () => undefined
  const expectedKey = namespacedKey(key)
  const onStorage = (event: StorageEvent) => {
    if (event.storageArea !== getLocalStorage() || event.key !== expectedKey) return
    if (event.newValue === null) {
      listener(undefined)
      return
    }
    try {
      listener(JSON.parse(event.newValue) as T)
    } catch {
      listener(undefined)
    }
  }
  window.addEventListener('storage', onStorage)
  return () => window.removeEventListener('storage', onStorage)
}

/** Generate a collision-resistant id in browsers and a deterministic fallback elsewhere. */
export function uid(prefix = 'id'): string {
  const cryptoApi = typeof globalThis.crypto !== 'undefined' ? globalThis.crypto : undefined
  if (cryptoApi && 'randomUUID' in cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return `${prefix}-${cryptoApi.randomUUID()}`
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export { STORAGE_PREFIX }
