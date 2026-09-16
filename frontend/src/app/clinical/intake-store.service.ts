import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { ClinicalFormService } from './clinical-form.service';

export interface IntakeRecord {
  id: string;
  createdAt: string;
  updatedAt?: string;
  nombre: string;
  identificacion: string;
  data: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class IntakeStoreService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private clinical = inject(ClinicalFormService);

  readonly records = signal<IntakeRecord[]>([]);
  readonly currentId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly loadError = signal('');
  /** Mensaje breve al volver a la lista de fichas tras actualizar el formulario completo. */
  readonly fichasFlashMsg = signal('');
  /** Mensaje breve al volver al inicio tras crear una ficha clínica. */
  readonly homeFlashMsg = signal('');

  constructor() {
    this.loadFromServer();
  }

  loadFromServer(): void {
    this.loading.set(true);
    this.loadError.set('');
    this.http.get<IntakeRecord[]>('/api/fichas').subscribe({
      next: (rows) => {
        this.records.set(
          (rows ?? []).sort((a, b) =>
            (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt),
          ),
        );
        this.loading.set(false);
      },
      error: () => {
        this.records.set([]);
        this.loading.set(false);
        this.loadError.set(
          'No se pudo conectar con el servidor. Inicie el backend y PostgreSQL (scripts\\start-postgres.cmd y scripts\\run-backend-docker.cmd).',
        );
      },
    });
  }

  /** @deprecated use loadFromServer */
  hydrateFromServer(): void {
    this.loadFromServer();
  }

  private saveRecord(record: IntakeRecord): Observable<IntakeRecord> {
    const payload: IntakeRecord = {
      ...record,
      data: { ...record.data, _clientId: record.id },
    };
    return this.http.put<IntakeRecord>(`/api/fichas/${record.id}`, payload).pipe(
      catchError(() => this.http.post<IntakeRecord>('/api/fichas', payload)),
      tap((saved) => {
        this.records.update((list) => {
          const idx = list.findIndex((r) => r.id === saved.id);
          if (idx >= 0) {
            const next = [...list];
            next[idx] = saved;
            return next.sort((a, b) =>
              (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt),
            );
          }
          return [saved, ...list].sort((a, b) =>
            (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt),
          );
        });
      }),
    );
  }

