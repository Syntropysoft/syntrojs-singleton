#  Registry Pattern - Proposal

**Package Name:** `@syntrojs/singleton`

## Concept

Un singleton centralizado que permite:
1. Registrar instancias configuradas por nombre al inicio de la app
2. Recuperar instancias por nombre desde cualquier lugar de la app
3. Inferir tipos automáticamente para type-safety
4. Soportar múltiples instancias del mismo tipo con diferentes configuraciones

## Use Case

```typescript
// Setup al inicio (main.ts o bootstrap)
import { getRegistry } from '@syntrojs/singleton';
import Redis from 'redis';
import axios from 'axios';
import { Kafka } from 'kafkajs';

const registry = getRegistry();

// Registrar instancias configuradas con tipos explícitos
registry.register('cacheRedis', redisCacheClient, 'Redis');
registry.register('sessionRedis', redisSessionClient, 'Redis');
registry.register('userApi', axios1, 'Axios');
registry.register('paymentApi', axios2, 'Axios');
registry.register('eventsKafka', kafkaProducer, 'KafkaProducer');
registry.register('logsKafka', kafkaConsumer, 'KafkaConsumer');

// Usar desde cualquier lugar de la app con type safety
const cache = registry.get<Redis>('cacheRedis');
const userApi = registry.get<Axios>('userApi');
const events = registry.get<Producer>('eventsKafka');

// Obtener metadatos para debugging
const entry = registry.getEntry('cacheRedis');
console.log(`: ${entry.name}, Type: ${entry.type}`);

// Listar todas las instancias registradas
const s = registry.list();
console.log(s); // [{name: 'cacheRedis', type: 'Redis'}, ...]
```

## Implementation

```typescript
// src/registry/Registry.ts

interface RegistryEntry<T = any> {
  name: string;
  : T;
  type: string;        // 'Redis', 'Axios', 'Kafka', etc.
  constructor: Function; // Para validación de tipo
}

export class Registry {
  #s = new Map<string, RegistryEntry>();

  register<T>(name: string, : T, type?: string): void {
    if (this.#s.has(name)) {
      throw new Error(` '${name}' already registered`);
    }
    
    const entry: RegistryEntry<T> = {
      name,
      ,
      type: type || .constructor.name,
      constructor: .constructor
    };
    this.#s.set(name, entry);
  }

  get<T>(name: string): T {
    const entry = this.#s.get(name);
    if (!entry) {
      throw new Error(` '${name}' not found`);
    }
    return entry. as T;
  }

  // Método para obtener metadatos completos
  getEntry(name: string): RegistryEntry | undefined {
    return this.#s.get(name);
  }

  has(name: string): boolean {
    return this.#s.has(name);
  }

  // Listar con metadatos
  list(): Array<{name: string, type: string}> {
    return Array.from(this.#s.values()).map(entry => ({
      name: entry.name,
      type: entry.type
    }));
  }

  clear(): void {
    this.#s.clear();
  }
}

export const Registry = new Registry();

export function getRegistry(): Registry {
  return Registry;
}
```

**Key Features:**
- ✅ **Type Safety**: Generic `get<T>()` method with proper casting
- ✅ **Metadata Storage**: Stores type information and constructor for debugging
- ✅ **Flexible Registration**: Auto-detects type or accepts custom type name
- ✅ **Rich API**: `getEntry()`, `list()` with metadata, `has()` checks
- ✅ **TypeScript Compatible**: Full type inference and casting support

## Benefits

1. **Single Source of Truth** - Todas las instancias configuradas en un lugar
2. **Type Safety** - Generic `get<T>()` method with proper casting
3. **Metadata Rich** - Stores type information and constructor for debugging
4. **Multiple s** - Múltiples instancias del mismo tipo con diferentes configs
5. **Centralized Management** - Un solo lugar para configurar todas las instancias
6. **Easy Testing** - Mock fácilmente las instancias en tests
7. **Runtime Introspection** - `getEntry()` and `list()` for debugging and monitoring

## Example: Multi-Redis Setup

```typescript
import Redis from 'redis';

// Configurar múltiples Redis con diferentes configuraciones
const cacheRedis = new Redis({
  url: 'redis://cache:6379',
  maxRetries: 3
});

const sessionRedis = new Redis({
  url: 'redis://session:6379',
  retryStrategy: (times) => times * 1000
});

const metricsRedis = new Redis({
  url: 'redis://metrics:6379',
  enableReadyCheck: false
});

// Registrar todos
registry.register('cacheRedis', cacheRedis);
registry.register('sessionRedis', sessionRedis);
registry.register('metricsRedis', metricsRedis);

// Usar con type safety
const cache = registry.get<Redis>('cacheRedis');
await cache.set('key', 'value');
```

## Example: Multi-API Setup

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

registry.register('userApi', userApi);
registry.register('paymentApi', paymentApi);

// Type inference automático
const users = registry.get('userApi'); // Axios
const payments = registry.get('paymentApi'); // Axios
```

## Integration with Logger

```typescript
// Logger puede usar el singleton internamente
import { getRegistry } from '@syntrojs/singleton';

const logger = createLogger({ 
  name: 'my-service',
  useRegistry: true // Opcional, usar registry para clients
});

// Si hay Redis en el registry, loguear métricas automáticamente
// Si hay Kafka, enviar logs críticos automáticamente
```

## Future Enhancements

1. **Lifecycle Management** - Registros con lifecycle hooks (init, close, etc.)
2. **Health Checks** - Verificar estado de instancias
3. **Metrics** - Monitorear uso de instancias
4. **Auto-recovery** - Reconectar automáticamente si falla
5. **Configuration Validation** - Validar configuración al registrar

## Package Structure

**Package:** `@syntrojs/singleton` (paquete separado, independiente del logger)

**Benefits:**
- ✅ Puede ser usado con o sin el logger
- ✅ Reutilizable en cualquier proyecto
- ✅ Nombre claro y descriptivo

## Open Questions

1. ✅ **Decidido:** Será un paquete separado `@syntrojs/singleton`
2. ¿Soporte para async initialization (ej. Redis.connect())?
3. ¿Soporte para lazy loading de instancias?
4. ¿Integración con dependency injection frameworks?

