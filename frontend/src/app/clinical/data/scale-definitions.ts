/** Definiciones de escalas gerontológicas (opciones + puntuación automática). */

export interface ScaleOption {
  label: string;
  score: number;
}

export interface ScaleItemDef {
  id: string;
  label: string;
  /** Subtítulo de grupo (p. ej. «Longitud y altura del paso»); se muestra una vez por bloque consecutivo. */
  sectionLabel?: string;
  options: ScaleOption[];
}

export interface ScaleDef {
  id: string;
  title: string;
  subtitle?: string;
  maxScore: number;
  items: ScaleItemDef[];
  interpret: (total: number) => string;
}

export const BARTHEL_SCALE: ScaleDef = {
  id: 'barthel',
  title: 'Índice de Barthel — Actividades básicas de la vida diaria',
  maxScore: 100,
  items: [
    {
      id: 'comer',
      label: 'Comer',
      options: [
        { label: 'Totalmente independiente', score: 10 },
        { label: 'Necesita ayuda para cortar carne, el pan, etc.', score: 5 },
        { label: 'Dependiente', score: 0 },
      ],
    },
    {
      id: 'lavarse',
      label: 'Lavarse',
      options: [
        { label: 'Independiente: entra y sale solo del baño', score: 5 },
        { label: 'Dependiente', score: 0 },
      ],
    },
    {
      id: 'vestirse',
      label: 'Vestirse',
      options: [
        {
          label:
            'Independiente: capaz de ponerse y de quitarse la ropa, abotonarse, atarse los zapatos',
          score: 10,
        },
        { label: 'Necesita ayuda', score: 5 },
        { label: 'Dependiente', score: 0 },
      ],
    },
    {
      id: 'arreglarse',
      label: 'Arreglarse',
      options: [
        {
          label:
            'Independiente para lavarse la cara, las manos, peinarse, afeitarse, maquillarse, etc.',
          score: 5,
        },
        { label: 'Dependiente', score: 0 },
      ],
    },
    {
      id: 'deposiciones',
      label: 'Deposiciones (valórese la semana previa)',
      options: [
        { label: 'Continencia normal', score: 10 },
        {
          label:
            'Ocasionalmente algún episodio de incontinencia o necesita ayuda para administrarse supositorios o lavativas',
          score: 5,
        },
        { label: 'Incontinencia', score: 0 },
      ],
    },
    {
      id: 'miccion',
      label: 'Micción (valórese la semana previa)',
      options: [
        {
          label:
            'Continencia normal, o es capaz de cuidarse de la sonda si tiene una puesta',
          score: 10,
        },
        {
          label:
            'Un episodio diario como máximo de incontinencia, o necesita ayuda para cuidar de la sonda',
          score: 5,
        },
        { label: 'Incontinencia', score: 0 },
      ],
    },
    {
      id: 'retrete',
      label: 'Usar el retrete',
      options: [
        {
          label:
            'Independiente para ir al cuarto de aseo, quitarse y ponerse la ropa',
          score: 10,
        },
        {
          label: 'Necesita ayuda para ir al retrete, pero se limpia solo',
          score: 5,
        },
        { label: 'Dependiente', score: 0 },
      ],
    },
    {
      id: 'trasladarse',
      label: 'Trasladarse',
      options: [
        {
          label: 'Independiente para ir del sillón a la cama',
          score: 15,
        },
        {
          label: 'Mínima ayuda física o supervisión para hacerlo',
          score: 10,
        },
        {
          label: 'Necesita gran ayuda, pero es capaz de mantenerse sentado solo',
          score: 5,
        },
        { label: 'Dependiente', score: 0 },
      ],
    },
    {
      id: 'deambular',
      label: 'Deambular',
      options: [
        { label: 'Independiente: camina solo 50 metros', score: 15 },
        {
          label: 'Necesita ayuda física o supervisión para caminar 50 metros',
          score: 10,
        },
        { label: 'Independiente en silla de ruedas sin ayuda', score: 5 },
        { label: 'Dependiente', score: 0 },
      ],
    },
    {
      id: 'escalones',
      label: 'Escalones',
      options: [
        { label: 'Independiente para bajar y subir escaleras', score: 10 },
        {
          label: 'Necesita ayuda física o supervisión para hacerlo',
          score: 5,
        },
        { label: 'Dependiente', score: 0 },
      ],
    },
  ],
  interpret: (t) => {
    if (t >= 90) return 'Independiente o dependencia leve';
    if (t >= 60) return 'Dependencia leve';
    if (t >= 40) return 'Dependencia moderada';
    if (t >= 20) return 'Dependencia grave';
    return 'Dependencia total';
  },
};

