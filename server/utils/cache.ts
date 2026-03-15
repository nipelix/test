/**
 * Cache with lock-based refresh to prevent stampede (thundering herd).
 * Only one caller fetches on miss; others wait for the result.
 */
export async function cached<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  const redis = useRedis()

  const raw = await redis.get(key)
  if (raw) {
    return JSON.parse(raw) as T
  }

  // Lock-based refresh: only one caller fetches
  const lockKey = `${key}:lock`
  const acquired = await redis.set(lockKey, '1', 'EX', 10, 'NX')

  if (!acquired) {
    // Another process is fetching — wait briefly then retry from cache
    await new Promise(resolve => setTimeout(resolve, 100))
    const retryRaw = await redis.get(key)
    if (retryRaw) return JSON.parse(retryRaw) as T
    // Fallback: fetch anyway (lock may have expired)
  }

  try {
    const result = await fn()
    await redis.set(key, JSON.stringify(result), 'EX', ttlSeconds)
    return result
  } finally {
    await redis.del(lockKey)
  }
}

/**
 * Invalidate cache using SCAN (not KEYS — avoids blocking Redis in production).
 */
export async function invalidateCache(pattern: string): Promise<void> {
  const redis = useRedis()
  let cursor = '0'
  const keysToDelete: string[] = []

  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100)
    cursor = nextCursor
    keysToDelete.push(...keys)
  } while (cursor !== '0')

  if (keysToDelete.length > 0) {
    await redis.del(...keysToDelete)
  }
}