  private newId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `ficha-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /** Construye la ficha actual desde el formulario (sin enviar al servidor). */
  buildCurrentRecord(): IntakeRecord | null {
    const id = this.currentId();
    if (!id) {
      return null;
    }
    this.clinical.form.patchValue(
      { personal: { fechaActualizacion: new Date().toISOString().slice(0, 10) } },
      { emitEvent: false },
    );
    this.clinical.pruneEmptyFormRows();
    const raw = this.clinical.getSanitizedRawValue();
    const nombre =
      (raw['personal'] as { nombreApellidos?: string })?.nombreApellidos?.trim() || 'Sin nombre';
    const identificacion =
      (raw['personal'] as { identificacion?: string })?.identificacion?.trim() || '';

    return {
      id,
      createdAt: this.currentRecord()?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nombre,
      identificacion,
      data: raw,
    };
  }

  createNew(nombre: string, identificacion: string, fechaIngreso: string): string {
    const id = this.newId();
    this.clinical.resetForNewIntake();
    this.clinical.form.patchValue({
      contratoNumero: '',
      personal: {
        nombreApellidos: nombre,
        identificacion,
        fechaIngreso,
        fechaActualizacion: new Date().toISOString().slice(0, 10),
      },
    });

    const record: IntakeRecord = {
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nombre: nombre.trim() || 'Sin nombre',
      identificacion: identificacion.trim(),
      data: this.clinical.getSanitizedRawValue(),
    };
    this.records.update((list) => [record, ...list]);
    this.currentId.set(id);
    return id;
  }

  /** Formulario nuevo sin ficha en listados hasta guardar. */
  beginDraft(): void {
    this.currentId.set(null);
    this.clinical.resetForNewIntake();
  }

  /** Persiste la ficha actual en memoria (crea id si es borrador). */
  commitCurrentIntake(): string | null {
    this.clinical.pruneEmptyFormRows();
    const raw = this.clinical.getSanitizedRawValue();
    const nombre =
      (raw['personal'] as { nombreApellidos?: string })?.nombreApellidos?.trim() || '';
    if (!nombre) {
      return null;
    }
    let id = this.currentId();
    if (!id) {
      id = this.newId();
      const identificacion =
        (raw['personal'] as { identificacion?: string })?.identificacion?.trim() || '';
      const record: IntakeRecord = {
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nombre,
        identificacion,
        data: raw,
      };
      this.records.update((list) => [record, ...list]);
      this.currentId.set(id);
    } else {
      this.syncFromForm();
    }
    return id;
  }

  /** Abre la ficha solo si existe. */
  open(id: string): boolean {
    const rec = this.records().find((r) => r.id === id);
    if (!rec) {
      this.currentId.set(null);
      return false;
    }
    this.currentId.set(id);
    this.clinical.initEscalasIfNeeded();
    this.clinical.loadFromRecord(rec.data);
    return true;
  }

  /** Guarda en sessionStorage los datos actuales para la ventana de impresión. */
  stashPrintPayload(id: string): void {
    this.open(id);
    this.syncFromForm();
    const rec = this.currentRecord();
    if (rec) {
      sessionStorage.setItem(`lun-print-payload-${id}`, JSON.stringify(rec));
    }
  }

  /** Restaura el snapshot de impresión preparado por la pestaña que abrió la ventana. */
  openFromPrintCache(id: string): boolean {
    const raw = sessionStorage.getItem(`lun-print-payload-${id}`);
    if (!raw) {
      return false;
    }
    try {
      const rec = JSON.parse(raw) as IntakeRecord;
      sessionStorage.removeItem(`lun-print-payload-${id}`);
      this.records.update((list) => {
        const idx = list.findIndex((r) => r.id === id);
        if (idx >= 0) {
          const next = [...list];
          next[idx] = rec;
          return next;
        }
        return [rec, ...list];
      });
      this.currentId.set(id);
      this.clinical.initEscalasIfNeeded();
      this.clinical.loadFromRecord(rec.data);
      return true;
    } catch {
      sessionStorage.removeItem(`lun-print-payload-${id}`);
      return false;
    }
  }

  /** Carga una ficha desde el servidor (p. ej. para imprimir en ventana nueva). */
  openFromServer(id: string): Observable<boolean> {
    return this.http.get<IntakeRecord>(`/api/fichas/${id}`).pipe(
      tap((rec) => {
        this.records.update((list) => {
          const idx = list.findIndex((r) => r.id === id);
          if (idx >= 0) {
            const next = [...list];
            next[idx] = rec;
            return next;
          }
          return [rec, ...list];
        });
        this.currentId.set(id);
        this.clinical.initEscalasIfNeeded();
        this.clinical.loadFromRecord(rec.data);
      }),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  currentRecord(): IntakeRecord | undefined {
    const id = this.currentId();
    return id ? this.records().find((r) => r.id === id) : undefined;
  }

  /** Actualiza la ficha activa en memoria (no envía al servidor). */
  syncFromForm(): void {
    const updated = this.buildCurrentRecord();
    if (!updated) {
      return;
    }
    this.records.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
  }

  saveToServer(): Observable<IntakeRecord> {
    const updated = this.buildCurrentRecord();
    if (!updated) {
      return throwError(() => new Error('No hay ficha activa para guardar'));
    }
    this.records.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
    return this.saveRecord(updated);
  }

  goToSection(id: string, section: string): void {
    this.open(id);
    void this.router.navigate(['/ingreso', id, section]);
  }
}
