import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { patientAppointmentKey } from './medical-appointments.service';
import { RegisteredPatientService } from './registered-patient.service';

export type VitalsShift = 'manana' | 'mediodia' | 'tarde';

export interface VitalsReading {
  ta: string;
  fc: string;
  fr: string;
  spo2: string;
}

export interface DailyVitalsEntry {
  id: string;
  patientKey: string;
  patientNombre: string;
  patientIdentificacion: string;
  fecha: string;
  turno: VitalsShift;
  ta: string;
  fc: string;
  fr: string;
  spo2: string;
  createdAt: string;
}

interface ApiVital {
  id: string;
  fichaId: string;
  patientNombre: string;
  patientIdentificacion: string;
  fecha: string;
  turno: VitalsShift;
  ta: string;
  fc: string;
  fr: string;
  spo2: string;
  createdAt: string;
}

export const VITALS_SHIFT_LABELS: Record<VitalsShift, string> = {
  manana: 'Mañana',
  mediodia: 'Mediodía',
  tarde: 'Tarde',
};

/**
 * Registro diario de signos vitales (mañana / mediodía / tarde).
 * Independiente del apartado «Signos vitales» del formulario de ingreso clínico.
 */
@Injectable({ providedIn: 'root' })
export class DailyVitalsService {
  private readonly http = inject(HttpClient);
  private readonly patients = inject(RegisteredPatientService);

  readonly entries = signal<DailyVitalsEntry[]>([]);
  readonly loading = signal(false);

  constructor() {
    this.loadFromServer();
  }

  loadFromServer(): void {
    this.loading.set(true);
    this.http.get<ApiVital[]>('/api/signos-vitales-diarios').subscribe({
      next: (rows) => {
        this.entries.set((rows ?? []).map((r) => this.fromApi(r)));
        this.loading.set(false);
      },
      error: () => {
        this.entries.set([]);
        this.loading.set(false);
      },
    });
  }

  private fromApi(row: ApiVital): DailyVitalsEntry {
    return {
      id: row.id,
      patientKey: patientAppointmentKey(row.patientNombre, row.patientIdentificacion),
      patientNombre: row.patientNombre,
      patientIdentificacion: row.patientIdentificacion,
      fecha: row.fecha,
      turno: row.turno,
      ta: row.ta,
      fc: row.fc,
      fr: row.fr,
      spo2: row.spo2,
      createdAt: row.createdAt,
    };
  }

  forPatientOnDate(nombre: string, identificacion: string, fecha: string): DailyVitalsEntry[] {
    const key = patientAppointmentKey(nombre, identificacion);
    return this.entries().filter((e) => e.patientKey === key && e.fecha === fecha);
  }

  allSorted(): DailyVitalsEntry[] {
    return [...this.entries()].sort((a, b) => {
      const da = this.parseDisplayDate(a.fecha);
      const db = this.parseDisplayDate(b.fecha);
      if (da !== db) {
        return db - da;
      }
      const nameCmp = a.patientNombre.localeCompare(b.patientNombre, 'es');
      if (nameCmp !== 0) {
        return nameCmp;
      }
      const order: Record<VitalsShift, number> = { manana: 0, mediodia: 1, tarde: 2 };
      return order[a.turno] - order[b.turno];
    });
  }

  forPatient(nombre: string, identificacion: string): DailyVitalsEntry[] {
    const key = patientAppointmentKey(nombre, identificacion);
    return this.entries()
      .filter((e) => e.patientKey === key)
      .sort((a, b) => {
        const da = this.parseDisplayDate(a.fecha);
        const db = this.parseDisplayDate(b.fecha);
        if (da !== db) {
          return db - da;
        }
        const order: Record<VitalsShift, number> = { manana: 0, mediodia: 1, tarde: 2 };
        return order[a.turno] - order[b.turno];
      });
  }

  removeEntry(id: string): void {
    this.http.delete(`/api/signos-vitales-diarios/${id}`).subscribe({
      next: () => {
        this.entries.update((list) => list.filter((e) => e.id !== id));
      },
    });
  }

  private parseDisplayDate(fecha: string): number {
    const parts = fecha.includes('/') ? fecha.split('/') : fecha.split('-');
    if (parts.length === 3) {
      if (fecha.includes('/')) {
        const [d, m, y] = parts.map(Number);
        return new Date(y, m - 1, d).getTime();
      }
      const [y, m, d] = parts.map(Number);
      return new Date(y, m - 1, d).getTime();
    }
    return 0;
  }

  saveShift(input: {
    patientNombre: string;
    patientIdentificacion: string;
    fecha: string;
    turno: VitalsShift;
    reading: VitalsReading;
  }): Observable<DailyVitalsEntry | null> {
    const registered = this.patients.resolvePatient(input.patientNombre, input.patientIdentificacion);
    if (!registered) {
      return of(null);
    }
    const body = {
      patientNombre: input.patientNombre,
      patientIdentificacion: input.patientIdentificacion,
      fecha: input.fecha,
      turno: input.turno,
      ta: input.reading.ta.trim(),
      fc: input.reading.fc.trim(),
      fr: input.reading.fr.trim(),
      spo2: input.reading.spo2.trim(),
    };
    return this.http.put<ApiVital>('/api/signos-vitales-diarios', body).pipe(
      map((row) => this.fromApi(row)),
      tap((entry) => {
        this.entries.update((list) => {
          const idx = list.findIndex((e) => e.id === entry.id);
          if (idx >= 0) {
            const next = [...list];
            next[idx] = entry;
            return next;
          }
          return [...list, entry];
        });
      }),
      catchError(() => of(null)),
    );
  }
}
