import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  GDS_QUESTIONS,
  PFEIFFER_QUESTIONS,
  TINETTI_BALANCE,
  TINETTI_GAIT,
} from './data/scale-definitions';
import {
  EXAMEN_FISICO_REGIONS,
  EXAMEN_MENTAL_FIELDS,
  INCONTINENCIA_CHECK_ITEMS,
  FR_CONDICION_FIELDS,
  REVISION_SISTEMAS_OTROS,
  VALOR_FR_EN_UN_MINUTO,
} from './data/exam-definitions';

const HIJO_ROW_KEYS = ['nombre', 'contacto', 'email'] as const;
const REFERENCIA_ROW_KEYS = ['nombre', 'contacto', 'direccion', 'relacion', 'foto'] as const;
const ACUDIENTE_ROW_KEYS = [
  'nombre',
  'identificacion',
  'contacto',
  'email',
  'direccion',
  'ingresosDependen',
  'parentesco',
  'foto',
] as const;
const MEDICAMENTO_ROW_KEYS = [
  'nombre',
  'dosis',
  'horarios',
  'soporteFormulaPdf',
  'soporteFormulaNombre',
] as const;
const ESPECIALISTA_ROW_KEYS = ['especialidad', 'frecuencia', 'tratamiento'] as const;
const PROFESIONAL_ROW_KEYS = ['nombre', 'cargo', 'documento', 'fecha', 'firma'] as const;
const SUSTANCIA_ROW_KEYS = ['nombre', 'frecuencia'] as const;

function isBlankField(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string') {
    return value.trim() === '';
  }
  if (typeof value === 'boolean' || typeof value === 'number') {
    return false;
  }
  return false;
}

function rowHasContent(row: unknown, keys: readonly string[]): boolean {
  if (!row || typeof row !== 'object') {
    return false;
  }
  const record = row as Record<string, unknown>;
  return keys.some((key) => !isBlankField(record[key]));
}

function filterNonEmptyRows(rows: unknown, keys: readonly string[]): unknown[] {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows.filter((row) => rowHasContent(row, keys));
}

