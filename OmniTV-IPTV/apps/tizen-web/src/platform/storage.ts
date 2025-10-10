import { type SecureStorage } from '@omnitv/core';

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const STORAGE_KEY = 'omnitv:secure';

async function getCryptoKey(): Promise<CryptoKey> {
  const rawKey = encoder.encode('omnitv-secret-key-32bytes!!!!');
  return crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function getStore(): Promise<Record<string, string>> {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function setStore(store: Record<string, string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export class TizenSecureStorage implements SecureStorage {
  async getItem(key: string): Promise<string | null> {
    const store = await getStore();
    const payload = store[key];
    if (!payload) return null;
    const { iv, data } = JSON.parse(payload) as { iv: string; data: string };
    const cryptoKey = await getCryptoKey();
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: Uint8Array.from(atob(iv), (c) => c.charCodeAt(0)) },
      cryptoKey,
      Uint8Array.from(atob(data), (c) => c.charCodeAt(0))
    );
    return decoder.decode(decrypted);
  }

  async setItem(key: string, value: string): Promise<void> {
    const store = await getStore();
    const cryptoKey = await getCryptoKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, encoder.encode(value));
    store[key] = JSON.stringify({
      iv: btoa(String.fromCharCode(...iv)),
      data: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    });
    await setStore(store);
  }

  async removeItem(key: string): Promise<void> {
    const store = await getStore();
    delete store[key];
    await setStore(store);
  }
}
