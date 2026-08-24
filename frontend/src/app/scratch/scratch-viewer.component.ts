import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ScratchSceneService } from './scratch-scene.service';

@Component({
  selector: 'app-scratch-viewer',
  standalone: true,
  template: `
    <div class="wrap">
      <div #host class="viewport"></div>
      <aside class="hint">
        <strong>Human Scratch 3D</strong> (Three.js + Angular)
        <ul>
          <li>Clic izquierdo + arrastrar: rayar</li>
          <li>Clic derecho: orbitar</li>
          <li>R: limpiar textura</li>
        </ul>
        @if (apiStatus) {
          <span class="api">API: {{ apiStatus }}</span>
        }
      </aside>
    </div>
  `,
  styles: [
    `
      .wrap {
        position: relative;
        width: 100vw;
        height: 100vh;
      }
      .viewport {
        width: 100%;
        height: 100%;
      }
      .hint {
        position: absolute;
        top: 12px;
        left: 12px;
        padding: 10px 14px;
        background: rgba(20, 22, 32, 0.88);
        color: #e8eaef;
        border-radius: 8px;
        font-size: 13px;
        max-width: 280px;
        pointer-events: none;
      }
      .hint ul {
        margin: 8px 0 0;
        padding-left: 18px;
      }
      .api {
        display: block;
        margin-top: 8px;
        color: #8bc4a8;
        font-size: 12px;
      }
    `,
  ],
  providers: [ScratchSceneService],
})
export class ScratchViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('host', { static: true }) hostRef!: ElementRef<HTMLElement>;

  private scene = inject(ScratchSceneService);
  private http = inject(HttpClient);

  apiStatus = '';

  ngAfterViewInit(): void {
    const host = this.hostRef.nativeElement;
    this.scene.init({ canvasHost: host });
    this.http.get('assets/models/human.obj', { responseType: 'text' }).subscribe({
      next: (text) => {
        this.apiStatus = 'modelo local';
        this.scene.loadObjFromText(text);
      },
      error: () => {
        this.http.get<{ status: string }>('/api/health').subscribe({
          next: (body) => {
            this.apiStatus = body.status;
            this.scene.loadObjFromUrl('/api/model/human.obj');
          },
          error: () => {
            this.apiStatus = 'offline';
            this.scene.loadObjFromUrl('assets/models/human.obj');
          },
        });
      },
    });
  }

  ngOnDestroy(): void {
    this.scene.ngOnDestroy();
  }
}
