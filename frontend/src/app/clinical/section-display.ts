/** Filas de solo lectura para acordeones inferiores por apartado. */

export interface DisplayRow {
  label: string;
  value: string;
}

function g(data: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let cur: unknown = data;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') {
      return undefined;
    }
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function fmt(v: unknown): string {
  if (v === null || v === undefined || v === '') {
    return '—';
  }
  if (typeof v === 'boolean') {
    return v ? 'Sí' : 'No';
  }
  return String(v);
}

function groupHasValues(obj: unknown): boolean {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  return Object.values(obj as Record<string, unknown>).some(
    (v) => v !== '' && v !== null && v !== false,
  );
}

const PERSONAL_KEYS: { key: string; label: string }[] = [
  { key: 'fechaIngreso', label: 'Fecha ingreso' },
  { key: 'nombreApellidos', label: 'Nombre' },
  { key: 'identificacion', label: 'Identificación' },
  { key: 'edad', label: 'Edad' },
  { key: 'sexo', label: 'Sexo' },
  { key: 'eps', label: 'EPS' },
  { key: 'modalidad', label: 'Modalidad' },
];

export function sectionHasData(sectionId: string, data: Record<string, unknown>): boolean {
  switch (sectionId) {
    case 'contrato':
      return fmt(g(data, 'contratoNumero')) !== '—';
    case 'personal':
      return groupHasValues(g(data, 'personal'));
    case 'economica':
      return groupHasValues(g(data, 'economica'));
    case 'familiar':
      return groupHasValues(g(data, 'familiar'));
    case 'hijos':
      return ((g(data, 'hijos') as unknown[]) ?? []).length > 0;
    case 'referencias':
      return (
        ((g(data, 'referencias') as unknown[]) ?? []).length > 0 ||
        ((g(data, 'acudientes') as unknown[]) ?? []).length > 0
      );
    case 'clinica':
      return (
        groupHasValues(g(data, 'clinica')) ||
        ((g(data, 'clinica.medicamentos') as unknown[]) ?? []).length > 0
      );
    case 'autopercepcion':
      return fmt(g(data, 'autopercepcion.estadoSalud')) !== '—';
    case 'riesgo':
      return (
        ((g(data, 'especialistas') as unknown[]) ?? []).length > 0 ||
        ((g(data, 'riesgoSalud') as unknown[]) ?? []).some((r) => groupHasValues(r))
      );
    case 'examen':
      return groupHasValues(g(data, 'examenFisico'));
    case 'sistemas':
      return groupHasValues(g(data, 'revisionSistemas'));
    case 'mental':
      return groupHasValues(g(data, 'examenMental'));
    case 'vitales':
      return groupHasValues(g(data, 'signosVitales'));
    case 'cuerpo-grafico':
      return (
        fmt(g(data, 'descripcionCuerpoObservaciones')) !== '—' ||
        fmt(g(data, 'bodyPaintImage')) !== '—'
      );
    case 'escalas':
      return groupHasValues(g(data, 'escalas')) || fmt(g(data, 'escalasObservaciones')) !== '—';
    case 'vgi':
      return fmt(g(data, 'personal.nombreApellidos')) !== '—';
    case 'cierre':
      return groupHasValues(g(data, 'conceptoInstitucional'));
    case 'referencias-personales':
      return ((g(data, 'referencias') as unknown[]) ?? []).length > 0;
    case 'acudiente':
      return ((g(data, 'acudientes') as unknown[]) ?? []).length > 0;
    case 'valoracion-clinica':
      return fmt(g(data, 'observacionesGenerales')) !== '—' || groupHasValues(g(data, 'clinica'));
    case 'patologias':
      return fmt(g(data, 'clinica.patologia')) !== '—';
    case 'alergias':
      return (
        fmt(g(data, 'clinica.alergiasMed')) !== '—' ||
        fmt(g(data, 'clinica.alergiasAlim')) !== '—' ||
        fmt(g(data, 'clinica.alergiasOtros')) !== '—'
      );
    case 'medicamentos':
      return ((g(data, 'clinica.medicamentos') as unknown[]) ?? []).length > 0;
    case 'anamnesis':
      return (
        fmt(g(data, 'autopercepcion.anamnesisAspecto')) !== '—' ||
        fmt(g(data, 'autopercepcion.anamnesisEmocional')) !== '—' ||
        fmt(g(data, 'autopercepcion.anamnesisFisico')) !== '—'
      );
    case 'condicion-general':
      return (
        fmt(g(data, 'autopercepcion.higienico')) !== '—' ||
        fmt(g(data, 'autopercepcion.nutricional')) !== '—' ||
        fmt(g(data, 'autopercepcion.ayudaMovilizarse')) !== '—'
      );
    case 'practicas-riesgo':
      return ((g(data, 'riesgoSalud') as unknown[]) ?? []).some((r) => groupHasValues(r));
    case 'remision-especialistas':
      return ((g(data, 'especialistas') as unknown[]) ?? []).length > 0;
    case 'examen-mental':
      return groupHasValues(g(data, 'examenMental'));
    case 'antecedentes':
      return groupHasValues(g(data, 'antecedentes'));
    case 'antecedentes-caidas':
      return groupHasValues(g(data, 'antecedentesCaidas'));
    case 'concepto-institucional':
      return groupHasValues(g(data, 'conceptoInstitucional'));
    case 'declaraciones-firmas':
      return (
        groupHasValues(g(data, 'declaracion')) ||
        groupHasValues(g(data, 'profesionales')) ||
        fmt(g(data, 'conceptoInstitucional.firmas')) !== '—'
      );
    default:
      return false;
  }
}

