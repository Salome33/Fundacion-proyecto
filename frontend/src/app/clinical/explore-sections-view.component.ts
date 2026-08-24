import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CLINICAL_NAV_SECTIONS } from './clinical-sections';

@Component({
  selector: 'app-explore-sections-view',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './clinical-theme.css',
  template: `
    <div class="app-view app-view--wide">
      <section class="dashboard-window clinical-hub-page">
        <div class="clinical-view-stack clinical-hub-page-body dashboard-window-body">
          <header class="app-view-head app-page-title">
            <h1>Explorar resultados por apartado</h1>
            <p class="panel-lead">
              Seleccione un título del índice del formulario para ver el listado de adultos mayores
              y consultar la información registrada en ese apartado.
            </p>
          </header>

          <section class="clinical-section-card">
            <h2 class="appointments-subtitle">Apartados del formulario</h2>
            <p class="panel-lead">
              {{ sections.length }} secciones disponibles. Elija una para filtrar adultos mayores y
              revisar los datos de ese apartado.
            </p>
            <div class="clinical-hub-nav-grid clinical-hub-nav-grid--sections">
              @for (sec of sections; track sec.path) {
                <a class="clinical-hub-nav-card" [routerLink]="['/seccion', sec.path]">
                  <strong>{{ sec.label }}</strong>
                  <span>{{ sec.description }}</span>
                </a>
              }
            </div>
          </section>
        </div>
      </section>
    </div>
  `,
})
export class ExploreSectionsViewComponent {
  readonly sections = CLINICAL_NAV_SECTIONS;
}
