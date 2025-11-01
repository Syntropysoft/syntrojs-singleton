import { getRegistry } from "@syntrojs/singleton";

// Example: Registering and using instances in vanilla JavaScript

// 1. Get the registry
const registry = getRegistry();

// 2. Create your instances (no TypeScript needed)
const redisClient = {
  url: "redis://localhost:6379",
  isOpen: false,
  async connect() {
    this.isOpen = true;
    console.log("Redis connected");
  },
  async get(key) {
    return `value-for-${key}`;
  },
};

const apiClient = {
  baseURL: "https://api.example.com",
  async get(path) {
    return { data: `Response from ${path}` };
  },
};

// 3. Register instances at app startup
registry.register("redis", redisClient, "Redis");
registry.register("api", apiClient, "ApiClient");

// 4. Use from anywhere in your application
// No TypeScript generics needed - just use the registry
export async function useRedis() {
  const redis = registry.get("redis");

  if (!redis.isOpen) {
    await redis.connect();
  }

  return await redis.get("my-key");
}

export async function useApi() {
  const api = registry.get("api");
  return await api.get("/users");
}

// 5. Check what's registered
console.log("Registered instances:", registry.list());
// Output: [{ name: 'redis', type: 'Redis' }, { name: 'api', type: 'ApiClient' }]

