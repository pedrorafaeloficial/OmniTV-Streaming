import type { XtreamClient, XtreamCategory, XtreamStream } from '@omnitv/core';
import type { ScreenName } from '../app.js';

interface ScreenContext {
  root: HTMLElement;
  navigate: (screen: ScreenName, params?: Record<string, unknown>) => void;
  getClient: () => XtreamClient | null;
  showToast: (message: string) => void;
}

export function createLiveScreen(context: ScreenContext) {
  const container = document.createElement('div');
  container.innerHTML = `
    <h1>TV Ao Vivo</h1>
    <div class="grid-row" data-categories></div>
    <div class="grid-row" data-channels></div>
  `;
  context.root.appendChild(container);
  loadCategories();

  async function loadCategories() {
    const client = context.getClient();
    if (!client) return;
    try {
      const categories = await client.liveCategories();
      renderCategories(categories);
    } catch (error) {
      context.showToast('Não foi possível carregar');
    }
  }

  async function loadChannels(category?: XtreamCategory) {
    const client = context.getClient();
    if (!client) return;
    try {
      const streams = await client.liveStreams(category?.category_id);
      renderChannels(streams);
    } catch (error) {
      context.showToast('Erro ao carregar canais');
    }
  }

  function renderCategories(categories: XtreamCategory[]) {
    const el = container.querySelector('[data-categories]');
    if (!el) return;
    el.innerHTML = '';
    categories.forEach((category) => {
      const button = document.createElement('button');
      button.dataset.focus = '';
      button.textContent = category.category_name;
      button.addEventListener('click', () => loadChannels(category));
      el.appendChild(button);
    });
  }

  function renderChannels(channels: XtreamStream[]) {
    const el = container.querySelector('[data-channels]');
    if (!el) return;
    el.innerHTML = '';
    channels.forEach((channel) => {
      const button = document.createElement('button');
      button.className = 'item tv-focusable';
      button.dataset.focus = '';
      button.textContent = channel.name;
      button.addEventListener('click', () => context.navigate('player', { type: 'live', channel }));
      el.appendChild(button);
    });
  }
}
