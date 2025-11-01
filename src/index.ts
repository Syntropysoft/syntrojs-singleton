/**
 * Registry Entry interface
 */
export interface RegistryEntry<T = unknown> {
  name: string;
  instance: T;
  type: string;
  constructor: new (...args: unknown[]) => unknown;
}

/**
 * Registry - A simple dictionary for storing and retrieving instances by name
 */
export class Registry {
  #entries = new Map<string, RegistryEntry>();

  /**
   * Stores an instance in the dictionary under a unique name.
   *
   * @param name - Unique name for the instance
   * @param instance - The instance to store
   * @param type - Optional type label (e.g., 'Redis', 'Axios'). If omitted, inferred from constructor
   * @throws Error if name is already registered
   */
  register<T>(name: string, instance: T, type?: string): void {
    if (this.#entries.has(name)) {
      throw new Error(`Instance '${name}' already registered`);
    }

    // Safe access to constructor for type inference
    const instanceObj = instance as { constructor?: { name?: string } };
    const constructorName = instanceObj.constructor?.name || "Unknown";

    const entry: RegistryEntry<T> = {
      name,
      instance,
      type: type || constructorName,
      constructor: (instanceObj.constructor || Object) as new (...args: unknown[]) => unknown,
    };

    this.#entries.set(name, entry);
  }

  /**
   * Retrieves the instance from the dictionary by its name.
   *
   * @param name - Name of the instance to retrieve
   * @returns The stored instance
   * @throws Error if instance is not found
   */
  get<T>(name: string): T {
    const entry = this.#entries.get(name);
    if (!entry) {
      throw new Error(`Instance '${name}' not found`);
    }
    return entry.instance as T;
  }

  /**
   * Returns metadata about a registered entry, including its name and type.
   *
   * @param name - Name of the entry
   * @returns Registry entry metadata or undefined if not found
   */
  getEntry(name: string): RegistryEntry | undefined {
    return this.#entries.get(name);
  }

  /**
   * Checks if an entry is registered under the name.
   *
   * @param name - Name to check
   * @returns true if registered, false otherwise
   */
  has(name: string): boolean {
    return this.#entries.has(name);
  }

  /**
   * Returns a list of all registered entries with their metadata.
   *
   * @returns Array of {name, type} objects
   */
  list(): Array<{ name: string; type: string }> {
    return Array.from(this.#entries.values()).map((entry) => ({
      name: entry.name,
      type: entry.type,
    }));
  }

  /**
   * Clears all registered entries. Useful for testing environments.
   */
  clear(): void {
    this.#entries.clear();
  }
}

// Singleton instance
const registryInstance = new Registry();

/**
 * Returns the global instance of the Registry.
 *
 * @returns The singleton Registry instance
 */
export function getRegistry(): Registry {
  return registryInstance;
}
