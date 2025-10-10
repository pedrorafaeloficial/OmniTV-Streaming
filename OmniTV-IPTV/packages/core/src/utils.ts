import { stringify } from 'node:querystring';

export function buildUrl(base: string, path: string, params?: Record<string, string | number | undefined>): string {
  const sanitizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const sanitizedPath = path.startsWith('/') ? path.slice(1) : path;
  const query = params ? `?${stringify(params)}` : '';
  return `${sanitizedBase}/${sanitizedPath}${query}`;
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message = 'Timeout'): Promise<T> {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error(message)), timeoutMs);
  });
  const result = await Promise.race([promise, timeoutPromise]);
  clearTimeout(timeoutHandle!);
  return result as T;
}

export function normalizeImage(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `https://${url}`;
}

export function isAdultCategory(name: string): boolean {
  return /adult|xxx|porn|erotic/i.test(name);
}

export function now(): number {
  return Date.now();
}
