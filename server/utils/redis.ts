import Redis from 'ioredis'

let _redis: Redis | null = null

export function useRedis(): Redis {
  if (!_redis) {
    const config = useRuntimeConfig()
    _redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 5000)
        return delay
      },
      lazyConnect: true
    })
    _redis.connect().catch(() => {})
  }
  return _redis
}
