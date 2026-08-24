export type UserRole = 'coordinador' | 'junta';

export interface AuthSession {
  username: string;
  role: UserRole;
  displayName: string;
}

export interface AuthUser {
  username: string;
  password: string;
  role: UserRole;
  displayName: string;
}
