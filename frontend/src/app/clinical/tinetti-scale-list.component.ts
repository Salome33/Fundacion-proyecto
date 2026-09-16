import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ScaleItemDef,
  TinettiRenderBlock,
  tinettiBuildRenderBlocks,
  tinettiSelectedOptionIndex,
} from './data/scale-definitions';

@Component({
  selector: 'app-tinetti-scale-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div [formGroup]="group">
      <ul class="scale-question-list">
        @for (block of blocks; track block.id) {
          <li
            class="scale-question-item scale-question-item--tinetti"
            [class.scale-question-item--group-box]="block.items.length > 1"
          >
            @if (block.sectionLabel) {
              <p class="scale-question-text scale-question-text--section">{{ block.sectionLabel }}</p>
            }
            @if (block.label) {
              <p class="scale-question-text scale-question-text--title">{{ block.label }}</p>
            }
            @for (item of block.items; track item.id; let gi = $index) {
              <div
                class="scale-tinetti-subitem"
                [class.scale-tinetti-subitem--divider]="gi > 0"
              >
                <div class="scale-question-options scale-question-options--stack">
                  @for (opt of item.options; track opt.label; let oi = $index) {
                    <label
                      class="scale-question-option"
                      [class.scale-question-option--selected]="selectedIndex(item) === oi"
                    >
                      @if (readonly) {
                        <input
                          type="radio"
                          [name]="namePrefix + '_' + item.id"
                          [checked]="selectedIndex(item) === oi"
                          disabled
                        />
                      } @else if (useChangeHandler) {
                        <input
                          type="radio"
                          [name]="namePrefix + '_' + item.id"
                          [checked]="selectedIndex(item) === oi"
                          (change)="onPick(item.id, oi)"
                        />
                      } @else {
                        <input type="radio" [formControlName]="item.id" [value]="oi" />
                      }
                      <span class="scale-option-label">{{ opt.label }}</span>
                      <span
                        class="scale-option-score"
                        [attr.aria-label]="'Puntuación ' + opt.score"
                        >{{ opt.score }}</span
                      >
                    </label>
                  }
                </div>
              </div>
            }
          </li>
        }
      </ul>
    </div>
  `,
})
export class TinettiScaleListComponent {
  @Input({ required: true }) items!: ScaleItemDef[];
  @Input({ required: true }) group!: FormGroup;
  @Input() namePrefix = 'tinetti';
  @Input() readonly = false;
  @Input() useChangeHandler = false;
  @Output() scorePick = new EventEmitter<{ itemId: string; optionIndex: number }>();

  get blocks(): TinettiRenderBlock[] {
    return tinettiBuildRenderBlocks(this.items);
  }

  selectedIndex(item: ScaleItemDef): number | null {
    return tinettiSelectedOptionIndex(item, this.group.get(item.id)?.value);
  }

  onPick(itemId: string, optionIndex: number): void {
    this.scorePick.emit({ itemId, optionIndex });
  }
}
