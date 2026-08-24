import { Component, input, output } from '@angular/core';

export type ClinicalDialogSize = 'md' | 'lg' | 'xl';

/** Ventana modal reutilizable en módulos clínicos operativos. */
@Component({
  selector: 'app-clinical-dialog',
  standalone: true,
  template: `
    <div
      class="clinical-dialog-backdrop"
      role="presentation"
      (click)="onBackdropClick()"
      (keydown.escape)="closed.emit()"
    >
      <div
        class="clinical-dialog"
        [class.clinical-dialog--md]="size() === 'md'"
        [class.clinical-dialog--lg]="size() === 'lg'"
        [class.clinical-dialog--xl]="size() === 'xl'"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
        (click)="$event.stopPropagation()"
      >
        <header class="clinical-dialog-head">
          <h2 [id]="titleId">{{ title() }}</h2>
          <button type="button" class="clinical-dialog-close" (click)="closed.emit()" aria-label="Cerrar">
            ×
          </button>
        </header>
        <div class="clinical-dialog-body">
          <ng-content />
        </div>
      </div>
    </div>
  `,
})
export class ClinicalDialogComponent {
  title = input.required<string>();
  size = input<ClinicalDialogSize>('lg');
  closed = output<void>();

  readonly titleId = `clinical-dialog-${Math.random().toString(36).slice(2, 9)}`;

  onBackdropClick(): void {
    this.closed.emit();
  }
}