export const LAWTON_SCALE: ScaleDef = {
  id: 'lawton',
  title: 'Escala de Lawton y Brody — AIVD',
  subtitle: 'Mide capacidad y tienen un buen coeficiente de reproductibilidad (0,94)',
  maxScore: 8,
  items: [
    {
      id: 'telefono',
      label: 'Utiliza el teléfono',
      options: [
        {
          label:
            'Utiliza el teléfono a iniciativa propia, busca y marca los números, etc.',
          score: 1,
        },
        { label: 'Marca unos cuantos números bien conocidos', score: 1 },
        { label: 'Contesta el teléfono pero no marca', score: 1 },
        { label: 'No usa el teléfono', score: 0 },
      ],
    },
    {
      id: 'compras',
      label: 'Ir de compras',
      options: [
        { label: 'Realiza todas las compras necesarias con independencia', score: 1 },
        { label: 'Compra con independencia pequeñas cosas', score: 0 },
        { label: 'Necesita compañía para realizar cualquier compra', score: 0 },
        { label: 'Completamente incapaz de ir de compras', score: 0 },
      ],
    },
    {
      id: 'comida',
      label: 'Preparación de la comida',
      options: [
        {
          label: 'Planea, prepara y sirve las comidas adecuadas con independencia',
          score: 1,
        },
        { label: 'Prepara las comidas si se le dan los ingredientes', score: 0 },
        {
          label: 'Calienta y sirve las comidas pero no mantiene una dieta adecuada',
          score: 0,
        },
        { label: 'Necesita que se le prepare y sirva la comida', score: 0 },
      ],
    },
    {
      id: 'casa',
      label: 'Cuidar la casa',
      options: [
        {
          label:
            'Cuida la casa sólo o con ayuda ocasional (ej. trabajos pesados)',
          score: 1,
        },
        {
          label: 'Realiza tareas domésticas ligeras como fregar o hacer cama',
          score: 1,
        },
        {
          label:
            'Realiza tareas domésticas ligeras pero no puede mantener un nivel de limpieza aceptable',
          score: 1,
        },
        { label: 'Necesita ayuda en todas las tareas de la casa', score: 1 },
        { label: 'No participa en ninguna tarea doméstica', score: 0 },
      ],
    },
    {
      id: 'ropa',
      label: 'Lavado de ropa',
      options: [
        { label: 'Realiza completamente el lavado de ropa personal', score: 1 },
        { label: 'Lava ropa pequeña', score: 1 },
        { label: 'Necesita que otro se ocupe del lavado', score: 0 },
      ],
    },
    {
      id: 'transporte',
      label: 'Medio de transporte',
      options: [
        {
          label: 'Viaja con independencia en transportes públicos o conduce su coche',
          score: 1,
        },
        {
          label:
            'Capaz de organizar su propio transporte en taxi, pero no usa transporte público',
          score: 1,
        },
        {
          label: 'Viaja en transportes públicos si le acompaña otra persona',
          score: 1,
        },
        { label: 'Sólo viaja en taxi o automóvil con ayuda de otros', score: 0 },
        { label: 'No viaja', score: 0 },
      ],
    },
    {
      id: 'medicacion',
      label: 'Responsabilidad sobre la medicación',
      options: [
        {
          label:
            'Es responsable en el uso de la medicación, dosis y horas correctas',
          score: 1,
        },
        {
          label:
            'Toma responsablemente la medicación si se le prepara con anticipación en dosis preparadas',
          score: 0,
        },
        { label: 'No es capaz de responsabilizarse de su propia medicación', score: 0 },
      ],
    },
    {
      id: 'dinero',
      label: 'Capacidad de utilizar el dinero',
      options: [
        {
          label:
            'Maneja los asuntos financieros con independencia, recoge y conoce sus ingresos',
          score: 1,
        },
        {
          label:
            'Maneja los gastos cotidianos pero necesita ayuda para ir al banco, grandes gastos, etc.',
          score: 1,
        },
        { label: 'Incapaz de manejar el dinero', score: 0 },
      ],
    },
  ],
  interpret: (t) =>
    t >= 8 ? 'Independencia en AIVD' : t >= 5 ? 'Dependencia parcial' : 'Alta dependencia en AIVD',
};

