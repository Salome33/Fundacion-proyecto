/** Definiciones de escalas gerontológicas (opciones + puntuación automática). */

export interface ScaleOption {
  label: string;
  score: number;
}

export interface ScaleItemDef {
  id: string;
  label: string;
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
      label: 'Trasladarse (silla ↔ cama)',
      options: [
        { label: 'Independiente', score: 15 },
        { label: 'Mínima ayuda o supervisión', score: 10 },
        { label: 'Gran ayuda pero se mantiene sentado', score: 5 },
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
      label: 'A. Capacidad para usar el teléfono',
      options: [
        { label: 'Usa el teléfono por iniciativa propia', score: 1 },
        { label: 'Marca números conocidos', score: 1 },
        { label: 'Contesta pero no marca', score: 1 },
        { label: 'No usa el teléfono', score: 0 },
      ],
    },
    {
      id: 'compras',
      label: 'B. Ir de compras',
      options: [
        { label: 'Todas las compras con independencia', score: 1 },
        { label: 'Compras pequeñas solo', score: 0 },
        { label: 'Necesita compañía para comprar', score: 0 },
        { label: 'Incapaz de ir de compras', score: 0 },
      ],
    },
    {
      id: 'comida',
      label: 'C. Preparación de la comida',
      options: [
        { label: 'Planea, prepara y sirve solo', score: 1 },
        { label: 'Prepara si le dan ingredientes', score: 0 },
        { label: 'Calienta/sirve sin dieta adecuada', score: 0 },
        { label: 'Necesita que le preparen la comida', score: 0 },
      ],
    },
    {
      id: 'casa',
      label: 'D. Cuidar la casa',
      options: [
        { label: 'Solo o ayuda ocasional (trabajos pesados)', score: 1 },
        { label: 'Tareas ligeras (fregar, cama)', score: 1 },
        { label: 'Ligeras pero limpieza no aceptable', score: 1 },
        { label: 'Ayuda en todas las tareas', score: 1 },
        { label: 'No participa', score: 0 },
      ],
    },
    {
      id: 'ropa',
      label: 'E. Lavado de ropa',
      options: [
        { label: 'Lavado completo personal', score: 1 },
        { label: 'Lava ropa pequeña', score: 1 },
        { label: 'Otro se ocupa del lavado', score: 0 },
      ],
    },
    {
      id: 'transporte',
      label: 'F. Medio de transporte',
      options: [
        { label: 'Transporte público o conduce solo', score: 1 },
        { label: 'Taxi propio, no transporte público', score: 1 },
        { label: 'Público solo con acompañante', score: 1 },
        { label: 'Solo taxi/auto con ayuda', score: 0 },
        { label: 'No viaja', score: 0 },
      ],
    },
    {
      id: 'medicacion',
      label: 'G. Responsabilidad sobre la medicación',
      options: [
        { label: 'Toma medicación correcta solo', score: 1 },
        { label: 'Toma si le preparan dosis', score: 0 },
        { label: 'No es capaz de responsabilizarse', score: 0 },
      ],
    },
    {
      id: 'dinero',
      label: 'H. Capacidad de utilizar el dinero',
      options: [
        { label: 'Finanzas independientes', score: 1 },
        { label: 'Gastos diarios; ayuda en banco', score: 1 },
        { label: 'Incapaz de manejar dinero', score: 0 },
      ],
    },
  ],
  interpret: (t) =>
    t >= 8 ? 'Independencia en AIVD' : t >= 5 ? 'Dependencia parcial' : 'Alta dependencia en AIVD',
};

