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
import { TinettiScaleListComponent } from './tinetti-scale-list.component';
import { ClinicalBodyScratchComponent } from './clinical-body-scratch.component';
import { PhotoAttachComponent } from './photo-attach.component';
import { PdfAttachComponent } from './pdf-attach.component';
import { MultiPhotoAttachComponent } from './multi-photo-attach.component';
import { IntakeStoreService } from './intake-store.service';
import { ClinicalSidebarService } from './clinical-sidebar.service';
import {
  BARTHEL_SCALE,
  GDS_QUESTIONS,
  gdsNoScore,
  interpretGds,
  interpretPfeiffer,
  LAWTON_SCALE,
  PFEIFFER_QUESTIONS,
  SALUD_PERCEPCION,
  TINETTI_BALANCE,
  TINETTI_BALANCE_MAX,
  TINETTI_GAIT,
  TINETTI_GAIT_MAX,
  TINETTI_TOTAL_MAX,
  tinettiTotalFromItems,
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
  RESPIRATORIO_REVISION_FIELDS,
  VALOR_FR_EN_UN_MINUTO,
} from './data/exam-definitions';
import {
  CLINICAL_PRINT_IFRAME_OVERRIDES,
  CLINICAL_PRINT_STYLES,
} from './clinical-print-styles';

