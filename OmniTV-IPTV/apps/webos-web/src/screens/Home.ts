import type { XtreamClient } from '@omnitv/core';
import type { ScreenName } from '../app.js';

interface ScreenContext {
  root: HTMLElement;
  navigate: (screen: ScreenName) => void;
  getClient: () => XtreamClient | null;
}

const MENU_ITEMS: Array<{ label: string; screen: ScreenName }> = [
  { label: 'TV Ao Vivo', screen: 'live' },
  { label: 'Filmes', screen: 'vod' },
  { label: 'Séries', screen: 'series' },
  { label: 'Busca', screen: 'live' },
  { label: 'Configurações', screen: 'settings' },
];

export function createHomeScreen(context: ScreenContext) {
  const container = document.createElement('div');
  container.innerHTML = `
    <h1>OmniTV webOS</h1>
    <nav class="grid-row" data-menu></nav>
  `;

  const nav = container.querySelector('[data-menu]');
  MENU_ITEMS.forEach((item) => {
    const button = document.createElement('button');
    button.textContent = item.label;
    button.dataset.focus = '';
    button.addEventListener('click', () => context.navigate(item.screen));
    nav?.appendChild(button);
  });

  context.root.appendChild(container);
  container.querySelector<HTMLElement>('[data-focus]')?.focus();
}
