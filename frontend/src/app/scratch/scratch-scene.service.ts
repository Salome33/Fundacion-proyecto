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

export type ScratchTool = 'paint' | 'erase';

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

  init(options: ScratchSceneOptions): void {
    if (this.renderer) {
      this.ngOnDestroy();
    }
    this.host = options.canvasHost;
    this.host.replaceChildren();
    const width = Math.max(this.host.clientWidth, 320);
    const height = Math.max(this.host.clientHeight, 240);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x3d4455);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, TARGET_Y + 0.2, 3.8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
    this.controls.enableDamping = true;
    this.controls.mouseButtons = {
      LEFT: null,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.ROTATE,
    };
    this.controls.addEventListener('change', this.onControlsChange);

    this.paintCanvas = document.createElement('canvas');
    this.paintCanvas.width = TEXTURE_SIZE;
    this.paintCanvas.height = TEXTURE_SIZE;
    const ctx = this.paintCanvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
      willReadFrequently: false,
    });
    if (!ctx) {
      throw new Error('Canvas 2D no disponible');
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

    this.bindEvents();
    this.resizeToHost();
    this.animId = requestAnimationFrame(() => this.loop());
  }

  /** Carga malla desde texto OBJ (fiable en Angular /assets). */
  loadObjFromText(text: string): void {
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

  private attachObj(obj: THREE.Object3D): void {
    if (this.root) {
      this.scene.remove(this.root);
      this.raycastTargets = [];
    }
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
      this.loadFallbackBody();
      return;
    }
    this.root = obj;
    this.scene.add(obj);
    this.fitModelToView();
    this.resizeToHost();
    requestAnimationFrame(() => {
      this.fitModelToView();
      this.resizeToHost();
      this.onModelReady?.();
    });
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
    cancelAnimationFrame(this.animId);
    this.controls?.removeEventListener('change', this.onControlsChange);
    this.unbindEvents();
    if (this.renderer?.domElement?.parentElement) {
      this.renderer.domElement.remove();
    }
    this.renderer?.dispose();
    this.paintTexture?.dispose();
    this.root = null;
    this.raycastTargets = [];
    this.onModelReady = null;
    this.onModelError = null;
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

  /** Restaura marcas guardadas; cadena vacía deja el modelo limpio. */
  loadPaintDataUrl(dataUrl: string | null | undefined): void {
    if (!this.paintCtx || !this.paintTexture) {
      return;
    }
    if (!dataUrl) {
      this.resetPaint();
      return;
    }
    const img = new Image();
    img.onload = () => {
      this.clearPaint();
      this.paintCtx.drawImage(img, 0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
      this.paintTexture.needsUpdate = true;
      this.lastUv = null;
      this.lastWorldPoint = null;
    };
    img.onerror = () => this.resetPaint();
    img.src = dataUrl;
  }

  isReady(): boolean {
    return !!this.paintTexture && !!this.renderer;
  }

  setPaintEnabled(enabled: boolean): void {
    this.paintEnabled = enabled;
    if (!enabled) {
      this.tool = 'paint';
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
    this.paintCtx.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  }

  private loop(): void {
    this.controls.update();
    if (this.renderRequested || this.scratching) {
      this.renderer.render(this.scene, this.camera);
      if (!this.scratching) {
        this.renderRequested = false;
      }
    }
    this.animId = requestAnimationFrame(() => this.loop());
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
    this.controls.target.copy(center);
    this.camera.position.set(center.x, center.y + maxDim * 0.08, center.z + dist);
    this.camera.near = Math.max(dist / 100, 0.01);
    this.camera.far = dist * 20;
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  private bindEvents(): void {
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.addEventListener('pointerup', this.onPointerUp);
    this.renderer.domElement.addEventListener('pointerleave', this.onPointerUp);
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('keydown', this.onKeyDown);
  }

  private unbindEvents(): void {
    window.removeEventListener('resize', this.onResize);
    this.renderer?.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer?.domElement.removeEventListener('pointerup', this.onPointerUp);
    this.renderer?.domElement.removeEventListener('pointerleave', this.onPointerUp);
    this.renderer?.domElement.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('keydown', this.onKeyDown);
  }

  private readonly onResize = (): void => {
    this.resizeToHost();
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

  private readonly onPointerDown = (e: PointerEvent): void => {
    if (e.button !== 0) {
      return;
    }
    if (!this.paintEnabled) {
      return;
    }
    e.preventDefault();
    this.renderer.domElement.setPointerCapture(e.pointerId);
    this.controls.enabled = false;
    this.scratching = true;
    this.lastUv = null;
    this.lastWorldPoint = null;
    this.scratchAtEvent(e);
  };

  private readonly onPointerUp = (e: PointerEvent): void => {
    if (
      this.scratching &&
      e.pointerId !== undefined &&
      this.renderer.domElement.hasPointerCapture(e.pointerId)
    ) {
      this.renderer.domElement.releasePointerCapture(e.pointerId);
    }
    this.controls.enabled = true;
    this.scratching = false;
    this.lastUv = null;
    this.lastWorldPoint = null;
    this.pushScratchVisual();
    this.renderRequested = true;
  };

  private readonly onPointerMove = (e: PointerEvent): void => {
    if (!this.scratching) {
      return;
    }
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
    const x = u * TEXTURE_SIZE;
    const y = (1 - v) * TEXTURE_SIZE;
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
      const x0 = u0 * TEXTURE_SIZE;
      const y0 = (1 - v0) * TEXTURE_SIZE;
      const x1 = u1 * TEXTURE_SIZE;
      const y1 = (1 - v1) * TEXTURE_SIZE;
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
      const x = (u0 + du * t) * TEXTURE_SIZE;
      const y = (1 - (v0 + dv * t)) * TEXTURE_SIZE;
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