@Component({
  selector: 'app-clinical-intake',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ScaleFormComponent,
    TinettiScaleListComponent,
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
  readonly sidebar = inject(ClinicalSidebarService);

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
  readonly tinettiBalanceMax = TINETTI_BALANCE_MAX;
  readonly tinettiGaitMax = TINETTI_GAIT_MAX;
  readonly tinettiTotalMax = TINETTI_TOTAL_MAX;
  readonly pfeifferQ = PFEIFFER_QUESTIONS;
  readonly gdsQ = GDS_QUESTIONS;
  readonly gdsNoScore = gdsNoScore;
  readonly saludOpts = SALUD_PERCEPCION;
  readonly examRegions = EXAMEN_FISICO_REGIONS;
  readonly respiratorioRevisionFields = RESPIRATORIO_REVISION_FIELDS;
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
  saveFailed = signal(false);
  printBannerVisible = signal(false);
  printHintMsg = signal('');
  activeIndexPath = signal('contrato');
  private scrollSpyEnabled = false;
  private intakeReady = false;
  private viewReady = false;
  private printFlowPending = false;
  private printFlowStarted = false;
  draftIntakeKey = signal('');
  printMode = false;
  readonly bodyFrontFallback = 'assets/clinical/body-front.svg';
  readonly bodyBackFallback = 'assets/clinical/body-back.svg';

  get hijos(): FormArray {
    return this.clinical.hijos;
  }

  get medicamentos(): FormArray {
    return this.clinical.medicamentos;
  }

  get clinicaGroup(): FormGroup {
    return this.form.get('clinica') as FormGroup;
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
    this.printMode = printMode;
    if (printMode) {
      document.body.classList.add('clinical-print-mode');
    }
    if (!fichaId && !this.auth.canEdit()) {
      void this.router.navigate(['/fichas']);
      return;
    }

    const afterOpen = (): void => {
      this.formApi.ensureDefaultRows();
      if (!this.auth.canEdit() && !printMode) {
        this.form.disable({ emitEvent: false });
      }
      queueMicrotask(() => {
        this.cdr.detectChanges();
        this.refreshActiveSection();
      });
      this.intakeReady = true;
      this.backfillPrintSnapshotsIfNeeded();
      if (printMode) {
        this.queuePrintFlow();
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
        if (this.store.openFromPrintCache(fichaId)) {
          this.draftIntakeKey.set(fichaId);
          afterOpen();
        } else {
          this.store.openFromServer(fichaId).subscribe((ok) => {
            if (!ok) {
              void this.router.navigate(['/fichas']);
              return;
            }
            this.draftIntakeKey.set(fichaId);
            afterOpen();
          });
        }
      } else if (!openLocal()) {
        const tryServer = (): void => {
          this.store.openFromServer(fichaId).subscribe((ok) => {
            if (!ok) {
              void this.router.navigate(['/fichas']);
              return;
            }
            this.draftIntakeKey.set(fichaId);
            afterOpen();
          });
        };
        if (!this.store.loading()) {
          tryServer();
        } else {
          const wait = setInterval(() => {
            if (!this.store.loading()) {
              clearInterval(wait);
              if (!openLocal()) {
                tryServer();
              }
            }
          }, 50);
        }
      }
    } else {
      this.store.beginDraft();
      this.draftIntakeKey.set(`borrador-${Date.now()}`);
      afterOpen();
    }
  }

  private schedulePrint(): void {
    this.form.enable({ emitEvent: false });
    this.sidebar.close();
    void this.ensureBodyPrintSnapshots().finally(() => {
      document.body.classList.add('clinical-print-mode');
      setTimeout(() => {
        this.triggerPrint();
        setTimeout(() => {
          if (window.opener) {
            return;
          }
          if (this.isMobileDevice()) {
            this.showPrintFallbackBanner();
          }
        }, 1800);
      }, 900);
    });
  }

  private triggerPrint(): void {
    this.cdr.detectChanges();
    this.applyPrintBackgrounds();
    requestAnimationFrame(() => {
      this.printViaIframe();
    });
  }

  /** Imprime en iframe aislado con los mismos estilos del tema (fotos, anexos, logo). */
  private printViaIframe(): void {
    const source = document.querySelector('.intake-form-window');
    if (!source) {
      window.print();
      return;
    }

    document.getElementById('clinical-print-iframe')?.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'clinical-print-iframe';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText =
      'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;
    if (!doc || !win) {
      iframe.remove();
      window.print();
      return;
    }

    this.materializeImages(source as HTMLElement);
    const clone = source.cloneNode(true) as HTMLElement;
    this.prepareCloneForPrint(clone);

    doc.open();
    doc.write(
      `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><base href="${window.location.origin}/"><title>Ficha clínica — Fundación Manos Unidas de Dios</title></head><body class="clinical-print-mode"></body></html>`,
    );
    doc.close();

    this.copyDocumentStyles(doc);
    const overrides = doc.createElement('style');
    overrides.textContent = `${CLINICAL_PRINT_STYLES}\n${CLINICAL_PRINT_IFRAME_OVERRIDES}`;
    doc.head.appendChild(overrides);
    doc.body.appendChild(clone);

    const finish = (): void => {
      iframe.remove();
      this.clearPrintBackgrounds();
      if (window.opener) {
        document.body.classList.remove('clinical-print-mode');
        window.close();
      }
    };

    win.addEventListener('afterprint', finish, { once: true });

    const printFrame = (): void => {
      win.focus();
      win.print();
    };

    const images = Array.from(doc.images);
    if (images.length === 0) {
      setTimeout(printFrame, 200);
      return;
    }

    void Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
              return;
            }
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }),
      ),
    ).then(() => setTimeout(printFrame, 200));
  }

  private copyDocumentStyles(targetDoc: Document): void {
    document.querySelectorAll('head style, head link[rel="stylesheet"]').forEach((node) => {
      targetDoc.head.appendChild(node.cloneNode(true));
    });
  }

  private materializeImages(root: HTMLElement): void {
    root.querySelectorAll('img').forEach((img) => {
      const current = img.currentSrc || img.src;
      if (current) {
        img.setAttribute('src', current);
      }
    });
  }

  private expandComponentHosts(root: HTMLElement): void {
    const tags = [
      'app-photo-attach',
      'app-pdf-attach',
      'app-multi-photo-attach',
      'app-scale-form',
      'app-tinetti-scale-list',
    ];
    let found = true;
    while (found) {
      found = false;
      for (const tag of tags) {
        root.querySelectorAll(tag).forEach((host) => {
          found = true;
          const wrapper = document.createElement('div');
          wrapper.className = tag.replace('app-', 'print-');
          while (host.firstChild) {
            wrapper.appendChild(host.firstChild);
          }
          host.replaceWith(wrapper);
        });
      }
    }
  }

  private fixImageSources(root: HTMLElement): void {
    root.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src');
      if (!src || src.startsWith('data:') || src.startsWith('http')) {
        return;
      }
      const normalized = src.replace(/^\//, '');
      img.setAttribute('src', `${window.location.origin}/${normalized}`);
    });
  }

  private prepareCloneForPrint(root: HTMLElement): void {
    this.expandComponentHosts(root);

    root
      .querySelectorAll(
        'app-clinical-body-scratch, .body-graphic-hint, input[type="file"]',
      )
      .forEach((el) => el.remove());

    root.querySelectorAll('.body-graphic-print-sheet').forEach((el) => {
      (el as HTMLElement).style.display = 'grid';
    });

    this.fixImageSources(root);
  }

  /** Variables de tema para impresión (sin estilos inline masivos en el DOM). */
  private applyPrintBackgrounds(): void {
    const root = document.documentElement;
    root.style.setProperty('--lun-bg', '#ffffff');
    root.style.setProperty('--lun-surface', '#fffef9');
    root.style.setProperty('--lun-surface-soft', '#fffef9');
  }

  private clearPrintBackgrounds(): void {
    document.documentElement.style.removeProperty('--lun-bg');
    document.documentElement.style.removeProperty('--lun-surface');
    document.documentElement.style.removeProperty('--lun-surface-soft');
    document.getElementById('clinical-print-iframe')?.remove();
  }

  private isMobileDevice(): boolean {
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  }

  canShowPrintAction(): boolean {
    return this.auth.isLoggedIn() && !!this.store.currentId() && !this.printMode;
  }

  startPrint(): void {
    const id = this.store.currentId();
    if (!id || !this.auth.isLoggedIn()) {
      return;
    }
    void (async () => {
      await this.bodyScratch?.commitDraftToForm();
      this.store.syncFromForm();
      this.auth.ensureSessionPersisted();
      this.store.stashPrintPayload(id);
      this.printMode = true;
      this.printBannerVisible.set(false);
      this.printHintMsg.set('');
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { imprimir: '1' },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
      this.queuePrintFlow();
    })();
  }

  retryPrint(): void {
    this.form.enable({ emitEvent: false });
    document.body.classList.add('clinical-print-mode');
    this.printFlowStarted = false;
    this.printFlowPending = false;
    this.triggerPrint();
  }

  exitPrintMode(): void {
    this.printMode = false;
    this.printBannerVisible.set(false);
    this.printHintMsg.set('');
    this.printFlowStarted = false;
    this.printFlowPending = false;
    this.clearPrintBackgrounds();
    document.body.classList.remove('clinical-print-mode');
    const id = this.store.currentId();
    if (id) {
      void this.router.navigate(['/ficha', id], { replaceUrl: true });
    }
  }

  private showPrintFallbackBanner(): void {
    this.printBannerVisible.set(true);
    if (!this.printHintMsg()) {
      this.printHintMsg.set(
        'Si no apareció el diálogo, use Compartir → Imprimir (iPhone) o el menú del navegador → Imprimir / Guardar como PDF (Android).',
      );
    }
  }

  private queuePrintFlow(): void {
    this.printFlowPending = true;
    this.tryStartPrintFlow();
  }

  private tryStartPrintFlow(): void {
    if (!this.printMode || !this.printFlowPending || this.printFlowStarted) {
      return;
    }
    if (!this.intakeReady || !this.viewReady) {
      return;
    }
    this.printFlowStarted = true;
    this.printFlowPending = false;
    this.schedulePrint();
  }

  private backfillPrintSnapshotsIfNeeded(): void {
    if (this.hasBodyPrintSnapshots() || !this.form.get('bodyPaintImage')?.value) {
      return;
    }
    void this.ensureBodyPrintSnapshots();
  }

  private hasBodyPrintSnapshots(): boolean {
    return (
      !!this.form.get('bodyPrintFrontImage')?.value &&
      !!this.form.get('bodyPrintBackImage')?.value
    );
  }

  private async ensureBodyPrintSnapshots(): Promise<void> {
    if (this.hasBodyPrintSnapshots()) {
      return;
    }
    if (!this.form.get('bodyPaintImage')?.value) {
      return;
    }
    const scratch = this.bodyScratch;
    if (!scratch) {
      return;
    }
    const ready = await scratch.whenSceneReady();
    if (!ready) {
      return;
    }
    scratch.reloadFromSaved();
    for (let attempt = 0; attempt < 30; attempt++) {
      const snaps = await scratch.capturePrintSnapshotsAsync();
      if (snaps.front && snaps.back) {
        this.form.patchValue(
          {
            bodyPrintFrontImage: snaps.front,
            bodyPrintBackImage: snaps.back,
          },
          { emitEvent: false },
        );
        this.cdr.detectChanges();
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  bodyPrintFrontSrc(): string | null {
    const saved = this.form.get('bodyPrintFrontImage')?.value as string;
    if (saved?.trim()) {
      return saved;
    }
    if (this.form.get('bodyPaintImage')?.value) {
      return null;
    }
    return this.bodyFrontFallback;
  }

  bodyPrintBackSrc(): string | null {
    const saved = this.form.get('bodyPrintBackImage')?.value as string;
    if (saved?.trim()) {
      return saved;
    }
    if (this.form.get('bodyPaintImage')?.value) {
      return null;
    }
    return this.bodyBackFallback;
  }

  showBodyPrintSheet(): boolean {
    return (
      !!this.form.get('bodyPaintImage')?.value ||
      !!this.form.get('bodyPrintFrontImage')?.value ||
      !!this.form.get('bodyPrintBackImage')?.value ||
      !!this.form.get('descripcionCuerpoObservaciones')?.value
    );
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

  tinettiPercent(part: 'balance' | 'gait'): number {
    const max = part === 'balance' ? TINETTI_BALANCE_MAX : TINETTI_GAIT_MAX;
    return Math.round((this.tinettiTotal(part) / max) * 100);
  }

  tinettiGeneralTotal(): number {
    return this.tinettiTotal('balance') + this.tinettiTotal('gait');
  }

  tinettiGeneralPercent(): number {
    return Math.round((this.tinettiGeneralTotal() / TINETTI_TOTAL_MAX) * 100);
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
    this.viewReady = true;
    this.refreshActiveSection();
    this.backfillPrintSnapshotsIfNeeded();
    if (this.printMode) {
      this.queuePrintFlow();
    }
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onWindowScroll);
    this.clearPrintBackgrounds();
    document.body.classList.remove('clinical-print-mode');
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
    this.sidebar.close();
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
    void (async () => {
      await this.bodyScratch?.commitDraftToForm();
      const id = this.store.commitCurrentIntake();
      if (!id) {
        this.saveMsg.set('Escriba al menos el nombre y apellidos en Información personal.');
        return;
      }
      this.draftIntakeKey.set(id);
      this.saveFailed.set(false);
      this.store.saveToServer().subscribe({
        next: () => {
          this.saveFailed.set(false);
          if (wasNew) {
            this.store.homeFlashMsg.set('Ficha clínica creada exitosamente.');
            void this.router.navigate(['/']);
          } else {
            this.store.fichasFlashMsg.set('Información actualizada correctamente.');
            void this.router.navigate(['/fichas']);
          }
        },
        error: () => {
          this.saveFailed.set(true);
          this.saveMsg.set(
            'No se pudo guardar en el servidor. Verifique que PostgreSQL y el backend estén en ejecución (scripts\\start-postgres.cmd y scripts\\run-backend-docker.cmd).',
          );
        },
      });
    })();
  }
}
