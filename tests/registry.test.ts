import { beforeEach, describe, expect, it } from "vitest";
import { type Registry, getRegistry } from "../src/index.js";

describe("Registry", () => {
  let registry: Registry;

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

    it("should support type casting with generics", () => {
      interface TestInterface {
        value: string;
      }

      const instance: TestInterface = { value: "test" };
      registry.register("test", instance);

      const retrieved = registry.get<TestInterface>("test");
      expect(retrieved.value).toBe("test");
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
      expect(entry?.name).toBe("test");
      expect(entry?.type).toBe("TestType");
      expect(entry?.instance).toBe(instance);
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
      expect(registry2.get("shared")).toEqual({ value: "test" });
    });
  });

  describe("multiple instances of same type", () => {
    it("should support multiple instances with different names", () => {
      const redis1 = { url: "redis://cache:6379" };
      const redis2 = { url: "redis://session:6379" };
      const redis3 = { url: "redis://metrics:6379" };

      registry.register("cacheRedis", redis1, "Redis");
      registry.register("sessionRedis", redis2, "Redis");
      registry.register("metricsRedis", redis3, "Redis");

      expect(registry.get("cacheRedis")).toBe(redis1);
      expect(registry.get("sessionRedis")).toBe(redis2);
      expect(registry.get("metricsRedis")).toBe(redis3);

      const list = registry.list();
      expect(list.filter((e) => e.type === "Redis")).toHaveLength(3);
    });
  });
});
