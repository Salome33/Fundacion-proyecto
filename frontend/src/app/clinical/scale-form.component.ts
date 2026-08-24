import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ScaleDef, ScaleItemDef } from './data/scale-definitions';

@Component({
  selector: 'app-scale-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="scale-block" [class.scale-block--embedded]="hideHeader" [formGroup]="group">
      @if (!hideHeader) {
        <h3>{{ scale.title }}</h3>
        @if (scale.subtitle) {
          <p class="scale-sub">{{ scale.subtitle }}</p>
        }
      }

      <ul class="scale-question-list">
        @for (item of scale.items; track item.id) {
          <li class="scale-question-item scale-question-item--tinetti">
            <p class="scale-question-text">{{ item.label }}</p>
            @if (useNumericInput(item)) {
              <input
                type="number"
                class="scale-num-input"
                [formControlName]="item.id"
                [min]="minScore(item)"
                [max]="maxScore(item)"
              />
            } @else {
              <div class="scale-question-options scale-question-options--stack">
                @for (opt of item.options; track opt.label) {
                  <label class="scale-question-option">
                    <input
                      type="radio"
                      [name]="scale.id + '_' + item.id"
                      [checked]="group.get(item.id)?.value === opt.score"
                      (change)="onPick(item.id, opt.score)"
                    />
                    <span class="scale-option-label">{{ opt.label }}</span>
                    <span class="scale-option-score" [attr.aria-label]="'Puntuación ' + opt.score">{{
                      opt.score
                    }}</span>
                  </label>
                }
              </div>
            }
          </li>
        }
      </ul>

      <div class="scale-total">
        <strong>{{ totalCaption }}: {{ total }} / {{ scale.maxScore }}</strong>
        <span class="interp">{{ scale.interpret(total) }}</span>
      </div>
    </div>
  `,
})
export class ScaleFormComponent implements OnInit {
  @Input({ required: true }) scale!: ScaleDef;
  @Input({ required: true }) group!: FormGroup;
  /** Título en la section-card padre; oculta h3 y borde duplicado. */
  @Input() hideHeader = false;

  ngOnInit(): void {
    for (const item of this.scale.items) {
      if (!this.group.contains(item.id)) {
        this.group.addControl(item.id, new FormControl<number | null>(null));
      }
    }
  }

  onPick(itemId: string, score: number): void {
    this.group.get(itemId)?.setValue(score);
  }

  useNumericInput(item: ScaleItemDef): boolean {
    const max = this.maxScore(item);
    return max > 15 && item.options.length > 6;
  }

  minScore(item: ScaleItemDef): number {
    return Math.min(...item.options.map((o) => o.score));
  }

  maxScore(item: ScaleItemDef): number {
    return Math.max(...item.options.map((o) => o.score));
  }

  get total(): number {
    return this.scale.items.reduce(
      (sum, it) => sum + (Number(this.group.get(it.id)?.value) || 0),
      0,
    );
  }

  get totalCaption(): string {
    if (this.scale.maxScore === 100) {
      return 'Puntuación total';
    }
    if (this.scale.maxScore <= 30) {
      return 'Total';
    }
    return 'Porcentaje total';
  }
}
