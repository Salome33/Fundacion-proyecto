import { FormArray, FormGroup } from '@angular/forms';
import {
  EXAMEN_FISICO_REGIONS,
  EXAMEN_MENTAL_FIELDS,
  INCONTINENCIA_CHECK_ITEMS,
  RESPIRATORIO_REVISION_FIELDS,
  VALOR_FR_EN_UN_MINUTO,
} from './data/exam-definitions';

export type SectionFieldInputType = 'text' | 'textarea' | 'date' | 'pdf' | 'signature' | 'photo';

export interface SectionEditField {
  label: string;
  path: string;
  inputType?: SectionFieldInputType;
}

function pushScalar(
  fields: SectionEditField[],
  label: string,
  path: string,
  inputType: SectionFieldInputType = 'text',
): void {
  fields.push({ label, path, inputType });
}

function pushGroup(
  fields: SectionEditField[],
  prefix: string,
  keys: { key: string; label: string; inputType?: SectionFieldInputType }[],
): void {
  for (const k of keys) {
    const inputType =
      k.inputType ?? (k.key.toLowerCase().includes('fecha') ? 'date' : 'text');
    pushScalar(fields, k.label, `${prefix}.${k.key}`, inputType);
  }
}

function pushArrayGroup(
  fields: SectionEditField[],
  array: FormArray,
  basePath: string,
  itemLabel: string,
  keys: { key: string; label: string; inputType?: SectionFieldInputType }[],
  minRows = 0,
): void {
  const count = Math.max(array.length, minRows);
  for (let i = 0; i < count; i++) {
    for (const k of keys) {
      pushScalar(
        fields,
        `${itemLabel} ${i + 1} — ${k.label}`,
        `${basePath}.${i}.${k.key}`,
        k.inputType ?? 'text',
      );
    }
  }
}

function pushExamenFisico(fields: SectionEditField[]): void {
  for (const region of EXAMEN_FISICO_REGIONS) {
    for (const f of region.fields) {
      pushScalar(
        fields,
        `${region.label} — ${f.label}`,
        `examenFisico.${region.id}.${f.id}`,
        'textarea',
      );
    }
  }
  pushScalar(fields, 'Incontinencia — ¿Presenta?', 'examenFisico.incontinencia.presenta');
  pushScalar(fields, 'Incontinencia — Momento', 'examenFisico.incontinencia.momento');
  for (const item of INCONTINENCIA_CHECK_ITEMS) {
    pushScalar(
      fields,
      `Incontinencia — ${item.label}`,
      `examenFisico.incontinencia.${item.id}`,
      'textarea',
    );
  }
  for (const field of RESPIRATORIO_REVISION_FIELDS) {
    pushScalar(
      fields,
      `Revisión por sistemas — Respiratorio — ${field.label}`,
      `revisionSistemas.respiratorio.${field.id}`,
      'textarea',
    );
  }
}

function pushRevisionSistemas(fields: SectionEditField[]): void {
  for (const item of VALOR_FR_EN_UN_MINUTO) {
    pushScalar(fields, item.label, `revisionSistemas.${item.id}`, 'textarea');
  }
}

function pushExamenMental(fields: SectionEditField[]): void {
  for (const f of EXAMEN_MENTAL_FIELDS) {
    pushScalar(fields, f.label, `examenMental.${f.id}`, 'textarea');
  }
}

function pushAprobacionFields(fields: SectionEditField[], prefix: string): void {
  pushGroup(fields, prefix, [
    { key: 'fecha', label: 'Fecha' },
    { key: 'favorable', label: 'Concepto' },
    { key: 'justificacion', label: 'Justificación', inputType: 'textarea' },
    { key: 'firmas', label: 'Firmas', inputType: 'signature' },
  ]);
}