/** Tinetti — equilibrio (15) + marcha (12); items con scores variables. */
export const TINETTI_BALANCE: ScaleItemDef[] = [
  {
    id: 'eq_sentado',
    label: 'Equilibrio sentado',
    options: [
      { label: 'Se inclina o desliza hacia delante en la silla', score: 0 },
      { label: 'Se mantiene firme y seguro en la silla', score: 1 },
    ],
  },
  {
    id: 'levantarse',
    label: 'Levantarse',
    options: [
      { label: 'Incapaz de levantarse sin ayuda', score: 0 },
      { label: 'Capaz de levantarse usando las manos o apoyándose en el brazo de la silla', score: 1 },
      { label: 'Capaz de levantarse sin usar las manos', score: 2 },
    ],
  },
  {
    id: 'intentos_levantarse',
    label: 'Intentos de levantarse',
    options: [
      { label: 'Incapaz de levantarse sin ayuda', score: 0 },
      { label: 'Capaz de levantarse, pero necesita más de un intento', score: 1 },
      { label: 'Capaz de levantarse al primer intento', score: 2 },
    ],
  },
  {
    id: 'eq_inmediato',
    label: 'Equilibrio inmediato al levantarse',
    options: [
      { label: 'Inestable; tambalea, se mueve los pies, balancea el tronco', score: 0 },
      { label: 'Estable, pero se apoya en andador, bastón u otra ayuda', score: 1 },
      { label: 'Estable sin apoyo de bastón ni otras ayudas', score: 2 },
    ],
  },
  {
    id: 'eq_biped',
    label: 'Equilibrio en bipedestación',
    options: [
      { label: 'Inestable', score: 0 },
      { label: 'Estable, pero con base amplia o apoyándose en ayuda externa', score: 1 },
      { label: 'Estable con base estrecha sin apoyo externo', score: 2 },
    ],
  },
  {
    id: 'empujon',
    label: 'Empujón (ligero empujón en el esternón, con los pies juntos)',
    options: [
      { label: 'Comienza a caer', score: 0 },
      { label: 'Tambalea, agita los brazos, pero se mantiene en pie', score: 1 },
      { label: 'Estable', score: 2 },
    ],
  },
  {
    id: 'ojos_cerrados',
    label: 'Ojos cerrados (con los pies juntos)',
    options: [
      { label: 'Inestable', score: 0 },
      { label: 'Estable', score: 1 },
    ],
  },
  {
    id: 'giro_360',
    label: 'Giro 360°',
    options: [
      { label: 'Pasos discontinuos', score: 0 },
      { label: 'Pasos continuos y estables', score: 1 },
    ],
  },
  {
    id: 'sentarse',
    label: 'Sentarse',
    options: [
      { label: 'Inseguro; calcula mal la distancia, cae en la silla', score: 0 },
      { label: 'Usa las manos o el movimiento no es suave', score: 1 },
      { label: 'Seguro, movimiento suave y bien controlado', score: 2 },
    ],
  },
];

export const TINETTI_GAIT: ScaleItemDef[] = [
  {
    id: 'inicio_marcha',
    label: 'Comienzo de la marcha (inmediatamente después de «marcha»)',
    options: [
      { label: 'Cualquier vacilación o múltiples intentos para iniciar la marcha', score: 0 },
      { label: 'No vacilante', score: 1 },
    ],
  },
  {
    id: 'paso_der_longitud',
    label: 'Longitud del paso — pie derecho',
    options: [
      {
        label: 'El pie derecho no pasa la posición del pie izquierdo con el paso',
        score: 0,
      },
      {
        label: 'El pie derecho pasa la posición del pie izquierdo con el paso',
        score: 1,
      },
    ],
  },
  {
    id: 'paso_der_altura',
    label: 'Altura del paso — pie derecho',
    options: [
      { label: 'El pie derecho no se eleva completamente del suelo', score: 0 },
      { label: 'El pie derecho se eleva completamente del suelo', score: 1 },
    ],
  },
  {
    id: 'paso_izq_longitud',
    label: 'Longitud del paso — pie izquierdo',
    options: [
      {
        label: 'El pie izquierdo no pasa la posición del pie derecho con el paso',
        score: 0,
      },
      {
        label: 'El pie izquierdo pasa la posición del pie derecho con el paso',
        score: 1,
      },
    ],
  },
  {
    id: 'paso_izq_altura',
    label: 'Altura del paso — pie izquierdo',
    options: [
      { label: 'El pie izquierdo no se eleva completamente del suelo', score: 0 },
      { label: 'El pie izquierdo se eleva completamente del suelo', score: 1 },
    ],
  },
  {
    id: 'simetria',
    label: 'Simetría del paso',
    options: [
      { label: 'Las longitudes de los pasos derecho e izquierdo no son iguales', score: 0 },
      { label: 'Las longitudes de los pasos parecen iguales', score: 1 },
    ],
  },
  {
    id: 'continuidad',
    label: 'Continuidad de los pasos',
    options: [
      { label: 'Se detiene entre pasos', score: 0 },
      { label: 'Los pasos son continuos', score: 1 },
    ],
  },
  {
    id: 'trayectoria',
    label: 'Trayectoria (observar el trazado de un pie durante varios pasos)',
    options: [
      { label: 'Desviación marcada', score: 0 },
      { label: 'Desviación leve o usa ayuda para la marcha', score: 1 },
      { label: 'Recta sin ayudas', score: 2 },
    ],
  },
  {
    id: 'tronco',
    label: 'Tronco',
    options: [
      { label: 'Balanceo marcado o usa ayuda para la marcha', score: 0 },
      { label: 'No hay balanceo, pero flexión de rodillas o espalda, o usa los brazos para estabilizarse', score: 1 },
      { label: 'No hay balanceo, flexión, uso de ayudas ni abducción de brazos', score: 2 },
    ],
  },
  {
    id: 'postura',
    label: 'Postura en la marcha',
    options: [
      { label: 'Los talones están separados', score: 0 },
      { label: 'Los talones casi se tocan mientras camina', score: 1 },
    ],
  },
];

