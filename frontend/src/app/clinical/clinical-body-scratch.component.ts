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
import { HttpClient } from '@angular/common/http';
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
          } @else if (loadState() === 'error') {
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
            </div>
          </div>
        }
      </div>
      <div
        #host
        class="body-scratch-viewport"
        [class.body-scratch-viewport--erase]="activeTool() === 'erase' && markEditable() && auth.canEdit()"
      ></div>
      <p class="body-scratch-hint">
        @if (auth.canEdit() && markEditable()) {
          @if (activeTool() === 'erase') {
            Clic izquierdo + arrastrar: borrar marcas · Clic derecho: rotar · Pulse «Actualizar» para
            guardar los cambios.
          } @else {
            Clic izquierdo + arrastrar: marcar · Clic derecho: rotar · Use el borrador para quitar marcas
            puntuales y «Actualizar» para guardar.
          }
        } @else if (auth.canEdit()) {
          Pulse «Editar» para marcar o borrar sobre el modelo.
        } @else {
          Clic derecho: rotar · Visualización de las áreas marcadas del adulto mayor.
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
    if (this.sceneReady && this.scene.hasModel()) {
      this.reloadFromSaved();
      requestAnimationFrame(() => this.scene.resizeToHost());
    }
  }

  /** En explorar apartados solo permite marcar al pulsar «Editar». */
  readonly markEditable = input(true);

  private scene = inject(ScratchSceneService);
  private http = inject(HttpClient);
  private formApi = inject(ClinicalFormService);
  private store = inject(IntakeStoreService);
  private cdr = inject(ChangeDetectorRef);
  readonly auth = inject(AuthService);

  activeTool = signal<ScratchTool>('paint');
  loadState = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  private resizeObs: ResizeObserver | null = null;
  private sceneReady = false;
  private booted = false;
  private currentKey = '';

  personLabel(): string {
    return this.store.currentRecord()?.nombre?.trim() ?? '';
  }

  constructor() {
    effect(() => {
      this.markEditable();
      if (this.booted) {
        this.syncInteractionMode();
      }
    });
  }

  ngAfterViewInit(): void {
    this.bootScene(this.hostRef.nativeElement);
  }

  /** Persiste las marcas del lienzo en el formulario (llamar al pulsar Actualizar/Guardar). */
  commitDraftToForm(): void {
    if (!this.auth.canEdit() || !this.scene.isReady()) {
      return;
    }
    this.formApi.form.patchValue({ bodyPaintImage: this.scene.getPaintDataUrl() });
  }

  /** Restaura el lienzo desde los datos guardados en la ficha. */
  reloadFromSaved(): void {
    if (!this.scene.isReady()) {
      return;
    }
    const saved = this.formApi.form.get('bodyPaintImage')?.value as string;
    this.scene.loadPaintDataUrl(saved || '');
    this.activeTool.set('paint');
    this.scene.setTool('paint');
  }

  persistPaint(): void {
    this.commitDraftToForm();
  }

  setTool(tool: ScratchTool): void {
    if (!this.auth.canEdit() || !this.markEditable()) {
      return;
    }
    this.activeTool.set(tool);
    this.scene.setTool(tool);
  }

  private loadHumanModel(): void {
    this.http.get('assets/models/human.obj', { responseType: 'text' }).subscribe({
      next: (text) => {
        if (text.includes('v ') && text.length > 100) {
          this.scene.loadObjFromText(text);
        } else {
          this.scene.loadFallbackBody();
        }
      },
      error: () => {
        this.http.get('/api/model/human.obj', { responseType: 'text' }).subscribe({
          next: (text) => this.scene.loadObjFromText(text),
          error: () => this.scene.loadFallbackBody(),
        });
      },
    });
  }

  private bootScene(host: HTMLElement): void {
    if (this.booted) {
      return;
    }
    this.booted = true;
    this.loadState.set('loading');
    try {
      this.scene.onModelReady = () => {
        this.reloadFromSaved();
        this.scene.resizeToHost();
        this.loadState.set('ready');
        this.cdr.markForCheck();
      };
      this.scene.onModelError = () => {
        this.loadState.set('ready');
        this.cdr.markForCheck();
      };
      this.scene.init({ canvasHost: host });
      this.syncInteractionMode();
      this.sceneReady = true;
      this.watchResize(host);
      requestAnimationFrame(() => this.scene.resizeToHost());
      void this.loadHumanModel();
    } catch {
      this.loadState.set('error');
      this.booted = false;
    }
  }

  ngOnDestroy(): void {
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
    this.scene.setPaintEnabled(canMark);
    if (canMark) {
      this.scene.setTool(this.activeTool());
    } else {
      this.activeTool.set('paint');
      this.scene.setTool('paint');
      this.reloadFromSaved();
    }
  }
}
