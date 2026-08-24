import { NgFor } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { INTAKE_INDEX_ITEMS, IntakeIndexItem } from './intake-index-items';

@Component({
  selector: 'app-intake-index-nav',
  standalone: true,
  imports: [RouterLink, NgFor],
  template: `
    <aside class="lun-sidebar lun-sidebar--scroll-index">
      <div class="lun-brand lun-brand--compact">
        <p class="lun-brand-title">Formulario de ingreso</p>
        <p class="lun-brand-sub">Índice de secciones</p>
      </div>
      <nav class="lun-sidebar-nav lun-sidebar-nav--compact intake-index-nav" aria-label="Índice del formulario">
        <ul class="intake-index-list">
          <li *ngFor="let s of navItems; trackBy: trackByPath">
            <button
              type="button"
              class="intake-index-link"
              [class.intake-index-link--active]="activeAnchor() === s.anchor"
              (click)="sectionClick.emit(s.anchor)"
            >
              {{ s.label }}
            </button>
          </li>
        </ul>
      </nav>
      <div class="lun-sidebar-foot">
        <a routerLink="/" class="btn btn-secondary btn-gold--block">← Volver al inicio</a>
      </div>
    </aside>
  `,
})
export class IntakeIndexNavComponent {
  readonly navItems: IntakeIndexItem[] = INTAKE_INDEX_ITEMS;
  readonly activeAnchor = input('contrato');
  readonly sectionClick = output<string>();

  trackByPath = (_: number, s: IntakeIndexItem): string => s.path;
}
