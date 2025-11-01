import { getRegistry } from "@syntrojs/singleton";

// Example: Multiple Redis instances for different purposes

// Mock Redis client for example purposes
interface RedisClientType {
  url: string;
  isOpen: boolean;
  connect(): Promise<void>;
  get(key: string): Promise<string>;
  set(key: string, value: string): Promise<void>;
  incr(key: string): Promise<number>;
}

function createMockRedisClient(url: string): RedisClientType {
  const store = new Map<string, string>();
  return {
    url,
    isOpen: false,
    async connect() {
      this.isOpen = true;
    },
    async get(key: string) {
      return store.get(key) || "";
    },
    async set(key: string, value: string) {
      store.set(key, value);
    },
    async incr(key: string) {
      const current = Number.parseInt(store.get(key) || "0", 10);
      const newValue = current + 1;
      store.set(key, newValue.toString());
      return newValue;
    },
  };
}

const registry = getRegistry();

// Create multiple Redis instances with different configurations
const cacheRedis = createMockRedisClient("redis://cache:6379");
const sessionRedis = createMockRedisClient("redis://session:6379");
const metricsRedis = createMockRedisClient("redis://metrics:6379");

// Register all with different names
registry.register("cacheRedis", cacheRedis, "Redis");
registry.register("sessionRedis", sessionRedis, "Redis");
registry.register("metricsRedis", metricsRedis, "Redis");

// Use from anywhere in your application
// Each one is a separate singleton instance
export async function useCacheRedis() {
  const cache = registry.get<RedisClientType>("cacheRedis");
  if (!cache.isOpen) await cache.connect();
  await cache.set("key", "value");
  return await cache.get("key");
}

export async function useSessionRedis() {
  const session = registry.get<RedisClientType>("sessionRedis");
  if (!session.isOpen) await session.connect();
  await session.set("session-id", "user-data");
  return await session.get("session-id");
}

export async function useMetricsRedis() {
  const metrics = registry.get<RedisClientType>("metricsRedis");
  if (!metrics.isOpen) await metrics.connect();
  await metrics.incr("request-count");
  return await metrics.get("request-count");
}

// All three are separate instances, managed independently
console.log("Redis instances:", registry.list().filter((e) => e.type === "Redis"));
// Output: [
//   { name: 'cacheRedis', type: 'Redis' },
//   { name: 'sessionRedis', type: 'Redis' },
//   { name: 'metricsRedis', type: 'Redis' }
// ]

