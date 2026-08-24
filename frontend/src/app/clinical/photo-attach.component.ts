import {
  Component,
  ElementRef,
  forwardRef,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type PhotoAttachVariant = 'portrait' | 'flex' | 'signature';

/** Cuadro para anexar fotografía o firma (ControlValueAccessor → data URL). */
@Component({
  selector: 'app-photo-attach',
  standalone: true,
  template: `
    <div
      class="photo-attach-wrap"
      [class.photo-attach-wrap--flex]="variant() === 'flex'"
      [class.photo-attach-wrap--signature]="variant() === 'signature'"
    >
      @if (header()) {
        <span class="photo-attach-header">{{ header() }}</span>
      }
      @if (variant() === 'signature') {
        <div
          class="photo-attach-frame"
          [class.photo-attach-frame--filled]="!!preview()"
          [class.photo-attach-frame--disabled]="disabled"
          [class.photo-attach-frame--readonly]="disabled"
          (click)="openPicker($event)"
          [attr.title]="hint()"
        >
          <input
            #fileInput
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            (change)="onFileSelected($event)"
          />
          <div class="photo-attach-frame-inner">
            @if (preview()) {
              <img [src]="preview()" alt="" class="photo-attach-img" />
              <div class="photo-attach-overlay" aria-hidden="true">
                <span>{{ hint() }}</span>
              </div>
              @if (!disabled) {
                <button
                  type="button"
                  class="photo-attach-clear"
                  (click)="clearPhoto($event)"
                  aria-label="Quitar imagen"
                >
                  ×
                </button>
              }
            } @else if (!disabled) {
              <div class="photo-attach-empty" aria-hidden="true">
                <span class="photo-attach-plus">+</span>
                <span class="photo-attach-hover">{{ hoverText() }}</span>
              </div>
            } @else {
              <div class="photo-attach-empty photo-attach-empty--readonly" aria-hidden="true">
                <span class="photo-attach-readonly-label">Sin firma registrada</span>
              </div>
            }
          </div>
        </div>
      } @else {
      <div
        class="photo-attach"
        [class.photo-attach--portrait]="variant() === 'portrait'"
        [class.photo-attach--flex]="variant() === 'flex'"
        [class.photo-attach--filled]="!!preview()"
        [class.photo-attach--disabled]="disabled"
        [class.photo-attach--readonly]="disabled"
        (click)="openPicker($event)"
        [attr.title]="hint()"
      >
        <input
          #fileInput
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          hidden
          (change)="onFileSelected($event)"
        />
        @if (preview()) {
          <img [src]="preview()" alt="" class="photo-attach-img" />
          <div class="photo-attach-overlay" aria-hidden="true">
            <span>{{ hint() }}</span>
          </div>
          @if (!disabled) {
            <button
              type="button"
              class="photo-attach-clear"
              (click)="clearPhoto($event)"
              aria-label="Quitar imagen"
            >
              ×
            </button>
          }
        } @else if (!disabled) {
          <div class="photo-attach-empty" aria-hidden="true">
            <span class="photo-attach-plus">+</span>
            <span class="photo-attach-hover">{{ hoverText() }}</span>
          </div>
        } @else {
          <div class="photo-attach-empty photo-attach-empty--readonly" aria-hidden="true">
            <span class="photo-attach-readonly-label">Sin imagen registrada</span>
          </div>
        }
      </div>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhotoAttachComponent),
      multi: true,
    },
  ],
})
export class PhotoAttachComponent implements ControlValueAccessor {
  /** Texto encima del recuadro (p. ej. «Anexar foto»). */
  header = input('');
  /** Texto centrado cuando está vacío (p. ej. tamaño 3,5 × 4,5 cm). */
  sizeHint = input('');
  /** Mensaje al pasar el cursor. */
  hint = input('Anexar foto');
  /** portrait = 3,5×4,5 cm fijo; flex = se ajusta al tamaño de la imagen. */
  variant = input<PhotoAttachVariant>('portrait');

  hoverText(): string {
    return this.sizeHint() || this.hint();
  }

  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  preview = signal('');
  disabled = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.preview.set(value || '');
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
    if (this.disabled) {
      return;
    }
    if ((event.target as HTMLElement).closest('.photo-attach-clear')) {
      return;
    }
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file?.type.startsWith('image/')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      void this.applyImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  clearPhoto(event: Event): void {
    event.stopPropagation();
    this.preview.set('');
    this.onChange('');
    this.onTouched();
  }

  private async applyImage(dataUrl: string): Promise<void> {
    const optimized = await this.resizeIfNeeded(dataUrl, 900);
    this.preview.set(optimized);
    this.onChange(optimized);
    this.onTouched();
  }

  private resizeIfNeeded(dataUrl: string, maxPx: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        if (width <= maxPx && height <= maxPx) {
          resolve(dataUrl);
          return;
        }
        const scale = maxPx / Math.max(width, height);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }
}
