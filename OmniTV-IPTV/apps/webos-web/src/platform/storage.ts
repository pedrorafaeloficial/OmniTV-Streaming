import { type SecureStorage } from '@omnitv/core';

const STORAGE_KEY = 'omnitv:webos';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function xorBuffer(buffer: Uint8Array, key: Uint8Array): Uint8Array {
  const output = new Uint8Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) {
    output[i] = buffer[i] ^ key[i % key.length];
  }
  return output;
}

export class WebOSSecureStorage implements SecureStorage {
  async getItem(key: string): Promise<string | null> {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${key}`);
    if (!raw) return null;
    const buffer = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
    const decoded = xorBuffer(buffer, encoder.encode('webos-key')); // simples ofuscação
    return decoder.decode(decoded);
  }

  async setItem(key: string, value: string): Promise<void> {
    const buffer = xorBuffer(encoder.encode(value), encoder.encode('webos-key'));
    const base64 = btoa(String.fromCharCode(...buffer));
    localStorage.setItem(`${STORAGE_KEY}:${key}`, base64);
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(`${STORAGE_KEY}:${key}`);
  }
}
