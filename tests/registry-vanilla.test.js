import { beforeEach, describe, expect, it } from "vitest";
import { getRegistry } from "../src/index.ts";

describe("Registry - Vanilla JavaScript", () => {
  let registry;

  beforeEach(() => {
    registry = getRegistry();
    registry.clear();
  });

  describe("register", () => {
    it("should store an instance with a unique name", () => {
      const instance = { value: "test" };
      registry.register("test", instance);

      expect(registry.has("test")).toBe(true);
    });

    it("should auto-detect type from constructor name", () => {
      class TestClass {}
      const instance = new TestClass();
      registry.register("test", instance);

      const entry = registry.getEntry("test");
      expect(entry?.type).toBe("TestClass");
    });

    it("should accept custom type label", () => {
      const instance = { value: "test" };
      registry.register("test", instance, "CustomType");

      const entry = registry.getEntry("test");
      expect(entry?.type).toBe("CustomType");
    });

    it("should throw error if name already exists", () => {
      const instance1 = { value: "test1" };
      const instance2 = { value: "test2" };

      registry.register("test", instance1);
      expect(() => registry.register("test", instance2)).toThrow(
        "Instance 'test' already registered",
      );
    });
  });

  describe("get", () => {
    it("should retrieve the same instance that was registered", () => {
      const instance = { value: "test" };
      registry.register("test", instance);

      const retrieved = registry.get("test");
      expect(retrieved).toBe(instance);
      expect(retrieved.value).toBe("test");
    });

    it("should work without TypeScript generics", () => {
      const instance = { value: "test", count: 42 };
      registry.register("test", instance);

      // In vanilla JS, you just call get without generics
      const retrieved = registry.get("test");
      expect(retrieved.value).toBe("test");
      expect(retrieved.count).toBe(42);
    });

    it("should throw error if instance not found", () => {
      expect(() => registry.get("nonexistent")).toThrow("Instance 'nonexistent' not found");
    });
  });

  describe("has", () => {
    it("should return true if entry exists", () => {
      registry.register("test", { value: "test" });
      expect(registry.has("test")).toBe(true);
    });

    it("should return false if entry does not exist", () => {
      expect(registry.has("nonexistent")).toBe(false);
    });
  });

  describe("getEntry", () => {
    it("should return entry metadata when found", () => {
      const instance = { value: "test" };
      registry.register("test", instance, "TestType");

      const entry = registry.getEntry("test");
      expect(entry).toBeDefined();
      expect(entry.name).toBe("test");
      expect(entry.type).toBe("TestType");
      expect(entry.instance).toBe(instance);
    });

    it("should return undefined when entry not found", () => {
      const entry = registry.getEntry("nonexistent");
      expect(entry).toBeUndefined();
    });
  });

  describe("list", () => {
    it("should return empty array when no entries", () => {
      expect(registry.list()).toEqual([]);
    });

    it("should return list of all registered entries with metadata", () => {
      registry.register("redis", { value: "redis" }, "Redis");
      registry.register("kafka", { value: "kafka" }, "Kafka");
      registry.register("sqs", { value: "sqs" }, "SQS");

      const list = registry.list();
      expect(list).toHaveLength(3);
      expect(list).toContainEqual({ name: "redis", type: "Redis" });
      expect(list).toContainEqual({ name: "kafka", type: "Kafka" });
      expect(list).toContainEqual({ name: "sqs", type: "SQS" });
    });
  });

  describe("clear", () => {
    it("should remove all entries", () => {
      registry.register("test1", { value: "test1" });
      registry.register("test2", { value: "test2" });

      expect(registry.list()).toHaveLength(2);

      registry.clear();

      expect(registry.list()).toHaveLength(0);
      expect(registry.has("test1")).toBe(false);
      expect(registry.has("test2")).toBe(false);
    });
  });

  describe("getRegistry", () => {
    it("should always return the same registry instance", () => {
      const registry1 = getRegistry();
      const registry2 = getRegistry();

      expect(registry1).toBe(registry2);
    });

    it("should share state across different getRegistry calls", () => {
      const registry1 = getRegistry();
      registry1.register("shared", { value: "test" });

      const registry2 = getRegistry();
      expect(registry2.has("shared")).toBe(true);
      expect(registry2.get("shared").value).toBe("test");
    });
  });

  describe("practical usage - no TypeScript needed", () => {
    it("should work with plain objects", () => {
      // Simulate Redis client
      const redisClient = {
        url: "redis://localhost:6379",
        isOpen: false,
        async connect() {
          this.isOpen = true;
          return Promise.resolve();
        },
        async get(key) {
          return `value-for-${key}`;
        },
      };

      // Simulate API client
      const apiClient = {
        baseURL: "https://api.example.com",
        async get(path) {
          return { data: `Response from ${path}` };
        },
      };

      // Register
      registry.register("redis", redisClient, "Redis");
      registry.register("api", apiClient, "ApiClient");

      // Use - no TypeScript generics needed
      const redis = registry.get("redis");
      const api = registry.get("api");

      expect(redis.url).toBe("redis://localhost:6379");
      expect(api.baseURL).toBe("https://api.example.com");

      // Can still use methods
      expect(typeof redis.connect).toBe("function");
      expect(typeof api.get).toBe("function");
    });
  });
});
