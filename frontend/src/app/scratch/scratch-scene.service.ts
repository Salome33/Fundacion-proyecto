import { Injectable, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const TEXTURE_SIZE = 1024;
const TARGET_Y = 0.91;
const SCRATCH_RGB = '#050507';
/** Máxima distancia UV entre puntos consecutivos antes de romper el trazo (evita líneas entre islas UV). */
const MAX_UV_SEGMENT = 0.028;
/** Máxima distancia 3D en la malla antes de romper el trazo. */
const MAX_WORLD_SEGMENT = 0.07;

export type ScratchTool = 'paint' | 'erase' | 'rotate';

const PAINT_DRAG_THRESHOLD_PX = 5;

export interface ScratchSceneOptions {
  canvasHost: HTMLElement;
}

@Injectable()
export class ScratchSceneService implements OnDestroy {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private root: THREE.Object3D | null = null;
  private raycastTargets: THREE.Object3D[] = [];
  private paintCanvas!: HTMLCanvasElement;
  private paintCtx!: CanvasRenderingContext2D;
  private paintTexture!: THREE.CanvasTexture;
  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2();
  private tmpNormal = new THREE.Vector3();
  private animId = 0;
  private host!: HTMLElement;
  private triedFallback = false;
  private paintEnabled = true;
  private tool: ScratchTool = 'paint';
  onModelReady: (() => void) | null = null;
  onModelError: (() => void) | null = null;

  private scratching = false;
  private lastUv: THREE.Vector2 | null = null;
  private lastWorldPoint: THREE.Vector3 | null = null;
  private renderRequested = true;
  private strokePaint = true;
  private paintLoadPromise: Promise<void> = Promise.resolve();
  private touchPointers = new Set<number>();
  private pendingScratch = false;
  private scratchPointerId: number | null = null;
  private pointerDownX = 0;
  private pointerDownY = 0;
  private paintEventsBound = false;
  private destroyed = false;
  private modelLoading = false;
  private fallbackModel = false;
  private webglLive = false;
  private textureSize = TEXTURE_SIZE;
  private viewportActive = true;
  private tabVisible = true;

  /** Inicializa WebGL y el lienzo de marcas. Devuelve false si no hay GPU/canvas usable. */
  init(options: ScratchSceneOptions): boolean {
    this.destroyed = false;
    if (this.webglLive) {
      this.disposeScene();
    }
    this.host = options.canvasHost;
    this.host.replaceChildren();
    const width = Math.max(this.host.clientWidth, 320);
    const height = Math.max(this.host.clientHeight, 240);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x3d4455);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, TARGET_Y + 0.2, 3.8);

    const touchLayout = this.isTouchLayout();
    if (!this.createRenderer(touchLayout)) {
      this.releaseGpuResources();
      return false;
    }
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, touchLayout ? 1 : 1.5));
    this.renderer.setSize(width, height, false);
    const canvas = this.renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.touchAction = 'none';
    this.host.appendChild(canvas);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, TARGET_Y, 0);
    this.controls.enableDamping = !touchLayout;
    this.syncOrbitMouseButtons();
    this.controls.addEventListener('change', this.onControlsChange);

    this.textureSize = touchLayout ? 512 : TEXTURE_SIZE;
    this.paintCanvas = document.createElement('canvas');
    this.paintCanvas.width = this.textureSize;
    this.paintCanvas.height = this.textureSize;
    const ctx =
      this.paintCanvas.getContext('2d', {
        alpha: true,
        desynchronized: true,
        willReadFrequently: false,
      }) ?? this.paintCanvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas 2D no disponible');
      this.releaseGpuResources();
      return false;
    }
    this.paintCtx = ctx;
    this.applyToolStyle();
    this.clearPaint();
    this.paintTexture = new THREE.CanvasTexture(this.paintCanvas);
    this.paintTexture.colorSpace = THREE.SRGBColorSpace;
    this.paintTexture.minFilter = THREE.LinearFilter;
    this.paintTexture.magFilter = THREE.LinearFilter;
    this.paintTexture.generateMipmaps = false;

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(0.35, 0.85, 0.42);
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.35);
    fill.position.set(-0.55, 0.25, -0.65);
    this.scene.add(fill);
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444455, 0.55);
    this.scene.add(hemi);

    this.bindCoreEvents();
    this.syncPaintEventBindings();
    this.resizeToHost();
    this.webglLive = true;
    this.syncAnimationLoop();
    return true;
  }

  /** Pausa o reanuda el bucle WebGL (p. ej. cuando el visor no está en pantalla). */
  setViewportActive(active: boolean): void {
    if (this.viewportActive === active) {
      return;
    }
    this.viewportActive = active;
    this.syncAnimationLoop();
  }

  private createRenderer(touchLayout: boolean): boolean {
    const attempts: THREE.WebGLRendererParameters[] = [
      {
        antialias: !touchLayout,
        alpha: false,
        powerPreference: touchLayout ? 'default' : 'high-performance',
      },
      { antialias: false, alpha: false, powerPreference: 'default' },
      { antialias: false, alpha: false, failIfMajorPerformanceCaveat: false },
    ];
    for (const params of attempts) {
      try {
        this.renderer = new THREE.WebGLRenderer(params);
        return true;
      } catch (e) {
        console.warn('WebGLRenderer init attempt failed', params, e);
      }
    }
    return false;
  }

  /** Carga malla desde texto OBJ (fiable en Angular /assets). */
  loadObjFromText(text: string): void {
    if (this.destroyed || (this.root && !this.fallbackModel)) {
      this.modelLoading = false;
      return;
    }
    try {
      const loader = new OBJLoader();
      const obj = loader.parse(text);
      this.attachObj(obj);
    } catch (e) {
      console.error('Parse OBJ', e);
      this.loadFallbackBody();
    }
  }

  loadObjFromUrl(url: string): void {
    const loader = new OBJLoader();
    loader.load(
      url,
      (obj) => this.attachObj(obj),
      undefined,
      () => this.loadFallbackBody(),
    );
  }

  /** Cuerpo simple si falla el OBJ (evita pantalla vacía). */
  loadFallbackBody(): void {
    if (this.destroyed || this.root || this.modelLoading) {
      return;
    }
    this.modelLoading = false;
    this.fallbackModel = true;
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      map: this.paintTexture,
      color: 0xe8e8ee,
      roughness: 0.8,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.1, 16), mat);
    torso.position.y = 0.55;
    group.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), mat);
    head.position.y = 1.25;
    group.add(head);
    this.attachObj(group);
  }

  beginModelLoad(): boolean {
    if (this.destroyed || this.modelLoading || (this.root && !this.fallbackModel)) {
      return false;
    }
    this.modelLoading = true;
    return true;
  }

  isModelLoadPending(): boolean {
    return this.modelLoading;
  }

  isFallbackModel(): boolean {
    return this.fallbackModel;
  }

  private attachObj(obj: THREE.Object3D): void {
    if (this.destroyed) {
      this.modelLoading = false;
      return;
    }
    this.disposeRoot();
    let meshCount = 0;
    obj.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      meshCount++;
      const geom = child.geometry as THREE.BufferGeometry;
      if (!geom.attributes['uv']) {
        console.warn('Malla sin UV; se omiten marcas UV en esta malla.');
      }
      geom.computeVertexNormals();
      child.material = new THREE.MeshStandardMaterial({
        map: this.paintTexture,
        roughness: 0.75,
        metalness: 0.02,
        color: 0xe8e8ee,
        side: THREE.DoubleSide,
      });
      this.raycastTargets.push(child);
    });
    if (meshCount === 0) {
      console.error('OBJ sin mallas');
      this.modelLoading = false;
      this.loadFallbackBody();
      return;
    }
    this.root = obj;
    this.fallbackModel = false;
    this.scene.add(obj);
    this.modelLoading = false;
    this.fitModelToView();
    this.resizeToHost();
    this.onModelReady?.();
    requestAnimationFrame(() => {
      if (this.destroyed) {
        return;
      }
      this.fitModelToView();
      this.resizeToHost();
      this.renderer?.render(this.scene, this.camera);
    });
  }

  private disposeRoot(): void {
    if (!this.root) {
      this.raycastTargets = [];
      return;
    }
    this.root.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) {
        return;
      }
      child.geometry?.dispose();
      const disposeMat = (mat: THREE.Material): void => {
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.map = null;
        }
        mat.dispose();
      };
      if (Array.isArray(child.material)) {
        child.material.forEach(disposeMat);
      } else if (child.material) {
        disposeMat(child.material);
      }
    });
    this.scene.remove(this.root);
    this.root = null;
    this.fallbackModel = false;
    this.raycastTargets = [];
  }

  resizeToHost(): void {
    if (!this.host || !this.renderer || !this.camera) {
      return;
    }
    const w = Math.max(this.host.clientWidth, 320);
    const h = Math.max(this.host.clientHeight, 240);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    if (this.root) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.releaseGpuResources();
    this.onModelReady = null;
    this.onModelError = null;
  }

  private disposeScene(): void {
    this.releaseGpuResources();
    this.destroyed = false;
    this.modelLoading = false;
  }

  private releaseGpuResources(): void {
    this.modelLoading = false;
    cancelAnimationFrame(this.animId);
    this.animId = 0;
    this.controls?.removeEventListener('change', this.onControlsChange);
    this.controls?.disconnect();
    this.unbindPaintEvents();
    this.unbindCoreEvents();
    this.disposeRoot();
    if (this.renderer?.domElement?.parentElement) {
      this.renderer.domElement.remove();
    }
    this.renderer?.dispose();
    this.paintTexture?.dispose();
    this.webglLive = false;
  }

  resetPaint(): void {
    if (!this.paintTexture) {
      return;
    }
    this.clearPaint();
    this.paintTexture.needsUpdate = true;
    this.lastUv = null;
    this.lastWorldPoint = null;
  }

  /** Exporta la textura de marcas (para guardar por ficha / adulto mayor). */
  getPaintDataUrl(): string {
    if (!this.paintCanvas) {
      return '';
    }
    return this.paintCanvas.toDataURL('image/jpeg', 0.85);
  }

  /** Capturas frontal y posterior con el modelo y las marcas (para impresión). */
  capturePrintSnapshots(): { front: string; back: string } {
    if (!this.root || !this.renderer || !this.camera) {
      return { front: '', back: '' };
    }
    const savedBg = this.scene.background;
    const savedPos = this.camera.position.clone();
    const savedTarget = this.controls.target.clone();
    const hostW = Math.max(this.host?.clientWidth ?? 480, 320);
    const hostH = Math.max(this.host?.clientHeight ?? 480, 320);

    this.scene.background = new THREE.Color(0xf5f0e8);
    // El maniquí CC0 está orientado a lo largo del eje X: frontal/posterior desde ±X.
    const front = this.captureViewSnapshot(Math.PI / 2);
    const back = this.captureViewSnapshot(-Math.PI / 2);

    this.scene.background = savedBg;
    this.camera.position.copy(savedPos);
    this.controls.target.copy(savedTarget);
    this.controls.update();
    this.renderer.setSize(hostW, hostH, false);
    this.camera.aspect = hostW / hostH;
    this.camera.updateProjectionMatrix();
    this.renderRequested = true;

    return { front, back };
  }

  whenPaintReady(): Promise<void> {
    return this.paintLoadPromise;
  }

  private captureViewSnapshot(yaw: number): string {
    if (!this.root || !this.renderer || !this.camera) {
      return '';
    }
    const box = new THREE.Box3().setFromObject(this.root);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.01);
    const snap = this.isTouchLayout() ? 480 : 640;

    this.renderer.setSize(snap, snap, false);
    this.camera.aspect = 1;
    const fovRad = (this.camera.fov * Math.PI) / 180;
    const dist = (maxDim / (2 * Math.tan(fovRad / 2))) * 1.08;

    this.camera.position.set(
      center.x + Math.sin(yaw) * dist,
      center.y + maxDim * 0.02,
      center.z + Math.cos(yaw) * dist,
    );
    this.camera.lookAt(center);
    this.camera.updateProjectionMatrix();

    if (this.paintTexture) {
      this.paintTexture.needsUpdate = true;
    }
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  /** Restaura marcas guardadas; cadena vacía deja el modelo limpio. */
  loadPaintDataUrl(dataUrl: string | null | undefined): void {
    if (!this.paintCtx || !this.paintTexture) {
      return;
    }
    if (!dataUrl) {
      this.resetPaint();
      this.paintLoadPromise = Promise.resolve();
      return;
    }
    this.paintLoadPromise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.clearPaint();
        this.paintCtx.drawImage(img, 0, 0, this.textureSize, this.textureSize);
        this.paintTexture.needsUpdate = true;
        this.lastUv = null;
        this.lastWorldPoint = null;
        this.renderer?.render(this.scene, this.camera);
        resolve();
      };
      img.onerror = () => {
        this.resetPaint();
        resolve();
      };
      img.src = dataUrl;
    });
  }

  isReady(): boolean {
    return this.webglLive && !!this.paintTexture && !!this.renderer;
  }

  setPaintEnabled(enabled: boolean): void {
    this.paintEnabled = enabled;
    if (!enabled) {
      this.tool = 'paint';
      this.stopScratching();
      this.cancelPendingScratch();
      this.touchPointers.clear();
    }
    this.syncPaintEventBindings();
    this.syncOrbitMouseButtons();
    if (this.controls) {
      this.controls.enabled = true;
      this.controls.enableRotate = true;
      this.controls.update();
      this.renderRequested = true;
    }
  }

  /** Recalcula cámara y tamaño del lienzo (p. ej. al abrir un modal). */
  refreshViewport(): void {
    this.resizeToHost();
    if (this.root) {
      this.fitModelToView();
      this.renderer.render(this.scene, this.camera);
    }
  }

  setTool(tool: ScratchTool): void {
    if (!this.paintEnabled) {
      return;
    }
    this.tool = tool;
    this.applyToolStyle();
  }

  getTool(): ScratchTool {
    return this.tool;
  }

  hasModel(): boolean {
    return !!this.root;
  }

  private clearPaint(): void {
    this.paintCtx.fillStyle = '#ffffff';
    this.paintCtx.fillRect(0, 0, this.textureSize, this.textureSize);
  }

  private loop(): void {
    if (this.destroyed || !this.webglLive || !this.renderer) {
      this.animId = 0;
      return;
    }
    if (!this.viewportActive || !this.tabVisible) {
      this.animId = 0;
      return;
    }
    this.controls.update();
    if (this.renderRequested || this.scratching) {
      this.renderer.render(this.scene, this.camera);
      if (!this.scratching) {
        this.renderRequested = false;
      }
    }
    this.animId = requestAnimationFrame(() => this.loop());
  }

  private syncAnimationLoop(): void {
    if (this.destroyed || !this.webglLive || !this.renderer) {
      cancelAnimationFrame(this.animId);
      this.animId = 0;
      return;
    }
    const shouldRun = this.viewportActive && this.tabVisible;
    if (shouldRun) {
      if (!this.animId) {
        this.animId = requestAnimationFrame(() => this.loop());
      }
    } else {
      cancelAnimationFrame(this.animId);
      this.animId = 0;
    }
  }

  private readonly onControlsChange = (): void => {
    this.renderRequested = true;
  };

  private fitModelToView(): void {
    if (!this.root) {
      return;
    }
    const box = new THREE.Box3().setFromObject(this.root);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.01);
    const fovRad = (this.camera.fov * Math.PI) / 180;
    const dist = (maxDim / (2 * Math.tan(fovRad / 2))) * 1.35;
    // El maniquí OBJ está orientado a lo largo del eje X: vista frontal desde +X.
    const yaw = Math.PI / 2;
    this.controls.target.copy(center);
    this.camera.position.set(
      center.x + Math.sin(yaw) * dist,
      center.y + maxDim * 0.08,
      center.z + Math.cos(yaw) * dist,
    );
    this.camera.near = Math.max(dist / 100, 0.01);
    this.camera.far = dist * 20;
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  /** Escritorio: clic izq. marca al editar; móvil: un dedo marca, dos dedos rotan. */
  private syncOrbitMouseButtons(): void {
    if (!this.controls) {
      return;
    }
    this.controls.enabled = true;
    const touchLayout = this.isTouchLayout();
    this.controls.mouseButtons = {
      LEFT: this.paintEnabled ? null : THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    if (touchLayout && this.paintEnabled) {
      this.controls.touches = {
        ONE: null,
        TWO: THREE.TOUCH.ROTATE,
      };
    } else {
      this.controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN,
      };
    }
  }

  private isTouchLayout(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
  }

  private bindCoreEvents(): void {
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  private syncPaintEventBindings(): void {
    if (!this.renderer) {
      return;
    }
    if (this.paintEnabled) {
      this.bindPaintEvents();
    } else {
      this.unbindPaintEvents();
    }
  }

  private bindPaintEvents(): void {
    if (this.paintEventsBound) {
      return;
    }
    const el = this.renderer.domElement;
    const capture = { capture: true };
    el.addEventListener('pointerdown', this.onPaintPointerDown, capture);
    el.addEventListener('pointermove', this.onPaintPointerMove, capture);
    el.addEventListener('pointerup', this.onPaintPointerUp, capture);
    el.addEventListener('pointercancel', this.onPaintPointerUp, capture);
    el.addEventListener('pointerleave', this.onPaintPointerUp, capture);
    this.paintEventsBound = true;
  }

  private unbindPaintEvents(): void {
    if (!this.paintEventsBound || !this.renderer) {
      return;
    }
    const el = this.renderer.domElement;
    const capture = { capture: true };
    el.removeEventListener('pointerdown', this.onPaintPointerDown, capture);
    el.removeEventListener('pointermove', this.onPaintPointerMove, capture);
    el.removeEventListener('pointerup', this.onPaintPointerUp, capture);
    el.removeEventListener('pointercancel', this.onPaintPointerUp, capture);
    el.removeEventListener('pointerleave', this.onPaintPointerUp, capture);
    this.paintEventsBound = false;
  }

  private unbindCoreEvents(): void {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  private readonly onVisibilityChange = (): void => {
    this.tabVisible = document.visibilityState !== 'hidden';
    this.syncAnimationLoop();
  };

  private readonly onResize = (): void => {
    this.resizeToHost();
    this.syncOrbitMouseButtons();
  };

  private readonly onKeyDown = (e: KeyboardEvent): void => {
    if (!this.paintEnabled) {
      return;
    }
    if (e.key === 'b' || e.key === 'B') {
      this.tool = this.tool === 'erase' ? 'paint' : 'erase';
      this.applyToolStyle();
    }
  };

  private readonly onPaintPointerDown = (e: PointerEvent): void => {
    if (!this.paintEnabled) {
      return;
    }
    if (e.pointerType === 'touch') {
      this.touchPointers.add(e.pointerId);
      if (this.touchPointers.size > 1) {
        this.cancelPendingScratch();
        this.stopScratching();
        return;
      }
      this.pendingScratch = true;
      this.scratchPointerId = e.pointerId;
      this.pointerDownX = e.clientX;
      this.pointerDownY = e.clientY;
      return;
    }
    if (e.button !== 0) {
      return;
    }
    e.stopImmediatePropagation();
    this.beginScratch(e);
  };

  private readonly onPaintPointerUp = (e: PointerEvent): void => {
    this.touchPointers.delete(e.pointerId);
    if (this.pendingScratch && e.pointerId === this.scratchPointerId) {
      this.cancelPendingScratch();
    }
    if (this.scratching && e.pointerId === this.scratchPointerId) {
      this.stopScratching();
    }
    this.renderRequested = true;
  };

  private beginScratch(e: PointerEvent): void {
    e.preventDefault();
    this.pendingScratch = false;
    this.scratchPointerId = e.pointerId;
    try {
      this.renderer.domElement.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    this.scratching = true;
    this.lastUv = null;
    this.lastWorldPoint = null;
    this.scratchAtEvent(e);
  }

  private cancelPendingScratch(): void {
    this.pendingScratch = false;
    if (!this.scratching) {
      this.scratchPointerId = null;
    }
  }

  private stopScratching(): void {
    if (
      this.scratchPointerId !== null &&
      this.renderer.domElement.hasPointerCapture(this.scratchPointerId)
    ) {
      this.renderer.domElement.releasePointerCapture(this.scratchPointerId);
    }
    this.pendingScratch = false;
    if (this.scratching) {
      this.scratching = false;
      this.lastUv = null;
      this.lastWorldPoint = null;
      this.pushScratchVisual();
    }
    this.scratchPointerId = null;
  }

  private readonly onPaintPointerMove = (e: PointerEvent): void => {
    if (!this.paintEnabled) {
      return;
    }
    if (this.pendingScratch && e.pointerId === this.scratchPointerId) {
      if (this.touchPointers.size > 1) {
        this.cancelPendingScratch();
        return;
      }
      const moved = Math.hypot(e.clientX - this.pointerDownX, e.clientY - this.pointerDownY);
      if (moved >= PAINT_DRAG_THRESHOLD_PX) {
        e.stopImmediatePropagation();
        this.beginScratch(e);
      }
      return;
    }
    if (!this.scratching) {
      return;
    }
    e.stopImmediatePropagation();
    e.preventDefault();
    this.scratchAtEvent(e);
  };

  private scratchAtEvent(e: PointerEvent): void {
    if (!this.root || this.raycastTargets.length === 0) {
      return;
    }
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }
    this.pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNdc.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const hits = this.raycaster.intersectObjects(this.raycastTargets, false);
    const hit = this.pickFrontHit(hits);
    if (!hit?.uv) {
      // Sin impacto: romper el trazo para no unir zonas distantes al volver a tocar.
      this.lastUv = null;
      this.lastWorldPoint = null;
      return;
    }

    const uv = hit.uv;
    const worldPoint = hit.point;

    if (this.lastUv && this.lastWorldPoint) {
      const uvDist = Math.hypot(uv.x - this.lastUv.x, uv.y - this.lastUv.y);
      const worldDist = worldPoint.distanceTo(this.lastWorldPoint);
      if (uvDist > MAX_UV_SEGMENT || worldDist > MAX_WORLD_SEGMENT) {
        // Salto de costura UV o cambio brusco de superficie: nuevo tramo sin línea fantasma.
        this.drawScratchDot(uv.x, uv.y);
        this.lastUv.set(uv.x, uv.y);
        this.lastWorldPoint.copy(worldPoint);
        this.pushScratchVisual();
        return;
      }
      this.drawScratchLine(this.lastUv.x, this.lastUv.y, uv.x, uv.y);
    } else {
      this.drawScratchDot(uv.x, uv.y);
    }

    if (!this.lastUv) {
      this.lastUv = new THREE.Vector2(uv.x, uv.y);
      this.lastWorldPoint = worldPoint.clone();
    } else {
      this.lastUv.set(uv.x, uv.y);
      this.lastWorldPoint!.copy(worldPoint);
    }
    this.pushScratchVisual();
  }

  /** Ignora impactos en la cara trasera (DoubleSide) que provocan saltos de UV. */
  private pickFrontHit(hits: THREE.Intersection[]): THREE.Intersection | undefined {
    for (const hit of hits) {
      if (!hit.uv || !hit.face) {
        continue;
      }
      this.tmpNormal.copy(hit.face.normal);
      if (hit.object instanceof THREE.Mesh) {
        this.tmpNormal.transformDirection(hit.object.matrixWorld);
      }
      if (this.tmpNormal.dot(this.raycaster.ray.direction) < 0) {
        return hit;
      }
    }
    return undefined;
  }

  /** Sube la textura y repinta al instante (sin esperar al siguiente frame). */
  private pushScratchVisual(): void {
    if (this.paintTexture) {
      this.paintTexture.needsUpdate = true;
    }
    this.renderer.render(this.scene, this.camera);
  }

  private applyToolStyle(): void {
    this.strokePaint = this.tool === 'paint';
    this.paintCtx.globalCompositeOperation = 'source-over';
    this.paintCtx.strokeStyle = this.strokePaint ? SCRATCH_RGB : '#ffffff';
    this.paintCtx.fillStyle = this.strokePaint ? SCRATCH_RGB : '#ffffff';
    this.paintCtx.lineWidth = this.strokePaint ? 7 : 0;
    this.paintCtx.lineJoin = 'round';
    this.paintCtx.lineCap = 'round';
  }

  private drawScratchDot(u: number, v: number): void {
    const x = u * this.textureSize;
    const y = (1 - v) * this.textureSize;
    if (this.strokePaint) {
      const r = 3;
      this.paintCtx.beginPath();
      this.paintCtx.arc(x, y, r, 0, Math.PI * 2);
      this.paintCtx.fill();
      return;
    }
    this.drawEraseCircle(x, y);
  }

  private drawScratchLine(u0: number, v0: number, u1: number, v1: number): void {
    if (this.strokePaint) {
      const x0 = u0 * this.textureSize;
      const y0 = (1 - v0) * this.textureSize;
      const x1 = u1 * this.textureSize;
      const y1 = (1 - v1) * this.textureSize;
      this.paintCtx.beginPath();
      this.paintCtx.moveTo(x0, y0);
      this.paintCtx.lineTo(x1, y1);
      this.paintCtx.stroke();
      return;
    }
    this.drawEraseBetween(u0, v0, u1, v1);
  }

  /** Borrador circular: sellos redondos en lugar de trazo en cruz/cápsula. */
  private drawEraseBetween(u0: number, v0: number, u1: number, v1: number): void {
    const du = u1 - u0;
    const dv = v1 - v0;
    const len = Math.hypot(du, dv);
    const steps = Math.max(1, Math.ceil(len / 0.007));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = (u0 + du * t) * this.textureSize;
      const y = (1 - (v0 + dv * t)) * this.textureSize;
      this.drawEraseCircle(x, y);
    }
  }

  private drawEraseCircle(x: number, y: number): void {
    const r = 10;
    this.paintCtx.beginPath();
    this.paintCtx.arc(x, y, r, 0, Math.PI * 2);
    this.paintCtx.fill();
  }
}
