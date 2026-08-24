export const CLINICAL_DATA_VERSION = '2026-08-19-postgres-v1';
const VERSION_KEY = 'manos-unidas-data-version';

/** Claves legacy de localStorage; ya no se usan como persistencia principal. */
export const CLINICAL_STORAGE_KEYS = [
  'manos-unidas-intakes',
  'manos-unidas-medical-appointments',
  'manos-unidas-daily-vitals',
  'manos-unidas-nursing-notes',
] as const;

export function needsClinicalDataReset(): boolean {
  return localStorage.getItem(VERSION_KEY) !== CLINICAL_DATA_VERSION;
}

/** Limpia datos locales obsoletos tras migrar a PostgreSQL. */
export function clearClinicalLocalData(): void {
  for (const key of CLINICAL_STORAGE_KEYS) {
    localStorage.removeItem(key);
  }
  localStorage.setItem(VERSION_KEY, CLINICAL_DATA_VERSION);
}
