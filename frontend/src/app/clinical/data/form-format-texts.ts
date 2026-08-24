/** Textos introductorios y legales del formato clínico. */

export const VGI_TEXTO = `La Valoración Gerontogeriátrica Integral (VGI) es un proceso sistemático, interdisciplinario y multidimensional que permite evaluar de manera integral el estado de salud y las condiciones biopsicosociales de la persona adulta mayor. Comprende la valoración de los aspectos físicos, funcionales, cognitivos, emocionales, nutricionales, sociales y del entorno, con el propósito de identificar necesidades, riesgos, capacidades y factores que puedan influir en su bienestar y calidad de vida.

Los resultados de esta valoración sirven como base para la formulación de un plan de atención individualizado, orientado a la promoción de la salud, la prevención de complicaciones, el mantenimiento de la autonomía funcional, la rehabilitación cuando sea necesaria y el seguimiento continuo de la evolución del adulto mayor. De esta manera, la VGI constituye una herramienta fundamental para garantizar una atención integral, humanizada y centrada en la persona.

En los Centros de Protección Social para el Adulto Mayor, la Valoración Gerontogeriátrica Integral representa una herramienta esencial para garantizar una atención humanizada, segura y de calidad, ya que permite realizar un seguimiento periódico de la evolución funcional y clínica de cada residente, detectar oportunamente cambios en su estado de salud, prevenir eventos adversos y fortalecer las estrategias de promoción del envejecimiento saludable.`;

export const TINETTI_BALANCE_INTRO =
  'Instrucciones: sujeto sentado en una silla sin brazos';

export const TINETTI_GAIT_INTRO =
  'Instrucciones: el sujeto de pie con el examinador camina primero con su paso habitual, regresando con ' +
  '«paso rápido, pero seguro» (usando sus ayudas habituales para la marcha, como bastón o andador)';

export const TINETTI_INTERPRET = (total: number): string => {
  if (total >= 24) return 'Bajo riesgo de caídas';
  if (total >= 19) return 'Riesgo moderado de caídas';
  return 'Alto riesgo de caídas';
};

export const PFEIFFER_INTRO = 'Marque las respuestas incorrectas.';

export const GDS_INTRO =
  'Vea directamente a la persona, logre su atención y explíquele:\n\n' +
  '«Le voy a hacer algunas preguntas para evaluar su estado de ánimo, tome en cuenta únicamente ' +
  'como se ha sentido durante la última semana, por favor responda con Si o No».\n\n' +
  'Hágale a la persona las preguntas de la Escala de Depresión Geriátrica en el orden indicado a continuación:';

export const DECLARACION_TEXTO =
  'El contratante o acudiente manifiesta que la Fundación Manos Unidas de Dios le ha suministrado de ' +
  'manera clara, suficiente y oportuna toda la información relacionada con el funcionamiento del ' +
  'Centro de Protección Social para el Adulto Mayor, incluyendo los servicios ofrecidos, el reglamento ' +
  'interno, los estatutos, los principios institucionales, los derechos y deberes de los usuarios y ' +
  'sus familias, así como las condiciones para el ingreso y permanencia del adulto mayor.\n\n' +
  'En consecuencia, declara que conoce, comprende y acepta el contenido de dichos documentos, ' +
  'manifestando su total conformidad con las normas y políticas institucionales. Asimismo, se ' +
  'compromete a cumplir y hacer cumplir las disposiciones establecidas por la Fundación, colaborando ' +
  'con el adecuado desarrollo de los procesos de atención y bienestar del adulto mayor.\n\n' +
  'De igual manera, bajo la gravedad del juramento, declara que toda la información y documentación ' +
  'suministrada a la Fundación es veraz, completa y auténtica. En caso de que posteriormente se ' +
  'evidencie que la información aportada es falsa, inexacta, incompleta o que se hayan ocultado ' +
  'hechos relevantes para el proceso de admisión o permanencia del adulto mayor, autoriza a la ' +
  'Fundación para adoptar las medidas administrativas correspondientes y adelantar las acciones ' +
  'legales a que haya lugar, sin perjuicio de las responsabilidades civiles, penales o de cualquier ' +
  'otra naturaleza que puedan derivarse de tales hechos.\n\n' +
  'Para constancia, firma la presente declaración de manera libre y voluntaria.';

export const CONCEPTO_INSTITUCIONAL_TITULO =
  'Concepto institucional para la aprobación del ingreso del adulto mayor';

export const PROFESIONALES_TITULO =
  'Firma de los profesionales que diligencian la ficha de ingreso y valoración clínica';
