import redis from '../config/redis';

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch (error) {
    console.warn(`[Redis] getCached failed for key ${key}:`, error);
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttl = 300): Promise<void> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.warn(`[Redis] setCache failed for key ${key}:`, error);
  }
}

export async function invalidateCache(...keys: string[]): Promise<void> {
  try {
    for (const key of keys) {
      if (key.includes('*')) {
        const matchingKeys = await redis.keys(key);
        if (matchingKeys.length > 0) await redis.del(...matchingKeys);
      } else {
        await redis.del(key);
      }
    }
  } catch (error) {
    console.warn(`[Redis] invalidateCache failed:`, error);
  }
}
