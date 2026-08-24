import { Component, inject } from '@angular/core';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { ClinicalFormService } from './clinical-form.service';
import { PdfAttachComponent } from './pdf-attach.component';
import { SALUD_PERCEPCION } from './data/scale-definitions';

@Component({
  selector: 'app-section-clinica',
  standalone: true,
  imports: [ReactiveFormsModule, PdfAttachComponent],
  templateUrl: './section-clinica.component.html',
})
export class SectionClinicaComponent {
  readonly formApi = inject(ClinicalFormService);
  readonly form = this.formApi.form;
  readonly saludOpts = SALUD_PERCEPCION;

  get medicamentos(): FormArray {
    return this.formApi.medicamentos;
  }

  get riesgoSalud(): FormArray {
    return this.form.get('riesgoSalud') as FormArray;
  }

  get especialistas(): FormArray {
    return this.form.get('especialistas') as FormArray;
  }
}