@Injectable({ providedIn: 'root' })
export class ClinicalFormService {
  readonly form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      contratoNumero: [''],
      personal: this.fb.group({
        fechaIngreso: [''],
        fechaActualizacion: [''],
        modalidad: [''],
        nombreApellidos: ['', Validators.required],
        identificacion: [''],
        lugarExpedicion: [''],
        fechaExpedicion: [''],
        lugarNacimiento: [''],
        fechaNacimiento: [''],
        edad: [''],
        rh: [''],
        sexo: [''],
        estadoCivil: [''],
        nombreConyuge: [''],
        estudios: [''],
        eps: [''],
        regimen: [''],
        lugarAtencion: [''],
        serviciosFunerarios: [''],
        profesion: [''],
        confesionReligiosa: [''],
        foto: [''],
      }),
      economica: this.fb.group({
        ingresosDe: [''],
        apoyoGubernamental: [''],
        viviendaTipo: [''],
        direccion: [''],
      }),
      familiar: this.fb.group({
        nombreMadre: [''],
        nombrePadre: [''],
        conQuienVive: [''],
        cuidadorPrincipal: [''],
        familiaresCercanos: [''],
        frecuenciaVisitas: [''],
        relacionFamilia: [''],
        decisionEmergencia: [''],
        actividadesSociales: [''],
        antecedentesMaltrato: [''],
        expectativas: [''],
        razonIngreso: [''],
      }),
      hijos: this.fb.array([]),
      referencias: this.fb.array([]),
      acudientes: this.fb.array([]),
      observacionesGenerales: [''],
      clinica: this.fb.group({
        patologia: [''],
        alergiasMed: [''],
        alergiasAlim: [''],
        alergiasOtros: [''],
        medicamentos: this.fb.array([]),
      }),
      autopercepcion: this.fb.group({
        estadoSalud: [''],
        anamnesisAspecto: [''],
        anamnesisEmocional: [''],
        anamnesisFisico: [''],
        higienico: [''],
        nutricional: [''],
        ayudaMovilizarse: [''],
        inmovilizacion: [''],
        autorizaInmovilizacion: [''],
        caminaSolo: [''],
        caminaBaston: [''],
        sillaRuedas: [''],
        mss: [''],
        mii: [''],
      }),
      riesgoSalud: this.fb.group({
        tabaco: this.fb.group({ consume: [''], frecuencia: [''] }),
        alcohol: this.fb.group({ consume: [''], frecuencia: [''] }),
        otraSustancia: this.fb.group({ nombre: [''], frecuencia: [''] }),
        otrasSustancias: this.fb.array([]),
      }),
      especialistas: this.fb.array([]),
      examenFisico: this.buildExamenFisicoGroup(),
      revisionSistemas: this.buildRevisionSistemasGroup(),
      examenMental: this.buildExamenMentalGroup(),
      antecedentes: this.fb.group({
        quirurgicos: [''],
        patologicos: [''],
        farmacologicos: [''],
        alergicos: [''],
        cancer: [''],
      }),
      antecedentesCaidas: this.fb.group({
        caidasPropiaAltura: [''],
        riesgoCaida: [''],
      }),
      signosVitales: this.fb.group({
        ta: [''],
        fc: [''],
        fr: [''],
        spo2: [''],
        peso: [''],
        talla: [''],
        imc: [''],
      }),
      bodyPaintImage: [''],
      descripcionCuerpoObservaciones: [''],
      escalasObservaciones: [''],
      escalas: this.fb.group({
        barthel: this.fb.group({}),
        lawton: this.fb.group({}),
        tinettiBalance: this.fb.group({}),
        tinettiGait: this.fb.group({}),
        pfeiffer: this.fb.group({}),
        gds: this.fb.group({}),
      }),
      conceptoInstitucional: this.fb.group({
        fecha: [''],
        favorable: [''],
        justificacion: [''],
        firmas: this.fb.control<string[]>(['']),
      }),
      aprobacionIndependiente: this.fb.group({
        fecha: [''],
        favorable: [''],
        justificacion: [''],
        firmas: this.fb.control<string[]>(['']),
      }),
      aprobacionFamilia: this.fb.group({
        fecha: [''],
        favorable: [''],
        justificacion: [''],
        firmas: this.fb.control<string[]>(['']),
      }),
      declaracion: this.fb.group({
        nombre: [''],
        documento: [''],
        firma: [''],
        fecha: [''],
      }),
      profesionales: this.fb.array([]),
    });

    this.signosVitales.valueChanges.subscribe(() => this.recalcImc());
    this.initEscalasIfNeeded();
    this.setupIncontinenciaListeners();
  }

  private setupIncontinenciaListeners(): void {
    const group = this.examenFisicoGroup.get('incontinencia') as FormGroup;
    group.get('presenta')?.valueChanges.subscribe((value) => {
      if (value !== 'Sí') {
        group.patchValue({ momento: '' }, { emitEvent: false });
      }
    });
  }

  private buildRevisionSistemasGroup(): FormGroup {
    const fields: Record<string, ReturnType<FormBuilder['control']>> = {};
    for (const item of VALOR_FR_EN_UN_MINUTO) {
      fields[item.id] = this.fb.control('');
    }
    return this.fb.group(fields);
  }

  private buildExamenMentalGroup(): FormGroup {
    const fields: Record<string, ReturnType<FormBuilder['control']>> = {};
    for (const f of EXAMEN_MENTAL_FIELDS) {
      fields[f.id] = this.fb.control('');
    }
    return this.fb.group(fields);
  }

  private buildExamenFisicoGroup(): FormGroup {
    const regions: Record<string, FormGroup> = {};
    for (const region of EXAMEN_FISICO_REGIONS) {
      const fields: Record<string, ReturnType<FormBuilder['control']>> = {};
      for (const f of region.fields) {
        fields[f.id] = this.fb.control('');
      }
      regions[region.id] = this.fb.group(fields);
    }
    return this.fb.group({
      ...regions,
      incontinencia: this.fb.group({
        presenta: [''],
        momento: [''],
        ...Object.fromEntries(INCONTINENCIA_CHECK_ITEMS.map((item) => [item.id, ['']])),
      }),
    });
  }

  private escalasInitialized = false;

  initEscalasIfNeeded(): void {
    if (this.escalasInitialized) {
      return;
    }
    const escalas = this.form.get('escalas') as FormGroup;
    const pfeiffer = escalas.get('pfeiffer') as FormGroup;
    const gds = escalas.get('gds') as FormGroup;
    for (const q of PFEIFFER_QUESTIONS) {
      const existing = pfeiffer.get(q.id);
      if (existing instanceof FormGroup) {
        const wasError = Object.values(existing.value as Record<string, unknown>).some((v) => v === true);
        pfeiffer.setControl(q.id, this.fb.control(wasError));
        continue;
      }
      if (!pfeiffer.contains(q.id)) {
        pfeiffer.addControl(q.id, this.fb.control<boolean | null>(null));
      }
    }
    for (const q of GDS_QUESTIONS) {
      if (!gds.contains(q.id)) {
        gds.addControl(q.id, this.fb.control<'si' | 'no' | null>(null));
      }
    }
    for (const items of [TINETTI_BALANCE, TINETTI_GAIT]) {
      const key = items === TINETTI_BALANCE ? 'tinettiBalance' : 'tinettiGait';
      const g = escalas.get(key) as FormGroup;
      for (const it of items) {
        if (!g.contains(it.id)) {
          g.addControl(it.id, this.fb.control<number | null>(null));
        }
      }
    }
    this.escalasInitialized = true;
  }

  get hijos(): FormArray {
    return this.form.get('hijos') as FormArray;
  }

  get medicamentos(): FormArray {
    return this.form.get('clinica.medicamentos') as FormArray;
  }

  get profesionales(): FormArray {
    return this.form.get('profesionales') as FormArray;
  }

  get otrasSustancias(): FormArray {
    return (this.form.get('riesgoSalud') as FormGroup).get('otrasSustancias') as FormArray;
  }

  addHijo(): void {
    this.hijos.push(this.hijoGroup());
  }

  addMedicamento(): void {
    this.medicamentos.push(this.medicamentoGroup());
  }

  addEspecialista(): void {
    (this.form.get('especialistas') as FormArray).push(this.especialistaGroup());
  }

  addReferencia(): void {
    this.referencias.push(this.referenciaGroup());
  }

  addAcudiente(): void {
    this.acudientes.push(this.acudienteGroup());
  }

  addOtraSustancia(): void {
    this.otrasSustancias.push(this.sustanciaGroup());
  }

  addProfesional(): void {
    this.profesionales.push(this.profesionalGroup());
  }

  removeHijo(i: number): void {
    this.hijos.removeAt(i);
  }

  removeReferencia(i: number): void {
    this.referencias.removeAt(i);
  }

  removeAcudiente(i: number): void {
    this.acudientes.removeAt(i);
  }

  removeMedicamento(i: number): void {
    this.medicamentos.removeAt(i);
  }

  removeEspecialista(i: number): void {
    (this.form.get('especialistas') as FormArray).removeAt(i);
  }

  removeOtraSustancia(i: number): void {
    this.otrasSustancias.removeAt(i);
  }

  removeProfesional(i: number): void {
    this.profesionales.removeAt(i);
  }

  get referencias(): FormArray {
    return this.form.get('referencias') as FormArray;
  }

  get acudientes(): FormArray {
    return this.form.get('acudientes') as FormArray;
  }

  /** Elimina filas vacías del formulario en vivo (deja una plantilla si la sección queda vacía). */
  pruneEmptyFormRows(): void {
    this.pruneFormArray(this.hijos, HIJO_ROW_KEYS);
    this.pruneFormArray(this.referencias, REFERENCIA_ROW_KEYS);
    this.pruneFormArray(this.acudientes, ACUDIENTE_ROW_KEYS);
    this.pruneFormArray(this.medicamentos, MEDICAMENTO_ROW_KEYS);
    this.pruneFormArray(this.form.get('especialistas') as FormArray, ESPECIALISTA_ROW_KEYS);
    this.pruneFormArray(this.profesionales, PROFESIONAL_ROW_KEYS);
    this.pruneFormArray(this.otrasSustancias, SUSTANCIA_ROW_KEYS);
    this.ensureDefaultRows();
  }

  /** Valor del formulario listo para persistir (sin filas vacías en listas). */
  getSanitizedRawValue(): Record<string, unknown> {
    const raw = this.form.getRawValue() as Record<string, unknown>;
    return this.sanitizeRecordData(raw);
  }

  private sanitizeRecordData(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...data };
    sanitized['hijos'] = filterNonEmptyRows(data['hijos'], HIJO_ROW_KEYS);
    sanitized['referencias'] = filterNonEmptyRows(data['referencias'], REFERENCIA_ROW_KEYS);
    sanitized['acudientes'] = filterNonEmptyRows(data['acudientes'], ACUDIENTE_ROW_KEYS);
    sanitized['especialistas'] = filterNonEmptyRows(data['especialistas'], ESPECIALISTA_ROW_KEYS);
    sanitized['profesionales'] = filterNonEmptyRows(data['profesionales'], PROFESIONAL_ROW_KEYS);

    const clinica = { ...((data['clinica'] as Record<string, unknown>) ?? {}) };
    clinica['medicamentos'] = filterNonEmptyRows(clinica['medicamentos'], MEDICAMENTO_ROW_KEYS);
    sanitized['clinica'] = clinica;

    const riesgoSalud = { ...((data['riesgoSalud'] as Record<string, unknown>) ?? {}) };
    riesgoSalud['otrasSustancias'] = filterNonEmptyRows(
      riesgoSalud['otrasSustancias'],
      SUSTANCIA_ROW_KEYS,
    );
    sanitized['riesgoSalud'] = riesgoSalud;

    return sanitized;
  }

  private pruneFormArray(arr: FormArray, keys: readonly string[]): void {
    for (let i = arr.length - 1; i >= 0; i--) {
      const row = arr.at(i).getRawValue() as Record<string, unknown>;
      if (!rowHasContent(row, keys)) {
        arr.removeAt(i);
      }
    }
  }

  private clearFormForLoad(): void {
    this.form.reset();
    this.setArrayLength('hijos', 0);
    this.setArrayLength('referencias', 0);
    this.setArrayLength('acudientes', 0);
    this.setArrayLength('clinica.medicamentos', 0);
    this.setArrayLength('especialistas', 0);
    this.setArrayLength('profesionales', 0);
    this.initRiesgoSalud();
    this.resetFirmasArrays();
  }

  private loadFormArrayRows(
    add: () => void,
    arr: FormArray,
    rows: unknown,
    keys: readonly string[],
  ): void {
    for (const row of filterNonEmptyRows(rows, keys)) {
      add();
      arr.at(arr.length - 1).patchValue(row as object);
    }
  }

  resetForNewIntake(): void {
    this.form.reset();
    this.setArrayLength('hijos', 0);
    this.setArrayLength('referencias', 0);
    this.setArrayLength('acudientes', 0);
    this.setArrayLength('clinica.medicamentos', 0);
    this.setArrayLength('especialistas', 0);
    this.setArrayLength('profesionales', 0);
    this.initRiesgoSalud();
    this.ensureDefaultRows();
    this.resetFirmasArrays();
  }

  /** Al menos una fila en referencias, medicamentos, especialistas, acudiente e hijo. */
  ensureDefaultRows(): void {
    if (this.hijos.length === 0) {
      this.addHijo();
    }
    if (this.referencias.length === 0) {
      this.addReferencia();
    }
    if (this.medicamentos.length === 0) {
      this.addMedicamento();
    }
    if ((this.form.get('especialistas') as FormArray).length === 0) {
      this.addEspecialista();
    }
    if (this.acudientes.length === 0) {
      this.addAcudiente();
    }
    if (this.profesionales.length === 0) {
      this.initProfesionales();
    }
  }

  loadFromRecord(data: Record<string, unknown>): void {
    this.clearFormForLoad();
    this.migrateLegacyFields(data);

    this.loadFormArrayRows(() => this.addHijo(), this.hijos, data['hijos'], HIJO_ROW_KEYS);
    this.loadFormArrayRows(
      () => this.addReferencia(),
      this.referencias,
      data['referencias'],
      REFERENCIA_ROW_KEYS,
    );
    this.loadFormArrayRows(
      () => this.addAcudiente(),
      this.acudientes,
      data['acudientes'],
      ACUDIENTE_ROW_KEYS,
    );
    this.loadFormArrayRows(
      () => this.addMedicamento(),
      this.medicamentos,
      (data['clinica'] as Record<string, unknown> | undefined)?.['medicamentos'],
      MEDICAMENTO_ROW_KEYS,
    );
    this.loadFormArrayRows(
      () => this.addEspecialista(),
      this.form.get('especialistas') as FormArray,
      data['especialistas'],
      ESPECIALISTA_ROW_KEYS,
    );

    const profData = data['profesionales'];
    if (Array.isArray(profData)) {
      this.loadFormArrayRows(() => this.addProfesional(), this.profesionales, profData, PROFESIONAL_ROW_KEYS);
    } else if (profData && typeof profData === 'object' && rowHasContent(profData, PROFESIONAL_ROW_KEYS)) {
      this.addProfesional();
      this.profesionales.at(0).patchValue(profData as object);
    }

    const riesgo = data['riesgoSalud'];
    if (Array.isArray(riesgo)) {
      this.migrateLegacyRiesgo(riesgo as { detalle?: string; frecuencia?: string }[]);
    }

    const { hijos: _h, referencias: _r, acudientes: _a, especialistas: _e, profesionales: _p, ...rest } =
      data;
    const clinica = { ...(rest['clinica'] as object) };
    if (clinica && typeof clinica === 'object' && 'medicamentos' in clinica) {
      delete (clinica as Record<string, unknown>)['medicamentos'];
    }
    this.form.patchValue({ ...rest, clinica });
    this.normalizeFirmasFromRecord(data);
    this.ensureDefaultRows();
  }

  private migrateIncontinenciaMomento(source: Record<string, unknown>): string {
    const dia = !!source['panalDia'];
    const noche = !!source['panalNoche'];
    if (dia && noche) {
      return 'ambos';
    }
    if (dia) {
      return 'dia';
    }
    if (noche) {
      return 'noche';
    }
    return typeof source['momento'] === 'string' ? source['momento'] : '';
  }

  private migrateLegacyFields(data: Record<string, unknown>): void {
    const personal = data['personal'] as Record<string, unknown> | undefined;
    if (personal?.['lugarFechaExpedicion'] && !personal['lugarExpedicion']) {
      personal['lugarExpedicion'] = personal['lugarFechaExpedicion'];
    }
    if (personal?.['lugarFechaNacimiento'] && !personal['lugarNacimiento']) {
      personal['lugarNacimiento'] = personal['lugarFechaNacimiento'];
    }

    const examen = data['examenFisico'] as Record<string, unknown> | undefined;
    if (examen && typeof examen['incontinencia'] === 'string') {
      examen['incontinencia'] = {
        presenta: examen['incontinencia'],
        momento: this.migrateIncontinenciaMomento(examen),
        ...Object.fromEntries(INCONTINENCIA_CHECK_ITEMS.map((item) => [item.id, ''])),
      };
      delete examen['panalDia'];
      delete examen['panalNoche'];
    }

    const incont = examen?.['incontinencia'] as Record<string, unknown> | undefined;
    if (incont && typeof incont === 'object') {
      if (incont['panalDia'] !== undefined || incont['panalNoche'] !== undefined) {
        incont['momento'] = this.migrateIncontinenciaMomento(incont);
        delete incont['panalDia'];
        delete incont['panalNoche'];
      }
      for (const item of INCONTINENCIA_CHECK_ITEMS) {
        const val = incont[item.id];
        if (val === undefined || val === false) {
          incont[item.id] = '';
        } else if (val === true) {
          incont[item.id] = '';
        } else if (typeof val !== 'string') {
          incont[item.id] = String(val ?? '');
        }
      }
      if (incont['momento'] === undefined) {
        incont['momento'] = '';
      }
    }

    for (const region of EXAMEN_FISICO_REGIONS) {
      const val = examen?.[region.id];
      if (typeof val === 'string' && val) {
        examen![region.id] = { observaciones: val };
      }
    }

    const revision = data['revisionSistemas'] as Record<string, unknown> | undefined;
    if (revision?.['frecuenciaRespiratoria'] && typeof revision['frecuenciaRespiratoria'] === 'object') {
      const fr = revision['frecuenciaRespiratoria'] as Record<string, unknown>;
      for (const [key, val] of Object.entries(fr)) {
        if (revision[key] === undefined || revision[key] === '') {
          revision[key] = val;
        }
      }
      delete revision['frecuenciaRespiratoria'];
    }
    if (revision?.['frecuenciaRespiratoriaCondicion'] || revision?.['frecuenciaRespiratoriaObs']) {
      revision['estertores'] = revision['frecuenciaRespiratoriaCondicion'] ?? '';
      delete revision['frecuenciaRespiratoriaCondicion'];
      delete revision['frecuenciaRespiratoriaObs'];
    }
    if (revision?.['respiratorio'] && typeof revision['respiratorio'] === 'object') {
      delete revision['respiratorio'];
    }

    const ant = data['antecedentes'] as Record<string, unknown> | undefined;
    if (ant && ('caidasPropiaAltura' in ant || 'riesgoCaida' in ant)) {
      data['antecedentesCaidas'] = {
        caidasPropiaAltura: ant['caidasPropiaAltura'] ?? '',
        riesgoCaida: ant['riesgoCaida'] ?? '',
      };
      delete ant['caidasPropiaAltura'];
      delete ant['riesgoCaida'];
    }
  }

  private migrateLegacyRiesgo(rows: { detalle?: string; frecuencia?: string }[]): void {
    const g = this.form.get('riesgoSalud') as FormGroup;
    for (const row of rows) {
      const d = (row.detalle ?? '').toLowerCase();
      const freq = row.frecuencia ?? '';
      if (d.includes('tabaco')) {
        g.get('tabaco')?.patchValue({ consume: freq ? 'si' : '', frecuencia: freq });
      } else if (d.includes('alcohol')) {
        g.get('alcohol')?.patchValue({ consume: freq ? 'si' : '', frecuencia: freq });
      } else if (d.includes('otras')) {
        g.get('otraSustancia')?.patchValue({ nombre: '', frecuencia: freq });
      }
    }
  }

  private normalizeFirmasFromRecord(data: Record<string, unknown>): void {
    for (const key of [
      'conceptoInstitucional',
      'aprobacionIndependiente',
      'aprobacionFamilia',
    ]) {
      const block = data[key] as Record<string, unknown> | undefined;
      if (!block) continue;
      const firmas = block['firmas'];
      const g = this.form.get(key) as FormGroup;
      if (typeof firmas === 'string' && firmas) {
        g.get('firmas')?.setValue([firmas]);
      } else if (Array.isArray(firmas)) {
        g.get('firmas')?.setValue(firmas.length ? firmas : ['']);
      }
    }
  }

  private resetFirmasArrays(): void {
    for (const key of [
      'conceptoInstitucional',
      'aprobacionIndependiente',
      'aprobacionFamilia',
    ]) {
      (this.form.get(key) as FormGroup).get('firmas')?.setValue(['']);
    }
  }

  private setArrayLength(path: string, len: number): void {
    const parts = path.split('.');
    let arr: FormArray = this.form.get(path) as FormArray;
    if (parts.length === 2) {
      arr = this.form.get(parts[0])?.get(parts[1]) as FormArray;
    }
    while (arr.length > len) {
      arr.removeAt(arr.length - 1);
    }
  }

  private initRiesgoSalud(): void {
    const g = this.form.get('riesgoSalud') as FormGroup;
    g.reset({
      tabaco: { consume: '', frecuencia: '' },
      alcohol: { consume: '', frecuencia: '' },
      otraSustancia: { nombre: '', frecuencia: '' },
    });
    this.setArrayLength('riesgoSalud.otrasSustancias', 0);
  }

  private initProfesionales(): void {
    this.setArrayLength('profesionales', 0);
    this.addProfesional();
  }

  private recalcImc(): void {
    const g = this.signosVitales;
    const peso = parseFloat(g.get('peso')?.value);
    const tallaCm = parseFloat(g.get('talla')?.value);
    if (!peso || !tallaCm) {
      g.get('imc')?.setValue('', { emitEvent: false });
      return;
    }
    const m = tallaCm / 100;
    const imc = peso / (m * m);
    g.get('imc')?.setValue(imc.toFixed(1), { emitEvent: false });
  }

  get signosVitales(): FormGroup {
    return this.form.get('signosVitales') as FormGroup;
  }

  get riesgoSaludGroup(): FormGroup {
    return this.form.get('riesgoSalud') as FormGroup;
  }

  get examenFisicoGroup(): FormGroup {
    return this.form.get('examenFisico') as FormGroup;
  }

  private hijoGroup(): FormGroup {
    return this.fb.group({
      nombre: [''],
      contacto: [''],
      email: [''],
    });
  }

  private referenciaGroup(): FormGroup {
    return this.fb.group({
      nombre: [''],
      contacto: [''],
      direccion: [''],
      relacion: [''],
      foto: [''],
    });
  }

  private acudienteGroup(): FormGroup {
    return this.fb.group({
      nombre: [''],
      identificacion: [''],
      contacto: [''],
      email: [''],
      direccion: [''],
      ingresosDependen: [''],
      parentesco: [''],
      foto: [''],
    });
  }

  private medicamentoGroup(): FormGroup {
    return this.fb.group({
      nombre: [''],
      dosis: [''],
      horarios: [''],
      soporteFormulaPdf: [''],
      soporteFormulaNombre: [''],
    });
  }

  private sustanciaGroup(): FormGroup {
    return this.fb.group({ nombre: [''], frecuencia: [''] });
  }

  private especialistaGroup(): FormGroup {
    return this.fb.group({
      especialidad: [''],
      frecuencia: [''],
      tratamiento: [''],
    });
  }

  private profesionalGroup(): FormGroup {
    return this.fb.group({
      nombre: [''],
      cargo: [''],
      documento: [''],
      fecha: [''],
      firma: [''],
    });
  }
}