/** Tinetti — equilibrio (15) + marcha (12); items con scores variables. */
/** Bloque visual: ítem suelto o grupo bajo un mismo subtítulo (p. ej. longitud y altura del paso). */
export interface TinettiRenderBlock {
  id: string;
  sectionLabel?: string;
  label?: string;
  items: ScaleItemDef[];
}

export function tinettiBuildRenderBlocks(items: ScaleItemDef[]): TinettiRenderBlock[] {
  const blocks: TinettiRenderBlock[] = [];
  let i = 0;
  while (i < items.length) {
    const item = items[i];
    if (item.sectionLabel) {
      const section = item.sectionLabel;
      const group: ScaleItemDef[] = [];
      while (i < items.length && items[i].sectionLabel === section) {
        group.push(items[i]);
        i++;
      }
      blocks.push({ id: `section_${group[0].id}`, sectionLabel: section, items: group });
    } else {
      blocks.push({ id: item.id, label: item.label, items: [item] });
      i++;
    }
  }
  return blocks;
}

export function tinettiMaxScore(items: ScaleItemDef[]): number {
  return items.reduce(
    (sum, it) => sum + Math.max(...it.options.map((o) => o.score)),
    0,
  );
}

function tinettiItemHasDuplicateScores(item: ScaleItemDef): boolean {
  const scores = item.options.map((o) => o.score);
  return new Set(scores).size !== scores.length;
}

/** Puntuación de un ítem según valor guardado (índice de opción o puntuación legacy). */
export function tinettiResolveScore(item: ScaleItemDef, raw: unknown): number {
  if (raw == null || raw === '') return 0;
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;
  if (tinettiItemHasDuplicateScores(item)) {
    const idx = Math.trunc(n);
    return item.options[idx]?.score ?? 0;
  }
  if (Number.isInteger(n) && n >= 0 && n < item.options.length) {
    return item.options[n].score;
  }
  return n;
}

export function tinettiTotalFromItems(
  items: ScaleItemDef[],
  getValue: (itemId: string) => unknown,
): number {
  return items.reduce(
    (sum, it) => sum + tinettiResolveScore(it, getValue(it.id)),
    0,
  );
}

/** Índice de opción seleccionada para marcar el radio correcto. */
export function tinettiSelectedOptionIndex(item: ScaleItemDef, raw: unknown): number | null {
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  if (tinettiItemHasDuplicateScores(item)) {
    const idx = Math.trunc(n);
    return idx >= 0 && idx < item.options.length ? idx : null;
  }
  if (Number.isInteger(n) && n >= 0 && n < item.options.length) {
    return n;
  }
  const idx = item.options.findIndex((o) => o.score === n);
  return idx >= 0 ? idx : null;
}

export const TINETTI_BALANCE: ScaleItemDef[] = [
  {
    id: 'eq_sentado',
    label: 'Equilibrio sentado',
    options: [
      { label: 'Se inclina o desliza en la silla', score: 0 },
      { label: 'Firme y seguro', score: 1 },
    ],
  },
  {
    id: 'levantarse',
    label: 'Levantarse',
    options: [
      { label: 'Incapaz sin ayuda', score: 0 },
      { label: 'Capaz utilizando los brazos como ayuda', score: 1 },
      { label: 'Capaz sin utilizar los brazos', score: 2 },
    ],
  },
  {
    id: 'intentos_levantarse',
    label: 'Intentos de levantarse',
    options: [
      { label: 'Incapaz sin ayuda', score: 0 },
      { label: 'Capaz, pero necesita más de un intento', score: 1 },
      { label: 'Capaz de levantarse con un intento', score: 2 },
    ],
  },
  {
    id: 'eq_inmediato',
    label: 'Equilibrio inmediato (5) al levantarse',
    options: [
      {
        label: 'Inestable (se tambalea, mueve los pies, marcado balanceo del tronco)',
        score: 0,
      },
      {
        label: 'Estable, pero usa andador, bastón, muletas u otros objetos',
        score: 1,
      },
      { label: 'Estable sin usar bastón u otros soportes', score: 2 },
    ],
  },
  {
    id: 'eq_biped',
    label: 'Equilibrio en bipedestación',
    options: [
      { label: 'Inestable', score: 0 },
      {
        label:
          'Estable con aumento del área de sustentación (los talones separados más de 10 cm.) o usa bastón, andador u otro soporte',
        score: 1,
      },
      {
        label: 'Base de sustentación estrecha sin ningún soporte',
        score: 2,
      },
    ],
  },
  {
    id: 'empujon',
    label:
      'Empujón (sujeto en posición firme con los pies lo más juntos posible; el examinador empuja sobre el esternón del paciente con la palma 3 veces)',
    options: [
      { label: 'Tiende a caerse', score: 0 },
      {
        label: 'Se tambalea, se sujeta, pero se mantiene solo',
        score: 1,
      },
      { label: 'Firme', score: 2 },
    ],
  },
  {
    id: 'ojos_cerrados',
    label: 'Ojos cerrados (en la posición anterior)',
    options: [
      { label: 'Inestable', score: 0 },
      { label: 'Estable', score: 1 },
    ],
  },
  {
    id: 'giro_360',
    label: 'Giro de 360º',
    options: [
      { label: 'Pasos discontinuos', score: 0 },
      { label: 'Pasos continuos', score: 1 },
      { label: 'Inestable (se agarra o tambalea)', score: 0 },
      { label: 'Estable', score: 1 },
    ],
  },
  {
    id: 'sentarse',
    label: 'Sentarse',
    options: [
      { label: 'Inseguro', score: 0 },
      { label: 'Usa los brazos o no tiene un movimiento suave', score: 1 },
      { label: 'Seguro, movimiento suave', score: 2 },
    ],
  },
];

