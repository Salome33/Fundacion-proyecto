import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormArray, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { navSectionByPath } from './clinical-sections';
import { IntakeRecord, IntakeStoreService } from './intake-store.service';
import { sectionEditFields } from './section-edit-fields';
import { sectionCardSummary } from './section-summary';
import { ClinicalFormService } from './clinical-form.service';
import { ClinicalBodyScratchComponent } from './clinical-body-scratch.component';
import { PdfAttachComponent } from './pdf-attach.component';
import { ClinicalDialogComponent } from './clinical-dialog.component';
import { SectionHubFormViewComponent } from './section-hub-form-view.component';
import { controlByPath } from './form-control-path';

type SortMode = 'recent' | 'oldest' | 'alpha';

@Component({
  selector: 'app-section-hub',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, DatePipe, RouterLink, ClinicalBodyScratchComponent, PdfAttachComponent, ClinicalDialogComponent, SectionHubFormViewComponent],
  styleUrl: './clinical-theme.css',
  template: `
    <div class="app-view app-view--wide">
      <section class="dashboard-window clinical-hub-page">
        <div class="clinical-view-stack clinical-hub-page-body dashboard-window-body">
          @if (meta(); as m) {
            <header class="app-view-head app-page-title clinical-section-hub-head">
              <a routerLink="/explorar" class="btn-back-home clinical-section-hub-back">
                ← Volver a explorar apartados
              </a>
              <h1>{{ m.label }}</h1>
              <p class="panel-lead">{{ m.description }}</p>
            </header>

            <section class="clinical-section-card">
              <h2 class="appointments-subtitle">Adultos mayores en este apartado</h2>
              <p class="panel-lead">
                {{ filtered.length }} registro(s) encontrado(s). Seleccione una persona para
                @if (auth.canEdit()) {
                  ver o modificar el apartado.
                } @else {
                  consultar el apartado.
                }
              </p>

              <div class="med-appt-filter-bar">
                <p class="med-appt-filter-heading">Filtrar consulta</p>
                <div class="med-appt-filter-grid">
                  <label class="med-appt-filter-field">
                    Nombre completo
                    <input
                      type="search"
                      [(ngModel)]="qNombre"
                      autocomplete="off"
                    />
                  </label>
                  <label class="med-appt-filter-field">
                    Documento de identidad
                    <input
                      type="search"
                      [(ngModel)]="qId"
                      autocomplete="off"
                    />
                  </label>
                  <label class="med-appt-filter-field">
                    Ordenar
                    <select [(ngModel)]="sortMode">
                      <option value="recent">Más reciente</option>
                      <option value="oldest">Menos reciente</option>
                      <option value="alpha">Orden alfabético</option>
                    </select>
                  </label>
                </div>
                @if (qNombre.trim() || qId.trim()) {
                  <div class="med-appt-filter-actions">
                    <button type="button" class="btn btn-secondary btn-sm" (click)="clearFilter()">
                      Ver todos
                    </button>
                    <span class="med-appt-filter-badge">
                      {{ filtered.length }} registro(s) encontrado(s)
                    </span>
                  </div>
                }
              </div>

              @if (filtered.length === 0) {
                <p class="appointments-empty">
                  @if (auth.canEdit()) {
                    No hay adultos mayores que coincidan con la búsqueda. Cree uno con «Nuevo ingreso»
                    en el panel lateral.
                  } @else {
                    No hay adultos mayores que coincidan con la búsqueda.
                  }
                </p>
              } @else {
                @if (sectionPath() === 'cuerpo-grafico' && !selectedId()) {
                  <p class="panel-lead section-hub-pick">
                    Seleccione un adulto mayor en la lista para ver el modelo 3D
                    @if (auth.canEdit()) {
                      y registrar marcas.
                    }.
                  </p>
                }
                <div class="clinical-records-list">
                  @for (rec of filtered; track rec.id) {
                    <button
                      type="button"
                      class="clinical-record-card clinical-record-card--selectable"
                      [class.clinical-record-card--active]="selectedId() === rec.id"
                      (click)="select(rec.id)"
                    >
                      <div class="clinical-record-card-body">
                        <strong>{{ rec.nombre }}</strong>
                        <p>{{ sectionCardSummary(sectionPath(), rec) }}</p>
                        <small>{{ rec.identificacion || 'Sin documento' }}</small>
                      </div>
                      <span
                        class="clinical-record-card-action btn btn-secondary"
                        aria-hidden="true"
                      >
                        {{ selectedId() === rec.id ? 'Seleccionado' : 'Ver detalle' }}
                      </span>
                    </button>
                  }
                </div>
              }
            </section>

            @if (selected; as rec) {
              <app-clinical-dialog [title]="rec.nombre" size="xl" (closed)="closeDetail()">
                <header class="section-hub-detail-head section-hub-detail-head--modal">
                  <div class="section-hub-detail-actions">
                    @if (auth.canEdit()) {
                      @if (!editing()) {
                        <button type="button" class="btn btn-secondary" (click)="startEdit(rec.id)">
                          Editar
                        </button>
                      } @else {
                        <button
                          type="button"
                          class="btn btn-secondary btn-gold--xl"
                          (click)="updateSection()"
                        >
                          Actualizar
                        </button>
                        <button type="button" class="btn btn-outline-sm" (click)="cancelEdit(rec.id)">
                          Cancelar
                        </button>
                      }
                    }
                    <a
                      class="btn btn-secondary btn-sm"
                      [routerLink]="['/ficha', rec.id]"
                      (click)="store.open(rec.id)"
                    >
                      Formulario completo
                    </a>
                  </div>
                </header>

                @if (saveMsg()) {
                  <p class="section-hub-save-msg">{{ saveMsg() }}</p>
                }

                @if (sectionPath() === 'cuerpo-grafico') {
                  <div class="body-graphic-layout body-graphic-layout--hub">
                    <aside class="body-graphic-panel">
                      <div class="body-graphic-panel-inner">
                        <label class="clinical-field-box clinical-field-box--observaciones field-observaciones">
                          <span class="clinical-field-box-label">Observaciones</span>
                          <textarea
                            class="observaciones-wide clinical-field-control"
                            rows="10"
                            [readonly]="!editing()"
                            [ngModel]="observacionesText()"
                            (ngModelChange)="onObservacionesChange($event)"
                          ></textarea>
                        </label>
                        @if (editing()) {
                          <p class="panel-lead section-hub-edit-hint">
                            Modifique las observaciones o las marcas en el visor 3D y pulse
                            «Actualizar».
                          </p>
                        }
                      </div>
                    </aside>
                    <div class="body-graphic-viewer">
                      @if (modelViewerOpen()) {
                        <app-clinical-body-scratch [intakeKey]="rec.id" [markEditable]="editing()" />
                      }
                    </div>
                  </div>
                } @else if (editing()) {
                  <div class="section-hub-table-wrap section-hub-table-wrap--edit">
                    <table class="lun-table section-hub-table">
                      <thead>
                        <tr>
                          <th>Campo</th>
                          <th>Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (field of editFields(); track field.path) {
                          @if (fieldControl(field.path); as ctrl) {
                            <tr>
                              <td class="col-field">{{ field.label }}</td>
                              <td>
                                @if (field.inputType === 'pdf') {
                                  <app-pdf-attach
                                    [formControl]="ctrl"
                                    [fileName]="pdfFileName(field.path)"
                                    (fileNameChange)="setPdfFileName(field.path, $event)"
                                  />
                                } @else if (field.inputType === 'textarea') {
                                  <textarea
                                    class="section-hub-field-input section-hub-field-textarea"
                                    rows="3"
                                    [formControl]="ctrl"
                                  ></textarea>
                                } @else if (field.inputType === 'signature' || field.inputType === 'photo') {
                                  <span class="section-hub-readonly-value">{{ attachmentHint(field.path, field.inputType) }}</span>
                                } @else {
                                  <input
                                    class="section-hub-field-input"
                                    [type]="field.inputType ?? 'text'"
                                    [formControl]="ctrl"
                                  />
                                }
                              </td>
                            </tr>
                          }
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <app-section-hub-form-view [section]="sectionPath()" />
                }

                <p class="section-hub-meta">
                  Creado: {{ rec.createdAt | date: 'medium' }}
                  @if (rec.updatedAt) {
                    · Actualizado: {{ rec.updatedAt | date: 'medium' }}
                  }
                </p>
              </app-clinical-dialog>
            }
          }
        </div>
      </section>
    </div>
  `,
})
export class SectionHubComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly auth = inject(AuthService);
  readonly formApi = inject(ClinicalFormService);
  readonly store = inject(IntakeStoreService);

  @ViewChild(ClinicalBodyScratchComponent) bodyScratch?: ClinicalBodyScratchComponent;

  sectionPath = signal('personal');
  selectedId = signal<string | null>(null);
  editing = signal(false);
  editRevision = signal(0);
  saveMsg = signal('');
  qNombre = '';
  qId = '';
  sortMode: SortMode = 'recent';
  observacionesText = signal('');
  modelViewerOpen = signal(false);

  meta = computed(() => navSectionByPath(this.sectionPath()));

  readonly sectionCardSummary = sectionCardSummary;

  editFields = computed(() => {
    this.editRevision();
    return sectionEditFields(this.formApi.form, this.sectionPath());
  });

  clearFilter(): void {
    this.qNombre = '';
    this.qId = '';
  }

  fieldControl(path: string): FormControl | null {
    const ctrl = controlByPath(this.formApi.form, path);
    return ctrl instanceof FormControl ? ctrl : null;
  }

  pdfFileName(pdfPath: string): string {
    const namePath = pdfPath.replace(/\.soporteFormulaPdf$/, '.soporteFormulaNombre');
    return String(this.fieldControl(namePath)?.value ?? '');
  }

  setPdfFileName(pdfPath: string, fileName: string): void {
    const namePath = pdfPath.replace(/\.soporteFormulaPdf$/, '.soporteFormulaNombre');
    this.fieldControl(namePath)?.setValue(fileName);
  }

  attachmentHint(path: string, kind: 'signature' | 'photo'): string {
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

  get filtered(): IntakeRecord[] {
    const nameQ = this.qNombre.trim().toLowerCase();
    const idQ = this.qId.trim().toLowerCase();
    let list = [...this.store.records()];
    list = list.filter((r) => {
      if (nameQ && !r.nombre.toLowerCase().includes(nameQ)) {
        return false;
      }
      if (idQ && !(r.identificacion ?? '').toLowerCase().includes(idQ)) {
        return false;
      }
      return true;
    });
    const mode = this.sortMode;
    list.sort((a, b) => {
      if (mode === 'alpha') {
        return a.nombre.localeCompare(b.nombre, 'es');
      }
      const ta = new Date(a.updatedAt ?? a.createdAt).getTime();
      const tb = new Date(b.updatedAt ?? b.createdAt).getTime();
      return mode === 'recent' ? tb - ta : ta - tb;
    });
    return list;
  }

  get selected(): IntakeRecord | undefined {
    const id = this.selectedId();
    return id ? this.store.records().find((r) => r.id === id) : undefined;
  }

  constructor() {
    this.route.paramMap.subscribe((p) => {
      const sec = p.get('section') ?? 'personal';
      if (!navSectionByPath(sec)) {
        void this.router.navigate(['/seccion', 'personal']);
        return;
      }
      this.sectionPath.set(sec);
      this.selectedId.set(null);
      this.editing.set(false);
      this.saveMsg.set('');
      this.modelViewerOpen.set(false);
    });
  }

  closeDetail(): void {
    const id = this.selectedId();
    if (id && this.editing()) {
      this.cancelEdit(id);
    }
    this.selectedId.set(null);
    this.editing.set(false);
    this.saveMsg.set('');
    this.modelViewerOpen.set(false);
    this.formApi.form.enable({ emitEvent: false });
  }

  select(id: string): void {
    this.editing.set(false);
    this.saveMsg.set('');
    this.modelViewerOpen.set(false);
    this.selectedId.set(id);
    this.store.open(id);
    this.formApi.initEscalasIfNeeded();
    this.ensureViewRows();
    this.formApi.form.disable({ emitEvent: false });
    const rec = this.store.records().find((r) => r.id === id);
    const obs = (rec?.data?.['descripcionCuerpoObservaciones'] as string | undefined) ?? '';
    this.observacionesText.set(obs);
    if (this.sectionPath() === 'cuerpo-grafico') {
      setTimeout(() => this.modelViewerOpen.set(true), 150);
    }
  }

  startEdit(id: string): void {
    if (!this.auth.canEdit()) {
      return;
    }
    this.store.open(id);
    this.formApi.initEscalasIfNeeded();
    this.ensureViewRows();
    this.formApi.form.enable({ emitEvent: false });
    this.editRevision.update((v) => v + 1);
    this.editing.set(true);
    this.saveMsg.set('');
    if (this.sectionPath() === 'cuerpo-grafico') {
      if (!this.modelViewerOpen()) {
        setTimeout(() => this.modelViewerOpen.set(true), 150);
      }
      queueMicrotask(() => this.bodyScratch?.reloadFromSaved());
    }
  }

  cancelEdit(id: string): void {
    this.store.open(id);
    this.ensureViewRows();
    this.formApi.form.disable({ emitEvent: false });
    const rec = this.store.records().find((r) => r.id === id);
    const obs = (rec?.data?.['descripcionCuerpoObservaciones'] as string | undefined) ?? '';
    this.observacionesText.set(obs);
    this.editing.set(false);
    this.saveMsg.set('');
    queueMicrotask(() => this.bodyScratch?.reloadFromSaved());
  }

  updateSection(): void {
    if (this.sectionPath() === 'cuerpo-grafico') {
      this.bodyScratch?.commitDraftToForm();
      this.formApi.form.patchValue({
        descripcionCuerpoObservaciones: this.observacionesText(),
      });
    }
    this.store.syncFromForm();
    this.store.saveToServer().subscribe({
      next: () => {
        this.editing.set(false);
        this.formApi.form.disable({ emitEvent: false });
        this.saveMsg.set('Información actualizada correctamente.');
        setTimeout(() => this.saveMsg.set(''), 3500);
      },
      error: () => {
        this.editing.set(false);
        this.formApi.form.disable({ emitEvent: false });
        this.saveMsg.set('Información guardada localmente. No se pudo sincronizar con el servidor.');
        setTimeout(() => this.saveMsg.set(''), 3500);
      },
    });
  }

  onObservacionesChange(value: string): void {
    this.observacionesText.set(value);
  }

  private ensureViewRows(): void {
    this.ensureEmptyRows();
  }

  private ensureEmptyRows(): void {
    const section = this.sectionPath();
    const clinical = this.formApi;
    switch (section) {
      case 'hijos':
        if (clinical.hijos.length === 0) {
          clinical.addHijo();
        }
        break;
      case 'referencias':
      case 'referencias-personales':
        if (clinical.referencias.length === 0) {
          clinical.addReferencia();
        }
        if (section === 'referencias' && clinical.acudientes.length === 0) {
          clinical.addAcudiente();
        }
        break;
      case 'acudiente':
        if (clinical.acudientes.length === 0) {
          clinical.addAcudiente();
        }
        break;
      case 'medicamentos':
      case 'clinica':
        if (clinical.medicamentos.length === 0) {
          clinical.addMedicamento();
        }
        break;
      case 'riesgo':
      case 'remision-especialistas':
        if ((clinical.form.get('especialistas') as FormArray).length === 0) {
          clinical.addEspecialista();
        }
        break;
      case 'declaraciones-firmas':
      case 'profesionales':
        if (clinical.profesionales.length === 0) {
          clinical.addProfesional();
        }
        break;
      default:
        break;
    }
  }

  legacyEditPath(): string {
    return legacySectionPath(this.sectionPath());
  }
}

export function legacySectionPath(path: string): string {
  const map: Record<string, string> = {
    'referencias-personales': 'referencias',
    acudiente: 'referencias',
    'valoracion-clinica': 'clinica',
    patologias: 'clinica',
    alergias: 'clinica',
    medicamentos: 'clinica',
    'practicas-riesgo': 'riesgo',
    'remision-especialistas': 'riesgo',
    'examen-mental': 'mental',
    antecedentes: 'mental',
    'concepto-institucional': 'concepto-institucional',
    'aprobacion-independiente': 'aprobacion-independiente',
    'aprobacion-familia': 'aprobacion-familia',
    declaracion: 'declaracion',
    profesionales: 'profesionales',
    'declaraciones-firmas': 'declaracion',
  };
  return map[path] ?? path;
}
