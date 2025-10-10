export function getDeviceId(): string {
  try {
    // @ts-ignore webOS specific API
    return window.PalmSystem?.deviceId ?? 'webos-sim';
  } catch (error) {
    console.warn('deviceId webOS indisponível', error);
    return 'webos-sim';
  }
}

export function registerKeyHandlers(handler: (event: KeyboardEvent) => void): void {
  window.addEventListener('keydown', handler);
}