export const TINETTI_GAIT: ScaleItemDef[] = [
  {
    id: 'inicio_marcha',
    label: 'Comienzo de la marcha (inmediatamente después de decir «camine»)',
    options: [
      {
        label: 'Duda o vacila, o múltiples intentos para comenzar',
        score: 0,
      },
      { label: 'No vacilante', score: 1 },
    ],
  },
  {
    id: 'paso_der_longitud',
    sectionLabel: 'Longitud y altura del paso',
    label: '',
    options: [
      {
        label:
          'El pie derecho no sobrepasa al izquierdo con el paso en la fase de balanceo',
        score: 0,
      },
      { label: 'El pie derecho sobrepasa al izquierdo', score: 1 },
    ],
  },
  {
    id: 'paso_der_altura',
    sectionLabel: 'Longitud y altura del paso',
    label: '',
    options: [
      {
        label:
          'El pie derecho no se levanta completamente del suelo con el paso en la fase del balanceo',
        score: 0,
      },
      { label: 'El pie derecho se levanta completamente', score: 1 },
    ],
  },
  {
    id: 'paso_izq_longitud',
    sectionLabel: 'Longitud y altura del paso',
    label: '',
    options: [
      {
        label:
          'El pie izquierdo no sobrepasa al derecho con el paso en la fase del balanceo',
        score: 0,
      },
      { label: 'El pie izquierdo sobrepasa al derecho con el paso', score: 1 },
    ],
  },
  {
    id: 'paso_izq_altura',
    sectionLabel: 'Longitud y altura del paso',
    label: '',
    options: [
      {
        label:
          'El pie izquierdo no se levanta completamente del suelo con el paso en la fase de balanceo',
        score: 0,
      },
      { label: 'El pie izquierdo se levanta completamente', score: 1 },
    ],
  },
  {
    id: 'simetria',
    label: 'Simetría del paso',
    options: [
      {
        label:
          'La longitud del paso con el pie derecho e izquierdo es diferente (estimada)',
        score: 0,
      },
      { label: 'Los pasos son iguales en longitud', score: 1 },
    ],
  },
  {
    id: 'continuidad',
    label: 'Continuidad de los pasos',
    options: [
      { label: 'Para o hay discontinuidad entre pasos', score: 0 },
      { label: 'Los pasos son continuos', score: 1 },
    ],
  },
  {
    id: 'trayectoria',
    label:
      'Trayectoria (estimada en relación con los baldosines del suelo de 30 cm. de diámetro; se observa la desviación de un pie en 3 cm. de distancia)',
    options: [
      { label: 'Marcada desviación', score: 0 },
      {
        label: 'Desviación moderada o media, o utiliza ayuda',
        score: 1,
      },
      { label: 'Derecho sin utilizar ayudas', score: 2 },
    ],
  },
  {
    id: 'tronco',
    label: 'Tronco',
    options: [
      { label: 'Marcado balanceo o utiliza ayudas', score: 0 },
      {
        label:
          'No balanceo, pero hay flexión de rodillas o espalda o extensión hacia fuera de los brazos',
        score: 1,
      },
      { label: 'No balanceo no flexión, ni utiliza ayudas', score: 2 },
    ],
  },
  {
    id: 'postura',
    label: 'Postura en la marcha',
    options: [
      { label: 'Talones separados', score: 0 },
      { label: 'Talones casi se tocan mientras camina', score: 1 },
    ],
  },
];

