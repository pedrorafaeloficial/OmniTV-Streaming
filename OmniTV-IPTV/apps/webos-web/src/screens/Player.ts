import Hls from 'hls.js';
import type { XtreamClient, XtreamStream } from '@omnitv/core';
import { PlayerOverlay } from '@omnitv/ui/src/components/PlayerOverlay.js';
import type { ScreenName } from '../app.js';

interface ScreenContext {
  root: HTMLElement;
  navigate: (screen: ScreenName) => void;
  getClient: () => XtreamClient | null;
  showToast: (message: string) => void;
}

type PlayerParams = {
  type: 'live' | 'vod' | 'series';
  channel?: XtreamStream;
  stream?: XtreamStream;
};

export function createPlayerScreen(context: ScreenContext, params: PlayerParams) {
  const container = document.createElement('div');
  container.innerHTML = `<video controls autoplay style="width:100%;height:100%;background:#000"></video>`;
  const video = container.querySelector('video')!;
  context.root.appendChild(container);

  const client = context.getClient();
  if (!client) {
    context.showToast('Credenciais ausentes');
    context.navigate('login');
    return;
  }

  const stream = params.channel ?? params.stream;
  if (!stream) {
    context.showToast('Conteúdo inválido');
    context.navigate('home');
    return;
  }

  const url = client.buildStreamUrl(params.type, stream.stream_id);
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
  } else if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) context.showToast(`Erro: ${data.type}`);
    });
  } else {
    context.showToast('HLS não suportado');
  }

  const overlay = new PlayerOverlay({
    onSeek: (direction) => {
      video.currentTime += direction === 'forward' ? 10 : -10;
    },
    onClose: () => context.navigate('home'),
  });
  overlay.mount(container);
}
