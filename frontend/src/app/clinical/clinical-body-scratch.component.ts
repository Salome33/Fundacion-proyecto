import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  inject,
  Input,
  input,
  OnDestroy,
  ViewChild,
  signal,
} from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ClinicalFormService } from './clinical-form.service';
import { IntakeStoreService } from './intake-store.service';
import { ScratchSceneService, ScratchTool } from '../scratch/scratch-scene.service';

/** Modelo 3D por ficha: marcas de heridas/condiciones guardadas por adulto mayor. */
@Component({
  selector: 'app-clinical-body-scratch',
  standalone: true,
  template: `
    <div class="body-scratch-panel">
      <h3 class="body-scratch-title">Modelo corporal</h3>
      <div class="body-scratch-toolbar">
        <div class="body-scratch-copy">
          <p class="body-scratch-lead">
            @if (personLabel()) {
              @if (auth.canEdit() && markEditable()) {
                Ficha: <strong>{{ personLabel() }}</strong> — marque heridas o condiciones sobre el
                modelo.
              } @else if (auth.canEdit()) {
                Ficha: <strong>{{ personLabel() }}</strong> — áreas marcadas del adulto mayor sobre el
                modelo.
              } @else {
                Ficha: <strong>{{ personLabel() }}</strong> — áreas marcadas del adulto mayor sobre el
                modelo.
              }
            } @else if (auth.canEdit() && markEditable()) {
              Marque sobre el cuerpo las zonas relevantes para la valoración.
            } @else {
              Consulte las áreas marcadas del adulto mayor sobre el modelo.
            }
          </p>
          @if (loadState() === 'loading') {
            <span class="body-scratch-status">Cargando modelo…</span>
          } @else if (loadState() === 'error' && !modelLoaded()) {
            <span class="body-scratch-status body-scratch-status--err">No se pudo cargar el modelo.</span>
          }
        </div>
        @if (auth.canEdit() && markEditable()) {
          <div class="body-scratch-actions">
            <div class="body-scratch-tools" role="group" aria-label="Herramientas de marcado">
              <button
                type="button"
                class="btn btn-secondary body-scratch-tool"
                [class.body-scratch-tool--active]="activeTool() === 'paint'"
                (click)="setTool('paint')"
              >
                Marcar
              </button>
              <button
                type="button"
                class="btn btn-secondary body-scratch-tool"
                [class.body-scratch-tool--active]="activeTool() === 'erase'"
                (click)="setTool('erase')"
              >
                Borrador
              </button>
              @if (touchLayout()) {
                <button
                  type="button"
                  class="btn btn-secondary body-scratch-tool"
                  [class.body-scratch-tool--active]="activeTool() === 'rotate'"
                  (click)="setTool('rotate')"
                >
                  Rotar
                </button>
              }
            </div>
          </div>
        }
      </div>
      <div
        #host
        class="body-scratch-viewport"
        [class.body-scratch-viewport--erase]="
          activeTool() === 'erase' && markEditable() && auth.canEdit()
        "
      ></div>
      <p class="body-scratch-hint">
        @if (touchLayout()) {
          @if (auth.canEdit() && markEditable()) {
            @if (activeTool() === 'rotate') {
              Un dedo: rotar el modelo · Pulse «Marcar» o «Borrador» para editar las marcas.
            } @else if (activeTool() === 'erase') {
              Un dedo: borrar marcas · Pulse «Rotar» para girar el modelo con un dedo.
            } @else {
              Un dedo: marcar · Pulse «Rotar» para girar el modelo con un dedo.
            }
          } @else if (auth.canEdit()) {
            Un dedo: rotar · Pulse «Editar» para marcar o borrar sobre el modelo.
          } @else {
            Un dedo: rotar · Visualización de las áreas marcadas del adulto mayor.
          }
        } @else if (auth.canEdit() && markEditable()) {
          @if (activeTool() === 'erase') {
            Clic izquierdo + arrastrar: borrar marcas · Clic derecho: rotar · Pulse «Actualizar» para
            guardar los cambios.
          } @else {
            Clic izquierdo + arrastrar: marcar · Clic derecho: rotar · Use el borrador para quitar marcas
            puntuales y «Actualizar» para guardar.
          }
        } @else if (auth.canEdit()) {
          Clic izquierdo o derecho: rotar · Pulse «Editar» para marcar o borrar sobre el modelo.
        } @else {
          Clic izquierdo o derecho: rotar · Visualización de las áreas marcadas del adulto mayor.
        }
      </p>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        width: 100%;
      }

      .body-scratch-panel {
        padding: 0.55rem 1.15rem 0.85rem;
        border: 1px solid var(--lun-border, rgba(214, 191, 152, 0.38));
        border-radius: 0.85rem;
        background: #fff;
        box-shadow: 0 2px 12px rgba(61, 43, 31, 0.05);
      }

      .body-scratch-title {
        margin: 0 0 0.5rem;
        font-family: var(--lun-serif, 'Palatino Linotype', Georgia, serif);
        font-size: 0.95rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        color: var(--lun-brown, #3d2b1f);
        text-align: left;
      }

      .body-scratch-toolbar {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 1rem 1.25rem;
        flex-wrap: wrap;
        margin-bottom: 0.85rem;
      }

      .body-scratch-copy {
        flex: 1 1 16rem;
        min-width: 0;
      }

      .body-scratch-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
        align-items: center;
        flex-shrink: 0;
      }

      .body-scratch-tools {
        display: inline-flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }

      .body-scratch-tool--active {
        background: var(--lun-btn-secondary-gradient);
        border-color: rgba(200, 146, 45, 0.65);
        box-shadow: inset 0 0 0 1px rgba(200, 146, 45, 0.35);
      }

      .body-scratch-viewport--erase {
        cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='26' height='26' viewBox='0 0 26 26'%3E%3Ccircle cx='13' cy='13' r='10' fill='none' stroke='%23ffffff' stroke-width='2'/%3E%3Ccircle cx='13' cy='13' r='10' fill='none' stroke='%233d2b1f' stroke-width='1'/%3E%3C/svg%3E")
            13 13,
          crosshair;
      }

      .body-scratch-lead {
        margin: 0;
        max-width: 36rem;
        font-family: var(--lun-sans, 'Inter', 'Segoe UI', system-ui, sans-serif);
        font-size: 0.875rem;
        font-weight: 400;
        line-height: 1.6;
        color: #757575;
      }

      .body-scratch-lead strong {
        font-weight: 700;
        color: #4a4a4a;
      }

      .body-scratch-status {
        display: inline-block;
        margin-top: 0.55rem;
        font-size: 0.8rem;
        line-height: 1.45;
        color: #757575;
      }

      .body-scratch-status--err {
        color: #a33;
      }

      .body-scratch-viewport {
        position: relative;
        width: 100%;
        height: min(58vh, 520px);
        min-height: 340px;
        border-radius: 0.65rem;
        overflow: hidden;
        border: 1px solid rgba(200, 146, 45, 0.2);
        background: #2a2638;
      }

      :host-context(.body-graphic-layout--modal) .body-scratch-viewport {
        height: min(52vh, 480px);
        min-height: 300px;
      }

      .body-scratch-viewport canvas {
        position: absolute;
        inset: 0;
        display: block;
        width: 100% !important;
        height: 100% !important;
      }

      .body-scratch-hint {
        margin: 0.6rem 0 0;
        padding-top: 0.6rem;
        border-top: 1px solid rgba(214, 191, 152, 0.2);
        font-family: var(--lun-sans, 'Inter', 'Segoe UI', system-ui, sans-serif);
        font-size: 0.8rem;
        line-height: 1.55;
        color: #757575;
      }
    `,
  ],
  providers: [ScratchSceneService],
})
export class ClinicalBodyScratchComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLElement>;

  @Input() set intakeKey(value: string) {
    const next = value ?? '';
    if (next === this.currentKey) {
      return;
    }
    this.currentKey = next;
    this.loadedPaintKey = '';
    if (this.sceneReady && this.scene.hasModel()) {
      this.reloadFromSaved();
      requestAnimationFrame(() => this.scene.resizeToHost());
    }
  }

  /** En explorar apartados solo permite marcar al pulsar «Editar». */
  readonly markEditable = input(true);

  private scene = inject(ScratchSceneService);
  private formApi = inject(ClinicalFormService);
  private store = inject(IntakeStoreService);
  private cdr = inject(ChangeDetectorRef);
  readonly auth = inject(AuthService);

  activeTool = signal<ScratchTool>('paint');
  loadState = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  touchLayout = signal(false);
  private resizeObs: ResizeObserver | null = null;
  private touchLayoutMq: MediaQueryList | null = null;
  private readonly onTouchLayoutChange = (): void => {
    this.touchLayout.set(this.touchLayoutMq?.matches ?? false);
    if (this.booted) {
      this.syncInteractionMode();
    }
  };
  private sceneReady = false;
  private booted = false;
  private currentKey = '';
  private alive = true;
  private modelRequested = false;
  private bootAttempts = 0;
  private bootRetryTimer: ReturnType<typeof setTimeout> | null = null;
  private modelWatchdogTimer: ReturnType<typeof setTimeout> | null = null;
  private visibilityObs: IntersectionObserver | null = null;
  private loadedPaintKey = '';
  private viewportVisible = false;

  modelLoaded(): boolean {
    return this.scene.hasModel();
  }

  personLabel(): string {
    return this.store.currentRecord()?.nombre?.trim() ?? '';
  }

  constructor() {
    effect(() => {
      this.markEditable();
      this.activeTool();
      if (this.booted) {
        this.syncInteractionMode();
      }
    });
  }

  ngAfterViewInit(): void {
    if (typeof window !== 'undefined') {
      this.touchLayoutMq = window.matchMedia('(max-width: 768px), (pointer: coarse)');
      this.touchLayout.set(this.touchLayoutMq.matches);
      this.touchLayoutMq.addEventListener('change', this.onTouchLayoutChange);
      if (this.touchLayout() && this.markEditable() && this.auth.canEdit()) {
        this.activeTool.set('rotate');
      }
    }
    this.watchViewportVisibility(this.hostRef.nativeElement);
  }

  /** Solo inicia WebGL cuando el visor entra en pantalla (evita OOM en fichas largas). */
  private watchViewportVisibility(host: HTMLElement): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.deferBootUntilSized(host);
      return;
    }
    this.visibilityObs = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        this.viewportVisible = visible;
        this.scene.setViewportActive(visible);
        if (!visible || !this.alive) {
          return;
        }
        if (!this.booted) {
          this.deferBootUntilSized(host);
          return;
        }
        if (this.scene.isReady()) {
          requestAnimationFrame(() => this.scene.refreshViewport());
        }
      },
      { root: null, rootMargin: '64px 0px', threshold: 0.05 },
    );
    this.visibilityObs.observe(host);
  }

  private deferBootUntilSized(host: HTMLElement, attempt = 0): void {
    if (!this.alive || this.booted || !this.viewportVisible) {
      return;
    }
    const ready = host.clientWidth >= 80 && host.clientHeight >= 80;
    if (ready || attempt >= 24) {
      this.bootScene(host);
      return;
    }
    requestAnimationFrame(() => this.deferBootUntilSized(host, attempt + 1));
  }

  /** Persiste las marcas del lienzo en el formulario (llamar al pulsar Actualizar/Guardar). */
  async commitDraftToForm(): Promise<void> {
    if (!this.auth.canEdit() || !this.scene.isReady()) {
      return;
    }
    this.formApi.form.patchValue({
      bodyPaintImage: this.scene.getPaintDataUrl(),
    });
    const snapshots = await this.capturePrintSnapshotsAsync();
    if (snapshots.front && snapshots.back) {
      this.formApi.form.patchValue({
        bodyPrintFrontImage: snapshots.front,
        bodyPrintBackImage: snapshots.back,
      });
    }
  }

  /** Espera a que el modelo 3D y las marcas estén listos para capturar. */
  whenSceneReady(timeoutMs = 35000): Promise<boolean> {
    const started = Date.now();
    return new Promise((resolve) => {
      const tick = (): void => {
        if (this.loadState() === 'ready' && this.scene.isReady() && this.scene.hasModel()) {
          resolve(true);
          return;
        }
        if (this.loadState() === 'error' || Date.now() - started > timeoutMs) {
          resolve(false);
          return;
        }
        requestAnimationFrame(tick);
      };
      tick();
    });
  }

  /** Genera vistas frontal/posterior para impresión si el modelo ya está cargado. */
  async capturePrintSnapshotsAsync(): Promise<{ front: string; back: string }> {
    if (!this.scene.isReady() || !this.scene.hasModel()) {
      return { front: '', back: '' };
    }
    await this.scene.whenPaintReady();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    return this.scene.capturePrintSnapshots();
  }

  capturePrintSnapshots(): { front: string; back: string } {
    if (!this.scene.isReady() || !this.scene.hasModel()) {
      return { front: '', back: '' };
    }
    return this.scene.capturePrintSnapshots();
  }

  /** Restaura el lienzo desde los datos guardados en la ficha. */
  reloadFromSaved(): void {
    if (!this.scene.isReady() || this.scene.isFallbackModel()) {
      return;
    }
    const saved = (this.formApi.form.get('bodyPaintImage')?.value as string) || '';
    if (saved === this.loadedPaintKey) {
      return;
    }
    this.loadedPaintKey = saved;
    this.scene.loadPaintDataUrl(saved);
    if (this.touchLayout() && this.markEditable() && this.auth.canEdit()) {
      if (this.activeTool() !== 'erase') {
        this.activeTool.set('rotate');
      }
    } else {
      this.activeTool.set('paint');
    }
    this.syncInteractionMode();
  }

  persistPaint(): void {
    this.commitDraftToForm();
  }

  /** Tras montar en modal o cambiar tamaño del contenedor. */
  refreshLayout(): void {
    if (!this.alive) {
      return;
    }
    const host = this.hostRef?.nativeElement;
    if (!host) {
      return;
    }
    if (!this.booted) {
      this.viewportVisible = true;
      this.scene.setViewportActive(true);
      this.deferBootUntilSized(host);
      return;
    }
    if (!this.scene.isReady()) {
      return;
    }
    requestAnimationFrame(() => this.scene.refreshViewport());
  }

  setTool(tool: ScratchTool): void {
    if (!this.auth.canEdit() || !this.markEditable()) {
      return;
    }
    if (tool === 'rotate' && !this.touchLayout()) {
      return;
    }
    this.activeTool.set(tool);
    this.syncInteractionMode();
  }

  private loadHumanModel(): void {
    if (!this.alive) {
      return;
    }
    if (this.scene.hasModel() && !this.scene.isFallbackModel()) {
      this.markModelReady();
      return;
    }
    if (this.modelRequested && this.scene.isModelLoadPending()) {
      return;
    }
    if (this.modelRequested && this.scene.hasModel()) {
      return;
    }
    if (!this.scene.beginModelLoad()) {
      return;
    }
    this.modelRequested = true;
    this.tryLoadModelFromPaths(
      ['/assets/models/human.obj', 'assets/models/human.obj', '/api/model/human.obj'],
      0,
    );
  }

  private tryLoadModelFromPaths(paths: string[], index: number): void {
    if (index >= paths.length) {
      this.scene.loadFallbackBody();
      return;
    }
    fetch(paths[index])
      .then((res) => (res.ok ? res.text() : Promise.reject(new Error(String(res.status)))))
      .then((text) => {
        if (!this.alive) {
          return;
        }
        if (/(^|\n)v /m.test(text) && text.length > 500) {
          this.scene.loadObjFromText(text);
        } else {
          this.tryLoadModelFromPaths(paths, index + 1);
        }
      })
      .catch(() => {
        if (this.alive) {
          this.tryLoadModelFromPaths(paths, index + 1);
        }
      });
  }

  private bootScene(host: HTMLElement): void {
    if (!this.alive || this.booted) {
      return;
    }
    this.loadState.set('loading');
    if (!this.scene.init({ canvasHost: host })) {
      console.error('No se pudo inicializar el visor 3D');
      this.scheduleBootRetry(host);
      return;
    }
    this.scene.onModelReady = () => this.markModelReady();
    this.booted = true;
    this.syncInteractionMode();
    this.sceneReady = true;
    this.watchResize(host);
    this.loadHumanModel();
    this.scheduleModelWatchdog();
  }

  private markModelReady(): void {
    if (!this.alive) {
      return;
    }
    this.reloadFromSaved();
    this.scene.refreshViewport();
    this.loadState.set('ready');
    this.cdr.markForCheck();
  }

  private scheduleBootRetry(host: HTMLElement): void {
    const maxAttempts = this.touchLayout() ? 1 : 2;
    if (!this.alive || this.booted || this.bootAttempts >= maxAttempts) {
      if (!this.booted) {
        this.loadState.set('error');
      }
      return;
    }
    this.bootAttempts++;
    this.bootRetryTimer = setTimeout(() => {
      if (this.alive && !this.booted) {
        this.deferBootUntilSized(host);
      }
    }, 300);
  }

  private scheduleModelWatchdog(): void {
    if (this.modelWatchdogTimer) {
      clearTimeout(this.modelWatchdogTimer);
    }
    this.modelWatchdogTimer = setTimeout(() => {
      if (!this.alive || !this.booted) {
        return;
      }
      if (!this.scene.hasModel() && !this.scene.isModelLoadPending()) {
        this.scene.loadFallbackBody();
      }
      if (
        this.scene.hasModel() &&
        !this.scene.isFallbackModel() &&
        this.loadState() !== 'ready'
      ) {
        this.markModelReady();
      }
    }, 4000);
  }

  ngOnDestroy(): void {
    this.alive = false;
    if (this.bootRetryTimer) {
      clearTimeout(this.bootRetryTimer);
    }
    if (this.modelWatchdogTimer) {
      clearTimeout(this.modelWatchdogTimer);
    }
    this.touchLayoutMq?.removeEventListener('change', this.onTouchLayoutChange);
    this.visibilityObs?.disconnect();
    this.resizeObs?.disconnect();
    const host = this.hostRef?.nativeElement;
    if (host) {
      host.replaceChildren();
    }
    this.scene.ngOnDestroy();
    this.sceneReady = false;
    this.booted = false;
  }

  private watchResize(host: HTMLElement): void {
    this.resizeObs = new ResizeObserver(() => {
      if (this.scene.isReady()) {
        this.scene.resizeToHost();
      }
    });
    this.resizeObs.observe(host);
  }

  private syncInteractionMode(): void {
    const canMark = this.auth.canEdit() && this.markEditable();
    const rotateMode = canMark && this.touchLayout() && this.activeTool() === 'rotate';
    this.scene.setPaintEnabled(canMark && !rotateMode);
    if (!canMark) {
      if (this.activeTool() !== 'paint') {
        this.activeTool.set('paint');
      }
      return;
    }
    if (rotateMode) {
      return;
    }
    const tool = this.activeTool();
    if (tool === 'paint' || tool === 'erase') {
      this.scene.setTool(tool);
    }
  }
}