export const TINETTI_BALANCE_MAX = tinettiMaxScore(TINETTI_BALANCE);
export const TINETTI_GAIT_MAX = tinettiMaxScore(TINETTI_GAIT);
export const TINETTI_TOTAL_MAX = TINETTI_BALANCE_MAX + TINETTI_GAIT_MAX;

export const PFEIFFER_QUESTIONS: { id: string; label: string; hint?: string }[] = [
  { id: 'q1', label: '¿Cuál es la fecha de hoy?', hint: 'Día, mes y año' },
  { id: 'q2', label: '¿Qué día de la semana es?' },
  { id: 'q3', label: '¿En qué lugar estamos?', hint: 'Cualquier descripción correcta' },
  { id: 'q4', label: '¿Cuál es su teléfono o dirección completa?' },
  { id: 'q5', label: '¿Cuántos años tiene?' },
  { id: 'q6', label: '¿Dónde nació?' },
  { id: 'q7', label: '¿Cuál es el nombre del presidente?' },
  { id: 'q8', label: '¿Cuál es el nombre del presidente anterior?' },
  { id: 'q9', label: '¿Cuál es el nombre de soltera de su madre?' },
  {
    id: 'q10',
    label: 'Reste de tres en tres desde 29',
    hint: 'Cualquier error hace errónea la respuesta',
  },
];

export function pfeifferResponseKey(questionId: string): string {
  return `${questionId}Respuesta`;
}

export function interpretPfeiffer(errors: number): string {
  if (errors <= 2) return 'Valoración cognitiva normal';
  if (errors <= 4) return 'Deterioro leve';
  if (errors <= 7) return 'Deterioro moderado';
  return 'Deterioro severo';
}

/** GDS Yesavage — score 1 = síntoma depresivo para esa pregunta */
export interface GdsQuestion {
  id: string;
  label: string;
  detail?: string;
  yesScore: number;
}

export function gdsNoScore(yesScore: number): number {
  return 1 - yesScore;
}

export const GDS_QUESTIONS: GdsQuestion[] = [
  {
    id: 'g1',
    label: '¿En general, está satisfecho(a) con su vida?',
    yesScore: 0,
  },
  {
    id: 'g2',
    label: '¿Ha abandonado muchas de sus tareas habituales y aficiones?',
    yesScore: 1,
  },
  {
    id: 'g3',
    label: '¿Siente que su vida está vacía?',
    yesScore: 1,
  },
  {
    id: 'g4',
    label: '¿Se siente con frecuencia aburrido(a)?',
    yesScore: 1,
  },
  {
    id: 'g5',
    label: '¿Se encuentra de buen humor la mayor parte del tiempo?',
    yesScore: 0,
  },
  {
    id: 'g6',
    label: '¿Teme que algo malo pueda ocurrirle?',
    yesScore: 1,
  },
  {
    id: 'g7',
    label: '¿Se siente feliz la mayor parte del tiempo?',
    yesScore: 0,
  },
  {
    id: 'g8',
    label: '¿Con frecuencia se siente desamparado(a), desprotegido(a)?',
    yesScore: 1,
  },
  {
    id: 'g9',
    label: '¿Prefiere usted quedarse en casa, más que salir y hacer cosas nuevas?',
    yesScore: 1,
  },
  {
    id: 'g10',
    label: '¿Cree que tiene más problemas de memoria que la mayoría de la gente?',
    yesScore: 1,
  },
  {
    id: 'g11',
    label: '¿En estos momentos, piensa que es estupendo estar vivo(a)?',
    yesScore: 0,
  },
  {
    id: 'g12',
    label: '¿Actualmente se siente un(a) inútil?',
    yesScore: 1,
  },
  {
    id: 'g13',
    label: '¿Se siente lleno(a) de energía?',
    yesScore: 0,
  },
  {
    id: 'g14',
    label: '¿Se siente sin esperanza en este momento?',
    yesScore: 1,
  },
  {
    id: 'g15',
    label: '¿Piensa que la mayoría de la gente está en mejor situación que usted?',
    yesScore: 1,
  },
];

export function interpretGds(total: number): string {
  if (total <= 4) return 'Normal, sin síntomas depresivos';
  if (total <= 8) return 'Depresión leve';
  if (total <= 11) return 'Depresión moderada';
  return 'Depresión grave';
}

export const SALUD_PERCEPCION = [
  'Muy bueno',
  'Bueno',
  'Término medio',
  'Malo',
  'Muy malo',
] as const;
