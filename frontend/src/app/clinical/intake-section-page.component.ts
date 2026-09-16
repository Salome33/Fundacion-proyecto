import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClinicalFormService } from './clinical-form.service';
import { INTAKE_SECTIONS, sectionByPath, IntakeSectionDef } from './clinical-sections';
import { IntakeSectionScalesComponent } from './intake-section-scales.component';
import { ClinicalBodyScratchComponent } from './clinical-body-scratch.component';
import { PhotoAttachComponent } from './photo-attach.component';
import { PdfAttachComponent } from './pdf-attach.component';
import { addButtonLabel } from './section-display';
import { IntakeStoreService } from './intake-store.service';
import { SectionRecordsDockComponent } from './section-records-dock.component';
import { SALUD_PERCEPCION } from './data/scale-definitions';

@Component({
  selector: 'app-intake-section-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    IntakeSectionScalesComponent,
    ClinicalBodyScratchComponent,
    PhotoAttachComponent,
    PdfAttachComponent,
    SectionRecordsDockComponent,
  ],
  styleUrl: './clinical-theme.css',
  templateUrl: './intake-section-page.component.html',
})
export class IntakeSectionPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly store = inject(IntakeStoreService);
  readonly formApi = inject(ClinicalFormService);
  readonly form = this.formApi.form;
  readonly saludOpts = SALUD_PERCEPCION;

  sectionId = signal('contrato');
  meta = signal<IntakeSectionDef | undefined>(undefined);
  editorOpen = signal(false);
  pageMsg = signal('');

  /** Borrador para agregar filas en listas (hijos, referencias, etc.) */
  draft = signal<Record<string, string>>({});

  ngOnInit(): void {
    this.route.paramMap.subscribe((p) => {
      const sec = p.get('section') ?? 'contrato';
      this.sectionId.set(sec);
      this.meta.set(sectionByPath(sec) ?? sectionByPath('contrato'));
      this.editorOpen.set(false);
      this.draft.set({});
    });

    this.route.parent?.paramMap.subscribe((p) => {
      const id = p.get('id');
      if (id && !this.store.open(id)) {
        void this.router.navigateByUrl('/');
      }
    });
  }

  @ViewChild(ClinicalBodyScratchComponent) private bodyViewer?: ClinicalBodyScratchComponent;

  openEditor(): void {
    this.draft.set({});
    if (this.sectionId() === 'medicamentos' && this.medicamentos.length === 0) {
      this.formApi.addMedicamento();
    }
    this.editorOpen.set(true);
  }

  closeEditor(): void {
    this.editorOpen.set(false);
    this.draft.set({});
  }

  addLabel(): string {
    return addButtonLabel(this.meta()?.label ?? 'información');
  }

  submitSection(): void {
    if (!this.store.currentId()) {
      this.pageMsg.set('Primero cree o abra una ficha de ingreso desde el inicio.');
      setTimeout(() => this.pageMsg.set(''), 4000);
      return;
    }
    if (this.sectionId() === 'cuerpo-grafico') {
      this.bodyViewer?.commitDraftToForm();
    }
    this.store.syncFromForm();
    this.closeEditor();
    this.pageMsg.set('Información enviada. Revise la barra inferior.');
    setTimeout(() => this.pageMsg.set(''), 3500);
  }

  showAddPanel(): boolean {
    return this.sectionId() !== 'vgi';
  }

  get hijos(): FormArray {
    return this.formApi.hijos;
  }

  get referencias(): FormArray {
    return this.formApi.referencias;
  }

  get acudientes(): FormArray {
    return this.formApi.acudientes;
  }

  get medicamentos(): FormArray {
    return this.formApi.medicamentos;
  }

  get clinicaGroup(): FormGroup {
    return this.form.get('clinica') as FormGroup;
  }

  get especialistas(): FormArray {
    return this.form.get('especialistas') as FormArray;
  }

  get riesgoSalud(): FormArray {
    return this.form.get('riesgoSalud') as FormArray;
  }

  group(name: string): FormGroup {
    return this.form.get(name) as FormGroup;
  }

  val(path: string): string {
    const parts = path.split('.');
    let g: FormGroup | null = this.form;
    for (let i = 0; i < parts.length - 1; i++) {
      g = g?.get(parts[i]) as FormGroup;
    }
    const v = g?.get(parts[parts.length - 1])?.value;
    if (v === null || v === undefined || v === '') {
      return '—';
    }
    if (typeof v === 'string' && (v.trim() === 'null' || v.trim() === 'undefined')) {
      return '—';
    }
    if (typeof v === 'boolean') {
      return v ? 'Sí' : 'No';
    }
    return String(v);
  }

  hasGroupData(name: string): boolean {
    const g = this.group(name);
    return Object.values(g.getRawValue()).some((v) => v !== '' && v !== null && v !== false);
  }

  saveDraftToArray(
    kind: 'hijo' | 'referencia' | 'acudiente' | 'medicamento' | 'especialista',
  ): void {
    const d = this.draft();
    const empty = Object.values(d).every((v) => !v?.trim());
    if (empty) {
      return;
    }
    switch (kind) {
      case 'hijo':
        this.formApi.addHijo();
        this.hijos.at(this.hijos.length - 1).patchValue(d);
        break;
      case 'referencia':
        this.formApi.addReferencia();
        this.referencias.at(this.referencias.length - 1).patchValue(d);
        break;
      case 'acudiente':
        this.formApi.addAcudiente();
        this.acudientes.at(this.acudientes.length - 1).patchValue(d);
        break;
      case 'medicamento':
        this.formApi.addMedicamento();
        this.medicamentos.at(this.medicamentos.length - 1).patchValue(d);
        break;
      case 'especialista':
        this.formApi.addEspecialista();
        this.especialistas.at(this.especialistas.length - 1).patchValue(d);
        break;
    }
    this.draft.set({});
    this.store.syncFromForm();
    if (kind === 'hijo') {
      this.closeEditor();
    }
  }

  patchDraft(field: string, value: string): void {
    this.draft.update((d) => ({ ...d, [field]: value }));
  }

  draftVal(field: string): string {
    return this.draft()[field] ?? '';
  }

  removeHijo(i: number): void {
    this.formApi.removeHijo(i);
  }

  removeReferencia(i: number): void {
    this.formApi.removeReferencia(i);
  }

  removeAcudiente(i: number): void {
    this.formApi.removeAcudiente(i);
  }

  removeMedicamento(i: number): void {
    this.formApi.removeMedicamento(i);
  }

  removeEspecialista(i: number): void {
    this.formApi.removeEspecialista(i);
  }

  readonly personalFields: { key: string; label: string; type?: string }[] = [
    { key: 'fechaIngreso', label: 'Fecha ingreso', type: 'date' },
    { key: 'fechaActualizacion', label: 'Fecha actualización', type: 'date' },
    { key: 'modalidad', label: 'Modalidad' },
    { key: 'nombreApellidos', label: 'Nombre y apellidos' },
    { key: 'identificacion', label: 'Identificación' },
    { key: 'lugarFechaExpedicion', label: 'Expedición ID' },
    { key: 'lugarFechaNacimiento', label: 'Nacimiento' },
    { key: 'edad', label: 'Edad' },
    { key: 'rh', label: 'Rh' },
    { key: 'sexo', label: 'Sexo' },
    { key: 'estadoCivil', label: 'Estado civil' },
    { key: 'nombreConyuge', label: 'Cónyuge' },
    { key: 'estudios', label: 'Estudios' },
    { key: 'eps', label: 'EPS' },
    { key: 'regimen', label: 'Régimen' },
    { key: 'lugarAtencion', label: 'Lugar atención' },
    { key: 'serviciosFunerarios', label: 'Servicios funerarios' },
    { key: 'profesion', label: 'Profesión' },
    { key: 'confesionReligiosa', label: 'Religión' },
  ];

  readonly economicaFields = [
    { key: 'ingresosDe', label: 'Ingresos' },
    { key: 'apoyoGubernamental', label: 'Apoyo gubernamental' },
    { key: 'viviendaTipo', label: 'Tipo vivienda' },
    { key: 'direccion', label: 'Dirección' },
  ];

  readonly familiarFields: { key: string; label: string; area?: boolean }[] = [
    { key: 'nombrePadre', label: 'Nombre del padre' },
    { key: 'nombreMadre', label: 'Nombre de la madre' },
    {
      key: 'conQuienVive',
      label: '¿Con quién vive actualmente el adulto mayor?',
    },
    {
      key: 'cuidadorPrincipal',
      label: '¿Quién es el principal cuidador o responsable de su atención?',
    },
    {
      key: 'familiaresCercanos',
      label: '¿Cuenta con familiares cercanos? ¿Quiénes son?',
    },
    {
      key: 'relacionFamilia',
      label: '¿Cómo es la relación el adulto mayor con su familia?',
      area: true,
    },
    {
      key: 'decisionEmergencia',
      label: '¿Existe alguna persona responsable de tomar decisiones en caso de emergencia?',
    },
    {
      key: 'actividadesSociales',
      label: '¿El adulto mayor participa de actividades sociales, comunitarias o religiosas?',
      area: true,
    },
    {
      key: 'antecedentesMaltrato',
      label: '¿Presenta antecedentes de abandono, maltrato o negligencia?',
      area: true,
    },
  ];

  readonly hijosExtraFields: { key: string; label: string }[] = [
    {
      key: 'expectativas',
      label:
        '¿Qué expectativas tiene la familia o el adulto mayor respecto a la atención que recibirá?',
    },
    {
      key: 'razonIngreso',
      label: '¿Cuál es la razón principal por la que solicita el ingreso a la institución?',
    },
  ];
}
