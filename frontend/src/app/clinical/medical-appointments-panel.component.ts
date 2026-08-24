import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import {
  isAppointmentPast,
  MedicalAppointment,
  MedicalAppointmentsService,
} from './medical-appointments.service';
import { REGISTERED_PATIENT_REQUIRED_MSG } from './registered-patient.service';
import { ClinicalDialogComponent } from './clinical-dialog.component';

interface CalendarDay {
  date: string;
  day: number;
  inMonth: boolean;
  isToday: boolean;
}

@Component({
  selector: 'app-medical-appointments-panel',
  standalone: true,
  imports: [FormsModule, ClinicalDialogComponent],
  template: `
    <section class="dashboard-appointments med-appt-panel" [class.dashboard-window]="embedded()">
      @if (!embedded() && !expanded()) {
        <button type="button" class="dashboard-appointments-trigger" (click)="expanded.set(true)">
          <span class="dashboard-appointments-trigger-title">Calendario de citas médicas</span>
          <span class="dashboard-appointments-trigger-hint">Ver calendario y agendar citas</span>
        </button>
      } @else {
        <div
          class="dashboard-appointments-panel med-appt-panel-body clinical-view-stack"
          [class.dashboard-window-body]="embedded()"
        >
          <header class="app-view-head app-page-title">
            <h1>Calendario de citas médicas</h1>
            <p class="panel-lead">
              Citas programadas de adultos mayores con ficha registrada. Cuando llegue la fecha y hora,
              la cita permanece visible hasta que el personal la marque como finalizada. Use el filtro
              por adulto mayor para consultar citas anteriores ya cerradas.
            </p>
          </header>

          <section class="clinical-section-card med-appt-query-section">
            <header class="clinical-section-card-head">
              <div class="clinical-section-card-head-text">
                <h3 class="appointments-subtitle">Consulta de citas médicas</h3>
                <p class="panel-lead">
                  Use el filtro por adulto mayor para consultar citas activas e historial finalizado.
                </p>
              </div>
              @if (auth.canEdit()) {
                <button type="button" class="btn btn-secondary btn-gold--xl" (click)="addDialogOpen.set(true)">
                  + Agendar cita médica
                </button>
              }
            </header>

            <div class="med-appt-filter-bar">
              <p class="med-appt-filter-heading">Filtrar historial por adulto mayor</p>
              <div class="med-appt-filter-grid">
              <label class="med-appt-filter-field">
                Nombre completo
                <input
                  type="search"
                  [ngModel]="filterNombre()"
                  (ngModelChange)="filterNombre.set($event)"
                  name="filterNombre"
                  autocomplete="off"
                />
              </label>
              <label class="med-appt-filter-field">
                Documento de identidad
                <input
                  type="search"
                  [ngModel]="filterDocumento()"
                  (ngModelChange)="filterDocumento.set($event)"
                  name="filterDocumento"
                  autocomplete="off"
                />
              </label>
            </div>
            @if (filterActive()) {
              <div class="med-appt-filter-actions">
                <label class="med-appt-filter-check">
                  <input
                    type="checkbox"
                    [ngModel]="showHistorial()"
                    (ngModelChange)="showHistorial.set($event)"
                    name="showHistorial"
                  />
                  Incluir citas anteriores finalizadas de este adulto mayor
                </label>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm med-appt-filter-clear"
                  (click)="clearFilter()"
                >
                  Ver todos
                </button>
              </div>
            }
          </div>
          </section>

          @if (filterActive() && showHistorial()) {
            <section class="clinical-section-card med-appt-history-block">
              <h3 class="appointments-subtitle">Citas anteriores del adulto mayor</h3>
              <p class="panel-lead">
                Citas ya finalizadas por el personal. No aparecen en el calendario activo.
              </p>
              @if (historialAppointments().length === 0) {
                <p class="appointments-empty">No hay citas anteriores finalizadas para este filtro.</p>
              } @else {
                <ul class="appointments-list med-appt-history-list">
                  @for (cita of historialAppointments(); track cita.id) {
                    <li class="appointments-list-item med-appt-history-item">
                      <div>
                        <strong>{{ formatShortDate(cita.fecha) }} · {{ cita.hora || '—' }} · {{ cita.patientNombre }}</strong>
                        <span>{{ cita.tipoCita }}</span>
                        <span class="appointments-list-doctor">{{ cita.nombreMedico }}</span>
                        @if (cita.finalizadaAt) {
                          <span class="med-appt-history-closed">
                            Finalizada: {{ formatDateTime(cita.finalizadaAt) }}
                          </span>
                        }
                      </div>
                      @if (auth.canEdit()) {
                        <button type="button" class="link-remove" (click)="removeCita(cita.id)">
                          Eliminar
                        </button>
                      }
                    </li>
                  }
                </ul>
              }
            </section>
          }

          <div class="clinical-section-card med-appt-calendar-block">
            <div class="gcal-toolbar">
            <div class="gcal-toolbar-nav">
              <button type="button" class="btn btn-secondary btn-sm" (click)="prevMonth()" aria-label="Mes anterior">
                ‹
              </button>
              <button type="button" class="btn btn-secondary btn-sm" (click)="goToday()">Hoy</button>
              <button type="button" class="btn btn-secondary btn-sm" (click)="nextMonth()" aria-label="Mes siguiente">
                ›
              </button>
            </div>
            <strong class="gcal-toolbar-title">{{ monthLabel() }}</strong>
          </div>

          <div class="gcal-month" aria-label="Calendario mensual de citas médicas">
            @for (weekday of weekdays; track weekday) {
              <div class="gcal-weekday">{{ weekday }}</div>
            }
            @for (cell of calendarDays(); track cell.date + '-' + cell.day + '-' + cell.inMonth) {
              <div
                class="gcal-day"
                [class.gcal-day--muted]="!cell.inMonth"
                [class.gcal-day--today]="cell.isToday"
                [class.gcal-day--selected]="selectedDate() === cell.date"
                (click)="pickDate(cell)"
                (keydown.enter)="pickDate(cell)"
                [attr.tabindex]="cell.inMonth ? 0 : -1"
                role="button"
              >
                @if (cell.inMonth) {
                  <span class="gcal-day-num">{{ cell.day }}</span>
                }
              </div>
            }
          </div>
          </div>

          @if (todayAppointments().length > 0) {
            <section class="clinical-section-card med-appt-today-block">
              <h3 class="appointments-subtitle">Citas de hoy · {{ formatDate(todayIso()) }}</h3>
              <p class="panel-lead med-appt-today-lead">
                Citas programadas para el día actual. Use el filtro para consultar otras fechas en el
                historial.
              </p>
              <ul class="appointments-list med-appt-today-list">
                @for (cita of todayAppointments(); track cita.id) {
                  <li
                    class="appointments-list-item"
                    [class.med-appt-list-item--pending]="isPastDue(cita)"
                  >
                    <div>
                      <strong>{{ cita.hora || '—' }} · {{ cita.patientNombre }}</strong>
                      <span>{{ cita.tipoCita }}</span>
                      <span class="appointments-list-doctor">{{ cita.nombreMedico }}</span>
                      <span class="appointments-list-id">Doc. {{ cita.patientIdentificacion }}</span>
                      @if (isPastDue(cita)) {
                        <span class="med-appt-pending-badge">Pendiente de cierre</span>
                      }
                    </div>
                    @if (auth.canEdit()) {
                      @if (isPastDue(cita)) {
                        <label class="med-appt-finalize-check">
                          <input
                            type="checkbox"
                            [checked]="false"
                            (change)="finalizeCita(cita)"
                          />
                          Cita finalizada
                        </label>
                      } @else {
                        <button type="button" class="link-remove" (click)="removeCita(cita.id)">
                          Cancelar cita
                        </button>
                      }
                    }
                  </li>
                }
              </ul>
            </section>
          }

          @if (addDialogOpen()) {
            <app-clinical-dialog title="Agendar cita médica" size="lg" (closed)="closeAddDialog()">
              <p class="panel-lead clinical-dialog-intro">
                Complete los datos del adulto mayor registrado y de la cita. El nombre y documento
                deben coincidir con una ficha existente.
              </p>
              <form class="med-appt-book-form field-grid" (ngSubmit)="saveAppointment()">
                <label
                  >Nombre completo del adulto mayor
                  <input
                    [(ngModel)]="formNombre"
                    name="formNombre"
                    required
                    autocomplete="name"
                  />
                </label>
                <label
                  >Documento de identidad
                  <input
                    [(ngModel)]="formIdentificacion"
                    name="formIdentificacion"
                    required
                    autocomplete="off"
                  />
                </label>
                <label class="field-full"
                  >Tipo de cita médica / motivo
                  <input
                    [(ngModel)]="formTipoCita"
                    name="formTipoCita"
                    required
                  />
                </label>
                <label
                  >Fecha
                  <input [(ngModel)]="formFecha" name="formFecha" type="date" required />
                </label>
                <label
                  >Hora
                  <input [(ngModel)]="formHora" name="formHora" type="time" required />
                </label>
                <label class="field-full"
                  >Nombre del médico
                  <input
                    [(ngModel)]="formMedico"
                    name="formMedico"
                    required
                  />
                </label>
                @if (bookError()) {
                  <p class="appointments-ident-error field-full">{{ bookError() }}</p>
                }
                @if (saveMsg()) {
                  <p class="med-appt-save-ok field-full">{{ saveMsg() }}</p>
                }
                <div class="field-full clinical-dialog-actions">
                  <button type="submit" class="btn btn-secondary btn-gold--xl">Guardar cita</button>
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
export class MedicalAppointmentsPanelComponent {
  private readonly appointmentsApi = inject(MedicalAppointmentsService);
  readonly auth = inject(AuthService);

  readonly embedded = input(false);
  readonly weekdays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  expanded = signal(false);
  addDialogOpen = signal(false);
  filterNombre = signal('');
  filterDocumento = signal('');
  showHistorial = signal(false);
  viewMonth = signal(this.startOfMonth(new Date()));
  selectedDate = signal(this.todayIso());

  formNombre = '';
  formIdentificacion = '';
  formTipoCita = '';
  formFecha = this.todayIso();
  formHora = '09:00';
  formMedico = '';

  bookError = signal('');
  saveMsg = signal('');

  readonly todayAppointments = computed(() => {
    this.appointmentsApi.appointments();
    this.filterNombre();
    this.filterDocumento();
    const today = this.todayIso();
    let list = this.appointmentsApi.activeSorted().filter((a) => a.fecha === today);
    if (this.filterActive()) {
      list = this.applyPatientFilter(list);
    }
    return list.sort((a, b) => (a.hora ?? '').localeCompare(b.hora ?? ''));
  });

  readonly historialAppointments = computed(() => {
    this.appointmentsApi.appointments();
    this.filterNombre();
    this.filterDocumento();
    this.showHistorial();
    if (!this.filterActive() || !this.showHistorial()) {
      return [];
    }
    const all = this.appointmentsApi.allSorted().filter((a) => !!a.finalizada);
    return this.applyPatientFilter(all).sort((a, b) =>
      `${b.fecha} ${b.hora ?? ''}`.localeCompare(`${a.fecha} ${a.hora ?? ''}`),
    );
  });

  private applyPatientFilter(list: MedicalAppointment[]): MedicalAppointment[] {
    const nameQ = this.filterNombre().trim().toLowerCase();
    const docQ = this.filterDocumento().trim().toLowerCase();
    if (!nameQ && !docQ) {
      return list;
    }
    return list.filter((a) => this.matchesPatientFilter(a, nameQ, docQ));
  }

  private matchesPatientFilter(
    a: MedicalAppointment,
    nameQ: string,
    docQ: string,
  ): boolean {
    const patientName = this.normalizeSearchText(a.patientNombre);
    const patientDoc = this.normalizeSearchText(a.patientIdentificacion);
    const normalizedNameQ = this.normalizeSearchText(nameQ);
    const normalizedDocQ = this.normalizeSearchText(docQ);

    if (normalizedNameQ) {
      const terms = normalizedNameQ.split(/\s+/).filter(Boolean);
      const nameWords = patientName.split(/\s+/).filter(Boolean);
      const nameOk = terms.every(
        (term) =>
          patientName.includes(term) || nameWords.some((word) => word.startsWith(term)),
      );
      if (!nameOk) {
        return false;
      }
    }

    if (normalizedDocQ && !patientDoc.includes(normalizedDocQ)) {
      return false;
    }

    return true;
  }

  private normalizeSearchText(value: string): string {
    return value
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .trim();
  }

  readonly monthLabel = computed(() =>
    this.viewMonth().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
  );

  readonly calendarDays = computed((): CalendarDay[] => {
    const month = this.viewMonth();
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;
    const today = this.todayIso();
    const cells: CalendarDay[] = [];

    const prevMonthDays = new Date(year, monthIndex, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = this.toIso(year, monthIndex - 1, day);
      cells.push({
        date,
        day,
        inMonth: false,
        isToday: date === today,
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = this.toIso(year, monthIndex, day);
      cells.push({
        date,
        day,
        inMonth: true,
        isToday: date === today,
      });
    }

    let trailingDay = 1;
    while (cells.length % 7 !== 0) {
      const date = this.toIso(year, monthIndex + 1, trailingDay);
      cells.push({
        date,
        day: trailingDay,
        inMonth: false,
        isToday: date === today,
      });
      trailingDay++;
    }

    return cells;
  });

  isPastDue = isAppointmentPast;

  todayIso(): string {
    return this.toIso(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  }

  filterActive(): boolean {
    return this.filterNombre().trim().length > 0 || this.filterDocumento().trim().length > 0;
  }

  clearFilter(): void {
    this.filterNombre.set('');
    this.filterDocumento.set('');
    this.showHistorial.set(false);
  }

  closeAddDialog(): void {
    this.addDialogOpen.set(false);
    this.bookError.set('');
  }

  pickDate(cell: CalendarDay): void {
    if (!cell.inMonth && !cell.date) {
      return;
    }
    if (!cell.inMonth) {
      const [y, m] = cell.date.split('-').map(Number);
      this.viewMonth.set(new Date(y, m - 1, 1));
    }
    this.selectedDate.set(cell.date);
    this.formFecha = cell.date;
  }

  prevMonth(): void {
    const d = this.viewMonth();
    this.viewMonth.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const d = this.viewMonth();
    this.viewMonth.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  goToday(): void {
    const now = new Date();
    this.viewMonth.set(this.startOfMonth(now));
    const iso = this.todayIso();
    this.selectedDate.set(iso);
    this.formFecha = iso;
  }

  saveAppointment(): void {
    const nombre = this.formNombre.trim();
    const identificacion = this.formIdentificacion.trim();
    const tipoCita = this.formTipoCita.trim();
    const fecha = this.formFecha;
    const hora = this.formHora.trim();
    const medico = this.formMedico.trim();

    if (!nombre || !identificacion || !tipoCita || !fecha || !hora || !medico) {
      this.bookError.set('Complete todos los campos del formulario.');
      this.saveMsg.set('');
      return;
    }

    this.bookError.set('');
    this.appointmentsApi
      .addAppointment({
        patientNombre: nombre,
        patientIdentificacion: identificacion,
        tipoCita,
        fecha,
        hora,
        nombreMedico: medico,
      })
      .subscribe((saved) => {
        if (!saved) {
          this.bookError.set(REGISTERED_PATIENT_REQUIRED_MSG);
          this.saveMsg.set('');
          return;
        }

        this.formTipoCita = '';
        this.formMedico = '';
        this.formNombre = saved.patientNombre;
        this.formIdentificacion = saved.patientIdentificacion;
        this.filterNombre.set('');
        this.filterDocumento.set('');
        this.showHistorial.set(false);
        this.saveMsg.set('Cita guardada correctamente.');
        const [y, m] = fecha.split('-').map(Number);
        this.viewMonth.set(new Date(y, m - 1, 1));
        this.selectedDate.set(fecha);
        this.formFecha = fecha;

        this.addDialogOpen.set(false);
        setTimeout(() => this.saveMsg.set(''), 3000);
      });
  }

  finalizeCita(cita: MedicalAppointment): void {
    this.appointmentsApi.markFinalized(cita.id);
    this.filterNombre.set(cita.patientNombre);
    this.filterDocumento.set(cita.patientIdentificacion);
    this.showHistorial.set(true);
    this.saveMsg.set('Cita marcada como finalizada.');
    setTimeout(() => this.saveMsg.set(''), 3000);
  }

  removeCita(id: string): void {
    this.appointmentsApi.removeAppointment(id);
  }

  formatShortDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  private toIso(year: number, month: number, day: number): string {
    const d = new Date(year, month, day);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
}
