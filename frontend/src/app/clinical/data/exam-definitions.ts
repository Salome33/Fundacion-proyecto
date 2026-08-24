/** Subcampos del examen físico y revisión por sistemas según el formato oficial. */

export interface ExamSubField {
  id: string;
  label: string;
  type?: 'text' | 'textarea';
  hint?: string;
}

export interface ExamRegionDef {
  id: string;
  label: string;
  fields: ExamSubField[];
}

export const EXAMEN_FISICO_REGIONS: ExamRegionDef[] = [
  {
    id: 'piel',
    label: 'Piel',
    fields: [
      { id: 'hidratada', label: 'Hidratada' },
      { id: 'resequedadZona', label: 'Resequedad zona' },
      { id: 'lesiones', label: 'Lesiones' },
    ],
  },
  {
    id: 'cabeza',
    label: 'Cabeza',
    fields: [
      { id: 'simetrica', label: 'Simétrica' },
      { id: 'lesiones', label: 'Lesiones' },
      { id: 'cueroCabelludo', label: 'Cuero cabelludo' },
    ],
  },
  {
    id: 'cara',
    label: 'Cara',
    fields: [
      { id: 'ojos', label: 'Ojos' },
      { id: 'nariz', label: 'Nariz' },
      { id: 'boca', label: 'Boca' },
      { id: 'oidos', label: 'Oídos' },
    ],
  },
  {
    id: 'ojos',
    label: 'Ojos',
    fields: [
      { id: 'simetria', label: 'Simetría' },
      { id: 'lesion', label: 'Lesión' },
      { id: 'usoGafas', label: 'Uso de gafas' },
    ],
  },
  {
    id: 'nariz',
    label: 'Nariz',
    fields: [
      { id: 'simetria', label: 'Simetría' },
      { id: 'permeabilidad', label: 'Permeabilidad' },
      { id: 'ventanasNasales', label: 'Ventanas nasales' },
    ],
  },
  {
    id: 'oidos',
    label: 'Oídos',
    fields: [
      { id: 'integros', label: 'Íntegros' },
      { id: 'dolor', label: 'Dolor' },
      { id: 'infeccion', label: 'Infección' },
      { id: 'pAudifonos', label: 'P. audífonos' },
    ],
  },
  {
    id: 'boca',
    label: 'Boca',
    fields: [
      { id: 'simetrica', label: 'Simétrica' },
      { id: 'lengua', label: 'Lengua' },
      { id: 'dientes', label: 'Dientes' },
      { id: 'protesis', label: 'Prótesis' },
    ],
  },
  {
    id: 'cuello',
    label: 'Cuello',
    fields: [
      { id: 'movilidad', label: 'Movilidad' },
      { id: 'dolor', label: 'Dolor' },
      { id: 'otros', label: 'Otros' },
    ],
  },
  {
    id: 'torax',
    label: 'Tórax',
    fields: [
      { id: 'simetria', label: 'Simetría' },
      { id: 'dolor', label: 'Dolor' },
      { id: 'otros', label: 'Otros' },
    ],
  },
  {
    id: 'abdomen',
    label: 'Abdomen',
    fields: [
      { id: 'ruidosPeristalticos', label: 'Ruidos peristálticos' },
      { id: 'dolor', label: 'Dolor' },
      { id: 'otros', label: 'Otros' },
    ],
  },
  {
    id: 'extSuperiores',
    label: 'Extremidades superiores',
    fields: [
      { id: 'hombro', label: 'Hombro' },
      { id: 'antebrazo', label: 'Antebrazo' },
      { id: 'codo', label: 'Codo' },
      { id: 'brazo', label: 'Brazo' },
      { id: 'muneca', label: 'Muñeca' },
      { id: 'mano', label: 'Mano' },
    ],
  },
  {
    id: 'extInferiores',
    label: 'Extremidades inferiores',
    fields: [
      { id: 'simetria', label: 'Simetría' },
      { id: 'dolor', label: 'Dolor' },
      { id: 'cadera', label: 'Cadera' },
      { id: 'rodillas', label: 'Rodillas' },
      { id: 'tobillos', label: 'Tobillos' },
      { id: 'pies', label: 'Pies' },
    ],
  },
  {
    id: 'columna',
    label: 'Columna',
    fields: [
      { id: 'simetria', label: 'Simetría' },
      { id: 'dolor', label: 'Dolor' },
      { id: 'cifosis', label: 'Cifosis' },
      { id: 'lordosis', label: 'Lordosis' },
      { id: 'escoliosis', label: 'Escoliosis' },
      { id: 'otros', label: 'Otros' },
    ],
  },
];

export const INCONTINENCIA_CHECK_ITEMS: { id: string; label: string }[] = [
  { id: 'lesiones', label: 'Lesiones' },
  { id: 'ulceras', label: 'Úlceras' },
  { id: 'hongos', label: 'Hongos' },
  { id: 'secreciones', label: 'Secreciones' },
  { id: 'prolapso', label: 'Prolapso' },
  { id: 'presenciaSonda', label: 'Presencia de sonda' },
];

