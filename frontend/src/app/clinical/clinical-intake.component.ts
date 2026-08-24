import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  afterNextRender,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ClinicalFormService } from './clinical-form.service';
import { CLINICAL_SCROLL_SECTIONS } from './clinical-sections';
import { INTAKE_INDEX_ITEMS, IntakeIndexItem } from './intake-index-items';
import { FUNDACION_CONTACT } from './fundacion-contact.config';
import { ScaleFormComponent } from './scale-form.component';
import { ClinicalBodyScratchComponent } from './clinical-body-scratch.component';
import { PhotoAttachComponent } from './photo-attach.component';
import { PdfAttachComponent } from './pdf-attach.component';
import { MultiPhotoAttachComponent } from './multi-photo-attach.component';
import { IntakeStoreService } from './intake-store.service';
import {
  BARTHEL_SCALE,
  GDS_QUESTIONS,
  interpretGds,
  interpretPfeiffer,
  LAWTON_SCALE,
  PFEIFFER_QUESTIONS,
  SALUD_PERCEPCION,
  TINETTI_BALANCE,
  TINETTI_GAIT,
} from './data/scale-definitions';
import {
  CONCEPTO_INSTITUCIONAL_TITULO,
  DECLARACION_TEXTO,
  GDS_INTRO,
  PFEIFFER_INTRO,
  PROFESIONALES_TITULO,
  TINETTI_BALANCE_INTRO,
  TINETTI_GAIT_INTRO,
  TINETTI_INTERPRET,
  VGI_TEXTO,
} from './data/form-format-texts';
import {
  EXAMEN_FISICO_REGIONS,
  EXAMEN_MENTAL_FIELDS,
  INCONTINENCIA_CHECK_ITEMS,
  VALOR_FR_EN_UN_MINUTO,
} from './data/exam-definitions';

