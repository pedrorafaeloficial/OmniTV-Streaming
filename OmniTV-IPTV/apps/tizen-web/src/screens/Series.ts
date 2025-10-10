import type { XtreamClient, XtreamStream } from '@omnitv/core';
import type { ScreenName } from '../app.js';

interface ScreenContext {
  root: HTMLElement;
  navigate: (screen: ScreenName, params?: Record<string, unknown>) => void;
  getClient: () => XtreamClient | null;
  showToast: (message: string) => void;
}

export function createSeriesScreen(context: ScreenContext) {
  const container = document.createElement('div');
  container.innerHTML = `
    <h1>Séries</h1>
    <div class="grid-row" data-series></div>
  `;
  context.root.appendChild(container);
  load();

  async function load() {
    const client = context.getClient();
    if (!client) return;
    try {
      const streams = await client.seriesList();
      render(streams);
    } catch (error) {
      context.showToast('Erro ao carregar séries');
    }
  }

  function render(streams: XtreamStream[]) {
    const el = container.querySelector('[data-series]');
    if (!el) return;
    el.innerHTML = '';
    streams.slice(0, 40).forEach((stream) => {
      const button = document.createElement('button');
      button.className = 'item tv-focusable';
      button.dataset.focus = '';
      button.innerHTML = `<span>${stream.name}</span>`;
      button.addEventListener('click', () => context.navigate('player', { type: 'series', stream }));
      el.appendChild(button);
    });
  }
}
