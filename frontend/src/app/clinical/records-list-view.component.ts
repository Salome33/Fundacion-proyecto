import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { IntakeRecord, IntakeStoreService } from './intake-store.service';

type SortMode = 'recent' | 'oldest' | 'alpha';

@Component({
  selector: 'app-records-list-view',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe],
  styleUrl: './clinical-theme.css',
  template: `
    <div class="app-view app-view--wide">
      <section class="dashboard-window clinical-hub-page">
        <div class="clinical-view-stack clinical-hub-page-body dashboard-window-body">
          <header class="app-view-head app-page-title">
            <h1>Fichas completas por adulto mayor</h1>
            <p class="panel-lead">
              Seleccione un adulto mayor para abrir el formulario completo de ingreso y valoración
              clínica con todas sus secciones. Coordinador y junta pueden consultar e imprimir fichas.
            </p>
          </header>

          @if (flashMsg()) {
            <p class="intake-form-toast" role="status">{{ flashMsg() }}</p>
          }

          @if (store.loadError()) {
            <p class="intake-form-error" role="alert">{{ store.loadError() }}</p>
          }

          @if (store.records().length === 0) {
            <section class="clinical-section-card">
              <h2 class="appointments-subtitle">Fichas registradas</h2>
              <div class="lun-empty clinical-hub-empty">
                <p>
                  @if (store.loadError()) {
                    No se pudieron cargar las fichas desde el servidor.
                  } @else if (auth.canEdit()) {
                    No hay fichas registradas. Use el botón «Nuevo ingreso» del panel lateral o la
                    página de inicio.
                  } @else {
                    No hay fichas registradas en el sistema.
                  }
                </p>
                @if (auth.canEdit()) {
                  <a routerLink="/nuevo" class="btn btn-secondary btn-gold--xl">+ Nuevo adulto mayor</a>
                }
              </div>
            </section>
          } @else {
            <section class="clinical-section-card clinical-section-card--records">
              <h2 class="appointments-subtitle">Fichas registradas</h2>
              <p class="panel-lead">
                {{ store.records().length }} adulto(s) mayor(es) en el sistema. Use el filtro para
                encontrar una ficha.
              </p>

              <div class="records-filter clinical-records-filter">
                <label>
                  Nombre completo
                  <input
                    type="search"
                    [(ngModel)]="qNombre"
                    autocomplete="off"
                  />
                </label>
                <label>
                  Documento de identidad
                  <input
                    type="search"
                    [(ngModel)]="qId"
                    autocomplete="off"
                  />
                </label>
                <label>
                  Ordenar
                  <select [(ngModel)]="sortMode">
                    <option value="recent">Más reciente</option>
                    <option value="oldest">Menos reciente</option>
                    <option value="alpha">Orden alfabético</option>
                  </select>
                </label>
              </div>
              @if (qNombre.trim() || qId.trim()) {
                <div class="records-filter-actions">
                  <button type="button" class="btn btn-secondary btn-sm" (click)="clearFilter()">
                    Ver todos
                  </button>
                  <span class="med-appt-filter-badge">
                    {{ filtered.length }} ficha(s) encontrada(s)
                  </span>
                </div>
              }

              @if (filtered.length === 0) {
                <p class="appointments-empty">No hay coincidencias con la búsqueda.</p>
              } @else {
                <div class="clinical-records-list">
                  @for (rec of filtered; track rec.id) {
                    <article class="clinical-record-card">
                      <div class="clinical-record-card-body">
                        <strong>{{ rec.nombre }}</strong>
                        <p>{{ rec.identificacion || 'Sin documento' }}</p>
                        <small>
                          Registrado: {{ rec.createdAt | date: 'medium' }}
                          @if (rec.updatedAt) {
                            · Actualizado: {{ rec.updatedAt | date: 'medium' }}
                          }
                        </small>
                      </div>
                      <div class="clinical-record-card-actions">
                        <a
                          class="btn btn-secondary"
                          [routerLink]="['/ficha', rec.id]"
                          (click)="store.open(rec.id)"
                        >
                          Ver formulario completo
                        </a>
                        @if (showPrintButton) {
                          <button
                            type="button"
                            class="btn btn-secondary btn-print-ficha"
                            (click)="printFicha(rec.id)"
                            title="Imprimir ficha clínica"
                            [attr.aria-label]="'Imprimir ficha clínica de ' + rec.nombre"
                          >
                            <svg
                              class="btn-print-ficha-icon"
                              viewBox="0 0 24 24"
                              width="18"
                              height="18"
                              aria-hidden="true"
                              focusable="false"
                            >
                              <path
                                fill="#3d2b1f"
                                d="M19 8H5a3 3 0 0 0-3 3v6h4v4h12v-4h4v-6a3 3 0 0 0-3-3zm-1 10H6v-4h12v4zm1-8a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-3-5H7v3h10V5z"
                              />
                            </svg>
                          </button>
                        }
                      </div>
                    </article>
                  }
                </div>
              }
            </section>
          }
        </div>
      </section>
    </div>
  `,
})
export class RecordsListViewComponent implements OnInit {
  readonly showPrintButton = true;

  readonly store = inject(IntakeStoreService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  flashMsg = signal('');

  qNombre = '';
  qId = '';
  sortMode: SortMode = 'recent';

  ngOnInit(): void {
    const msg = this.store.fichasFlashMsg();
    if (msg) {
      this.flashMsg.set(msg);
      this.store.fichasFlashMsg.set('');
      setTimeout(() => this.flashMsg.set(''), 4000);
    }
  }

  clearFilter(): void {
    this.qNombre = '';
    this.qId = '';
  }

  printFicha(id: string): void {
    this.auth.ensureSessionPersisted();
    this.store.stashPrintPayload(id);
    void this.router.navigate(['/ficha', id], { queryParams: { imprimir: '1' } });
  }

  get filtered(): IntakeRecord[] {
    const nameQ = this.qNombre.trim().toLowerCase();
    const idQ = this.qId.trim().toLowerCase();
    let list = [...this.store.records()];
    list = list.filter((r) => {
      if (nameQ && !r.nombre.toLowerCase().includes(nameQ)) {
        return false;
      }
      if (idQ && !(r.identificacion ?? '').toLowerCase().includes(idQ)) {
        return false;
      }
      return true;
    });
    const mode = this.sortMode;
    list.sort((a, b) => {
      if (mode === 'alpha') {
        return a.nombre.localeCompare(b.nombre, 'es');
      }
      const ta = new Date(a.updatedAt ?? a.createdAt).getTime();
      const tb = new Date(b.updatedAt ?? b.createdAt).getTime();
      return mode === 'recent' ? tb - ta : ta - tb;
    });
    return list;
  }
}
