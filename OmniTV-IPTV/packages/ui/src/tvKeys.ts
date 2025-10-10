export const TV_KEY = {
  ENTER: 13,
  BACK: 461,
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  DOWN: 40,
  PLAY: 415,
  PAUSE: 19,
  PLAY_PAUSE: 10252,
  OPTIONS: 457,
};

export type KeyHandler = (event: KeyboardEvent) => void;

export function bindKeys(element: HTMLElement, handler: KeyHandler): () => void {
  const listener = (event: KeyboardEvent) => handler(event);
  element.addEventListener('keydown', listener);
  return () => element.removeEventListener('keydown', listener);
}
