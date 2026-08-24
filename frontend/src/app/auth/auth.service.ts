import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { AuthSession } from './auth.model';

const SESSION_KEY = 'lun-clinical-session';

interface AuthSessionResponse {
  username: string;
  role: 'coordinador' | 'junta';
  displayName: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionSignal = signal<AuthSession | null>(this.loadSession());

  readonly session = this.sessionSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.sessionSignal() !== null);
  readonly canEdit = computed(() => this.sessionSignal()?.role === 'coordinador');
  readonly roleLabel = computed(() => this.sessionSignal()?.displayName ?? '');

  login(username: string, password: string): Observable<LoginResult> {
    const user = username.trim();
    const pass = password.trim();
    return this.http
      .post<AuthSessionResponse>('/api/auth/login', { username: user, password: pass })
      .pipe(
        tap((response) => {
          const session: AuthSession = {
            username: response.username,
            role: response.role,
            displayName: response.displayName,
          };
          this.persistSession(session);
          this.sessionSignal.set(session);
        }),
        map(() => ({ success: true })),
        catchError((err: HttpErrorResponse) => {
          if (err.status === 0) {
            return of({
              success: false,
              error:
                'No se pudo conectar con el servidor. Inicie el backend con scripts\\start.cmd y espere unos 20 segundos.',
            });
          }
          if (err.status === 401) {
            return of({ success: false, error: 'Usuario o contraseña incorrectos.' });
          }
          if (err.status === 500 || err.status === 502 || err.status === 503 || err.status === 504) {
            return of({
              success: false,
              error:
                'El servidor no está disponible. Ejecute scripts\\start.cmd (Docker + backend en puerto 8080) y vuelva a intentar.',
            });
          }
          const backendMsg =
            typeof err.error === 'object' && err.error && 'message' in err.error
              ? String((err.error as { message: string }).message)
              : typeof err.error === 'string'
                ? err.error
                : '';
          return of({
            success: false,
            error:
              backendMsg ||
              'Error al iniciar sesión. Verifique que el backend esté corriendo en http://localhost:8080.',
          });
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    this.sessionSignal.set(null);
  }

  /** Guarda la sesión activa para que otras pestañas (p. ej. imprimir) mantengan el acceso. */
  ensureSessionPersisted(): void {
    const session = this.sessionSignal();
    if (session) {
      this.persistSession(session);
    }
  }

  private persistSession(session: AuthSession): void {
    const raw = JSON.stringify(session);
    localStorage.setItem(SESSION_KEY, raw);
    sessionStorage.removeItem(SESSION_KEY);
  }

  private loadSession(): AuthSession | null {
    try {
      let raw = localStorage.getItem(SESSION_KEY);
      if (!raw) {
        raw = sessionStorage.getItem(SESSION_KEY);
        if (raw) {
          localStorage.setItem(SESSION_KEY, raw);
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as AuthSession;
      if (parsed.role !== 'coordinador' && parsed.role !== 'junta') {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
}
