export interface MainNavItem {
  path: string;
  label: string;
  description: string;
}

/** Panel principal — acceso a cada vista del sistema. */
export const MAIN_NAV_ITEMS: MainNavItem[] = [
  {
    path: '/',
    label: 'Inicio',
    description: 'Página introductoria y registro de adultos mayores',
  },
  {
    path: '/explorar',
    label: 'Explorar apartados',
    description: 'Resultados por título de sección del formulario',
  },
  {
    path: '/fichas',
    label: 'Fichas completas',
    description: 'Consultar el formulario completo por adulto mayor',
  },
  {
    path: '/citas',
    label: 'Citas médicas',
    description: 'Calendario y agendamiento de citas',
  },
  {
    path: '/signos-vitales',
    label: 'Registro de signos vitales',
    description: 'Registro diario por turno (independiente del formulario)',
  },
  {
    path: '/notas-enfermeria',
    label: 'Notas de enfermería',
    description: 'Registro de notas clínicas de enfermería',
  },
];
