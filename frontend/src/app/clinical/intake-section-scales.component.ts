import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClinicalFormService } from './clinical-form.service';
import { ScaleFormComponent } from './scale-form.component';
import {
  GDS_INTRO,
  PFEIFFER_INTRO,
  TINETTI_BALANCE_INTRO,
  TINETTI_GAIT_INTRO,
} from './data/form-format-texts';
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

@Component({
  selector: 'app-intake-section-scales',
  standalone: true,
  imports: [ReactiveFormsModule, ScaleFormComponent],
  templateUrl: './intake-section-scales.component.html',
})
export class IntakeSectionScalesComponent implements OnInit {
  readonly formApi = inject(ClinicalFormService);
  readonly form = this.formApi.form;
  readonly barthel = BARTHEL_SCALE;
  readonly lawton = LAWTON_SCALE;
  readonly tinettiBalance = TINETTI_BALANCE;
  readonly tinettiGait = TINETTI_GAIT;
  readonly pfeifferQ = PFEIFFER_QUESTIONS;
  readonly gdsQ = GDS_QUESTIONS;
  readonly tinettiBalanceIntro = TINETTI_BALANCE_INTRO;
  readonly tinettiGaitIntro = TINETTI_GAIT_INTRO;
  readonly gdsIntro = GDS_INTRO;
  readonly pfeifferIntro = PFEIFFER_INTRO;
  interpretPfeiffer = interpretPfeiffer;
  interpretGds = interpretGds;

  ngOnInit(): void {
    this.formApi.initEscalasIfNeeded();
  }

  get escalasGroup(): FormGroup {
    return this.form.get('escalas') as FormGroup;
  }

  tinettiBalanceGroup(): FormGroup {
    return this.escalasGroup.get('tinettiBalance') as FormGroup;
  }

  tinettiGaitGroup(): FormGroup {
    return this.escalasGroup.get('tinettiGait') as FormGroup;
  }

  pfeifferGroup(): FormGroup {
    return this.escalasGroup.get('pfeiffer') as FormGroup;
  }

  gdsGroup(): FormGroup {
    return this.escalasGroup.get('gds') as FormGroup;
  }

  pfeifferErrors(): number {
    let e = 0;
    for (const q of PFEIFFER_QUESTIONS) {
      if (this.pfeifferGroup().get(q.id)?.value === true) {
        e++;
      }
    }
    return e;
  }

  gdsTotal(): number {
    let t = 0;
    for (const q of GDS_QUESTIONS) {
      const v = this.gdsGroup().get(q.id)?.value;
      if (v === 'si') {
        t += q.yesScore;
      } else if (v === 'no') {
        t += q.yesScore === 1 ? 0 : 1;
      }
    }
    return t;
  }

  tinettiTotal(part: 'balance' | 'gait'): number {
    const items = part === 'balance' ? TINETTI_BALANCE : TINETTI_GAIT;
    const g = part === 'balance' ? this.tinettiBalanceGroup() : this.tinettiGaitGroup();
    return items.reduce((s, it) => s + (Number(g.get(it.id)?.value) || 0), 0);
  }

  setTinetti(part: 'balance' | 'gait', itemId: string, score: number): void {
    const g = part === 'balance' ? this.tinettiBalanceGroup() : this.tinettiGaitGroup();
    g.get(itemId)?.setValue(score);
  }
}
