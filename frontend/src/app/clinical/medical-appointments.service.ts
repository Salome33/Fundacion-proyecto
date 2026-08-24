import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { RegisteredPatientService } from './registered-patient.service';

export interface MedicalAppointment {
  id: string;
  patientKey: string;
  patientNombre: string;
  patientIdentificacion: string;
  tipoCita: string;
  fecha: string;
  hora: string;
  nombreMedico: string;
  createdAt: string;
  /** Marcada por el personal cuando la cita ya se cumplió. */
  finalizada?: boolean;
  finalizadaAt?: string;
}

interface ApiCita {
  id: string;
  fichaId: string;
  patientNombre: string;
  patientIdentificacion: string;
  tipoCita: string;
  fecha: string;
  hora: string;
  nombreMedico: string;
  finalizada: boolean;
  finalizadaAt: string | null;
  createdAt: string;
}

export function patientAppointmentKey(nombre: string, identificacion: string): string {
  return `${identificacion.trim().toLowerCase()}|${nombre.trim().toLowerCase()}`;
}

export function appointmentDateTime(a: MedicalAppointment): Date {
  const [y, m, d] = a.fecha.split('-').map(Number);
  const [hh = 0, mm = 0] = (a.hora || '00:00').split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

export function isAppointmentPast(a: MedicalAppointment): boolean {
  return appointmentDateTime(a).getTime() <= Date.now();
}

@Injectable({ providedIn: 'root' })
export class MedicalAppointmentsService {
  private readonly http = inject(HttpClient);
  private readonly patients = inject(RegisteredPatientService);

  readonly appointments = signal<MedicalAppointment[]>([]);
  readonly loading = signal(false);

  constructor() {
    this.loadFromServer();
  }

  loadFromServer(): void {
    this.loading.set(true);
    this.http.get<ApiCita[]>('/api/citas').subscribe({
      next: (rows) => {
        this.appointments.set((rows ?? []).map((r) => this.fromApi(r)));
        this.loading.set(false);
      },
      error: () => {
        this.appointments.set([]);
        this.loading.set(false);
      },
    });
  }

  private fromApi(row: ApiCita): MedicalAppointment {
    return {
      id: row.id,
      patientKey: patientAppointmentKey(row.patientNombre, row.patientIdentificacion),
      patientNombre: row.patientNombre,
      patientIdentificacion: row.patientIdentificacion,
      tipoCita: row.tipoCita,
      fecha: row.fecha,
      hora: row.hora,
      nombreMedico: row.nombreMedico,
      createdAt: row.createdAt,
      finalizada: row.finalizada,
      finalizadaAt: row.finalizadaAt ?? undefined,
    };
  }

  forPatient(nombre: string, identificacion: string): MedicalAppointment[] {
    const key = patientAppointmentKey(nombre, identificacion);
    return this.appointments()
      .filter((a) => a.patientKey === key)
      .sort((a, b) =>
        `${b.fecha} ${b.hora ?? ''}`.localeCompare(`${a.fecha} ${a.hora ?? ''}`),
      );
  }

  allSorted(): MedicalAppointment[] {
    return [...this.appointments()].sort((a, b) =>
      `${a.fecha} ${a.hora ?? ''}`.localeCompare(`${b.fecha} ${b.hora ?? ''}`),
    );
  }

  activeSorted(): MedicalAppointment[] {
    return this.allSorted().filter((a) => !a.finalizada);
  }

  finalizedForPatient(nombre: string, identificacion: string): MedicalAppointment[] {
    const key = patientAppointmentKey(nombre, identificacion);
    return this.appointments()
      .filter((a) => a.patientKey === key && a.finalizada)
      .sort((a, b) =>
        `${b.fecha} ${b.hora ?? ''}`.localeCompare(`${a.fecha} ${a.hora ?? ''}`),
      );
  }

  addAppointment(input: {
    patientNombre: string;
    patientIdentificacion: string;
    tipoCita: string;
    fecha: string;
    hora: string;
    nombreMedico: string;
  }): Observable<MedicalAppointment | null> {
    const registered = this.patients.resolvePatient(input.patientNombre, input.patientIdentificacion);
    if (!registered) {
      return of(null);
    }
    const body = {
      fichaId: registered.id,
      patientNombre: input.patientNombre,
      patientIdentificacion: input.patientIdentificacion,
      tipoCita: input.tipoCita,
      fecha: input.fecha,
      hora: input.hora,
      nombreMedico: input.nombreMedico,
    };
    return this.http.post<ApiCita>('/api/citas', body).pipe(
      map((row) => this.fromApi(row)),
      tap((appointment) => {
        this.appointments.update((list) => [...list, appointment]);
      }),
      catchError(() => of(null)),
    );
  }

  markFinalized(id: string): void {
    this.http.patch<ApiCita>(`/api/citas/${id}/finalizar`, {}).subscribe({
      next: (row) => {
        const updated = this.fromApi(row);
        this.appointments.update((list) =>
          list.map((a) => (a.id === id ? updated : a)),
        );
      },
    });
  }

  removeAppointment(id: string): void {
    this.http.delete(`/api/citas/${id}`).subscribe({
      next: () => {
        this.appointments.update((list) => list.filter((a) => a.id !== id));
      },
    });
  }
}