export function sectionDisplayRows(sectionId: string, data: Record<string, unknown>): DisplayRow[] {
  const rows: DisplayRow[] = [];
  const pushGroup = (prefix: string, keys: { key: string; label: string }[]) => {
    for (const k of keys) {
      rows.push({ label: k.label, value: fmt(g(data, `${prefix}.${k.key}`)) });
    }
  };

  switch (sectionId) {
    case 'contrato':
      rows.push({ label: 'Contrato Nº', value: fmt(g(data, 'contratoNumero')) });
      break;
    case 'personal':
      pushGroup('personal', PERSONAL_KEYS);
      break;
    case 'economica':
      pushGroup('economica', [
        { key: 'ingresosDe', label: 'Ingresos' },
        { key: 'viviendaTipo', label: 'Vivienda' },
        { key: 'direccion', label: 'Dirección' },
      ]);
      break;
    case 'familiar':
      pushGroup('familiar', [
        { key: 'conQuienVive', label: 'Convive con' },
        { key: 'cuidadorPrincipal', label: 'Cuidador' },
        { key: 'razonIngreso', label: 'Razón ingreso' },
      ]);
      break;
    case 'hijos':
      ((g(data, 'hijos') as Record<string, string>[]) ?? []).forEach((h, i) => {
        rows.push({
          label: `Hijo ${i + 1}`,
          value: `${h['nombre'] ?? '—'} · ${h['contacto'] ?? ''}`,
        });
      });
      break;
    case 'referencias':
      ((g(data, 'referencias') as Record<string, string>[]) ?? []).forEach((r, i) => {
        rows.push({
          label: `Referencia ${i + 1}`,
          value: `${r['nombre'] ?? '—'} · ${r['relacion'] ?? ''}`,
        });
      });
      ((g(data, 'acudientes') as Record<string, string>[]) ?? []).forEach((a, i) => {
        rows.push({
          label: `Acudiente ${i + 1}`,
          value: `${a['nombre'] ?? '—'} · ${a['parentesco'] ?? ''}`,
        });
      });
      break;
    case 'clinica':
      rows.push({ label: 'Patología', value: fmt(g(data, 'clinica.patologia')) });
      ((g(data, 'clinica.medicamentos') as Record<string, string>[]) ?? []).forEach((m, i) => {
        const formula = m['soporteFormulaNombre']?.trim()
          ? ` · Fórmula: ${m['soporteFormulaNombre']}`
          : m['soporteFormulaPdf']
            ? ' · Fórmula PDF adjunta'
            : '';
        rows.push({
          label: `Medicamento ${i + 1}`,
          value: `${m['nombre'] ?? '—'} — ${m['dosis'] ?? ''}${formula}`,
        });
      });
      break;
    case 'autopercepcion':
      rows.push({ label: 'Estado de salud', value: fmt(g(data, 'autopercepcion.estadoSalud')) });
      break;
    case 'riesgo':
      ((g(data, 'especialistas') as Record<string, string>[]) ?? []).forEach((e, i) => {
        rows.push({ label: `Especialista ${i + 1}`, value: e['especialidad'] ?? '—' });
      });
      break;
    case 'examen':
      pushGroup('examenFisico', [
        { key: 'piel', label: 'Piel' },
        { key: 'torax', label: 'Tórax' },
        { key: 'abdomen', label: 'Abdomen' },
      ]);
      break;
    case 'sistemas':
      pushGroup('revisionSistemas', [
        { key: 'respiratorio', label: 'Respiratorio' },
        { key: 'cardiovascular', label: 'Cardiovascular' },
      ]);
      break;
    case 'mental':
      rows.push({ label: 'Actitud', value: fmt(g(data, 'examenMental.actitud')) });
      break;
    case 'vitales':
      rows.push({ label: 'TA', value: fmt(g(data, 'signosVitales.ta')) });
      rows.push({ label: 'FC', value: fmt(g(data, 'signosVitales.fc')) });
      rows.push({ label: 'IMC', value: fmt(g(data, 'signosVitales.imc')) });
      break;
    case 'cuerpo-grafico':
      rows.push({
        label: 'Observaciones',
        value: fmt(g(data, 'descripcionCuerpoObservaciones')),
      });
      rows.push({
        label: 'Marcas en modelo 3D',
        value:
          fmt(g(data, 'bodyPaintImage')) !== '—'
            ? 'Guardadas (puede modificarlas en el visor 3D)'
            : 'Sin marcas guardadas',
      });
      break;
    case 'escalas':
      rows.push({ label: 'Observaciones', value: fmt(g(data, 'escalasObservaciones')) });
      rows.push({ label: 'Escalas', value: 'Barthel, Lawton, Tinetti, Pfeiffer, GDS' });
      break;
    case 'vgi':
      rows.push({
        label: 'VGI',
        value: 'Valoración gerontogeriátrica integral — plan de atención individualizado.',
      });
      break;
    case 'cierre':
      rows.push({ label: 'Concepto', value: fmt(g(data, 'conceptoInstitucional.favorable')) });
      rows.push({
        label: 'Justificación',
        value: fmt(g(data, 'conceptoInstitucional.justificacion')),
      });
      break;
    case 'referencias-personales':
      ((g(data, 'referencias') as Record<string, string>[]) ?? []).forEach((r, i) => {
        rows.push({
          label: `Referencia ${i + 1}`,
          value: `${r['nombre'] ?? '—'} · ${r['relacion'] ?? ''}`,
        });
      });
      break;
    case 'acudiente':
      ((g(data, 'acudientes') as Record<string, string>[]) ?? []).forEach((a, i) => {
        rows.push({
          label: `Acudiente ${i + 1}`,
          value: `${a['nombre'] ?? '—'} · ${a['parentesco'] ?? ''}`,
        });
      });
      break;
    case 'valoracion-clinica':
      rows.push({ label: 'Observaciones generales', value: fmt(g(data, 'observacionesGenerales')) });
      break;
    case 'patologias':
      rows.push({ label: 'Patología', value: fmt(g(data, 'clinica.patologia')) });
      break;
    case 'alergias':
      rows.push({ label: 'Medicamentos', value: fmt(g(data, 'clinica.alergiasMed')) });
      rows.push({ label: 'Alimentos', value: fmt(g(data, 'clinica.alergiasAlim')) });
      rows.push({ label: 'Otros', value: fmt(g(data, 'clinica.alergiasOtros')) });
      break;
    case 'medicamentos':
      ((g(data, 'clinica.medicamentos') as Record<string, string>[]) ?? []).forEach((m, i) => {
        const formula = m['soporteFormulaNombre']?.trim()
          ? ` · Fórmula: ${m['soporteFormulaNombre']}`
          : m['soporteFormulaPdf']
            ? ' · Fórmula PDF adjunta'
            : '';
        rows.push({
          label: `Medicamento ${i + 1}`,
          value: `${m['nombre'] ?? '—'} — ${m['dosis'] ?? ''} (${m['horarios'] ?? ''})${formula}`,
        });
      });
      break;
    case 'anamnesis':
      rows.push({ label: 'Aspecto', value: fmt(g(data, 'autopercepcion.anamnesisAspecto')) });
      rows.push({ label: 'Emocional', value: fmt(g(data, 'autopercepcion.anamnesisEmocional')) });
      rows.push({ label: 'Físico', value: fmt(g(data, 'autopercepcion.anamnesisFisico')) });
      break;
    case 'condicion-general':
      rows.push({ label: 'Higiénico', value: fmt(g(data, 'autopercepcion.higienico')) });
      rows.push({ label: 'Nutricional', value: fmt(g(data, 'autopercepcion.nutricional')) });
      rows.push({ label: 'Movilidad', value: fmt(g(data, 'autopercepcion.ayudaMovilizarse')) });
      break;
    case 'practicas-riesgo':
      ((g(data, 'riesgoSalud') as Record<string, string>[]) ?? []).forEach((r, i) => {
        rows.push({ label: `Práctica ${i + 1}`, value: r['practica'] ?? r['descripcion'] ?? '—' });
      });
      break;
    case 'remision-especialistas':
      ((g(data, 'especialistas') as Record<string, string>[]) ?? []).forEach((e, i) => {
        rows.push({ label: `Especialista ${i + 1}`, value: e['especialidad'] ?? '—' });
      });
      break;
    case 'examen-mental':
      rows.push({ label: 'Actitud', value: fmt(g(data, 'examenMental.actitud')) });
      rows.push({ label: 'Memoria', value: fmt(g(data, 'examenMental.memoria')) });
      rows.push({ label: 'Lenguaje', value: fmt(g(data, 'examenMental.lenguaje')) });
      break;
    case 'antecedentes':
      rows.push({ label: 'Patológicos', value: fmt(g(data, 'antecedentes.patologicos')) });
      rows.push({ label: 'Quirúrgicos', value: fmt(g(data, 'antecedentes.quirurgicos')) });
      rows.push({ label: 'Farmacológicos', value: fmt(g(data, 'antecedentes.farmacologicos')) });
      rows.push({ label: 'Alérgicos', value: fmt(g(data, 'antecedentes.alergicos')) });
      rows.push({ label: 'Cáncer', value: fmt(g(data, 'antecedentes.cancer')) });
      break;
    case 'antecedentes-caidas':
      rows.push({
        label: 'Caídas propia altura',
        value: fmt(g(data, 'antecedentesCaidas.caidasPropiaAltura')),
      });
      rows.push({ label: 'Riesgo de caída', value: fmt(g(data, 'antecedentesCaidas.riesgoCaida')) });
      break;
    case 'concepto-institucional':
      rows.push({ label: 'Concepto', value: fmt(g(data, 'conceptoInstitucional.favorable')) });
      rows.push({
        label: 'Justificación',
        value: fmt(g(data, 'conceptoInstitucional.justificacion')),
      });
      break;
    case 'declaraciones-firmas':
      rows.push({ label: 'Declarante', value: fmt(g(data, 'declaracion.nombre')) });
      rows.push({ label: 'Documento', value: fmt(g(data, 'declaracion.documento')) });
      rows.push({ label: 'Profesional', value: fmt(g(data, 'profesionales.nombre')) });
      rows.push({ label: 'Firmas (concepto)', value: fmt(g(data, 'conceptoInstitucional.firmas')) });
      break;
  }
  return rows.filter((r) => r.value !== '—');
}

export function addButtonLabel(sectionLabel: string): string {
  return `Agregar ${sectionLabel.toLowerCase()}`;
}

export function accordionBarTitle(sectionLabel: string, personName: string): string {
  return `${sectionLabel} de ${personName}`;
}
