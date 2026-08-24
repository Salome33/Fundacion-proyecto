import { AuthUser } from './auth.model';

/** Credenciales de acceso al sistema (dos perfiles fijos). */
export const AUTH_USERS: AuthUser[] = [
  {
    username: 'coordinador',
    password: 'coordinador',
    role: 'coordinador',
    displayName: 'Coordinador administrativo',
  },
  {
    username: 'junta',
    password: 'junta',
    role: 'junta',
    displayName: 'Junta directiva',
  },
];
