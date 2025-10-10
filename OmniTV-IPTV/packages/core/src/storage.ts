import type { SecureStorage } from './types.js';

export interface SecureStorageProvider {
  create(namespace: string): SecureStorage;
}

export class MemoryStorage implements SecureStorage {
  private store = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }
}

export class NamespacedStorage implements SecureStorage {
  constructor(private namespace: string, private storage: SecureStorage) {}

  private key(key: string): string {
    return `${this.namespace}:${key}`;
  }

  getItem(key: string): Promise<string | null> {
    return this.storage.getItem(this.key(key));
  }

  setItem(key: string, value: string): Promise<void> {
    return this.storage.setItem(this.key(key), value);
  }

  removeItem(key: string): Promise<void> {
    return this.storage.removeItem(this.key(key));
  }
}

export const fallbackStorageProvider: SecureStorageProvider = {
  create(namespace: string) {
    return new NamespacedStorage(namespace, new MemoryStorage());
  },
};
