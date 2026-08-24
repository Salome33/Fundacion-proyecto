import { IntakeRecord } from './intake-store.service';
import { sectionHasData } from './section-display';

/** Texto resumido para tarjetas de listado por apartado. */
export function sectionCardSummary(sectionId: string, rec: IntakeRecord): string {
  const data = rec.data;
  const updated = rec.updatedAt ?? rec.createdAt;
  const dateStr = new Date(updated).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (!sectionHasData(sectionId, data)) {
    return `Sin registro en este apartado · ficha del ${dateStr}`;
  }

  const labels: Record<string, string> = {
    personal: 'Datos personales registrados',
    economica: 'Información económica',
    familiar: 'Información familiar y social',
    hijos: 'Hijos registrados',
    'referencias-personales': 'Referencias personales',
    acudiente: 'Datos del acudiente',
    'valoracion-clinica': 'Valoración clínica general',
    patologias: 'Patologías diagnosticadas',
    alergias: 'Alergias registradas',
    medicamentos: 'Medicamentos actuales',
    autopercepcion: 'Autopercepción de la salud',
    anamnesis: 'Anamnesis',
    'condicion-general': 'Condición general',
    'practicas-riesgo': 'Prácticas con riesgo para la salud',
    'remision-especialistas': 'Remisión de especialistas',
    examen: 'Examen físico',
    sistemas: 'Valor frecuencia respiratoria en un minuto',
    'examen-mental': 'Examen mental',
    antecedentes: 'Antecedentes',
    'antecedentes-caidas': 'Antecedentes de caídas',
    vitales: 'Último registro de signos vitales',
    'cuerpo-grafico': 'Descripción gráfica corporal',
    escalas: 'Escalas gerontogeriátricas',
    'concepto-institucional': 'Concepto institucional para la aprobación del ingreso del adulto mayor',
    'declaraciones-firmas': 'Declaraciones y firmas',
  };

  const lead = labels[sectionId] ?? 'Información registrada';
  return `${lead} · actualizado ${dateStr}`;
}
