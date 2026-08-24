import { Component, forwardRef, input } from '@angular/core';
import {
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { PhotoAttachComponent } from './photo-attach.component';

/** Lista de firmas/imágenes anexables (ControlValueAccessor → string[]). */
@Component({
  selector: 'app-multi-photo-attach',
  standalone: true,
  imports: [ReactiveFormsModule, PhotoAttachComponent],
  template: `
    <div class="multi-photo-list">
      <div class="multi-photo-row">
        @for (ctrl of items.controls; track $index) {
          <div class="multi-photo-item">
            <app-photo-attach
              [formControl]="$any(ctrl)"
              [variant]="variant()"
              [header]="header()"
              [hint]="hint()"
              [sizeHint]="sizeHint()"
            />
            @if ($index > 0 && !disabled) {
              <button type="button" class="link-remove" (click)="remove($index)">Quitar</button>
            }
          </div>
        }
      </div>
      @if (!disabled) {
        <button type="button" class="btn btn-secondary multi-photo-add" (click)="add()">
          + {{ addLabel() }}
        </button>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiPhotoAttachComponent),
      multi: true,
    },
  ],
})
export class MultiPhotoAttachComponent implements ControlValueAccessor {
  variant = input<'portrait' | 'flex' | 'signature'>('signature');
  header = input('');
  hint = input('Adjuntar imagen de la firma');
  sizeHint = input('');
  addLabel = input('Agregar firma');
  minItems = input(1);

  items!: FormArray;
  disabled = false;

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private fb: FormBuilder) {
    this.items = this.fb.array([this.fb.control('')]);
    this.items.valueChanges.subscribe((v) => {
      this.onChange((v ?? []).filter((x: string | null) => x != null) as string[]);
    });
  }

  writeValue(value: string[] | null): void {
    const arr = value?.length ? value : [''];
    this.items.clear();
    for (const v of arr) {
      this.items.push(this.fb.control(v ?? ''));
    }
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.items.disable({ emitEvent: false });
    } else {
      this.items.enable({ emitEvent: false });
    }
  }

  add(): void {
    this.items.push(this.fb.control(''));
    this.onTouched();
  }

  remove(i: number): void {
    if (this.items.length <= this.minItems()) {
      return;
    }
    this.items.removeAt(i);
    this.onTouched();
  }
}