@Component({
  selector: 'app-clinical-intake',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ScaleFormComponent,
    ClinicalBodyScratchComponent,
    PhotoAttachComponent,
    MultiPhotoAttachComponent,
    PdfAttachComponent,
  ],
  templateUrl: './clinical-intake.component.html',
})
export class ClinicalIntakeComponent implements OnInit, AfterViewInit, OnDestroy {
  private clinical = inject(ClinicalFormService);
  private store = inject(IntakeStoreService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  readonly auth = inject(AuthService);

  @ViewChild(ClinicalBodyScratchComponent) bodyScratch?: ClinicalBodyScratchComponent;

  constructor() {
    afterNextRender(() => this.cdr.detectChanges());
  }

  readonly formApi = this.clinical;
  readonly storeApi = this.store;

  readonly sections = CLINICAL_SCROLL_SECTIONS.map((s) => ({
    path: s.path,
    anchor: s.scrollAnchor ?? s.path,
    label: s.label,
  }));
  readonly indexItems = INTAKE_INDEX_ITEMS;
  readonly contact = FUNDACION_CONTACT;
  readonly form = this.clinical.form;
  readonly barthel = BARTHEL_SCALE;
  readonly lawton = LAWTON_SCALE;
  readonly tinettiBalance = TINETTI_BALANCE;
  readonly tinettiGait = TINETTI_GAIT;
  readonly pfeifferQ = PFEIFFER_QUESTIONS;
  readonly gdsQ = GDS_QUESTIONS;
  readonly saludOpts = SALUD_PERCEPCION;
  readonly examRegions = EXAMEN_FISICO_REGIONS;
  readonly valorFrItems = VALOR_FR_EN_UN_MINUTO;
  readonly examenMentalFields = EXAMEN_MENTAL_FIELDS;
  readonly incontinenciaChecks = INCONTINENCIA_CHECK_ITEMS;
  readonly vgiTexto = VGI_TEXTO;
  readonly tinettiBalanceIntro = TINETTI_BALANCE_INTRO;
  readonly tinettiGaitIntro = TINETTI_GAIT_INTRO;
  readonly gdsIntro = GDS_INTRO;
  readonly pfeifferIntro = PFEIFFER_INTRO;
  readonly conceptoInstitucionalTitulo = CONCEPTO_INSTITUCIONAL_TITULO;
  readonly declaracionTexto = DECLARACION_TEXTO;
  readonly profesionalesTitulo = PROFESIONALES_TITULO;

  saveMsg = signal('');
  activeIndexPath = signal('contrato');
  private scrollSpyEnabled = false;
  draftIntakeKey = signal('');

  get hijos(): FormArray {
    return this.clinical.hijos;
  }

  get medicamentos(): FormArray {
    return this.clinical.medicamentos;
  }

  get especialistas(): FormArray {
    return this.form.get('especialistas') as FormArray;
  }

  get referencias(): FormArray {
    return this.form.get('referencias') as FormArray;
  }

  get acudientes(): FormArray {
    return this.form.get('acudientes') as FormArray;
  }

  get profesionales(): FormArray {
    return this.clinical.profesionales;
  }

  get otrasSustancias(): FormArray {
    return this.clinical.otrasSustancias;
  }

  get riesgoSaludGroup(): FormGroup {
    return this.clinical.riesgoSaludGroup;
  }

  get examenFisicoGroup(): FormGroup {
    return this.clinical.examenFisicoGroup;
  }

  get escalasGroup(): FormGroup {
    return this.form.get('escalas') as FormGroup;
  }

  get incontinenciaGroup(): FormGroup {
    return this.formApi.examenFisicoGroup.get('incontinencia') as FormGroup;
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

  ngOnInit(): void {
    this.clinical.initEscalasIfNeeded();
    const fichaId = this.route.snapshot.paramMap.get('id');
    const printMode = this.route.snapshot.queryParamMap.get('imprimir') === '1';
    if (!fichaId && !this.auth.canEdit()) {
      void this.router.navigate(['/fichas']);
      return;
    }

    const afterOpen = (): void => {
      this.formApi.ensureDefaultRows();
      if (!this.auth.canEdit() || printMode) {
        this.form.disable({ emitEvent: false });
      }
      queueMicrotask(() => {
        this.cdr.detectChanges();
        this.refreshActiveSection();
      });
      if (printMode) {
        this.schedulePrint();
      }
    };

    const openLocal = (): boolean => {
      if (!fichaId || !this.store.open(fichaId)) {
        return false;
      }
      this.draftIntakeKey.set(fichaId);
      afterOpen();
      return true;
    };

    if (fichaId) {
      if (printMode) {
        this.store.openFromServer(fichaId).subscribe((ok) => {
          if (!ok) {
            void this.router.navigate(['/fichas']);
            return;
          }
          this.draftIntakeKey.set(fichaId);
          afterOpen();
        });
      } else if (!openLocal()) {
        const wait = setInterval(() => {
          if (!this.store.loading()) {
            clearInterval(wait);
            if (!openLocal()) {
              void this.router.navigate(['/fichas']);
            }
          }
        }, 50);
      }
    } else {
      this.store.beginDraft();
      this.draftIntakeKey.set(`borrador-${Date.now()}`);
      afterOpen();
    }
  }

  private schedulePrint(): void {
    document.body.classList.add('clinical-print-mode');
    setTimeout(() => {
      window.print();
      window.addEventListener(
        'afterprint',
        () => {
          document.body.classList.remove('clinical-print-mode');
          if (window.opener) {
            window.close();
          }
        },
        { once: true },
      );
    }, 900);
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

  tinettiPercent(part: 'balance' | 'gait'): number {
    const max = part === 'balance' ? 15 : 12;
    return Math.round((this.tinettiTotal(part) / max) * 100);
  }

  tinettiGeneralTotal(): number {
    return this.tinettiTotal('balance') + this.tinettiTotal('gait');
  }

  tinettiGeneralPercent(): number {
    return Math.round((this.tinettiGeneralTotal() / 27) * 100);
  }

  tinettiInterpret = TINETTI_INTERPRET;

  riesgoConsume(path: 'tabaco' | 'alcohol'): boolean {
    return this.riesgoSaludGroup.get(path)?.get('consume')?.value === 'si';
  }

  otraSustanciaActiva(): boolean {
    const n = this.riesgoSaludGroup.get('otraSustancia')?.get('nombre')?.value;
    return !!n && String(n).trim().length > 0;
  }

  interpretPfeiffer = interpretPfeiffer;
  interpretGds = interpretGds;

  ngAfterViewInit(): void {
    window.addEventListener('scroll', this.onWindowScroll, { passive: true });
    this.scrollSpyEnabled = true;
    this.refreshActiveSection();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onWindowScroll);
  }

  private onWindowScroll = (): void => {
    this.resolveActiveFromScroll();
  };

  /** Sincroniza ítem activo del índice con la sección visible y desplaza el panel lateral. */
  private resolveActiveFromScroll(): void {
    if (!this.scrollSpyEnabled) {
      return;
    }
    const marker = window.innerHeight * 0.22;
    let current = this.indexItems[0];
    for (const item of this.indexItems) {
      const el = document.getElementById(item.anchor);
      if (!el) {
        continue;
      }
      if (el.getBoundingClientRect().top <= marker) {
        current = item;
      } else {
        break;
      }
    }
    if (this.activeIndexPath() === current.path) {
      return;
    }
    this.activeIndexPath.set(current.path);
    this.scrollNavToActiveItem();
  }

  private refreshActiveSection(): void {
    requestAnimationFrame(() => {
      this.resolveActiveFromScroll();
    });
  }

  private scrollNavToActiveItem(): void {
    queueMicrotask(() => {
      const nav = document.querySelector('.clinical-intake-index-list');
      const active = nav?.querySelector(`[data-index-path="${this.activeIndexPath()}"]`);
      active?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  }

  scrollToSection(item: IntakeIndexItem): void {
    this.activeIndexPath.set(item.path);
    document.getElementById(item.anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.scrollNavToActiveItem();
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }

  save(): void {
    if (!this.auth.canEdit()) {
      return;
    }
    const wasNew = !this.store.currentId();
    this.bodyScratch?.commitDraftToForm();
    const id = this.store.commitCurrentIntake();
    if (!id) {
      this.saveMsg.set('Escriba al menos el nombre y apellidos en Información personal.');
      return;
    }
    this.draftIntakeKey.set(id);
    this.store.saveToServer().subscribe({
      next: () => {
        if (wasNew) {
          this.saveMsg.set('Información del adulto mayor guardada correctamente.');
          setTimeout(() => void this.router.navigate(['/seccion', 'personal']), 1200);
        } else {
          this.store.fichasFlashMsg.set('Información actualizada correctamente.');
          void this.router.navigate(['/fichas']);
        }
      },
      error: () => {
        if (wasNew) {
          this.saveMsg.set('Información guardada localmente. No se pudo sincronizar con el servidor.');
          setTimeout(() => void this.router.navigate(['/seccion', 'personal']), 2200);
        } else {
          this.store.fichasFlashMsg.set('Información actualizada correctamente.');
          void this.router.navigate(['/fichas']);
        }
      },
    });
  }
}
