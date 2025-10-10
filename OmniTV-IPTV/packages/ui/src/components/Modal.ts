export class Modal {
  private element: HTMLElement;

  constructor(content: string) {
    this.element = document.createElement('div');
    this.element.className = 'modal';
    Object.assign(this.element.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '999',
      color: '#fff',
      fontSize: '32px',
      textAlign: 'center',
      padding: '40px',
    });
    this.element.innerHTML = `<div>${content}</div>`;
  }

  show(): void {
    document.body.appendChild(this.element);
    const firstFocusable = this.element.querySelector<HTMLElement>('button, [data-focus]');
    firstFocusable?.focus();
  }

  hide(): void {
    this.element.remove();
  }
}