export const PFEIFFER_QUESTIONS: { id: string; label: string; hint?: string }[] = [
  { id: 'q1', label: '¿Cuál es la fecha de hoy?', hint: 'Día, mes y año' },
  { id: 'q2', label: '¿Qué día de la semana es?' },
  { id: 'q3', label: '¿En qué lugar estamos?', hint: 'Cualquier descripción correcta' },
  { id: 'q4', label: '¿Cuál es su teléfono o dirección completa?' },
  { id: 'q5', label: '¿Cuántos años tiene?' },
  { id: 'q6', label: '¿Dónde nació?' },
  { id: 'q7', label: '¿Nombre del presidente actual?' },
  { id: 'q8', label: '¿Nombre del presidente anterior?' },
  { id: 'q9', label: '¿Nombre de soltera de su madre?' },
  { id: 'q10', label: 'Reste de tres en tres desde 20', hint: 'Cualquier error invalida' },
];

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
  detail: string;
  yesScore: number;
}

export const GDS_QUESTIONS: GdsQuestion[] = [
  {
    id: 'g1',
    label: '¿Está básicamente satisfecho(a) con su vida?',
    detail: 'Respuesta «No» sugiere insatisfacción con la vida actual.',
    yesScore: 0,
  },
  {
    id: 'g2',
    label: '¿Ha abandonado muchas de sus actividades e intereses?',
    detail: 'Respuesta «Sí» indica pérdida de interés o abandono de actividades habituales.',
    yesScore: 1,
  },
  {
    id: 'g3',
    label: '¿Siente que su vida está vacía?',
    detail: 'Respuesta «Sí» refleja sensación de vacío existencial.',
    yesScore: 1,
  },
  {
    id: 'g4',
    label: '¿Se aburre con frecuencia?',
    detail: 'Respuesta «Sí» indica aburrimiento frecuente en la última semana.',
    yesScore: 1,
  },
  {
    id: 'g5',
    label: '¿Está de buen humor la mayor parte del tiempo?',
    detail: 'Respuesta «No» sugiere ánimo bajo de forma persistente.',
    yesScore: 0,
  },
  {
    id: 'g6',
    label: '¿Teme que algo malo le vaya a suceder?',
    detail: 'Respuesta «Sí» refleja temor o preocupación anticipatoria.',
    yesScore: 1,
  },
  {
    id: 'g7',
    label: '¿Se siente feliz la mayor parte del tiempo?',
    detail: 'Respuesta «No» indica disminución de la sensación de felicidad.',
    yesScore: 0,
  },
  {
    id: 'g8',
    label: '¿Se siente a menudo desamparado(a) o desamparada?',
    detail: 'Respuesta «Sí» refleja sensación de desamparo o falta de apoyo.',
    yesScore: 1,
  },
  {
    id: 'g9',
    label: '¿Prefiere quedarse en casa en lugar de salir y hacer cosas nuevas?',
    detail: 'Respuesta «Sí» indica retraimiento social o preferencia por permanecer en casa.',
    yesScore: 1,
  },
  {
    id: 'g10',
    label: '¿Cree que tiene más problemas de memoria que la mayoría de las personas?',
    detail: 'Respuesta «Sí» sugiere percepción de deterioro mnésico.',
    yesScore: 1,
  },
  {
    id: 'g11',
    label: '¿Piensa que vivir es maravilloso?',
    detail: 'Respuesta «No» refleja disminución del entusiasmo por la vida.',
    yesScore: 0,
  },
  {
    id: 'g12',
    label: '¿Se siente inútil tal como está ahora?',
    detail: 'Respuesta «Sí» indica sentimientos de inutilidad.',
    yesScore: 1,
  },
  {
    id: 'g13',
    label: '¿Se siente lleno(a) de energía?',
    detail: 'Respuesta «No» sugiere disminución de la energía o vitalidad.',
    yesScore: 0,
  },
  {
    id: 'g14',
    label: '¿Siente que su situación es desesperada?',
    detail: 'Respuesta «Sí» refleja sensación de desesperanza.',
    yesScore: 1,
  },
  {
    id: 'g15',
    label: '¿Cree que la mayoría de las personas están mejor que usted?',
    detail: 'Respuesta «Sí» indica comparación negativa con los demás.',
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
