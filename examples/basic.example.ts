import { getRegistry } from '@syntrojs/singleton';

// Example: Registering and using instances

// 1. Get the registry
const registry = getRegistry();

// 2. Create your instances
const redisClient = {
  url: 'redis://localhost:6379',
  isOpen: false,
  async connect() {
    this.isOpen = true;
    console.log('Redis connected');
  },
  async get(key: string) {
    return `value-for-${key}`;
  },
};

const apiClient = {
  baseURL: 'https://api.example.com',
  async get(path: string) {
    return { data: `Response from ${path}` };
  },
};

// 3. Register instances at app startup
registry.register('redis', redisClient, 'Redis');
registry.register('api', apiClient, 'ApiClient');

// 4. Use from anywhere in your application
export async function useRedis() {
  const redis = registry.get<typeof redisClient>('redis');
  
  if (!redis.isOpen) {
    await redis.connect();
  }
  
  return await redis.get('my-key');
}

export async function useApi() {
  const api = registry.get<typeof apiClient>('api');
  return await api.get('/users');
}

// 5. Check what's registered
console.log('Registered instances:', registry.list());
// Output: [{ name: 'redis', type: 'Redis' }, { name: 'api', type: 'ApiClient' }]

