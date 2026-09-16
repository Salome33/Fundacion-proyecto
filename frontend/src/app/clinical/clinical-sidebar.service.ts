import { Injectable, signal } from '@angular/core';

const DESKTOP_QUERY = '(min-width: 961px)';

@Injectable({ providedIn: 'root' })
export class ClinicalSidebarService {
  /** En móvil controla si el panel lateral está visible. En escritorio siempre abierto. */
  readonly open = signal(false);

  constructor() {
    if (typeof window === 'undefined') {
      return;
    }
    const mq = window.matchMedia(DESKTOP_QUERY);
    this.open.set(mq.matches);
    mq.addEventListener('change', (event) => {
      this.open.set(event.matches);
    });
  }

  toggle(): void {
    if (this.isDesktop()) {
      return;
    }
    this.open.update((value) => !value);
  }

  /** Abre el panel lateral (en móvil); cerrar solo con la × del panel. */
  openPanel(): void {
    if (!this.isDesktop()) {
      this.open.set(true);
    }
  }

  close(): void {
    if (!this.isDesktop()) {
      this.open.set(false);
    }
  }

  isDesktop(): boolean {
    if (typeof window === 'undefined') {
      return true;
    }
    return window.matchMedia(DESKTOP_QUERY).matches;
  }
}
