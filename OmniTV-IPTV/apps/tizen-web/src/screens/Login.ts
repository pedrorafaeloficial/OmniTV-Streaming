import { XtreamClient, type XtreamCredentials } from '@omnitv/core';
import { TizenSecureStorage } from '../platform/storage.js';
import type { ScreenName } from '../app.js';

interface ScreenContext {
  root: HTMLElement;
  navigate: (screen: ScreenName) => void;
  setCredentials: (creds: XtreamCredentials) => void;
  showToast: (message: string) => void;
}

const storage = new TizenSecureStorage();
const CREDS_KEY = 'xtream:credentials';

export function createLoginScreen(context: ScreenContext) {
  const container = document.createElement('div');
  container.innerHTML = `
    <h1>OmniTV</h1>
    <form>
      <label>Host/URL
        <input data-focus name="host" placeholder="https://" required />
      </label>
      <label>Username
        <input data-focus name="username" required />
      </label>
      <label>Password
        <input data-focus name="password" type="password" required />
      </label>
      <button data-focus type="submit">Entrar</button>
    </form>
    <p>Suporta apenas login Xtream player_api.</p>
  `;

  storage.getItem(CREDS_KEY).then((stored) => {
    if (!stored) return;
    try {
      const form = container.querySelector('form');
      const creds = JSON.parse(stored) as XtreamCredentials;
      (form?.elements.namedItem('host') as HTMLInputElement).value = creds.host;
      (form?.elements.namedItem('username') as HTMLInputElement).value = creds.username;
      (form?.elements.namedItem('password') as HTMLInputElement).value = creds.password;
      context.setCredentials(creds);
    } catch (error) {
      console.warn('Falha ao ler credenciais salvas', error);
    }
  });

  container.querySelector('form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const data = new FormData(form);
    const credentials: XtreamCredentials = {
      host: String(data.get('host')),
      username: String(data.get('username')),
      password: String(data.get('password')),
    };

    try {
      const client = new XtreamClient(credentials);
      await client.ping();
      await storage.setItem(CREDS_KEY, JSON.stringify(credentials));
      context.setCredentials(credentials);
      context.showToast('Login bem-sucedido');
      context.navigate('home');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao conectar';
      context.showToast(message.includes('timeout') ? 'Servidor demorou a responder' : message);
    }
  });

  context.root.appendChild(container);
}
