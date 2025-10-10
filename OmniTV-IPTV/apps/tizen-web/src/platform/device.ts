export function getDeviceId(): string {
  try {
    // @ts-ignore Tizen specific API
    return window.tizen?.systeminfo?.getCapability('http://tizen.org/system/tizenid') ?? 'tizen-sim';
  } catch (error) {
    console.warn('Não foi possível obter deviceId Tizen', error);
    return 'tizen-sim';
  }
}

export function registerKeyHandlers(handler: (event: KeyboardEvent) => void): void {
  window.addEventListener('keydown', handler);
}
