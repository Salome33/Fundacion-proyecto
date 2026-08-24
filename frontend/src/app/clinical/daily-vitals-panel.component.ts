import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import {
  DailyVitalsService,
  VITALS_SHIFT_LABELS,
  VitalsReading,
  VitalsShift,
} from './daily-vitals.service';
import { REGISTERED_PATIENT_REQUIRED_MSG } from './registered-patient.service';
import { ClinicalDialogComponent } from './clinical-dialog.component';

const SHIFTS: VitalsShift[] = ['manana', 'mediodia', 'tarde'];

@Component({
  selector: 'app-daily-vitals-panel',
  standalone: true,
  imports: [FormsModule, ClinicalDialogComponent],
  template: `
    <section class="dashboard-appointments vitals-panel" [class.dashboard-window]="embedded()">
      @if (!embedded() && !expanded()) {
        <button type="button" class="dashboard-appointments-trigger" (click)="expanded.set(true)">
          <span class="dashboard-appointments-trigger-title">Registro de signos vitales</span>
          <span class="dashboard-appointments-trigger-hint">
            Registro diario por turno: mañana, mediodía y tarde
          </span>
        </button>
      } @else {
        <div
          class="dashboard-appointments-panel vitals-panel-body clinical-view-stack"
          [class.dashboard-window-body]="embedded()"
        >
          <header class="app-view-head app-page-title">
            <h1>Registro de signos vitales</h1>
            <p class="panel-lead">
              Registro diario para adultos mayores con ficha registrada. El nombre y documento deben
              coincidir con una ficha existente antes de guardar signos vitales.
            </p>
          </header>

          <section class="clinical-section-card vitals-history-section vitals-history-section--top">
            <header class="clinical-section-card-head">
              <div class="clinical-section-card-head-text">
                <h3 class="appointments-subtitle">Signos vitales registrados</h3>
                <p class="panel-lead">
                  Todos los adultos mayores con registro diario. Use el filtro para ver solo una persona.
                </p>
              </div>
              @if (auth.canEdit()) {
                <button type="button" class="btn btn-secondary btn-gold--xl" (click)="addDialogOpen.set(true)">
                  + Registrar signos vitales
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
                    {{ displayedRecords().length }} registro(s)
                  </span>
                </div>
              }
            </div>

            @if (displayedRecords().length === 0) {
              <p class="appointments-empty">
                @if (filterActive()) {
                  No hay signos vitales registrados para este adulto mayor en el registro diario.
                } @else {
                  Aún no hay signos vitales registrados en este apartado.
                }
              </p>
            } @else {
              <div class="vitals-history-wrap">
                <table class="lun-table vitals-history-table">
                  <thead>
                    <tr>
                      <th>Adulto mayor</th>
                      <th>Documento</th>
                      <th>Fecha</th>
                      <th>Turno</th>
                      <th>TA</th>
                      <th>FC</th>
                      <th>FR</th>
                      <th>SPO2</th>
                      @if (auth.canEdit()) {
                        <th></th>
                      }
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of displayedRecords(); track row.id) {
                      <tr>
                        <td>{{ row.patientNombre }}</td>
                        <td>{{ row.patientIdentificacion }}</td>
                        <td>{{ row.fecha }}</td>
                        <td>{{ shiftLabels[row.turno] }}</td>
                        <td>{{ row.ta || '—' }}</td>
                        <td>{{ row.fc || '—' }}</td>
                        <td>{{ row.fr || '—' }}</td>
                        <td>{{ row.spo2 || '—' }}</td>
                        @if (auth.canEdit()) {
                          <td>
                            <button type="button" class="link-remove" (click)="removeEntry(row.id)">
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
            <app-clinical-dialog title="Registrar signos vitales" size="xl" (closed)="closeAddDialog()">
              <p class="panel-lead clinical-dialog-intro">
                Complete los datos del adulto mayor, la fecha y los valores por turno (mañana, mediodía
                y tarde).
              </p>
              <div class="vitals-register-form">
                <div class="vitals-register-meta field-grid">
                  <label class="med-appt-filter-field">
                    Nombre completo del adulto mayor
                    <input
                      [(ngModel)]="formNombre"
                      name="formNombre"
                      required
                      (ngModelChange)="loadShiftReadings()"
                    />
                  </label>
                  <label class="med-appt-filter-field">
                    Documento de identidad
                    <input
                      [(ngModel)]="formDocumento"
                      name="formDocumento"
                      required
                      (ngModelChange)="loadShiftReadings()"
                    />
                  </label>
                  <label class="vitals-date-label">
                    Fecha del registro
                    <input
                      [(ngModel)]="fechaRegistro"
                      name="fechaRegistro"
                      type="date"
                      (ngModelChange)="loadShiftReadings()"
                    />
                  </label>
                </div>

                <div class="vitals-shifts">
                  @for (turno of shifts; track turno) {
                    <article class="vitals-shift-card">
                      <h4>{{ shiftLabels[turno] }}</h4>
                      <div class="vitals-shift-grid">
                        <label
                          >TA
                          <input
                            [(ngModel)]="readings[turno].ta"
                            [name]="turno + '_ta'"
                          />
                        </label>
                        <label
                          >FC
                          <input
                            [(ngModel)]="readings[turno].fc"
                            [name]="turno + '_fc'"
                          />
                        </label>
                        <label
                          >FR
                          <input
                            [(ngModel)]="readings[turno].fr"
                            [name]="turno + '_fr'"
                          />
                        </label>
                        <label
                          >SPO2
                          <input
                            [(ngModel)]="readings[turno].spo2"
                            [name]="turno + '_spo2'"
                          />
                        </label>
                      </div>
                      <button type="button" class="btn btn-secondary btn-sm" (click)="saveShift(turno)">
                        Guardar turno {{ shiftLabels[turno].toLowerCase() }}
                      </button>
                      @if (savedMessage() === turno) {
                        <p class="vitals-saved-msg">Turno guardado.</p>
                      }
                    </article>
                  }
                </div>

                @if (saveError()) {
                  <p class="appointments-ident-error">{{ saveError() }}</p>
                }
                <div class="clinical-dialog-actions">
                  <button type="button" class="btn btn-outline-sm" (click)="closeAddDialog()">
                    Cerrar
                  </button>
                </div>
              </div>
            </app-clinical-dialog>
          }
        </div>
      }
    </section>
  `,
})
export class DailyVitalsPanelComponent {
  private readonly vitalsApi = inject(DailyVitalsService);
  readonly auth = inject(AuthService);

