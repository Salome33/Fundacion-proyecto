export interface IntakeSectionDef {
  path: string;
  label: string;
  description: string;
  introText?: string;
  /** Ancla en formulario de scroll (puede coincidir con path). */
  scrollAnchor?: string;
}

/** Menú lateral principal — 24 apartados de la historia clínica. */
export const CLINICAL_NAV_SECTIONS: IntakeSectionDef[] = [
  {
    path: 'personal',
    label: 'Información personal',
    description: 'Identidad, contacto, afiliación y datos administrativos del adulto mayor.',
    scrollAnchor: 'personal',
  },
  {
    path: 'economica',
    label: 'Información económica',
    description: 'Ingresos, apoyos y vivienda previa al ingreso.',
    scrollAnchor: 'economica',
  },
  {
    path: 'familiar',
    label: 'Información familiar y social',
    description: 'Red de apoyo, convivencia, visitas y motivo de ingreso.',
    scrollAnchor: 'familiar',
  },
  {
    path: 'hijos',
    label: 'Información de los hijos',
    description: 'Nombre y contacto de cada hijo.',
    scrollAnchor: 'hijos',
  },
  {
    path: 'referencias-personales',
    label: 'Referencias personales',
    description: 'Personas de referencia no familiares.',
    scrollAnchor: 'referencias-personales',
  },
  {
    path: 'acudiente',
    label: 'Información del acudiente',
    description: 'Acudiente responsable y datos de contacto.',
    scrollAnchor: 'acudiente',
  },
  {
    path: 'valoracion-clinica',
    label: 'Valoración clínica',
    description: 'Observaciones generales de la valoración inicial.',
    scrollAnchor: 'valoracion-clinica',
  },
  {
    path: 'alergias',
    label: 'Alergias',
    description: 'Alergias a medicamentos, alimentos y otras.',
    scrollAnchor: 'alergias',
  },
  {
    path: 'medicamentos',
    label: 'Medicamentos',
    description: 'Medicación actual, dosis y horarios.',
    scrollAnchor: 'medicamentos',
  },
  {
    path: 'autopercepcion',
    label: 'Autopercepción de la salud',
    description: 'Cómo percibe el adulto mayor su estado de salud.',
    scrollAnchor: 'autopercepcion',
  },
  {
    path: 'anamnesis',
    label: 'Anamnesis',
    description: 'Aspecto, emocional y exploración por anamnesis.',
    scrollAnchor: 'anamnesis',
  },
  {
    path: 'condicion-general',
    label: 'Condición general',
    description: 'Higiene, nutrición, movilidad y apoyos.',
    scrollAnchor: 'condicion-general',
  },
  {
    path: 'practicas-riesgo',
    label: 'Prácticas con riesgo para la salud',
    description: 'Hábitos y conductas con riesgo.',
    scrollAnchor: 'practicas-riesgo',
  },
  {
    path: 'remision-especialistas',
    label: 'Remisión de especialistas',
    description: 'Especialidades, frecuencia y tratamientos.',
    scrollAnchor: 'remision-especialistas',
  },
  {
    path: 'examen',
    label: 'Examen físico',
    description: 'Hallazgos por regiones del cuerpo.',
    scrollAnchor: 'examen',
  },
  {
    path: 'sistemas',
    label: 'Valor frecuencia respiratoria en un minuto',
    description: 'Auscultación respiratoria y revisión por sistemas en un minuto.',
    scrollAnchor: 'sistemas',
  },
  {
    path: 'examen-mental',
    label: 'Examen mental',
    description: 'Actitud, afecto, memoria y lenguaje.',
    scrollAnchor: 'examen-mental',
  },
  {
    path: 'antecedentes',
    label: 'Antecedentes',
    description: 'Antecedentes patológicos, quirúrgicos y farmacológicos.',
    scrollAnchor: 'antecedentes',
  },
  {
    path: 'antecedentes-caidas',
    label: 'Antecedentes de caídas',
    description: 'Caídas previas y valoración de riesgo de caída.',
    scrollAnchor: 'antecedentes-caidas',
  },
  {
    path: 'vitales',
    label: 'Signos vitales',
    description: 'Constantes vitales e índices antropométricos.',
    scrollAnchor: 'vitales',
  },
  {
    path: 'cuerpo-grafico',
    label: 'Descripción gráfica del estado del cuerpo',
    description: 'Modelo 3D con marcas de afectaciones y observaciones.',
    scrollAnchor: 'cuerpo-grafico',
  },
  {
    path: 'escala-barthel',
    label: 'Índice de Barthel',
    description: 'Actividades básicas de la vida diaria.',
    scrollAnchor: 'escala-barthel',
  },
  {
    path: 'escala-lawton',
    label: 'Escala de Lawton',
    description: 'Actividades instrumentales de la vida diaria.',
    scrollAnchor: 'escala-lawton',
  },
  {
    path: 'escala-tinetti-equilibrio',
    label: 'Tinetti — Equilibrio',
    description: 'Escala de Tinetti, parte 1: equilibrio.',
    scrollAnchor: 'escala-tinetti-equilibrio',
  },
  {
    path: 'escala-tinetti-marcha',
    label: 'Tinetti — Marcha',
    description: 'Escala de Tinetti, parte 2: marcha.',
    scrollAnchor: 'escala-tinetti-marcha',
  },
  {
    path: 'escala-pfeiffer',
    label: 'Pfeiffer (SPMSQ)',
    description: 'Cuestionario de estado mental de Pfeiffer.',
    scrollAnchor: 'escala-pfeiffer',
  },
  {
    path: 'escala-gds',
    label: 'GDS Yesavage',
    description: 'Escala de depresión geriátrica.',
    scrollAnchor: 'escala-gds',
  },
  {
    path: 'concepto-institucional',
    label: 'Concepto institucional para la aprobación del ingreso del adulto mayor',
    description: 'Concepto favorable o no favorable e justificación.',
    scrollAnchor: 'concepto-institucional',
  },
  {
    path: 'aprobacion-independiente',
    label: 'Aprobación persona independiente',
    description: 'Aprobación de ingreso para persona independiente.',
    scrollAnchor: 'aprobacion-independiente',
  },
  {
    path: 'aprobacion-familia',
    label: 'Aprobación con limitación decisiones',
    description: 'Aprobación con familia y limitación para la toma de decisiones.',
    scrollAnchor: 'aprobacion-familia',
  },
  {
    path: 'declaracion',
    label: 'Declaración del acudiente',
    description: 'Declaración del contratante o acudiente.',
    scrollAnchor: 'declaracion',
  },
  {
    path: 'profesionales',
    label: 'Firmas profesionales',
    description: 'Firma de los profesionales que diligencian la ficha.',
    scrollAnchor: 'profesionales',
  },
];

