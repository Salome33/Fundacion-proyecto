import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FUNDACION_CONTACT } from './fundacion-contact.config';

@Component({
  selector: 'app-home-view',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './clinical-theme.css',
  template: `
    <div class="app-view app-view--wide">
      <section class="dashboard-window clinical-hub-page">
        <div class="clinical-view-stack clinical-hub-page-body dashboard-window-body">
          <header class="app-view-head app-page-title clinical-hub-hero">
            <div class="lun-brand-logo clinical-hub-brand-logo">
              <img src="assets/fundacion/logo-emblem.png" alt="Fundación Manos Unidas de Dios" />
            </div>
            <h1>Ingreso y valoración clínica</h1>
            <p class="panel-lead">
              @if (auth.canEdit()) {
                Bienvenido al sistema de historia clínica del adulto mayor. Use el panel lateral para
                navegar entre vistas: explorar resultados, consultar fichas, citas, signos vitales y
                notas de enfermería.
              } @else {
                Bienvenido al sistema de consulta de historia clínica. Puede revisar la información
                registrada en explorar apartados, fichas, citas, signos vitales y notas de enfermería.
              }
            </p>
          </header>

          @if (auth.canEdit()) {
            <section class="clinical-section-card clinical-hub-cta">
              <h2 class="appointments-subtitle">Registro de adultos mayores</h2>
              <p class="panel-lead">
                El formulario incluye todas las secciones del formato en una sola página con índice
                lateral. Al guardar, la información quedará disponible en las demás vistas del sistema.
              </p>
              <a routerLink="/nuevo" class="btn btn-secondary btn-gold--xl">+ Nuevo adulto mayor</a>
            </section>
          }

          <section class="clinical-section-card">
            <h2 class="appointments-subtitle">Acceso rápido</h2>
            <p class="panel-lead">
              Vistas operativas y consulta de información clínica registrada en el sistema.
            </p>
            <div class="clinical-hub-nav-grid">
              <a routerLink="/explorar" class="clinical-hub-nav-card">
                <strong>Explorar apartados</strong>
                <span>Consulte resultados por título de sección</span>
              </a>
              <a routerLink="/fichas" class="clinical-hub-nav-card">
                <strong>Fichas completas</strong>
                <span>Abra el formulario completo de cada adulto mayor</span>
              </a>
              <a routerLink="/citas" class="clinical-hub-nav-card">
                <strong>Citas médicas</strong>
                <span>Calendario y agendamiento</span>
              </a>
              <a routerLink="/signos-vitales" class="clinical-hub-nav-card">
                <strong>Registro de signos vitales</strong>
                <span>Registro por turno del día</span>
              </a>
              <a routerLink="/notas-enfermeria" class="clinical-hub-nav-card">
                <strong>Notas de enfermería</strong>
                <span>Registro de observaciones</span>
              </a>
            </div>
          </section>

          <footer class="clinical-hub-contact clinical-foundation-contact">
            <a
              class="clinical-foundation-contact-site"
              [href]="contact.websiteUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ contact.website }}
            </a>
            <a class="clinical-foundation-contact-line" [href]="'mailto:' + contact.email">
              {{ contact.email }}
            </a>
            <p class="clinical-foundation-contact-line">{{ contact.phones }}</p>
            <p class="clinical-foundation-contact-line">{{ contact.location }}</p>
          </footer>
        </div>
      </section>
    </div>
  `,
})
export class HomeViewComponent {
  readonly auth = inject(AuthService);
  readonly contact = FUNDACION_CONTACT;
}