  readonly embedded = input(false);
  readonly shifts = SHIFTS;
  readonly shiftLabels = VITALS_SHIFT_LABELS;

  expanded = signal(false);
  addDialogOpen = signal(false);
  filterNombre = '';
  filterDocumento = '';

  formNombre = '';
  formDocumento = '';
  fechaRegistro = this.todayIso();
  saveError = signal('');
  savedMessage = signal<VitalsShift | ''>('');

  readings: Record<VitalsShift, VitalsReading> = {
    manana: { ta: '', fc: '', fr: '', spo2: '' },
    mediodia: { ta: '', fc: '', fr: '', spo2: '' },
    tarde: { ta: '', fc: '', fr: '', spo2: '' },
  };

  readonly displayedRecords = computed(() => {
    this.vitalsApi.entries();
    const nameQ = this.filterNombre.trim().toLowerCase();
    const docQ = this.filterDocumento.trim().toLowerCase();
    let list = this.vitalsApi.allSorted();
    if (!nameQ && !docQ) {
      return list;
    }
    return list.filter((e) => {
      if (nameQ && !e.patientNombre.toLowerCase().includes(nameQ)) {
        return false;
      }
      if (docQ && !e.patientIdentificacion.toLowerCase().includes(docQ)) {
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

  closeAddDialog(): void {
    this.addDialogOpen.set(false);
    this.saveError.set('');
  }

  removeEntry(id: string): void {
    this.vitalsApi.removeEntry(id);
  }

  loadShiftReadings(): void {
    const nombre = this.formNombre.trim();
    const documento = this.formDocumento.trim();
    const fecha = this.displayDateFromInput(this.fechaRegistro);
    if (!nombre || !documento || !fecha) {
      this.resetReadings();
      return;
    }
    const entries = this.vitalsApi.forPatientOnDate(nombre, documento, fecha);
    for (const turno of SHIFTS) {
      const found = entries.find((e) => e.turno === turno);
      this.readings[turno] = found
        ? { ta: found.ta, fc: found.fc, fr: found.fr, spo2: found.spo2 }
        : { ta: '', fc: '', fr: '', spo2: '' };
    }
  }

  saveShift(turno: VitalsShift): void {
    const nombre = this.formNombre.trim();
    const documento = this.formDocumento.trim();
    const fecha = this.displayDateFromInput(this.fechaRegistro);

    if (!nombre || !documento) {
      this.saveError.set('Complete nombre completo y documento de identidad.');
      return;
    }
    if (!fecha) {
      this.saveError.set('Indique la fecha del registro.');
      return;
    }

    this.saveError.set('');
    this.vitalsApi
      .saveShift({
        patientNombre: nombre,
        patientIdentificacion: documento,
        fecha,
        turno,
        reading: this.readings[turno],
      })
      .subscribe((saved) => {
        if (!saved) {
          this.saveError.set(REGISTERED_PATIENT_REQUIRED_MSG);
          return;
        }
        this.savedMessage.set(turno);
        setTimeout(() => {
          if (this.savedMessage() === turno) {
            this.savedMessage.set('');
          }
        }, 2000);
      });
  }

  private resetReadings(): void {
    for (const turno of SHIFTS) {
      this.readings[turno] = { ta: '', fc: '', fr: '', spo2: '' };
    }
  }

  private todayIso(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
