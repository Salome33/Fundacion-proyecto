import { Component, inject } from '@angular/core';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { ClinicalFormService } from './clinical-form.service';
import { PhotoAttachComponent } from './photo-attach.component';

@Component({
  selector: 'app-section-personal',
  standalone: true,
  imports: [ReactiveFormsModule, PhotoAttachComponent],
  templateUrl: './section-personal.component.html',
})
export class SectionPersonalComponent {
  readonly formApi = inject(ClinicalFormService);
  readonly form = this.formApi.form;

  get hijos(): FormArray {
    return this.formApi.hijos;
  }

  get referencias(): FormArray {
    return this.formApi.referencias;
  }

  get acudientes(): FormArray {
    return this.formApi.acudientes;
  }
}
