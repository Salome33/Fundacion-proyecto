import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { patientAppointmentKey } from './medical-appointments.service';
import { RegisteredPatientService } from './registered-patient.service';

export interface NursingNote {
  id: string;
  patientKey: string;
  patientNombre: string;
  patientIdentificacion: string;
  fecha: string;
  hora: string;
  detalle: string;
  createdAt: string;
}

interface ApiNota {
  id: string;
  fichaId: string;
  patientNombre: string;
  patientIdentificacion: string;
  fecha: string;
  hora: string;
  detalle: string;
  createdAt: string;
}

/**
 * Notas de enfermería diarias — independiente del formulario de ingreso clínico.
 */
@Injectable({ providedIn: 'root' })
export class NursingNotesService {
  private readonly http = inject(HttpClient);
  private readonly patients = inject(RegisteredPatientService);

  readonly notes = signal<NursingNote[]>([]);
  readonly loading = signal(false);

  constructor() {
    this.loadFromServer();
  }

  loadFromServer(): void {
    this.loading.set(true);
    this.http.get<ApiNota[]>('/api/notas-enfermeria').subscribe({
      next: (rows) => {
        this.notes.set((rows ?? []).map((r) => this.fromApi(r)));
        this.loading.set(false);
      },
      error: () => {
        this.notes.set([]);
        this.loading.set(false);
      },
    });
  }

  private fromApi(row: ApiNota): NursingNote {
    return {
      id: row.id,
      patientKey: patientAppointmentKey(row.patientNombre, row.patientIdentificacion),
      patientNombre: row.patientNombre,
      patientIdentificacion: row.patientIdentificacion,
      fecha: row.fecha,
      hora: row.hora,
      detalle: row.detalle,
      createdAt: row.createdAt,
    };
  }

  forPatient(nombre: string, identificacion: string): NursingNote[] {
    const key = patientAppointmentKey(nombre, identificacion);
    return this.notes()
      .filter((n) => n.patientKey === key)
      .sort((a, b) =>
        `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`),
      );
  }

  allSorted(): NursingNote[] {
    return [...this.notes()].sort((a, b) => {
      const cmp = `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`);
      if (cmp !== 0) {
        return cmp;
      }
      return a.patientNombre.localeCompare(b.patientNombre, 'es');
    });
  }

  addNote(input: {
    patientNombre: string;
    patientIdentificacion: string;
    fecha: string;
    hora: string;
    detalle: string;
  }): Observable<NursingNote | null> {
    const registered = this.patients.resolvePatient(input.patientNombre, input.patientIdentificacion);
    if (!registered) {
      return of(null);
    }
    const body = {
      patientNombre: input.patientNombre,
      patientIdentificacion: input.patientIdentificacion,
      fecha: input.fecha,
      hora: input.hora,
      detalle: input.detalle,
    };
    return this.http.post<ApiNota>('/api/notas-enfermeria', body).pipe(
      map((row) => this.fromApi(row)),
      tap((note) => {
        this.notes.update((list) => [note, ...list]);
      }),
      catchError(() => of(null)),
    );
  }

  removeNote(id: string): void {
    this.http.delete(`/api/notas-enfermeria/${id}`).subscribe({
      next: () => {
        this.notes.update((list) => list.filter((n) => n.id !== id));
      },
    });
  }
}
