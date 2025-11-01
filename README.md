<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntrojs-singleton/main/assets/beaconLog-2.png" alt="SyntroJS Singleton Logo" width="170"/>
  <h1 align="center">@syntrojs/singleton</h1>
  <p align="center"><b>Simple, type-safe singleton pattern</b></p>
</p>

[![npm version](https://img.shields.io/npm/v/@syntrojs/singleton.svg)](https://www.npmjs.com/package/@syntrojs/singleton)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://github.com/Syntropysoft/syntrojs-singleton/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-optional-blue.svg)](https://www.typescriptlang.org/)

**Cross-Platform:**

[![Node.js](https://img.shields.io/badge/Node.js-✓-brightgreen.svg)](https://nodejs.org/)
[![Bun](https://img.shields.io/badge/Bun-✓-brightgreen.svg)](https://bun.sh/)
[![Browser](https://img.shields.io/badge/Browser-✓-brightgreen.svg)](https://developer.mozilla.org/)
[![Vanilla JS](https://img.shields.io/badge/Vanilla%20JS-✓-brightgreen.svg)](https://developer.mozilla.org/)

**Code Coverage:**

[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](https://github.com/Syntropysoft/syntrojs-singleton)
[![Mutation Score](https://img.shields.io/badge/mutation%20score-95.45%25-brightgreen.svg)](https://github.com/Syntropysoft/syntrojs-singleton)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen.svg)](https://github.com/Syntropysoft/syntrojs-singleton)

---

A simple, type-safe abstraction for the singleton pattern. Works in Node.js, Bun, browser environments, and vanilla JavaScript. Instead of implementing your own singleton logic, use this library to register instances once and retrieve them from anywhere in your application.

Perfect for managing multiple instances of the same type (e.g., 3 Redis, 2 Kafka, 1 SQS) with different names, ensuring you always get the same instance when referencing by the same name.

**Why this exists:** The singleton pattern is useful, but implementing it correctly every time can be tricky, especially for developers just starting out. This library abstracts that complexity so you can focus on your business logic instead of reinventing the wheel. No need to create your own singleton implementation—use this simple, tested solution.

## Concept

A simple abstraction of the singleton pattern: you register instances by name at startup, then retrieve them from anywhere in your application.

1. Register instances by name at app startup
2. Retrieve instances by name from anywhere in the app
3. Automatically infer types for type-safety
4. Support multiple instances of the same type with different configurations

**What it does:** When you use `registry.get('cacheRedis')`, you always get the same instance you registered—no need to implement singleton logic yourself. It's a simple, tested solution so you can focus on your business logic.

**Simplifies singleton pattern:** No need to create your own singleton class or worry about thread safety. This library handles it for you in a simple, consistent way that works across your entire application.

**Key Features:**
- ✅ **Works everywhere**: Node.js, Bun, browsers, and vanilla JavaScript
- ✅ **TypeScript optional**: Type-safe with generics when using TypeScript, but works perfectly in plain JavaScript too
- ✅ **Simple API**: Just import and use—no setup or configuration needed
- ✅ **Metadata Storage**: Stores type information and constructor for debugging
- ✅ **Flexible Registration**: Auto-detects type or accepts custom type name
- ✅ **Rich API**: `getEntry()`, `list()` with metadata, `has()` checks

---

## Installation

```bash
npm install @syntrojs/singleton
```

---

## Basic Usage

Register your instances at application startup and retrieve them from anywhere in your code. Each instance maintains its native behavior and the code that uses it is responsible for managing its state.

**TypeScript:**
```typescript
// Setup at startup (main.ts or bootstrap)
import { getRegistry } from '@syntrojs/singleton';
import Redis from 'redis';
import axios from 'axios';

const registry = getRegistry();

// Create instances (the registry doesn't care about their state)
const redisCacheClient = new Redis({ url: 'redis://cache:6379' });
const userApi = axios.create({
  baseURL: 'https://api.users.com',
  headers: { 'Authorization': `Bearer ${token}` }
});

// Register instances
registry.register('cacheRedis', redisCacheClient, 'Redis');
registry.register('userApi', userApi, 'Axios');

// --- Anywhere in your code ---

// Retrieve instances (always the same instance)
const cache = registry.get<Redis>('cacheRedis');
const userApi = registry.get<AxiosInstance>('userApi');

// Each instance is used according to its native behavior
// The code that uses it is responsible for managing connections/state
if (!cache.isOpen) {
  await cache.connect();
}
await cache.set('key', 'value');

const response = await userApi.get('/users'); // Axios doesn't require connection
```

**JavaScript (vanilla):**
```javascript
import { getRegistry } from '@syntrojs/singleton';

const registry = getRegistry();

const redisClient = { url: 'redis://cache:6379' };
const userApi = { baseURL: 'https://api.users.com' };

// Register instances
registry.register('cacheRedis', redisClient, 'Redis');
registry.register('userApi', userApi, 'Axios');

// Use from anywhere - same API, just without TypeScript generics
const cache = registry.get('cacheRedis');
const api = registry.get('userApi');
```

**Main Benefit:** When you use `registry.get('cacheRedis')` from anywhere in your code, you always get the same instance you registered—a simple singleton without the complexity. Works the same in TypeScript and JavaScript. If you need multiple different instances (e.g., 3 different Redis instances for cache, session, and metrics), simply register them with different names.

---

## Practical Examples

### Multi-Redis Setup

Three different Redis instances, each with its own purpose and configuration:

```typescript
import { createClient } from 'redis';

// Create multiple instances with different configurations
const cacheRedis = createClient({ url: 'redis://cache:6379' });
const sessionRedis = createClient({ url: 'redis://session:6379' });
const metricsRedis = createClient({ url: 'redis://metrics:6379' });

// Register all with different names
const registry = getRegistry();
registry.register('cacheRedis', cacheRedis, 'Redis');
registry.register('sessionRedis', sessionRedis, 'Redis');
registry.register('metricsRedis', metricsRedis, 'Redis');

// Use from anywhere
const cache = registry.get<RedisClientType>('cacheRedis'); // Always the same cacheRedis
const session = registry.get<RedisClientType>('sessionRedis'); // Always the same sessionRedis
const metrics = registry.get<RedisClientType>('metricsRedis'); // Always the same metricsRedis

// Each one is managed independently
if (!cache.isOpen) await cache.connect();
await cache.set('key', 'value');
```

### Multi-API Setup

Managing multiple API clients with different configurations:

```typescript
import axios from 'axios';

const userApi = axios.create({
  baseURL: 'https://api.users.com',
  headers: { 'Authorization': `Bearer ${token}` }
});

const paymentApi = axios.create({
  baseURL: 'https://api.payments.com',
  headers: { 'X-API-Key': paymentKey }
});

const registry = getRegistry();
registry.register('userApi', userApi);
registry.register('paymentApi', paymentApi);

// Automatic type inference
const users = registry.get('userApi'); // Axios
const payments = registry.get('paymentApi'); // Axios
```

---

## Why Use This Library?

**Don't reinvent the wheel:** The singleton pattern exists for a reason. Instead of implementing it from scratch every time, use this simple, tested solution and focus on what matters—your business logic.

**Perfect for:**
- **Junior developers** who want a simple, consistent way to share instances across their application
- **Teams** that need a standard pattern everyone can follow
- **Anyone** who wants to avoid common pitfalls like creating duplicate instances

**Helps prevent:**
- Multiple instances of the same service causing memory issues
- Connections that don't close properly
- Having to refactor code to consolidate duplicate instances
- Each developer implementing singleton logic differently

**Simple and focused:** This isn't a full DI framework—it's a lightweight tool that does one thing well: simplifies the singleton pattern. Register your instances once, retrieve them anywhere. That's it. Focus on your business logic, not infrastructure code.

---

## API Reference

### Registry Access

**`getRegistry(): Registry`** - Returns the global singleton instance of the Registry.

### Registry Methods

**`registry.register<T>(name, instance, type?): void`** - Stores an instance in the dictionary under a unique name. Type is auto-detected from constructor or can be provided manually. Throws error if name already exists.

**`registry.get<T>(name): T`** - Retrieves the instance by name. Always returns the same instance. Throws error if not found.

**`registry.has(name): boolean`** - Checks if an instance is registered under the given name.

**`registry.getEntry(name): RegistryEntry | undefined`** - Returns metadata about a registered entry (name, instance, type, constructor).

**`registry.list(): Array<{name, type}>`** - Returns all registered entries with their metadata.

**`registry.clear(): void`** - Clears all registered entries. Useful for testing.

---

## Benefits

1. **It's a simple dictionary** - Store and retrieve instances by name
2. **Same instance per name** - `registry.get('cacheRedis')` always returns the same instance you registered
3. **Multiple instances supported** - You can have 3 Redis, 2 Kafka, 1 SQS, etc. Each with its unique name
4. **Low memory** - Helps maintain low memory consumption by avoiding duplicate instances
5. **Simplifies usage** - Adds value by simplifying usage without having to pass context throughout the application
6. **Type safety** - Generic `get<T>()` with type casting
7. **Rich metadata** - Stores type information and constructor for debugging
8. **Easy testing** - Easily mock instances in tests using `registry.clear()`
9. **Runtime introspection** - `getEntry()` and `list()` for debugging and monitoring

**Note:** This library provides a simple pattern to follow. If you need a singleton, use the registry instead of creating new instances. It's a tool to help you, not a strict enforcement mechanism.

---

## Future Enhancements

None planned. It's a dictionary. If something more is needed in the future, it will be evaluated, but the philosophy is to maintain simplicity.

---

## Design Decisions

1. ✅ **Independent package:** `@syntrojs/singleton`
2. ✅ **Simplicity:** Only stores and retrieves. Doesn't validate states or manage connections
3. ✅ **Native behavior:** Each instance maintains its native behavior
4. ✅ **No integrations:** Doesn't need special integrations. It's a dictionary, period

---

## License

[Apache 2.0](LICENSE)
