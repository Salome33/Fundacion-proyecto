import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { FUNDACION_CONTACT } from './fundacion-contact.config';

@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [FormsModule],
  styleUrl: './clinical-theme.css',
  template: `
    <div class="login-page">
      <section class="login-card dashboard-window">
        <div class="login-card-body dashboard-window-body">
          <header class="login-head">
            <div class="lun-brand-logo login-logo">
              <img src="assets/fundacion/logo-emblem.png" alt="Fundación Manos Unidas de Dios" />
            </div>
            <h1>Historia clínica</h1>
            <p class="panel-lead">
              Fundación Manos Unidas de Dios · Ingrese con su usuario para acceder al sistema.
            </p>
          </header>

          <form class="login-form" (ngSubmit)="submit()">
            <label class="login-field">
              Usuario
              <input
                [(ngModel)]="username"
                name="username"
                autocomplete="username"
                required
              />
            </label>
            <label class="login-field">
              Contraseña
              <input
                [(ngModel)]="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
              />
            </label>

            @if (error()) {
              <p class="login-error" role="alert">{{ error() }}</p>
            }

            <button type="submit" class="btn btn-secondary btn-gold--xl login-submit">
              Ingresar al sistema
            </button>
          </form>

          <footer class="clinical-hub-contact clinical-foundation-contact login-foot">
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
      </section>
    </div>
  `,
})
export class LoginViewComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly contact = FUNDACION_CONTACT;

  username = '';
  password = '';
  error = signal('');

  submit(): void {
    this.error.set('');
    this.auth.login(this.username, this.password).subscribe((result) => {
      if (!result.success) {
        this.error.set(result.error ?? 'Usuario o contraseña incorrectos.');
        return;
      }
      void this.router.navigateByUrl('/');
    });
  }
}
