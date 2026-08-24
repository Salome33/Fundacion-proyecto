import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CLINICAL_NAV_SECTIONS } from './clinical-sections';

/** Índice lateral de apartados (formulario y vistas por sección). */
@Component({
  selector: 'app-section-index-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="lun-sidebar lun-sidebar--index">
      <div class="lun-brand lun-brand--compact">
        <p class="lun-brand-title">Índice</p>
        <p class="lun-brand-sub">Apartados de la ficha</p>
      </div>
      <nav class="lun-sidebar-nav lun-sidebar-nav--compact">
        <a
          class="lun-nav-item lun-nav-item--sm"
          routerLink="/"
          routerLinkActive="lun-nav-item--active"
          [routerLinkActiveOptions]="{ exact: true }"
          >Inicio</a
        >
        @for (item of sections; track item.path) {
          <a
            class="lun-nav-item lun-nav-item--sm"
            [routerLink]="['/seccion', item.path]"
            routerLinkActive="lun-nav-item--active"
            [routerLinkActiveOptions]="{ exact: true }"
            >{{ item.label }}</a
          >
        }
      </nav>
      <div class="lun-sidebar-foot">
        <a routerLink="/nuevo" class="btn btn-secondary btn-gold--block">+ Nuevo adulto mayor</a>
      </div>
    </aside>
  `,
})
export class SectionIndexSidebarComponent {
  readonly sections = CLINICAL_NAV_SECTIONS;
}
