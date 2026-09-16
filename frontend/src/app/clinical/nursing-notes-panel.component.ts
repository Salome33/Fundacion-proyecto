import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { NursingNotesService } from './nursing-notes.service';
import { REGISTERED_PATIENT_REQUIRED_MSG } from './registered-patient.service';
import { ClinicalDialogComponent } from './clinical-dialog.component';

@Component({
  selector: 'app-nursing-notes-panel',
  standalone: true,
  imports: [FormsModule, ClinicalDialogComponent],
  template: `
    <section class="dashboard-appointments nursing-panel" [class.dashboard-window]="embedded()">
      @if (!embedded() && !expanded()) {
        <button type="button" class="dashboard-appointments-trigger" (click)="expanded.set(true)">
          <span class="dashboard-appointments-trigger-title">Notas de enfermería</span>
          <span class="dashboard-appointments-trigger-hint">
            Consulta y registro de notas por adulto mayor
          </span>
        </button>
      } @else {
        <div
          class="dashboard-appointments-panel nursing-panel-body clinical-view-stack"
          [class.dashboard-window-body]="embedded()"
        >
          <header class="app-view-head app-page-title">
            <h1>Notas de enfermería</h1>
            <p class="panel-lead">
              Notas de enfermería solo para adultos mayores con ficha registrada. El nombre y
              documento deben coincidir con una ficha existente.
            </p>
          </header>

          <section class="clinical-section-card vitals-history-section vitals-history-section--top">
            <header class="clinical-section-card-head">
              <div class="clinical-section-card-head-text">
                <h3 class="appointments-subtitle">Notas registradas</h3>
                <p class="panel-lead">
                  Todas las notas de enfermería. Use el filtro para ver solo las de un adulto mayor.
                </p>
              </div>
              @if (auth.canEdit()) {
                <button type="button" class="btn btn-secondary btn-gold--xl" (click)="openAddDialog()">
                  + Registrar nota de enfermería
                </button>
              }
            </header>

            <div class="med-appt-filter-bar vitals-filter-bar">
              <p class="med-appt-filter-heading">Filtrar consulta</p>
              <div class="med-appt-filter-grid">
                <label class="med-appt-filter-field">
                  Nombre completo
                  <input
                    type="search"
                    [(ngModel)]="filterNombre"
                    name="filterNombre"
                    autocomplete="off"
                  />
                </label>
                <label class="med-appt-filter-field">
                  Documento de identidad
                  <input
                    type="search"
                    [(ngModel)]="filterDocumento"
                    name="filterDocumento"
                    autocomplete="off"
                  />
                </label>
              </div>
              @if (filterActive()) {
                <div class="med-appt-filter-actions">
                  <button type="button" class="btn btn-secondary btn-sm" (click)="clearFilter()">
                    Ver todos
                  </button>
                  <span class="med-appt-filter-badge">
                    {{ displayedNotes().length }} nota(s)
                  </span>
                </div>
              }
            </div>

            @if (displayedNotes().length === 0) {
              <p class="appointments-empty">
                @if (filterActive()) {
                  No hay notas de enfermería registradas para este adulto mayor.
                } @else {
                  Aún no hay notas de enfermería registradas en este apartado.
                }
              </p>
            } @else {
              <div class="vitals-history-wrap">
                <table class="lun-table vitals-history-table nursing-notes-table">
                  <thead>
                    <tr>
                      <th>Adulto mayor</th>
                      <th>Documento</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Detalle</th>
                      @if (auth.canEdit()) {
                        <th></th>
                      }
                    </tr>
                  </thead>
                  <tbody>
                    @for (nota of displayedNotes(); track nota.id) {
                      <tr>
                        <td>{{ nota.patientNombre }}</td>
                        <td>{{ nota.patientIdentificacion }}</td>
                        <td>{{ nota.fecha }}</td>
                        <td>{{ nota.hora }}</td>
                        <td class="nursing-note-cell">{{ nota.detalle }}</td>
                        @if (auth.canEdit()) {
                          <td>
                            <button type="button" class="link-remove" (click)="removeNote(nota.id)">
                              Eliminar
                            </button>
                          </td>
                        }
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </section>

          @if (addDialogOpen()) {
            <app-clinical-dialog title="Registrar nueva nota" size="lg" (closed)="closeAddDialog()">
              <p class="panel-lead clinical-dialog-intro">
                Complete los datos del adulto mayor, la fecha, la hora y el detalle de la observación.
              </p>
              <form class="vitals-register-form nursing-register-form field-grid" (ngSubmit)="addNote()">
                <label class="med-appt-filter-field">
                  Nombre completo del adulto mayor
                  <input
                    [(ngModel)]="formNombre"
                    name="formNombre"
                    required
                  />
                </label>
                <label class="med-appt-filter-field">
                  Documento de identidad
                  <input
                    [(ngModel)]="formDocumento"
                    name="formDocumento"
                    required
                  />
                </label>
                <label class="vitals-date-label">
                  Fecha
                  <input
                    [(ngModel)]="formFecha"
                    name="formFecha"
                    type="date"
                    class="input-datetime-hint"
                    required
                  />
                </label>
                <label class="vitals-date-label">
                  Hora
                  <input
                    [(ngModel)]="formHora"
                    name="formHora"
                    type="time"
                    class="input-datetime-hint"
                    required
                  />
                </label>
                <label class="field-full med-appt-filter-field">
                  Detalle
                  <textarea
                    [(ngModel)]="formDetalle"
                    name="formDetalle"
                    rows="8"
                    required
                  ></textarea>
                </label>
                @if (formError()) {
                  <p class="appointments-ident-error field-full">{{ formError() }}</p>
                }
                @if (saveMsg()) {
                  <p class="med-appt-save-ok field-full">{{ saveMsg() }}</p>
                }
                <div class="field-full clinical-dialog-actions">
                  <button type="submit" class="btn btn-secondary btn-gold--xl">Guardar nota</button>
                  <button type="button" class="btn btn-outline-sm" (click)="closeAddDialog()">
                    Cancelar
                  </button>
                </div>
              </form>
            </app-clinical-dialog>
          }
        </div>
      }
    </section>
  `,
})
export class NursingNotesPanelComponent {
  private readonly notesApi = inject(NursingNotesService);
  readonly auth = inject(AuthService);

