import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

export async function withCache<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached) {
    return cached;
  }
  const data = await fetcher();
  cache.set(key, data, ttl);
  return data;
}

export default cache;
