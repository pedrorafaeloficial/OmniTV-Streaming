import type { XtreamClient } from '@omnitv/core';
import { ParentalManager } from '@omnitv/core';
import type { ScreenName } from '../app.js';

interface ScreenContext {
  root: HTMLElement;
  navigate: (screen: ScreenName) => void;
  getClient: () => XtreamClient | null;
  parental: ParentalManager;
  showToast: (message: string) => void;
}

export function createSettingsScreen(context: ScreenContext) {
  const container = document.createElement('div');
  container.innerHTML = `
    <h1>Configurações</h1>
    <section>
      <h2>Conta</h2>
      <button data-focus data-logout>Sair</button>
    </section>
    <section>
      <h2>Controle Parental</h2>
      <button data-focus data-pin>Definir PIN</button>
      <button data-focus data-invisible>Alternar modo invisível</button>
    </section>
  `;
  container.querySelector('[data-logout]')?.addEventListener('click', () => {
    context.navigate('login');
  });

  container.querySelector('[data-pin]')?.addEventListener('click', async () => {
    const pin = prompt('Digite novo PIN (4-6 dígitos)');
    if (!pin) return;
    try {
      await context.parental.setPin(pin);
      context.showToast('PIN atualizado');
    } catch (error) {
      context.showToast('PIN inválido');
    }
  });

  container.querySelector('[data-invisible]')?.addEventListener('click', async () => {
    const current = context.parental.getConfig();
    await context.parental.setInvisibleMode(!current.invisibleMode);
    context.showToast(`Modo invisível ${current.invisibleMode ? 'desativado' : 'ativado'}`);
  });

  context.root.appendChild(container);
}
