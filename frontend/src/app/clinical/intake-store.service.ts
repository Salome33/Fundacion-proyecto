import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, tap } from 'rxjs';
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
  /** Mensaje breve al volver a la lista de fichas tras actualizar el formulario completo. */
  readonly fichasFlashMsg = signal('');

  constructor() {
    this.loadFromServer();
  }

  loadFromServer(): void {
    this.loading.set(true);
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

  createNew(nombre: string, identificacion: string, fechaIngreso: string): string {
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `ficha-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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
    this.saveRecord(record).subscribe({ error: () => {} });
    return id;
  }

  /** Formulario nuevo sin ficha en listados hasta guardar. */
  beginDraft(): void {
    this.currentId.set(null);
    this.clinical.resetForNewIntake();
  }

  /** Persiste la ficha actual (crea id si es borrador). */
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
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `ficha-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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
      this.saveRecord(record).subscribe({ error: () => {} });
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
    this.clinical.loadFromRecord(rec.data);
    return true;
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

  syncFromForm(): void {
    const id = this.currentId();
    if (!id) {
      return;
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

    const updated: IntakeRecord = {
      id,
      createdAt: this.currentRecord()?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nombre,
      identificacion,
      data: raw,
    };

    this.records.update((list) =>
      list.map((r) => (r.id === id ? updated : r)),
    );
    this.saveRecord(updated).subscribe({ error: () => {} });
  }

  saveToServer(): Observable<void> {
    const id = this.currentId();
    if (!id) {
      return of(undefined);
    }
    this.syncFromForm();
    const rec = this.currentRecord();
    if (!rec) {
      return of(undefined);
    }
    return this.saveRecord(rec).pipe(map(() => undefined));
  }

  goToSection(id: string, section: string): void {
    this.open(id);
    void this.router.navigate(['/ingreso', id, section]);
  }
}
