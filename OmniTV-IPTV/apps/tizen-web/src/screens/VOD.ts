import type { XtreamClient, XtreamStream } from '@omnitv/core';
import type { ScreenName } from '../app.js';

interface ScreenContext {
  root: HTMLElement;
  navigate: (screen: ScreenName, params?: Record<string, unknown>) => void;
  getClient: () => XtreamClient | null;
  showToast: (message: string) => void;
}

export function createVODScreen(context: ScreenContext) {
  const container = document.createElement('div');
  container.innerHTML = `
    <h1>Filmes</h1>
    <div class="grid-row" data-films></div>
  `;
  context.root.appendChild(container);
  load();

  async function load() {
    const client = context.getClient();
    if (!client) return;
    try {
      const streams = await client.vodStreams();
      render(streams);
    } catch (error) {
      context.showToast('Erro ao carregar filmes');
    }
  }

  function render(streams: XtreamStream[]) {
    const el = container.querySelector('[data-films]');
    if (!el) return;
    el.innerHTML = '';
    streams.slice(0, 40).forEach((stream) => {
      const button = document.createElement('button');
      button.className = 'item tv-focusable';
      button.dataset.focus = '';
      button.innerHTML = `<span>${stream.name}</span>`;
      button.addEventListener('click', () => context.navigate('player', { type: 'vod', stream }));
      el.appendChild(button);
    });
  }
}
