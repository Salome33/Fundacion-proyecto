import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ClinicalFormService } from './clinical-form.service';
import { ScaleFormComponent } from './scale-form.component';
import { TinettiScaleListComponent } from './tinetti-scale-list.component';
import {
  GDS_INTRO,
  PFEIFFER_INTRO,
  TINETTI_BALANCE_INTRO,
  TINETTI_GAIT_INTRO,
} from './data/form-format-texts';
import { RESPIRATORIO_REVISION_FIELDS } from './data/exam-definitions';
import {
  BARTHEL_SCALE,
  GDS_QUESTIONS,
  gdsNoScore,
  interpretGds,
  interpretPfeiffer,
  LAWTON_SCALE,
  PFEIFFER_QUESTIONS,
  TINETTI_BALANCE,
  TINETTI_BALANCE_MAX,
  TINETTI_GAIT,
  TINETTI_GAIT_MAX,
  TINETTI_TOTAL_MAX,
  tinettiTotalFromItems,
} from './data/scale-definitions';

@Component({
  selector: 'app-section-examen',
  standalone: true,
  imports: [ReactiveFormsModule, ScaleFormComponent, TinettiScaleListComponent],
  templateUrl: './section-examen.component.html',
})
export class SectionExamenComponent implements OnInit {
  readonly formApi = inject(ClinicalFormService);
  readonly form = this.formApi.form;
  readonly barthel = BARTHEL_SCALE;
  readonly lawton = LAWTON_SCALE;
  readonly tinettiBalance = TINETTI_BALANCE;
  readonly tinettiGait = TINETTI_GAIT;
  readonly tinettiBalanceMax = TINETTI_BALANCE_MAX;
  readonly tinettiGaitMax = TINETTI_GAIT_MAX;
  readonly tinettiTotalMax = TINETTI_TOTAL_MAX;
  readonly pfeifferQ = PFEIFFER_QUESTIONS;
  readonly gdsQ = GDS_QUESTIONS;
  readonly gdsNoScore = gdsNoScore;
  readonly tinettiBalanceIntro = TINETTI_BALANCE_INTRO;
  readonly tinettiGaitIntro = TINETTI_GAIT_INTRO;
  readonly gdsIntro = GDS_INTRO;
  readonly pfeifferIntro = PFEIFFER_INTRO;
  readonly respiratorioRevisionFields = RESPIRATORIO_REVISION_FIELDS;
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
    return tinettiTotalFromItems(items, (id) => g.get(id)?.value);
  }

  setTinetti(part: 'balance' | 'gait', itemId: string, optionIndex: number): void {
    const g = part === 'balance' ? this.tinettiBalanceGroup() : this.tinettiGaitGroup();
    g.get(itemId)?.setValue(optionIndex);
  }
}
