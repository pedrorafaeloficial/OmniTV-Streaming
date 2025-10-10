import { randomBytes, pbkdf2Sync } from 'node:crypto';
import { isAdultCategory, now } from './utils.js';
import type { ParentalConfig, SecureStorage } from './types.js';

const STORAGE_KEY = 'parental';
const ITERATIONS = 120_000;
const KEY_LENGTH = 32;
const DIGEST = 'sha256';

export interface ParentalManagerOptions {
  storage: SecureStorage;
}

function serialize(config: ParentalConfig): string {
  return JSON.stringify(config);
}

function deserialize(value: string | null): ParentalConfig {
  if (!value) {
    return {
      pinHash: null,
      pinSalt: null,
      invisibleMode: true,
      blockedCategories: [],
      attempts: 0,
    };
  }
  try {
    const parsed = JSON.parse(value) as ParentalConfig;
    return {
      invisibleMode: true,
      attempts: 0,
      ...parsed,
    };
  } catch (error) {
    console.warn('Invalid parental config, resetting', error);
    return {
      pinHash: null,
      pinSalt: null,
      invisibleMode: true,
      blockedCategories: [],
      attempts: 0,
    };
  }
}

async function save(storage: SecureStorage, config: ParentalConfig): Promise<void> {
  await storage.setItem(STORAGE_KEY, serialize(config));
}

function randomSalt(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return randomBytes(16).toString('hex');
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashPin(pin: string, salt: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof window !== 'undefined') {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
    const derived = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: enc.encode(salt), iterations: ITERATIONS, hash: 'SHA-256' },
      keyMaterial,
      KEY_LENGTH * 8
    );
    return toHex(derived);
  }
  return pbkdf2Sync(pin, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
}

export class ParentalManager {
  private config: ParentalConfig;

  constructor(private options: ParentalManagerOptions) {
    this.config = deserialize(null);
  }

  async load(): Promise<ParentalConfig> {
    const stored = await this.options.storage.getItem(STORAGE_KEY);
    this.config = deserialize(stored);
    return this.config;
  }

  getConfig(): ParentalConfig {
    return this.config;
  }

  async setPin(pin: string): Promise<void> {
    if (!/^\d{4,6}$/.test(pin)) {
      throw new Error('PIN inválido');
    }
    const salt = randomSalt();
    const pinHash = await hashPin(pin, salt);
    this.config = {
      ...this.config,
      pinHash,
      pinSalt: salt,
      attempts: 0,
    };
    await save(this.options.storage, this.config);
  }

  async validatePin(pin: string): Promise<boolean> {
    if (!this.config.pinHash || !this.config.pinSalt) {
      return false;
    }
    if (this.config.cooldownUntil && now() < this.config.cooldownUntil) {
      throw new Error('PIN bloqueado temporariamente');
    }
    const hashed = await hashPin(pin, this.config.pinSalt);
    if (hashed === this.config.pinHash) {
      this.config = { ...this.config, attempts: 0, cooldownUntil: undefined };
      await save(this.options.storage, this.config);
      return true;
    }
    const attempts = this.config.attempts + 1;
    const cooldownUntil = attempts >= 5 ? now() + 60_000 : undefined;
    this.config = { ...this.config, attempts, cooldownUntil };
    await save(this.options.storage, this.config);
    return false;
  }

  async setInvisibleMode(value: boolean): Promise<void> {
    this.config = { ...this.config, invisibleMode: value };
    await save(this.options.storage, this.config);
  }

  async blockCategory(name: string): Promise<void> {
    if (!this.config.blockedCategories.includes(name)) {
      this.config = {
        ...this.config,
        blockedCategories: [...this.config.blockedCategories, name],
      };
      await save(this.options.storage, this.config);
    }
  }

  async unblockCategory(name: string): Promise<void> {
    this.config = {
      ...this.config,
      blockedCategories: this.config.blockedCategories.filter((c) => c !== name),
    };
    await save(this.options.storage, this.config);
  }

  shouldHideCategory(name: string): boolean {
    if (this.config.blockedCategories.includes(name)) return true;
    if (!this.config.invisibleMode) return false;
    return isAdultCategory(name);
  }

  async reset(): Promise<void> {
    this.config = {
      pinHash: null,
      pinSalt: null,
      invisibleMode: true,
      blockedCategories: [],
      attempts: 0,
    };
    await save(this.options.storage, this.config);
  }
}

export async function getParental(storage: SecureStorage): Promise<ParentalConfig> {
  const manager = new ParentalManager({ storage });
  return manager.load();
}

export async function setParental(storage: SecureStorage, config: Partial<ParentalConfig>): Promise<void> {
  const manager = new ParentalManager({ storage });
  const current = await manager.load();
  manager['config'] = { ...current, ...config };
  await storage.setItem(STORAGE_KEY, serialize(manager.getConfig()));
}

export function shouldHideCategory(name: string, config: ParentalConfig): boolean {
  if (config.blockedCategories.includes(name)) return true;
  if (!config.invisibleMode) return false;
  return isAdultCategory(name);
}
