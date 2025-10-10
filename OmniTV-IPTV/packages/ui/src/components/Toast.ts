export class Toast {
  private element: HTMLElement;
  private hideTimeout?: number;

  constructor(message: string, duration = 4000) {
    this.element = document.createElement('div');
    this.element.className = 'toast';
    this.element.textContent = message;
    document.body.appendChild(this.element);
    this.hideTimeout = window.setTimeout(() => this.destroy(), duration);
  }

  destroy(): void {
    if (this.hideTimeout) {
      window.clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }
    this.element.remove();
  }
}
