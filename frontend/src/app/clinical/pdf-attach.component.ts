import {
  Component,
  ElementRef,
  forwardRef,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const MAX_PDF_BYTES = 5 * 1024 * 1024;

/** Cuadro para anexar soporte de fórmula médica en PDF (ControlValueAccessor → data URL). */
@Component({
  selector: 'app-pdf-attach',
  standalone: true,
  template: `
    <div class="pdf-attach-wrap">
      @if (header()) {
        <span class="pdf-attach-header">{{ header() }}</span>
      }
      <div
        class="pdf-attach"
        [class.pdf-attach--filled]="!!dataUrl()"
        [class.pdf-attach--disabled]="disabled"
        [class.pdf-attach--error]="!!errorMsg()"
        (click)="onAttachAreaClick($event)"
      >
        <input
          #fileInput
          type="file"
          accept="application/pdf,.pdf"
          hidden
          (change)="onFileSelected($event)"
        />
        @if (dataUrl()) {
          <div class="pdf-attach-file">
            <span class="pdf-attach-icon" aria-hidden="true">PDF</span>
            <span class="pdf-attach-name" [title]="displayName()">{{ displayName() }}</span>
            <a
              class="pdf-attach-link"
              [href]="dataUrl()"
              target="_blank"
              rel="noopener noreferrer"
              (click)="$event.stopPropagation()"
            >
              Ver
            </a>
            <button
              type="button"
              class="pdf-attach-clear"
              (click)="clearPdf($event)"
              [disabled]="disabled"
              aria-label="Quitar PDF"
            >
              ×
            </button>
          </div>
          <button
            type="button"
            class="btn btn-secondary btn-sm pdf-attach-replace"
            (click)="openPicker($event)"
            [disabled]="disabled"
          >
            Cambiar archivo
          </button>
        } @else {
          <div class="pdf-attach-empty">
            <span class="pdf-attach-plus" aria-hidden="true">+</span>
            <span class="pdf-attach-hint">{{ hint() }}</span>
          </div>
        }
      </div>
      @if (errorMsg()) {
        <p class="pdf-attach-error">{{ errorMsg() }}</p>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PdfAttachComponent),
      multi: true,
    },
  ],
})
export class PdfAttachComponent implements ControlValueAccessor {
  header = input('');
  hint = input('Anexar soporte de la fórmula médica');
  /** Nombre del archivo mostrado cuando ya hay PDF cargado. */
  fileName = input('');

  fileNameChange = output<string>();

  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  dataUrl = signal('');
  errorMsg = signal('');
  disabled = false;

  private pendingFileName = '';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  displayName(): string {
    return this.fileName() || this.pendingFileName || 'formula-medica.pdf';
  }

  writeValue(value: string | null): void {
    this.dataUrl.set(value || '');
    if (!value) {
      this.pendingFileName = '';
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  openPicker(event: Event): void {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }
    this.errorMsg.set('');
    this.fileInput?.nativeElement.click();
  }

  onAttachAreaClick(event: Event): void {
    if (this.disabled || this.dataUrl()) {
      return;
    }
    if ((event.target as HTMLElement).closest('.pdf-attach-clear, .pdf-attach-link, .pdf-attach-replace')) {
      return;
    }
    this.openPicker(event);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    this.errorMsg.set('');
    if (!file) {
      return;
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      this.errorMsg.set('Solo se permiten archivos PDF.');
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      this.errorMsg.set('El PDF no debe superar 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.pendingFileName = file.name;
      this.dataUrl.set(result);
      this.onChange(result);
      this.fileNameChange.emit(file.name);
      this.onTouched();
    };
    reader.onerror = () => {
      this.errorMsg.set('No se pudo leer el archivo.');
    };
    reader.readAsDataURL(file);
  }

  clearPdf(event: Event): void {
    event.stopPropagation();
    this.dataUrl.set('');
    this.pendingFileName = '';
    this.errorMsg.set('');
    this.onChange('');
    this.fileNameChange.emit('');
    this.onTouched();
  }
}
