/** Lista estática del índice del formulario /nuevo (sin dependencias circulares). */
export interface IntakeIndexItem {
  path: string;
  anchor: string;
  label: string;
}

export const INTAKE_INDEX_ITEMS: IntakeIndexItem[] = [
  { path: 'contrato', anchor: 'contrato', label: 'Contrato e ingreso' },
  { path: 'personal', anchor: 'personal', label: 'Información personal' },
  { path: 'economica', anchor: 'economica', label: 'Información económica' },
  { path: 'familiar', anchor: 'familiar', label: 'Información familiar y social' },
  { path: 'hijos', anchor: 'hijos', label: 'Información de los hijos' },
  { path: 'referencias-personales', anchor: 'referencias', label: 'Referencias y acudientes' },
  { path: 'acudiente', anchor: 'acudiente', label: 'Información del acudiente' },
  { path: 'valoracion-clinica', anchor: 'valoracion-clinica', label: 'Valoración clínica' },
  { path: 'alergias', anchor: 'alergias', label: 'Alergias' },
  { path: 'medicamentos', anchor: 'medicamentos', label: 'Medicamentos' },
  { path: 'autopercepcion', anchor: 'autopercepcion', label: 'Autopercepción de la salud' },
  { path: 'anamnesis', anchor: 'anamnesis', label: 'Anamnesis' },
  { path: 'condicion-general', anchor: 'condicion-general', label: 'Condición general' },
  { path: 'practicas-riesgo', anchor: 'practicas-riesgo', label: 'Prácticas con riesgo para la salud' },
  { path: 'remision-especialistas', anchor: 'remision-especialistas', label: 'Remisión de especialistas' },
  { path: 'examen', anchor: 'examen', label: 'Examen físico' },
  { path: 'sistemas', anchor: 'sistemas', label: 'Valor frecuencia respiratoria en un minuto' },
  { path: 'examen-mental', anchor: 'mental', label: 'Examen mental' },
  { path: 'antecedentes', anchor: 'antecedentes', label: 'Antecedentes' },
  { path: 'antecedentes-caidas', anchor: 'antecedentes-caidas', label: 'Antecedentes de caídas' },
  { path: 'vitales', anchor: 'vitales', label: 'Signos vitales' },
  { path: 'cuerpo-grafico', anchor: 'cuerpo-grafico', label: 'Descripción gráfica del cuerpo' },
  { path: 'vgi', anchor: 'vgi', label: 'Valoración gerontogeriátrica integral (VGI)' },
  { path: 'escala-barthel', anchor: 'escala-barthel', label: 'Índice de Barthel' },
  { path: 'escala-lawton', anchor: 'escala-lawton', label: 'Escala de Lawton' },
  { path: 'escala-tinetti-equilibrio', anchor: 'escala-tinetti-equilibrio', label: 'Tinetti — Equilibrio' },
  { path: 'escala-tinetti-marcha', anchor: 'escala-tinetti-marcha', label: 'Tinetti — Marcha' },
  { path: 'escala-pfeiffer', anchor: 'escala-pfeiffer', label: 'Pfeiffer (SPMSQ)' },
  { path: 'escala-gds', anchor: 'escala-gds', label: 'GDS Yesavage' },
  {
    path: 'concepto-institucional',
    anchor: 'concepto-institucional',
    label: 'Concepto institucional — aprobación ingreso',
  },
  {
    path: 'aprobacion-independiente',
    anchor: 'aprobacion-independiente',
    label: 'Aprobación persona independiente',
  },
  {
    path: 'aprobacion-familia',
    anchor: 'aprobacion-familia',
    label: 'Aprobación con limitación decisiones',
  },
  { path: 'declaracion', anchor: 'declaracion', label: 'Declaración del acudiente' },
  { path: 'profesionales', anchor: 'profesionales', label: 'Firmas profesionales' },
];
