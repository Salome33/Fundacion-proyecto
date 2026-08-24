import { Injectable, inject } from '@angular/core';
import { IntakeRecord, IntakeStoreService } from './intake-store.service';

export const REGISTERED_PATIENT_REQUIRED_MSG =
  'No hay un adulto mayor registrado con ese nombre y documento. Debe existir una ficha completa de ingreso antes de registrar citas, signos vitales o notas.';

@Injectable({ providedIn: 'root' })
export class RegisteredPatientService {
  private readonly store = inject(IntakeStoreService);

  normalizeName(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replace(/\s+/g, ' ');
  }

  normalizeDocument(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '');
  }

  findRecord(nombre: string, identificacion: string): IntakeRecord | undefined {
    const nameQ = this.normalizeName(nombre);
    const docQ = this.normalizeDocument(identificacion);
    if (!nameQ || !docQ) {
      return undefined;
    }
    return this.store.records().find(
      (record) =>
        this.normalizeName(record.nombre) === nameQ &&
        this.normalizeDocument(record.identificacion) === docQ,
    );
  }

  isRegistered(nombre: string, identificacion: string): boolean {
    return !!this.findRecord(nombre, identificacion);
  }

  /** Usa nombre e identificación canónicos de la ficha registrada. */
  resolvePatient(nombre: string, identificacion: string): IntakeRecord | null {
    return this.findRecord(nombre, identificacion) ?? null;
  }
}