  readonly embedded = input(false);

  expanded = signal(false);
  addDialogOpen = signal(false);
  filterNombre = '';
  filterDocumento = '';

  formNombre = '';
  formDocumento = '';
  formFecha = '';
  formHora = '';
  formDetalle = '';

  formError = signal('');
  saveMsg = signal('');

  readonly displayedNotes = computed(() => {
    this.notesApi.notes();
    const nameQ = this.filterNombre.trim().toLowerCase();
    const docQ = this.filterDocumento.trim().toLowerCase();
    let list = this.notesApi.allSorted();
    if (!nameQ && !docQ) {
      return list;
    }
    return list.filter((n) => {
      if (nameQ && !n.patientNombre.toLowerCase().includes(nameQ)) {
        return false;
      }
      if (docQ && !n.patientIdentificacion.toLowerCase().includes(docQ)) {
        return false;
      }
      return true;
    });
  });

  filterActive(): boolean {
    return this.filterNombre.trim().length > 0 || this.filterDocumento.trim().length > 0;
  }

  clearFilter(): void {
    this.filterNombre = '';
    this.filterDocumento = '';
  }

  openAddDialog(): void {
    this.formFecha = '';
    this.formHora = '';
    this.formDetalle = '';
    this.formError.set('');
    this.addDialogOpen.set(true);
  }

  closeAddDialog(): void {
    this.addDialogOpen.set(false);
    this.formError.set('');
  }

  addNote(): void {
    const nombre = this.formNombre.trim();
    const documento = this.formDocumento.trim();
    const fecha = this.displayDateFromInput(this.formFecha);
    const hora = this.formHora.trim();
    const detalle = this.formDetalle.trim();

    if (!nombre || !documento) {
      this.formError.set('Complete nombre completo y documento de identidad.');
      this.saveMsg.set('');
      return;
    }
    if (!fecha || !hora || !detalle) {
      this.formError.set('Complete fecha, hora y detalle.');
      this.saveMsg.set('');
      return;
    }

    this.formError.set('');
    this.notesApi
      .addNote({
        patientNombre: nombre,
        patientIdentificacion: documento,
        fecha,
        hora,
        detalle,
      })
      .subscribe((saved) => {
        if (!saved) {
          this.formError.set(REGISTERED_PATIENT_REQUIRED_MSG);
          this.saveMsg.set('');
          return;
        }
        this.formDetalle = '';
        this.saveMsg.set('Nota guardada correctamente.');
        this.addDialogOpen.set(false);
        setTimeout(() => this.saveMsg.set(''), 3000);
      });
  }

  removeNote(id: string): void {
    this.notesApi.removeNote(id);
  }

  private displayDateFromInput(iso: string): string {
    if (!iso) {
      return '';
    }
    const [y, m, d] = iso.split('-');
    if (!y || !m || !d) {
      return iso;
    }
    return `${d}/${m}/${y}`;
  }
}
