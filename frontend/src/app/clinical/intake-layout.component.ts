import { Component, inject, OnInit, signal } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { intakeNavGroups, sectionByPath } from './clinical-sections';
import { ClinicalSidebarService } from './clinical-sidebar.service';
import { IntakeStoreService } from './intake-store.service';

@Component({
  selector: 'app-intake-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  styleUrl: './clinical-theme.css',
  template: `
    <div
      class="lun-shell intake-scroll-shell"
      [class.clinical-sidebar-open]="sidebar.open()"
    >
      @if (!sidebar.open()) {
        <button
          type="button"
          class="clinical-sidebar-toggle"
          (click)="sidebar.openPanel()"
          aria-expanded="false"
          aria-controls="intake-layout-nav"
        >
          Menú
        </button>
      }
      @if (sidebar.open()) {
        <button
          type="button"
          class="clinical-sidebar-backdrop"
          aria-label="Cerrar menú"
          (click)="sidebar.close()"
        ></button>
      }
      <aside class="lun-sidebar lun-sidebar--scroll-index" id="intake-layout-nav">
        <div class="lun-brand">
          <button
            type="button"
            class="clinical-sidebar-close"
            aria-label="Cerrar menú"
            (click)="sidebar.close()"
          >
            ×
          </button>
          <div class="lun-brand-logo">
            <img src="assets/fundacion/logo-emblem.png" alt="Fundación Manos Unidas de Dios" />
          </div>
          <p class="lun-brand-title">Fundación Manos Unidas de Dios</p>
          <p class="lun-brand-sub">Valoración clínica</p>
        </div>

        <nav class="lun-sidebar-nav clinical-intake-index-list" aria-label="Apartados de la ficha">
          @for (group of navGroups; track group.title) {
            <p class="lun-nav-heading">{{ group.title }}</p>
            @for (item of group.items; track item.path) {
              <a
                class="lun-nav-item"
                [routerLink]="['/ingreso', intakeId, item.path]"
                routerLinkActive="lun-nav-item--active"
                [routerLinkActiveOptions]="{ exact: true }"
                (click)="sidebar.close()"
              >
                <span class="lun-nav-icon" aria-hidden="true">{{ navIcon(item.path) }}</span>
                <span>{{ item.label }}</span>
              </a>
            }
          }
        </nav>

        @if (store.currentRecord(); as r) {
          <div class="lun-sidebar-meta">
            <div class="lun-user-chip lun-user-chip--sidebar">
              <span class="lun-user-avatar">{{ initials(r.nombre) }}</span>
              <span class="lun-user-meta">
                <strong>{{ r.nombre }}</strong>
                <small>{{ r.identificacion || 'Sin documento' }}</small>
              </span>
            </div>
            <button type="button" class="btn-gold btn-gold--block" (click)="save()">Guardar avance</button>
          </div>
        }

        <div class="lun-sidebar-foot clinical-sidebar-actions">
          <a routerLink="/" class="btn btn-secondary btn-gold--block clinical-main-nav-new-btn">
            ← Volver al inicio
          </a>
          <button
            type="button"
            class="btn btn-secondary btn-gold--block clinical-main-nav-new-btn"
            (click)="logout()"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main class="clinical-page intake-scroll-main lun-main">
        @if (msg()) {
          <p class="lun-toast">{{ msg() }}</p>
        }

        <div class="lun-content">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class IntakeLayoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  readonly store = inject(IntakeStoreService);
  readonly sidebar = inject(ClinicalSidebarService);
  readonly navGroups = intakeNavGroups();
  msg = signal('');
  intakeId = '';
  sectionLabel = signal('Apartado');

  ngOnInit(): void {
    this.route.paramMap.subscribe((p) => {
      const id = p.get('id');
      if (id) {
        this.intakeId = id;
        if (!this.store.open(id)) {
          void this.router.navigateByUrl('/');
        }
      }
    });

    this.syncSectionLabel(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.syncSectionLabel(e.urlAfterRedirects));
  }

  navIcon(path: string): string {
    const icons: Record<string, string> = {
      contrato: '01',
      personal: '02',
      economica: '03',
      familiar: '04',
      hijos: '05',
      referencias: '06',
      clinica: '07',
      autopercepcion: '08',
      riesgo: '09',
      examen: '10',
      sistemas: '11',
      mental: '12',
      vitales: '13',
      'cuerpo-grafico': '3D',
      escalas: '14',
      vgi: '15',
      cierre: '16',
    };
    return icons[path] ?? '•';
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '?';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  save(): void {
    this.store.syncFromForm();
    this.store.saveToServer().subscribe({
      next: () => {
        this.msg.set('Ficha guardada correctamente.');
        setTimeout(() => this.msg.set(''), 3500);
      },
      error: () => {
        this.msg.set(
          'No se pudo guardar en el servidor. Verifique que PostgreSQL y el backend estén en ejecución.',
        );
        setTimeout(() => this.msg.set(''), 5000);
      },
    });
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }

  private syncSectionLabel(url: string): void {
    const parts = url.split('/').filter(Boolean);
    const sec = parts[parts.length - 1] ?? 'contrato';
    this.sectionLabel.set(sectionByPath(sec)?.label ?? 'Apartado');
  }
}
