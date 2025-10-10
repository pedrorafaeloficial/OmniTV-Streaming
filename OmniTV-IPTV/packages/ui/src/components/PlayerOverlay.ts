export interface TrackOption {
  id: string;
  label: string;
}

export interface PlayerOverlayOptions {
  onQualityChange?: (id: string) => void;
  onAudioChange?: (id: string) => void;
  onSubtitleChange?: (id: string) => void;
  onSeek?: (direction: 'forward' | 'backward') => void;
  onClose?: () => void;
}

export class PlayerOverlay {
  private container: HTMLElement;

  constructor(private options: PlayerOverlayOptions) {
    this.container = document.createElement('div');
    this.container.className = 'player-overlay';
    Object.assign(this.container.style, {
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      background: 'rgba(0, 0, 0, 0.7)',
      padding: '24px',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
      fontSize: '26px',
    });
    this.container.innerHTML = `
      <div>
        <strong>Qualidade</strong>
        <div data-quality></div>
      </div>
      <div>
        <strong>Áudio</strong>
        <div data-audio></div>
      </div>
      <div>
        <strong>Legenda</strong>
        <div data-subtitle></div>
      </div>
      <div>
        <button data-seek-back data-focus>« 10s</button>
        <button data-seek-forward data-focus>10s »</button>
        <button data-close data-focus>Fechar</button>
      </div>
    `;
    this.bind();
  }

  mount(target: HTMLElement): void {
    target.appendChild(this.container);
    this.container.querySelector<HTMLButtonElement>('[data-focus]')?.focus();
  }

  private bind(): void {
    this.container.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.dataset.seekBack !== undefined) {
        this.options.onSeek?.('backward');
      }
      if (target.dataset.seekForward !== undefined) {
        this.options.onSeek?.('forward');
      }
      if (target.dataset.close !== undefined) {
        this.options.onClose?.();
        this.destroy();
      }
    });
  }

  setQualityOptions(options: TrackOption[]): void {
    this.renderOptions('quality', options, this.options.onQualityChange);
  }

  setAudioOptions(options: TrackOption[]): void {
    this.renderOptions('audio', options, this.options.onAudioChange);
  }

  setSubtitleOptions(options: TrackOption[]): void {
    this.renderOptions('subtitle', options, this.options.onSubtitleChange);
  }

  private renderOptions(type: 'quality' | 'audio' | 'subtitle', options: TrackOption[], handler?: (id: string) => void) {
    const container = this.container.querySelector(`[data-${type}]`);
    if (!container) return;
    container.innerHTML = '';
    options.forEach((option) => {
      const button = document.createElement('button');
      button.textContent = option.label;
      button.dataset.focus = '';
      button.addEventListener('click', () => handler?.(option.id));
      container.appendChild(button);
    });
  }

  destroy(): void {
    this.container.remove();
  }
}