const SCROLL_ANCHOR_MAP: Record<string, string> = {
  'referencias-personales': 'referencias',
  acudiente: 'acudiente',
  'valoracion-clinica': 'valoracion-clinica',
  alergias: 'alergias',
  medicamentos: 'medicamentos',
  'practicas-riesgo': 'practicas-riesgo',
  'remision-especialistas': 'remision-especialistas',
  'examen-mental': 'mental',
  antecedentes: 'antecedentes',
  'concepto-institucional': 'concepto-institucional',
  'aprobacion-independiente': 'aprobacion-independiente',
  'aprobacion-familia': 'aprobacion-familia',
  declaracion: 'declaracion',
  profesionales: 'profesionales',
  'declaraciones-firmas': 'declaracion',
  'cuerpo-grafico': 'cuerpo-grafico',
  escalas: 'escala-barthel',
  'escala-barthel': 'escala-barthel',
  'escala-lawton': 'escala-lawton',
  'escala-tinetti-equilibrio': 'escala-tinetti-equilibrio',
  'escala-tinetti-marcha': 'escala-tinetti-marcha',
  'escala-pfeiffer': 'escala-pfeiffer',
  'escala-gds': 'escala-gds',
};

/** Índice del formulario único (incluye contrato al inicio). */
export const CLINICAL_SCROLL_SECTIONS: IntakeSectionDef[] = [
  {
    path: 'contrato',
    label: 'Contrato e ingreso',
    description: 'Número de contrato.',
    scrollAnchor: 'contrato',
  },
  ...CLINICAL_NAV_SECTIONS.map((s) => ({
    ...s,
    scrollAnchor: SCROLL_ANCHOR_MAP[s.path] ?? s.path,
  })),
];

/** Compatibilidad con clinical-intake.component */
export const CLINICAL_SECTIONS = CLINICAL_SCROLL_SECTIONS.map((s) => ({
  id: s.scrollAnchor ?? s.path,
  label: s.label,
}));

