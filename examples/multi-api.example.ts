import { getRegistry } from "@syntrojs/singleton";

// Example: Multiple API clients for different services

// Mock Axios-like client for example purposes
interface AxiosInstance {
  baseURL: string;
  get(path: string): Promise<{ data: unknown }>;
  post(path: string, data: unknown): Promise<{ data: unknown }>;
}

function createMockApiClient(baseURL: string): AxiosInstance {
  return {
    baseURL,
    async get(path: string) {
      return { data: `Response from ${baseURL}${path}` };
    },
    async post(path: string, data: unknown) {
      return { data: { received: data, url: `${baseURL}${path}` } };
    },
  };
}

const registry = getRegistry();

// Create multiple API clients with different configurations
const userApi = createMockApiClient("https://api.users.com");
const paymentApi = createMockApiClient("https://api.payments.com");
const analyticsApi = createMockApiClient("https://api.analytics.com");

// Register all with different names
registry.register("userApi", userApi, "Axios");
registry.register("paymentApi", paymentApi, "Axios");
registry.register("analyticsApi", analyticsApi, "Axios");

// Use from anywhere in your application
// Each one is a separate singleton instance
export async function getUser(userId: string) {
  const api = registry.get<AxiosInstance>("userApi");
  const response = await api.get(`/users/${userId}`);
  return response.data;
}

export async function processPayment(amount: number, userId: string) {
  const api = registry.get<AxiosInstance>("paymentApi");
  const response = await api.post("/payments", { amount, userId });
  return response.data;
}

export async function trackEvent(event: string, data: unknown) {
  const api = registry.get<AxiosInstance>("analyticsApi");
  const response = await api.post("/events", { event, data });
  return response.data;
}

// All three are separate instances, configured independently
console.log("API clients:", registry.list().filter((e) => e.type === "Axios"));
// Output: [
//   { name: 'userApi', type: 'Axios' },
//   { name: 'paymentApi', type: 'Axios' },
//   { name: 'analyticsApi', type: 'Axios' }
// ]