/** Campos editables del apartado, enlazados al formulario clínico. */
export function sectionEditFields(form: FormGroup, sectionId: string): SectionEditField[] {
  const fields: SectionEditField[] = [];

  switch (sectionId) {
    case 'contrato':
      pushScalar(fields, 'Contrato Nº', 'contratoNumero');
      break;
    case 'personal':
      pushGroup(fields, 'personal', [
        { key: 'fechaIngreso', label: 'Fecha ingreso' },
        { key: 'fechaActualizacion', label: 'Fecha actualización' },
        { key: 'modalidad', label: 'Modalidad' },
        { key: 'nombreApellidos', label: 'Nombre y apellidos' },
        { key: 'identificacion', label: 'Identificación' },
        { key: 'lugarExpedicion', label: 'Lugar expedición' },
        { key: 'fechaExpedicion', label: 'Fecha expedición' },
        { key: 'lugarNacimiento', label: 'Lugar nacimiento' },
        { key: 'fechaNacimiento', label: 'Fecha nacimiento' },
        { key: 'edad', label: 'Edad' },
        { key: 'rh', label: 'RH' },
        { key: 'sexo', label: 'Sexo' },
        { key: 'estadoCivil', label: 'Estado civil' },
        { key: 'nombreConyuge', label: 'Nombre del cónyuge' },
        { key: 'estudios', label: 'Estudios cursados' },
        { key: 'eps', label: 'EPS' },
        { key: 'regimen', label: 'Régimen' },
        { key: 'lugarAtencion', label: 'Lugar de atención' },
        { key: 'serviciosFunerarios', label: 'Servicios funerarios' },
        { key: 'profesion', label: 'Profesión' },
        { key: 'confesionReligiosa', label: 'Confesión religiosa' },
        { key: 'foto', label: 'Foto', inputType: 'photo' },
      ]);
      break;
    case 'economica':
      pushGroup(fields, 'economica', [
        { key: 'ingresosDe', label: 'Los ingresos económicos son de' },
        { key: 'apoyoGubernamental', label: 'Apoyo gubernamental' },
        { key: 'viviendaTipo', label: 'Tipo vivienda' },
        { key: 'direccion', label: 'Dirección' },
      ]);
      break;
    case 'familiar':
      pushGroup(fields, 'familiar', [
        { key: 'nombrePadre', label: 'Nombre del padre' },
        { key: 'nombreMadre', label: 'Nombre de la madre' },
        {
          key: 'conQuienVive',
          label: '¿Con quién vive actualmente el adulto mayor?',
        },
        {
          key: 'cuidadorPrincipal',
          label: '¿Quién es el principal cuidador o responsable de su atención?',
        },
        {
          key: 'familiaresCercanos',
          label: '¿Cuenta con familiares cercanos? ¿Quiénes son?',
        },
        {
          key: 'relacionFamilia',
          label: '¿Cómo es la relación el adulto mayor con su familia?',
          inputType: 'textarea',
        },
        {
          key: 'decisionEmergencia',
          label: '¿Existe alguna persona responsable de tomar decisiones en caso de emergencia?',
        },
        {
          key: 'actividadesSociales',
          label: '¿El adulto mayor participa de actividades sociales, comunitarias o religiosas?',
          inputType: 'textarea',
        },
        {
          key: 'antecedentesMaltrato',
          label: '¿Presenta antecedentes de abandono, maltrato o negligencia?',
          inputType: 'textarea',
        },
      ]);
      break;
    case 'hijos':
      pushArrayGroup(fields, form.get('hijos') as FormArray, 'hijos', 'Hijo', [
        { key: 'nombre', label: 'Nombre y apellidos' },
        { key: 'contacto', label: 'Contacto' },
        { key: 'email', label: 'Correo electrónico' },
      ]);
      pushGroup(fields, 'familiar', [
        {
          key: 'expectativas',
          label:
            '¿Qué expectativas tiene la familia o el adulto mayor respecto a la atención que recibirá?',
          inputType: 'textarea',
        },
        {
          key: 'razonIngreso',
          label: '¿Cuál es la razón principal por la que solicita el ingreso a la institución?',
          inputType: 'textarea',
        },
      ]);
      break;
    case 'referencias':
      pushArrayGroup(fields, form.get('referencias') as FormArray, 'referencias', 'Referencia', [
        { key: 'nombre', label: 'Nombre y apellido' },
        { key: 'contacto', label: 'Contacto' },
        { key: 'direccion', label: 'Dirección' },
        { key: 'relacion', label: 'Relación' },
        { key: 'foto', label: 'Foto', inputType: 'photo' },
      ]);
      pushArrayGroup(fields, form.get('acudientes') as FormArray, 'acudientes', 'Acudiente', [
        { key: 'nombre', label: 'Nombre' },
        { key: 'identificacion', label: 'Identificación' },
        { key: 'contacto', label: 'Contacto' },
        { key: 'email', label: 'Correo' },
        { key: 'direccion', label: 'Dirección' },
        { key: 'ingresosDependen', label: 'Los ingresos económicos dependen de:' },
        { key: 'parentesco', label: 'Parentesco' },
        { key: 'foto', label: 'Foto', inputType: 'photo' },
      ]);
      break;
    case 'referencias-personales':
      pushArrayGroup(fields, form.get('referencias') as FormArray, 'referencias', 'Referencia', [
        { key: 'nombre', label: 'Nombre y apellido' },
        { key: 'contacto', label: 'Contacto' },
        { key: 'direccion', label: 'Dirección' },
        { key: 'relacion', label: 'Relación' },
        { key: 'foto', label: 'Foto', inputType: 'photo' },
      ]);
      break;
    case 'acudiente':
      pushArrayGroup(fields, form.get('acudientes') as FormArray, 'acudientes', 'Acudiente', [
        { key: 'nombre', label: 'Nombre' },
        { key: 'identificacion', label: 'Identificación' },
        { key: 'contacto', label: 'Contacto' },
        { key: 'email', label: 'Correo' },
        { key: 'direccion', label: 'Dirección' },
        { key: 'ingresosDependen', label: 'Los ingresos económicos dependen de:' },
        { key: 'parentesco', label: 'Parentesco' },
        { key: 'foto', label: 'Foto', inputType: 'photo' },
      ]);
      break;
    case 'valoracion-clinica':
      pushScalar(fields, 'Observaciones generales', 'observacionesGenerales', 'textarea');
      break;
    case 'patologias':
      pushScalar(fields, 'Patología diagnosticada', 'clinica.patologia', 'textarea');
      break;
    case 'clinica':
      pushScalar(fields, 'Patología', 'clinica.patologia', 'textarea');
      pushScalar(fields, 'Alergias medicamentos', 'clinica.alergiasMed', 'textarea');
      pushScalar(fields, 'Alergias alimentos', 'clinica.alergiasAlim', 'textarea');
      pushScalar(fields, 'Otras alergias', 'clinica.alergiasOtros', 'textarea');
      pushArrayGroup(
        fields,
        (form.get('clinica') as FormGroup).get('medicamentos') as FormArray,
        'clinica.medicamentos',
        'Medicamento',
        [
          { key: 'nombre', label: 'Nombre' },
          { key: 'dosis', label: 'Dosis' },
          { key: 'horarios', label: 'Horarios' },
        ],
      );
      pushScalar(
        fields,
        'Soporte fórmula médica (PDF)',
        'clinica.soporteFormulaPdf',
        'pdf',
      );
      break;
    case 'alergias':
      pushScalar(fields, 'Alergias medicamentos', 'clinica.alergiasMed', 'textarea');
      pushScalar(fields, 'Alergias alimentos', 'clinica.alergiasAlim', 'textarea');
      pushScalar(fields, 'Otras alergias', 'clinica.alergiasOtros', 'textarea');
      break;
    case 'medicamentos':
      pushArrayGroup(
        fields,
        (form.get('clinica') as FormGroup).get('medicamentos') as FormArray,
        'clinica.medicamentos',
        'Medicamento',
        [
          { key: 'nombre', label: 'Nombre' },
          { key: 'dosis', label: 'Dosis' },
          { key: 'horarios', label: 'Horarios' },
        ],
      );
      pushScalar(
        fields,
        'Soporte fórmula médica (PDF)',
        'clinica.soporteFormulaPdf',
        'pdf',
      );
      break;
    case 'autopercepcion':
      pushGroup(fields, 'autopercepcion', [{ key: 'estadoSalud', label: 'Estado de salud' }]);
      break;
    case 'anamnesis':
      pushGroup(fields, 'autopercepcion', [
        { key: 'anamnesisAspecto', label: 'Aspecto a primera vista', inputType: 'textarea' },
        { key: 'anamnesisEmocional', label: 'Emocional', inputType: 'textarea' },
        { key: 'anamnesisFisico', label: 'Físico', inputType: 'textarea' },
      ]);
      break;
    case 'condicion-general':
      pushGroup(fields, 'autopercepcion', [
        { key: 'higienico', label: 'Higiénico' },
        { key: 'nutricional', label: 'Nutricional' },
        { key: 'ayudaMovilizarse', label: '¿Necesita ayuda para movilizarse?' },
        { key: 'inmovilizacion', label: '¿El adulto mayor necesita ser inmovilizado?' },
        { key: 'autorizaInmovilizacion', label: '¿Autoriza la inmovilización?' },
        { key: 'caminaSolo', label: '¿Camina solo?' },
        { key: 'caminaBaston', label: '¿Camina con ayuda de bastón?' },
        { key: 'sillaRuedas', label: '¿Movilización en silla de ruedas?' },
        { key: 'mss', label: 'MSS' },
        { key: 'mii', label: 'MII' },
      ]);
      break;
    case 'practicas-riesgo':
      pushGroup(fields, 'riesgoSalud.tabaco', [
        { key: 'consume', label: 'Tabaco — consume' },
        { key: 'frecuencia', label: 'Tabaco — frecuencia' },
      ]);
      pushGroup(fields, 'riesgoSalud.alcohol', [
        { key: 'consume', label: 'Alcohol — consume' },
        { key: 'frecuencia', label: 'Alcohol — frecuencia' },
      ]);
      pushGroup(fields, 'riesgoSalud.otraSustancia', [
        { key: 'nombre', label: 'Otra sustancia — nombre' },
        { key: 'frecuencia', label: 'Otra sustancia — frecuencia' },
      ]);
      pushArrayGroup(
        fields,
        ((form.get('riesgoSalud') as FormGroup).get('otrasSustancias') as FormArray),
        'riesgoSalud.otrasSustancias',
        'Otra sustancia',
        [
          { key: 'nombre', label: 'Nombre' },
          { key: 'frecuencia', label: 'Frecuencia' },
        ],
      );
      break;
    case 'riesgo':
    case 'remision-especialistas':
      pushArrayGroup(
        fields,
        form.get('especialistas') as FormArray,
        'especialistas',
        'Especialista',
        [
          { key: 'especialidad', label: 'Especialidad' },
          { key: 'frecuencia', label: 'Frecuencia' },
          { key: 'tratamiento', label: 'Tratamiento' },
        ],
      );
      if (sectionId === 'riesgo') {
        pushGroup(fields, 'riesgoSalud.tabaco', [
          { key: 'consume', label: 'Tabaco — consume' },
          { key: 'frecuencia', label: 'Tabaco — frecuencia' },
        ]);
        pushGroup(fields, 'riesgoSalud.alcohol', [
          { key: 'consume', label: 'Alcohol — consume' },
          { key: 'frecuencia', label: 'Alcohol — frecuencia' },
        ]);
      }
      break;
    case 'examen':
      pushExamenFisico(fields);
      break;
    case 'sistemas':
      pushRevisionSistemas(fields);
      break;
    case 'mental':
    case 'examen-mental':
      pushExamenMental(fields);
      break;
    case 'antecedentes':
      pushGroup(fields, 'antecedentes', [
        { key: 'quirurgicos', label: 'Quirúrgicos', inputType: 'textarea' },
        { key: 'patologicos', label: 'Patológicos', inputType: 'textarea' },
        { key: 'farmacologicos', label: 'Farmacológicos', inputType: 'textarea' },
        { key: 'alergicos', label: 'Alérgicos', inputType: 'textarea' },
        { key: 'cancer', label: 'Cáncer', inputType: 'textarea' },
      ]);
      break;
    case 'antecedentes-caidas':
      pushGroup(fields, 'antecedentesCaidas', [
        { key: 'caidasPropiaAltura', label: '¿Caídas desde su propia altura?' },
        { key: 'riesgoCaida', label: 'Riesgo de caída', inputType: 'textarea' },
      ]);
      break;
    case 'vitales':
      pushGroup(fields, 'signosVitales', [
        { key: 'ta', label: 'TA' },
        { key: 'fc', label: 'FC' },
        { key: 'fr', label: 'FR' },
        { key: 'spo2', label: 'SpO2' },
        { key: 'peso', label: 'Peso (kg)' },
        { key: 'talla', label: 'Talla (cm)' },
        { key: 'imc', label: 'IM' },
      ]);
      break;
    case 'cuerpo-grafico':
      pushScalar(fields, 'Observaciones corporales', 'descripcionCuerpoObservaciones', 'textarea');
      break;
    case 'escalas':
      pushScalar(fields, 'Observaciones escalas', 'escalasObservaciones', 'textarea');
      break;
    case 'vgi':
      pushScalar(fields, 'Plan VGI / observaciones', 'observacionesGenerales', 'textarea');
      break;
    case 'cierre':
    case 'concepto-institucional':
      pushGroup(fields, 'conceptoInstitucional', [
        { key: 'fecha', label: 'Fecha' },
        { key: 'favorable', label: 'Concepto' },
        { key: 'justificacion', label: 'Justificación', inputType: 'textarea' },
        { key: 'firmas', label: 'Firmas', inputType: 'signature' },
      ]);
      break;
    case 'aprobacion-independiente':
      pushAprobacionFields(fields, 'aprobacionIndependiente');
      break;
    case 'aprobacion-familia':
      pushAprobacionFields(fields, 'aprobacionFamilia');
      break;
    case 'declaracion':
      pushGroup(fields, 'declaracion', [
        { key: 'nombre', label: 'Nombre' },
        { key: 'documento', label: 'Documento' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'firma', label: 'Firma', inputType: 'signature' },
      ]);
      break;
    case 'profesionales':
      pushArrayGroup(
        fields,
        form.get('profesionales') as FormArray,
        'profesionales',
        'Profesional',
        [
          { key: 'nombre', label: 'Nombre del profesional' },
          { key: 'cargo', label: 'Cargo' },
          { key: 'documento', label: 'Documento' },
          { key: 'fecha', label: 'Fecha' },
          { key: 'firma', label: 'Firma', inputType: 'signature' },
        ],
      );
      break;
    case 'declaraciones-firmas':
      pushGroup(fields, 'declaracion', [
        { key: 'nombre', label: 'Declarante' },
        { key: 'documento', label: 'Documento' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'firma', label: 'Firma', inputType: 'signature' },
      ]);
      pushArrayGroup(
        fields,
        form.get('profesionales') as FormArray,
        'profesionales',
        'Profesional',
        [
          { key: 'nombre', label: 'Nombre' },
          { key: 'cargo', label: 'Cargo' },
          { key: 'documento', label: 'Documento' },
          { key: 'fecha', label: 'Fecha' },
          { key: 'firma', label: 'Firma', inputType: 'signature' },
        ],
      );
      pushGroup(fields, 'conceptoInstitucional', [
        { key: 'fecha', label: 'Concepto — fecha' },
        { key: 'favorable', label: 'Concepto — favorable' },
        { key: 'justificacion', label: 'Concepto — justificación', inputType: 'textarea' },
        { key: 'firmas', label: 'Concepto — firmas', inputType: 'signature' },
      ]);
      break;
  }

  return fields;
}
