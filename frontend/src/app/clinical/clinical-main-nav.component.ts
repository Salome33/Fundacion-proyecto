import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { MAIN_NAV_ITEMS } from './clinical-nav.config';
import { FUNDACION_CONTACT } from './fundacion-contact.config';

@Component({
  selector: 'app-clinical-main-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  styleUrl: './clinical-theme.css',
  template: `
    <aside class="lun-sidebar clinical-main-nav">
      <div class="lun-brand">
        <div class="lun-brand-logo">
          <img src="assets/fundacion/logo-emblem.png" alt="Fundación Manos Unidas de Dios" />
        </div>
        <p class="lun-brand-title">Fundación Manos Unidas de Dios</p>
        <p class="lun-brand-sub">Historia clínica</p>
      </div>

      <nav class="lun-sidebar-nav clinical-main-nav-list" aria-label="Panel de vistas">
        <p class="lun-nav-heading">Vistas del sistema</p>
        @for (item of navItems; track item.path) {
          <a
            class="lun-nav-item"
            [routerLink]="item.path"
            routerLinkActive="lun-nav-item--active"
            [routerLinkActiveOptions]="{ exact: item.path === '/' }"
            [title]="item.description"
          >
            <span class="lun-nav-icon lun-nav-icon--menu" aria-hidden="true"></span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="clinical-main-nav-bottom">
        <div class="lun-sidebar-meta clinical-main-nav-meta clinical-sidebar-actions">
          <span class="clinical-session-role">{{ auth.roleLabel() }}</span>
          <button
            type="button"
            class="btn btn-secondary btn-gold--block clinical-main-nav-new-btn"
            (click)="logout()"
          >
            Cerrar sesión
          </button>
        </div>

        <footer class="lun-sidebar-foot clinical-main-nav-foot-wrap clinical-foundation-contact">
          <a
            class="clinical-foundation-contact-site"
            [href]="contact.websiteUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ contact.website }}
          </a>
          <a class="clinical-foundation-contact-line" [href]="'mailto:' + contact.email">
            {{ contact.email }}
          </a>
          <p class="clinical-foundation-contact-line">{{ contact.phones }}</p>
          <p class="clinical-foundation-contact-line">{{ contact.location }}</p>
        </footer>
      </div>
    </aside>
  `,
})
export class ClinicalMainNavComponent {
  readonly auth = inject(AuthService);
  private router = inject(Router);

  readonly navItems = MAIN_NAV_ITEMS;
  readonly contact = FUNDACION_CONTACT;

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
