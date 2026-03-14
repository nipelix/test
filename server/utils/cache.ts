export async function cached<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
  const redis = useRedis()

  const raw = await redis.get(key)
  if (raw) {
    return JSON.parse(raw) as T
  }

  const result = await fn()
  await redis.set(key, JSON.stringify(result), 'EX', ttlSeconds)
  return result
}

export async function invalidateCache(pattern: string): Promise<void> {
  const redis = useRedis()
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}
