export interface PoWChallenge {
  challengeString: string;
  expiresAt: number;
  difficulty: number;
}

// To survive Next.js fast-refresh / hot reloading in dev environment,
// we cache the store on the global object.
const globalForPoW = globalThis as unknown as {
  powStore?: Map<string, PoWChallenge>;
};

const store = globalForPoW.powStore ?? new Map<string, PoWChallenge>();

if (process.env.NODE_ENV !== 'production') {
  globalForPoW.powStore = store;
}

/**
 * Clean up all expired challenges from the store to prevent memory leaks.
 */
export function cleanupExpired(): void {
  const now = Date.now();
  for (const [key, challenge] of store.entries()) {
    if (challenge.expiresAt <= now) {
      store.delete(key);
    }
  }
}

/**
 * Saves a challenge to the memory store.
 * 
 * @param challengeString The cryptographically random 32-byte hex challenge string
 * @param difficulty The difficulty target (number of prefix zeros required)
 * @param ttlMs The time-to-live in milliseconds (defaults to 5 minutes)
 */
export function saveChallenge(challengeString: string, difficulty: number, ttlMs: number = 300000): void {
  // Run lazy cleanup first
  cleanupExpired();

  store.set(challengeString, {
    challengeString,
    expiresAt: Date.now() + ttlMs,
    difficulty,
  });
}

/**
 * Retrieves a challenge from the store. Returns undefined if not found or expired.
 * If expired, it is lazily deleted.
 * 
 * @param challengeString The challenge string to check
 */
export function getChallenge(challengeString: string): PoWChallenge | undefined {
  const challenge = store.get(challengeString);
  if (!challenge) {
    return undefined;
  }

  // Lazy check: delete if expired and return undefined
  if (challenge.expiresAt <= Date.now()) {
    store.delete(challengeString);
    return undefined;
  }

  return challenge;
}

/**
 * Instantly deletes a challenge from the store.
 * 
 * @param challengeString The challenge string to delete
 */
export function deleteChallenge(challengeString: string): void {
  store.delete(challengeString);
}

/**
 * Helper to get the current size of the store (useful for debugging/tests).
 */
export function getStoreSize(): number {
  cleanupExpired();
  return store.size;
}

/**
 * Helper to clear the entire store (useful for test isolation).
 */
export function clearStore(): void {
  store.clear();
}
