import { Component, computed, inject, input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  BARTHEL_SCALE,
  GDS_QUESTIONS,
  interpretGds,
  interpretPfeiffer,
  LAWTON_SCALE,
  PFEIFFER_QUESTIONS,
  TINETTI_BALANCE,
  TINETTI_GAIT,
} from './data/scale-definitions';
import {
  DECLARACION_TEXTO,
  GDS_INTRO,
  PFEIFFER_INTRO,
  PROFESIONALES_TITULO,
  TINETTI_BALANCE_INTRO,
  TINETTI_GAIT_INTRO,
  VGI_TEXTO,
} from './data/form-format-texts';
import { ClinicalFormService } from './clinical-form.service';
import { sectionEditFields } from './section-edit-fields';
import { ScaleFormComponent } from './scale-form.component';
import { controlByPath } from './form-control-path';

@Component({
  selector: 'app-section-hub-form-view',
  standalone: true,
  imports: [ReactiveFormsModule, ScaleFormComponent],
  template: `
    <div class="section-hub-form-view intake-readonly" [formGroup]="form">
      @if (section() === 'vgi') {
        <div class="info-box vgi-box">{{ vgiTexto }}</div>
      }

      @if (isScaleSection()) {
        <div formGroupName="escalas" class="section-card section-hub-readonly-card">
          @if (section() === 'escala-barthel') {
            <app-scale-form [scale]="barthel" [group]="barthelGroup" [hideHeader]="true" />
          }
          @if (section() === 'escala-lawton') {
            @if (lawton.subtitle) {
              <p class="scale-sub">{{ lawton.subtitle }}</p>
            }
            <app-scale-form [scale]="lawton" [group]="lawtonGroup" [hideHeader]="true" />
          }
          @if (section() === 'escala-tinetti-equilibrio') {
            <p class="scale-sub">{{ tinettiBalanceIntro }}</p>
            <div [formGroup]="tinettiBalanceGroup">
              <ul class="scale-question-list">
                @for (item of tinettiBalance; track item.id) {
                  <li class="scale-question-item scale-question-item--tinetti">
                    <p class="scale-question-text">{{ item.label }}</p>
                    <div class="scale-question-options scale-question-options--stack">
                      @for (opt of item.options; track opt.label) {
                        <label class="scale-question-option">
                          <input
                            type="radio"
                            [name]="'hub_tb_' + item.id"
                            [checked]="tinettiBalanceGroup.get(item.id)?.value === opt.score"
                            disabled
                          />
                          <span class="scale-option-label">{{ opt.label }}</span>
                          <span class="scale-option-score">{{ opt.score }}</span>
                        </label>
                      }
                    </div>
                  </li>
                }
              </ul>
              <p class="scale-total">
                <strong>Total equilibrio: {{ tinettiTotal('balance') }} / 15</strong>
              </p>
            </div>
          }
          @if (section() === 'escala-tinetti-marcha') {
            <p class="scale-sub">{{ tinettiGaitIntro }}</p>
            <div [formGroup]="tinettiGaitGroup">
              <ul class="scale-question-list">
                @for (item of tinettiGait; track item.id) {
                  <li class="scale-question-item scale-question-item--tinetti">
                    <p class="scale-question-text">{{ item.label }}</p>
                    <div class="scale-question-options scale-question-options--stack">
                      @for (opt of item.options; track opt.label) {
                        <label class="scale-question-option">
                          <input
                            type="radio"
                            [name]="'hub_tg_' + item.id"
                            [checked]="tinettiGaitGroup.get(item.id)?.value === opt.score"
                            disabled
                          />
                          <span class="scale-option-label">{{ opt.label }}</span>
                          <span class="scale-option-score">{{ opt.score }}</span>
                        </label>
                      }
                    </div>
                  </li>
                }
              </ul>
              <p class="scale-total">
                <strong>Total marcha: {{ tinettiTotal('gait') }} / 12</strong>
              </p>
            </div>
          }
          @if (section() === 'escala-pfeiffer') {
            <p class="scale-sub">{{ pfeifferIntro }}</p>
            <div [formGroup]="pfeifferGroup">
              <ul class="scale-question-list">
                @for (q of pfeifferQ; track q.id) {
                  <li class="scale-question-item scale-question-item--pfeiffer">
                    <label class="scale-question-label scale-question-label--pfeiffer">
                      <input type="checkbox" [formControlName]="q.id" />
                      <span class="scale-question-text">
                        {{ q.label }}
                        @if (q.hint) {
                          <em class="scale-question-hint">({{ q.hint }})</em>
                        }
                      </span>
                    </label>
                  </li>
                }
              </ul>
              <p class="scale-total">
                Errores: {{ pfeifferErrors() }} — {{ interpretPfeiffer(pfeifferErrors()) }}
              </p>
            </div>
          }
          @if (section() === 'escala-gds') {
            <p class="scale-sub">{{ gdsIntro }}</p>
            <div [formGroup]="gdsGroup">
              <ul class="scale-question-list">
                @for (q of gdsQ; track q.id) {
                  <li class="scale-question-item scale-question-item--gds">
                    <p class="scale-question-text">{{ q.label }}</p>
                    @if (q.detail) {
                      <p class="scale-question-detail">{{ q.detail }}</p>
                    }
                    <div class="scale-question-options scale-question-options--stack">
                      <label class="scale-question-option">
                        <input type="radio" [formControlName]="q.id" value="si" /> Sí
                      </label>
                      <label class="scale-question-option">
                        <input type="radio" [formControlName]="q.id" value="no" /> No
                      </label>
                    </div>
                  </li>
                }
              </ul>
              <p class="scale-total">
                Total: {{ gdsTotal() }} — {{ interpretGds(gdsTotal()) }}
              </p>
            </div>
          }
        </div>
      } @else if (section() === 'declaracion') {
        <div class="section-card section-hub-readonly-card">
          <div class="declaracion-texto">{{ declaracionTexto }}</div>
          <div class="field-grid section-hub-readonly-grid" formGroupName="declaracion">
            @for (field of fields(); track field.path) {
              @if (fieldControl(field.path); as ctrl) {
                <label
                  class="section-hub-readonly-field"
                  [class.field-full]="field.inputType === 'signature'"
                >
                  <span class="section-hub-readonly-label">{{ field.label }}</span>
                  @if (field.inputType === 'signature') {
                    <span class="section-hub-readonly-value">{{ signatureLabel(field.path) }}</span>
                  } @else {
                    <input class="section-hub-readonly-control" [formControl]="ctrl" />
                  }
                </label>
              }
            }
          </div>
        </div>
      } @else {
        <div class="section-card section-hub-readonly-card">
          @if (section() === 'profesionales') {
            <h3 class="section-hub-readonly-subtitle">{{ profesionalesTitulo }}</h3>
          }
          <div class="field-grid section-hub-readonly-grid">
            @for (field of fields(); track field.path) {
              @if (fieldControl(field.path); as ctrl) {
                <label
                  class="section-hub-readonly-field"
                  [class.field-full]="
                    field.inputType === 'textarea' ||
                    field.inputType === 'pdf' ||
                    field.inputType === 'signature' ||
                    field.inputType === 'photo'
                  "
                >
                  <span class="section-hub-readonly-label">{{ field.label }}</span>
                  @if (field.inputType === 'pdf') {
                    <span class="section-hub-readonly-value">{{ pdfLabel(field.path) }}</span>
                  } @else if (field.inputType === 'signature' || field.inputType === 'photo') {
                    <span class="section-hub-readonly-value">{{ attachmentLabel(field.path, field.inputType) }}</span>
                  } @else if (field.inputType === 'textarea') {
                    <textarea class="section-hub-readonly-control" rows="3" [formControl]="ctrl"></textarea>
                  } @else {
                    <input class="section-hub-readonly-control" [formControl]="ctrl" />
                  }
                </label>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class SectionHubFormViewComponent implements OnInit {
  private readonly formApi = inject(ClinicalFormService);

  section = input.required<string>();

  readonly form = this.formApi.form;
  readonly vgiTexto = VGI_TEXTO;
  readonly declaracionTexto = DECLARACION_TEXTO;
  readonly profesionalesTitulo = PROFESIONALES_TITULO;
  readonly barthel = BARTHEL_SCALE;
  readonly lawton = LAWTON_SCALE;
  readonly tinettiBalance = TINETTI_BALANCE;
  readonly tinettiGait = TINETTI_GAIT;
  readonly pfeifferQ = PFEIFFER_QUESTIONS;
  readonly gdsQ = GDS_QUESTIONS;
  readonly tinettiBalanceIntro = TINETTI_BALANCE_INTRO;
  readonly tinettiGaitIntro = TINETTI_GAIT_INTRO;
  readonly pfeifferIntro = PFEIFFER_INTRO;
  readonly gdsIntro = GDS_INTRO;
  readonly interpretGds = interpretGds;
  readonly interpretPfeiffer = interpretPfeiffer;

  readonly fields = computed(() => sectionEditFields(this.formApi.form, this.section()));

  readonly isScaleSection = computed(() =>
    [
      'escala-barthel',
      'escala-lawton',
      'escala-tinetti-equilibrio',
      'escala-tinetti-marcha',
      'escala-pfeiffer',
      'escala-gds',
    ].includes(this.section()),
  );

  ngOnInit(): void {
    this.formApi.initEscalasIfNeeded();
  }

  get escalasGroup(): FormGroup {
    return this.form.get('escalas') as FormGroup;
  }

  get barthelGroup(): FormGroup {
    return this.escalasGroup.get('barthel') as FormGroup;
  }

  get lawtonGroup(): FormGroup {
    return this.escalasGroup.get('lawton') as FormGroup;
  }

  get tinettiBalanceGroup(): FormGroup {
    return this.escalasGroup.get('tinettiBalance') as FormGroup;
  }

  get tinettiGaitGroup(): FormGroup {
    return this.escalasGroup.get('tinettiGait') as FormGroup;
  }

  get pfeifferGroup(): FormGroup {
    return this.escalasGroup.get('pfeiffer') as FormGroup;
  }

  get gdsGroup(): FormGroup {
    return this.escalasGroup.get('gds') as FormGroup;
  }

  fieldControl(path: string): FormControl | null {
    const ctrl = controlByPath(this.formApi.form, path);
    return ctrl instanceof FormControl ? ctrl : null;
  }

  pdfLabel(pdfPath: string): string {
    const namePath = pdfPath.replace(/\.soporteFormulaPdf$/, '.soporteFormulaNombre');
    const name = String(this.fieldControl(namePath)?.value ?? '').trim();
    if (name) {
      return name;
    }
    return this.fieldControl(pdfPath)?.value ? 'PDF adjunto' : '';
  }

  signatureLabel(path: string): string {
    return this.attachmentLabel(path, 'signature');
  }

  attachmentLabel(path: string, kind: 'signature' | 'photo'): string {
    const ctrl = controlByPath(this.formApi.form, path);
    const v = ctrl?.value;
    if (Array.isArray(v)) {
      const n = v.filter((x) => String(x ?? '').trim()).length;
      return n > 0 ? `${n} firma(s) registrada(s)` : '';
    }
    const s = String(v ?? '').trim();
    if (!s) {
      return '';
    }
    return kind === 'photo' ? 'Foto adjunta' : 'Firma registrada';
  }

  tinettiTotal(part: 'balance' | 'gait'): number {
    const items = part === 'balance' ? TINETTI_BALANCE : TINETTI_GAIT;
    const g = part === 'balance' ? this.tinettiBalanceGroup : this.tinettiGaitGroup;
    return items.reduce((sum, it) => sum + (Number(g.get(it.id)?.value) || 0), 0);
  }

  pfeifferErrors(): number {
    let n = 0;
    for (const q of PFEIFFER_QUESTIONS) {
      if (this.pfeifferGroup.get(q.id)?.value === true) {
        n++;
      }
    }
    return n;
  }

  gdsTotal(): number {
    let total = 0;
    for (const q of GDS_QUESTIONS) {
      const v = this.gdsGroup.get(q.id)?.value;
      if (v === 'si') {
        total += q.yesScore;
      }
    }
    return total;
  }
}