export const FR_CONDICION_FIELDS: ExamSubField[] = [
  {
    id: 'murmulloVesicular',
    label: 'Murmullo vesicular',
    hint: 'Entrada de aire a los pulmones con obstrucción',
  },
  {
    id: 'sibilancia',
    label: 'Sibilancia',
    hint: 'Sonido sibilante y chillón. Por EPOC, asma.',
  },
  {
    id: 'estertores',
    label: 'Estertores',
    hint:
      'Ronquidos. Por insuficiencia cardiaca, enf. pulmonar, obstrucción vías respiratorias, bronquitis.',
  },
];

export const REVISION_SISTEMAS_OTROS: { id: string; label: string; hint?: string }[] = [
  {
    id: 'neurologico',
    label: 'Neurológico',
    hint:
      'Síncope, cefalea, pérdida de conocimiento, convulsiones, irritabilidad, vómito, alteración de lenguaje, pérdida de memoria, insomnio, aislamiento.',
  },
  {
    id: 'endocrino',
    label: 'Endocrino',
    hint: 'Trastornos diabetes, tiroides, riñones, hirsutismo (crecimiento excesivo de bello).',
  },
  {
    id: 'musculoEsqueletico',
    label: 'Músculo esquelético',
    hint:
      'Marcha, movilidad, tono, alineación, parestesias, dolor, edema, bipedestación (capacidad para mantenerse de pie).',
  },
  {
    id: 'hematopoyetico',
    label: 'Hematopoyético',
    hint: 'Anemia, adenomas, masas.',
  },
  {
    id: 'linforreticular',
    label: 'Linforreticular',
    hint:
      'Ganglios linfáticos, palpación de edema en las zonas: ingle, axila, cuello, detrás del oído, región occipital de la cabeza, fiebre, fatiga.',
  },
  {
    id: 'psiquiatrico',
    label: 'Psiquiátrico',
    hint: 'Estado de ánimo, activo, reactivo, colaborador, memoria conservada.',
  },
  {
    id: 'articular',
    label: 'Articular',
    hint: 'Deformidad, dolor, inflamación, enrojecimiento.',
  },
  {
    id: 'cardiovascular',
    label: 'Cardiovascular',
    hint:
      'Disnea, intolerancia al ejercicio, cansancio, dolor en el pecho, diaforesis: sudoración fría, cianosis bucal, inflamación en tobillos y pies.',
  },
  {
    id: 'gastrointestinal',
    label: 'Gastrointestinal',
    hint:
      'Apetito, hábitos intestinales, dolor, hematemesis, náuseas, vómito, intolerancia a alimentos, distensión.',
  },
  {
    id: 'ginecologico',
    label: 'Ginecológico',
    hint: 'Incontinencia urinaria, lesiones.',
  },
  {
    id: 'urologico',
    label: 'Urológico',
    hint:
      'Incontinencia, frecuencia y cantidad de orina, presencia de goteo, sin dolor al orinar, hematuria, tenesmo.',
  },
];

export const VALOR_FR_EN_UN_MINUTO: { id: string; label: string; hint?: string }[] = [
  ...FR_CONDICION_FIELDS.map((f) => ({
    id: f.id,
    label: f.label,
    hint: f.hint,
  })),
  ...REVISION_SISTEMAS_OTROS,
];

export const EXAMEN_MENTAL_FIELDS: { id: string; label: string; hint?: string }[] = [
  {
    id: 'actitud',
    label: 'Actitud',
    hint: 'Colaborador, mantiene contacto visual, verbal.',
  },
  {
    id: 'atencion',
    label: 'Atención',
    hint: 'Evaluación a través de preguntas.',
  },
  {
    id: 'conciencia',
    label: 'Conciencia',
    hint:
      'Estado de coma, estupor, delirio, vigilante, activo: normal, habla, escucha, sigue órdenes.',
  },
  {
    id: 'orientacion',
    label: 'Orientación',
    hint: 'Tiempo, lugar, espacio.',
  },
  {
    id: 'lenguaje',
    label: 'Lenguaje',
    hint: 'Fluido, claro, buen tono de voz.',
  },
  {
    id: 'memoria',
    label: 'Memoria',
    hint: 'Preguntas de alimentación, actividades.',
  },
  { id: 'sueno', label: 'Sueño' },
  { id: 'alimentacion', label: 'Alimentación' },
  { id: 'retrasoMental', label: 'Retraso mental' },
  { id: 'sintomasDepresivos', label: 'Sintomatología depresiva' },
  { id: 'sintomasAnsiedad', label: 'Sintomatología de ansiedad' },
  { id: 'pensamientoIncoherente', label: 'Pensamiento o ideas incoherentes' },
];

/** @deprecated Respiratorio integrado en valoración de frecuencia respiratoria. */
export const RESPIRATORIO_FIELDS: ExamSubField[] = [];