/** Rutas legacy multi-página */
export const INTAKE_SECTIONS: IntakeSectionDef[] = [
  {
    path: 'contrato',
    label: 'Contrato e ingreso',
    description: 'Número de contrato e identificación del ingreso.',
  },
  ...CLINICAL_NAV_SECTIONS.filter((s) =>
    [
      'personal',
      'economica',
      'familiar',
      'hijos',
      'examen',
      'sistemas',
      'vitales',
      'cuerpo-grafico',
      'escala-barthel',
      'escala-lawton',
      'escala-tinetti-equilibrio',
      'escala-tinetti-marcha',
      'escala-pfeiffer',
      'escala-gds',
    ].includes(s.path),
  ),
  {
    path: 'referencias',
    label: 'Referencias y acudientes',
    description: 'Personas de referencia y acudientes responsables.',
  },
  {
    path: 'clinica',
    label: 'Valoración clínica',
    description: 'Patologías, alergias y medicación actual.',
  },
  {
    path: 'autopercepcion',
    label: 'Autopercepción de la salud',
    description: 'Cómo percibe el adulto mayor su estado de salud.',
  },
  {
    path: 'anamnesis',
    label: 'Anamnesis',
    description: 'Aspecto, emocional y exploración física.',
  },
  {
    path: 'condicion-general',
    label: 'Condición general',
    description: 'Higiene, nutrición, movilidad y apoyos.',
  },
  {
    path: 'riesgo',
    label: 'Riesgo y especialistas',
    description: 'Hábitos de riesgo y remisiones a especialistas.',
  },
  {
    path: 'mental',
    label: 'Examen mental',
    description: 'Estado mental y antecedentes relevantes.',
  },
  {
    path: 'concepto-institucional',
    label: 'Concepto institucional para la aprobación del ingreso del adulto mayor',
    description: 'Concepto favorable o no favorable e justificación.',
    scrollAnchor: 'concepto-institucional',
  },
  {
    path: 'aprobacion-independiente',
    label: 'Aprobación persona independiente',
    description: 'Aprobación de ingreso para persona independiente.',
    scrollAnchor: 'aprobacion-independiente',
  },
  {
    path: 'aprobacion-familia',
    label: 'Aprobación con limitación decisiones',
    description: 'Aprobación con familia y limitación para la toma de decisiones.',
    scrollAnchor: 'aprobacion-familia',
  },
  {
    path: 'declaracion',
    label: 'Declaración del acudiente',
    description: 'Declaración del contratante o acudiente.',
    scrollAnchor: 'declaracion',
  },
  {
    path: 'profesionales',
    label: 'Firmas profesionales',
    description: 'Firma de los profesionales que diligencian la ficha.',
    scrollAnchor: 'profesionales',
  },
];

export const INTAKE_NAV = INTAKE_SECTIONS;

export interface IntakeNavGroup {
  title: string;
  paths: string[];
}

export const INTAKE_NAV_GROUPS: IntakeNavGroup[] = [
  {
    title: 'Datos del ingreso',
    paths: ['contrato', 'personal', 'economica', 'familiar', 'hijos', 'referencias'],
  },
  {
    title: 'Valoración clínica',
    paths: [
      'clinica',
      'autopercepcion',
      'anamnesis',
      'condicion-general',
      'riesgo',
      'examen',
      'sistemas',
      'mental',
      'vitales',
      'cuerpo-grafico',
      'escala-barthel',
      'escala-lawton',
      'escala-tinetti-equilibrio',
      'escala-tinetti-marcha',
      'escala-pfeiffer',
      'escala-gds',
    ],
  },
  { title: 'Cierre', paths: ['concepto-institucional', 'aprobacion-independiente', 'aprobacion-familia', 'declaracion', 'profesionales'] },
];

export function intakeNavGroups(): { title: string; items: IntakeSectionDef[] }[] {
  return INTAKE_NAV_GROUPS.map((g) => ({
    title: g.title,
    items: g.paths.map((p) => sectionByPath(p)!).filter(Boolean),
  }));
}

export function sectionByPath(path: string): IntakeSectionDef | undefined {
  return (
    CLINICAL_NAV_SECTIONS.find((s) => s.path === path) ??
    INTAKE_SECTIONS.find((s) => s.path === path)
  );
}

export function navSectionByPath(path: string): IntakeSectionDef | undefined {
  return sectionByPath(path);
}
