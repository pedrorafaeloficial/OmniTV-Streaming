export interface FocusGridItem {
  element: HTMLElement;
}

export class FocusGrid {
  private index = 0;

  constructor(private container: HTMLElement, private items: FocusGridItem[] = []) {
    this.refresh();
  }

  refresh(): void {
    this.items = Array.from(this.container.querySelectorAll<HTMLElement>('[data-focus]')).map((element) => ({
      element,
    }));
  }

  focus(index = 0): void {
    if (!this.items.length) return;
    this.index = Math.max(0, Math.min(index, this.items.length - 1));
    requestAnimationFrame(() => {
      this.items[this.index].element.focus();
    });
  }

  handleKey(event: KeyboardEvent): void {
    if (!this.items.length) return;
    switch (event.key) {
      case 'ArrowRight':
        this.index = Math.min(this.index + 1, this.items.length - 1);
        break;
      case 'ArrowLeft':
        this.index = Math.max(this.index - 1, 0);
        break;
      default:
        return;
    }
    event.preventDefault();
    this.focus(this.index);
  }
}
