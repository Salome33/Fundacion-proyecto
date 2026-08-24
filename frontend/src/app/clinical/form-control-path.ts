import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

export function controlByPath(form: FormGroup, path: string): AbstractControl | null {
  const parts = path.split('.');
  let current: AbstractControl | null = form;
  for (const part of parts) {
    if (!current) {
      return null;
    }
    if (current instanceof FormGroup) {
      current = current.get(part);
    } else if (current instanceof FormArray) {
      const idx = Number(part);
      current = Number.isNaN(idx) ? null : current.at(idx);
    } else {
      return null;
    }
  }
  return current;
}
