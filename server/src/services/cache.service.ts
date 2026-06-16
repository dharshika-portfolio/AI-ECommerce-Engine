import redis from '../config/redis';

export async function getCached<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  return data ? (JSON.parse(data) as T) : null;
}

export async function setCache(key: string, value: unknown, ttl = 300): Promise<void> {
  await redis.setex(key, ttl, JSON.stringify(value));
}

export async function invalidateCache(...keys: string[]): Promise<void> {
  for (const key of keys) {
    if (key.includes('*')) {
      const matchingKeys = await redis.keys(key);
      if (matchingKeys.length > 0) await redis.del(...matchingKeys);
    } else {
      await redis.del(key);
    }
  }
}
