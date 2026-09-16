package com.humanscratch.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.*;

@Service
public class FichaFormPersistenceService {

    private final JdbcTemplate jdbc;

    public FichaFormPersistenceService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public boolean hasNormalizedData(String fichaId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM datos_personales WHERE ficha_id = ?",
                Integer.class,
                fichaId);
        return count != null && count > 0;
    }

    @Transactional
    public void persist(String fichaId, Map<String, Object> data) {
        upsertDatosPersonales(fichaId, data);
        upsertDatosEconomicos(fichaId, data);
        upsertDatosFamiliares(fichaId, data);
        upsertPerfilClinico(fichaId, data);
        upsertAutopercepcion(fichaId, data);
        upsertHabitos(fichaId, data);
        upsertAntecedentes(fichaId, data);
        upsertSignosVitalesIngreso(fichaId, data);
        upsertModeloCorporal(fichaId, data);
        upsertValoracionGeriatrica(fichaId, data);
        upsertDeclaracion(fichaId, data);
        ensureExamHeaders(fichaId);
        upsertIncontinencia(fichaId, data);
        replaceHijos(fichaId, data);
        replaceReferencias(fichaId, data);
        replaceAcudientes(fichaId, data);
        replaceMedicamentos(fichaId, data);
        replaceOtrasSustancias(fichaId, data);
        replaceEspecialistas(fichaId, data);
        replaceProfesionales(fichaId, data);
        replaceConceptos(fichaId, data);
        replaceEscalas(fichaId, data);
        replaceHallazgosExamenFisico(fichaId, data);
        replaceValoresSistema(fichaId, data);
        replaceCamposExamenMental(fichaId, data);
    }

    public Map<String, Object> load(String fichaId) {
        Map<String, Object> data = new LinkedHashMap<>();
        loadDatosPersonales(fichaId, data);
        loadDatosEconomicos(fichaId, data);
        loadDatosFamiliares(fichaId, data);
        loadPerfilClinico(fichaId, data);
        loadAutopercepcion(fichaId, data);
        loadHabitos(fichaId, data);
        loadAntecedentes(fichaId, data);
        loadSignosVitalesIngreso(fichaId, data);
        loadModeloCorporal(fichaId, data);
        loadValoracionGeriatrica(fichaId, data);
        loadDeclaracion(fichaId, data);
        loadHijos(fichaId, data);
        loadReferencias(fichaId, data);
        loadAcudientes(fichaId, data);
        loadMedicamentos(fichaId, data);
        loadOtrasSustancias(fichaId, data);
        loadEspecialistas(fichaId, data);
        loadProfesionales(fichaId, data);
        loadConceptos(fichaId, data);
        loadEscalas(fichaId, data);
        loadExamenFisico(fichaId, data);
        loadRevisionSistemas(fichaId, data);
        loadExamenMental(fichaId, data);
        loadFichaHeader(fichaId, data);
        return data;
    }

    private void loadFichaHeader(String fichaId, Map<String, Object> data) {
        jdbc.query(
                "SELECT contrato_numero, observaciones_generales FROM ficha_clinica WHERE id = ?",
                rs -> {
                    data.put("contratoNumero", rs.getString("contrato_numero"));
                    data.put("observacionesGenerales", rs.getString("observaciones_generales"));
                },
                fichaId);
    }

    private void upsertDatosPersonales(String fichaId, Map<String, Object> data) {
        Map<String, Object> p = FormMapUtil.asMap(data.get("personal"));
        jdbc.update("""
                INSERT INTO datos_personales (
                    ficha_id, fecha_ingreso, fecha_actualizacion, modalidad, nombre_apellidos,
                    identificacion, lugar_expedicion, fecha_expedicion, lugar_nacimiento, fecha_nacimiento,
                    edad, rh, sexo, estado_civil, nombre_conyuge, estudios, eps, regimen,
                    lugar_atencion, servicios_funerarios, profesion, confesion_religiosa, foto_url
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                ON CONFLICT (ficha_id) DO UPDATE SET
                    fecha_ingreso=EXCLUDED.fecha_ingreso, fecha_actualizacion=EXCLUDED.fecha_actualizacion,
                    modalidad=EXCLUDED.modalidad, nombre_apellidos=EXCLUDED.nombre_apellidos,
                    identificacion=EXCLUDED.identificacion, lugar_expedicion=EXCLUDED.lugar_expedicion,
                    fecha_expedicion=EXCLUDED.fecha_expedicion, lugar_nacimiento=EXCLUDED.lugar_nacimiento,
                    fecha_nacimiento=EXCLUDED.fecha_nacimiento, edad=EXCLUDED.edad, rh=EXCLUDED.rh,
                    sexo=EXCLUDED.sexo, estado_civil=EXCLUDED.estado_civil, nombre_conyuge=EXCLUDED.nombre_conyuge,
                    estudios=EXCLUDED.estudios, eps=EXCLUDED.eps, regimen=EXCLUDED.regimen,
                    lugar_atencion=EXCLUDED.lugar_atencion, servicios_funerarios=EXCLUDED.servicios_funerarios,
                    profesion=EXCLUDED.profesion, confesion_religiosa=EXCLUDED.confesion_religiosa,
                    foto_url=EXCLUDED.foto_url
                """,
                fichaId,
                toSqlDate(FormMapUtil.parseDate(p.get("fechaIngreso"))),
                toSqlDate(FormMapUtil.parseDate(p.get("fechaActualizacion"))),
                FormMapUtil.str(p.get("modalidad")),
                FormMapUtil.str(p.get("nombreApellidos")),
                FormMapUtil.str(p.get("identificacion")),
                FormMapUtil.str(p.get("lugarExpedicion")),
                toSqlDate(FormMapUtil.parseDate(p.get("fechaExpedicion"))),
                FormMapUtil.str(p.get("lugarNacimiento")),
                toSqlDate(FormMapUtil.parseDate(p.get("fechaNacimiento"))),
                FormMapUtil.str(p.get("edad")),
                FormMapUtil.str(p.get("rh")),
                FormMapUtil.str(p.get("sexo")),
                FormMapUtil.str(p.get("estadoCivil")),
                FormMapUtil.str(p.get("nombreConyuge")),
                FormMapUtil.str(p.get("estudios")),
                FormMapUtil.str(p.get("eps")),
                FormMapUtil.str(p.get("regimen")),
                FormMapUtil.str(p.get("lugarAtencion")),
                FormMapUtil.str(p.get("serviciosFunerarios")),
                FormMapUtil.str(p.get("profesion")),
                FormMapUtil.str(p.get("confesionReligiosa")),
                FormMapUtil.str(p.get("foto")));
    }

    private void loadDatosPersonales(String fichaId, Map<String, Object> data) {
        Map<String, Object> personal = new LinkedHashMap<>();
        jdbc.query(
                "SELECT * FROM datos_personales WHERE ficha_id = ?",
                rs -> {
                    personal.put("fechaIngreso", formatDate(rs.getDate("fecha_ingreso")));
                    personal.put("fechaActualizacion", formatDate(rs.getDate("fecha_actualizacion")));
                    personal.put("modalidad", rs.getString("modalidad"));
                    personal.put("nombreApellidos", rs.getString("nombre_apellidos"));
                    personal.put("identificacion", rs.getString("identificacion"));
                    personal.put("lugarExpedicion", rs.getString("lugar_expedicion"));
                    personal.put("fechaExpedicion", formatDate(rs.getDate("fecha_expedicion")));
                    personal.put("lugarNacimiento", rs.getString("lugar_nacimiento"));
                    personal.put("fechaNacimiento", formatDate(rs.getDate("fecha_nacimiento")));
                    personal.put("edad", rs.getString("edad"));
                    personal.put("rh", rs.getString("rh"));
                    personal.put("sexo", rs.getString("sexo"));
                    personal.put("estadoCivil", rs.getString("estado_civil"));
                    personal.put("nombreConyuge", rs.getString("nombre_conyuge"));
                    personal.put("estudios", rs.getString("estudios"));
                    personal.put("eps", rs.getString("eps"));
                    personal.put("regimen", rs.getString("regimen"));
                    personal.put("lugarAtencion", rs.getString("lugar_atencion"));
                    personal.put("serviciosFunerarios", rs.getString("servicios_funerarios"));
                    personal.put("profesion", rs.getString("profesion"));
                    personal.put("confesionReligiosa", rs.getString("confesion_religiosa"));
                    personal.put("foto", rs.getString("foto_url"));
                },
                fichaId);
        data.put("personal", personal);
    }

    private void upsertDatosEconomicos(String fichaId, Map<String, Object> data) {
        Map<String, Object> e = FormMapUtil.asMap(data.get("economica"));
        jdbc.update("""
                INSERT INTO datos_economicos (ficha_id, ingresos_de, apoyo_gubernamental, vivienda_tipo, direccion)
                VALUES (?,?,?,?,?)
                ON CONFLICT (ficha_id) DO UPDATE SET
                    ingresos_de=EXCLUDED.ingresos_de, apoyo_gubernamental=EXCLUDED.apoyo_gubernamental,
                    vivienda_tipo=EXCLUDED.vivienda_tipo, direccion=EXCLUDED.direccion
                """,
                fichaId,
                FormMapUtil.str(e.get("ingresosDe")),
                FormMapUtil.str(e.get("apoyoGubernamental")),
                FormMapUtil.str(e.get("viviendaTipo")),
                FormMapUtil.str(e.get("direccion")));
    }

    private void loadDatosEconomicos(String fichaId, Map<String, Object> data) {
        Map<String, Object> economica = new LinkedHashMap<>();
        jdbc.query("SELECT * FROM datos_economicos WHERE ficha_id = ?", rs -> {
            economica.put("ingresosDe", rs.getString("ingresos_de"));
            economica.put("apoyoGubernamental", rs.getString("apoyo_gubernamental"));
            economica.put("viviendaTipo", rs.getString("vivienda_tipo"));
            economica.put("direccion", rs.getString("direccion"));
        }, fichaId);
        data.put("economica", economica);
    }

    private void upsertDatosFamiliares(String fichaId, Map<String, Object> data) {
        Map<String, Object> f = FormMapUtil.asMap(data.get("familiar"));
        jdbc.update("""
                INSERT INTO datos_familiares (
                    ficha_id, nombre_madre, nombre_padre, con_quien_vive, cuidador_principal,
                    familiares_cercanos, frecuencia_visitas, relacion_familia, decision_emergencia,
                    actividades_sociales, antecedentes_maltrato, expectativas, razon_ingreso
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
                ON CONFLICT (ficha_id) DO UPDATE SET
                    nombre_madre=EXCLUDED.nombre_madre, nombre_padre=EXCLUDED.nombre_padre,
                    con_quien_vive=EXCLUDED.con_quien_vive, cuidador_principal=EXCLUDED.cuidador_principal,
                    familiares_cercanos=EXCLUDED.familiares_cercanos, frecuencia_visitas=EXCLUDED.frecuencia_visitas,
                    relacion_familia=EXCLUDED.relacion_familia, decision_emergencia=EXCLUDED.decision_emergencia,
                    actividades_sociales=EXCLUDED.actividades_sociales, antecedentes_maltrato=EXCLUDED.antecedentes_maltrato,
                    expectativas=EXCLUDED.expectativas, razon_ingreso=EXCLUDED.razon_ingreso
                """,
                fichaId,
                FormMapUtil.str(f.get("nombreMadre")),
                FormMapUtil.str(f.get("nombrePadre")),
                FormMapUtil.str(f.get("conQuienVive")),
                FormMapUtil.str(f.get("cuidadorPrincipal")),
                FormMapUtil.str(f.get("familiaresCercanos")),
                FormMapUtil.str(f.get("frecuenciaVisitas")),
                FormMapUtil.str(f.get("relacionFamilia")),
                FormMapUtil.str(f.get("decisionEmergencia")),
                FormMapUtil.str(f.get("actividadesSociales")),
                FormMapUtil.str(f.get("antecedentesMaltrato")),
                FormMapUtil.str(f.get("expectativas")),
                FormMapUtil.str(f.get("razonIngreso")));
    }

    private void loadDatosFamiliares(String fichaId, Map<String, Object> data) {
        Map<String, Object> familiar = new LinkedHashMap<>();
        jdbc.query("SELECT * FROM datos_familiares WHERE ficha_id = ?", rs -> {
            familiar.put("nombreMadre", rs.getString("nombre_madre"));
            familiar.put("nombrePadre", rs.getString("nombre_padre"));
            familiar.put("conQuienVive", rs.getString("con_quien_vive"));
            familiar.put("cuidadorPrincipal", rs.getString("cuidador_principal"));
            familiar.put("familiaresCercanos", rs.getString("familiares_cercanos"));
            familiar.put("frecuenciaVisitas", rs.getString("frecuencia_visitas"));
            familiar.put("relacionFamilia", rs.getString("relacion_familia"));
            familiar.put("decisionEmergencia", rs.getString("decision_emergencia"));
            familiar.put("actividadesSociales", rs.getString("actividades_sociales"));
            familiar.put("antecedentesMaltrato", rs.getString("antecedentes_maltrato"));
            familiar.put("expectativas", rs.getString("expectativas"));
            familiar.put("razonIngreso", rs.getString("razon_ingreso"));
        }, fichaId);
        data.put("familiar", familiar);
    }

    private void upsertPerfilClinico(String fichaId, Map<String, Object> data) {
        Map<String, Object> c = FormMapUtil.asMap(data.get("clinica"));
        jdbc.update("""
                INSERT INTO perfil_clinico (ficha_id, patologia, alergias_med, alergias_alim, alergias_otros, soporte_formula_pdf, soporte_formula_nombre)
                VALUES (?,?,?,?,?,?,?)
                ON CONFLICT (ficha_id) DO UPDATE SET
                    patologia=EXCLUDED.patologia, alergias_med=EXCLUDED.alergias_med,
                    alergias_alim=EXCLUDED.alergias_alim, alergias_otros=EXCLUDED.alergias_otros,
                    soporte_formula_pdf=EXCLUDED.soporte_formula_pdf,
                    soporte_formula_nombre=EXCLUDED.soporte_formula_nombre
                """,
                fichaId,
                FormMapUtil.str(c.get("patologia")),
                FormMapUtil.str(c.get("alergiasMed")),
                FormMapUtil.str(c.get("alergiasAlim")),
                FormMapUtil.str(c.get("alergiasOtros")),
                FormMapUtil.str(c.get("soporteFormulaPdf")),
                FormMapUtil.str(c.get("soporteFormulaNombre")));
    }

    private void loadPerfilClinico(String fichaId, Map<String, Object> data) {
        Map<String, Object> clinica = new LinkedHashMap<>();
        jdbc.query("SELECT * FROM perfil_clinico WHERE ficha_id = ?", rs -> {
            clinica.put("patologia", rs.getString("patologia"));
            clinica.put("alergiasMed", rs.getString("alergias_med"));
            clinica.put("alergiasAlim", rs.getString("alergias_alim"));
            clinica.put("alergiasOtros", rs.getString("alergias_otros"));
            clinica.put("soporteFormulaPdf", rs.getString("soporte_formula_pdf"));
            clinica.put("soporteFormulaNombre", rs.getString("soporte_formula_nombre"));
        }, fichaId);
        data.put("clinica", clinica);
    }

    private void upsertAutopercepcion(String fichaId, Map<String, Object> data) {
        Map<String, Object> a = FormMapUtil.asMap(data.get("autopercepcion"));
        jdbc.update("""
                INSERT INTO autopercepcion (
                    ficha_id, estado_salud, anamnesis_aspecto, anamnesis_emocional, anamnesis_fisico,
                    higienico, nutricional, ayuda_movilizarse, inmovilizacion, autoriza_inmovilizacion,
                    camina_solo, camina_baston, silla_ruedas, mss, mii
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                ON CONFLICT (ficha_id) DO UPDATE SET
                    estado_salud=EXCLUDED.estado_salud, anamnesis_aspecto=EXCLUDED.anamnesis_aspecto,
                    anamnesis_emocional=EXCLUDED.anamnesis_emocional, anamnesis_fisico=EXCLUDED.anamnesis_fisico,
                    higienico=EXCLUDED.higienico, nutricional=EXCLUDED.nutricional,
                    ayuda_movilizarse=EXCLUDED.ayuda_movilizarse, inmovilizacion=EXCLUDED.inmovilizacion,
                    autoriza_inmovilizacion=EXCLUDED.autoriza_inmovilizacion, camina_solo=EXCLUDED.camina_solo,
                    camina_baston=EXCLUDED.camina_baston, silla_ruedas=EXCLUDED.silla_ruedas,
                    mss=EXCLUDED.mss, mii=EXCLUDED.mii
                """,
                fichaId,
                FormMapUtil.str(a.get("estadoSalud")),
                FormMapUtil.str(a.get("anamnesisAspecto")),
                FormMapUtil.str(a.get("anamnesisEmocional")),
                FormMapUtil.str(a.get("anamnesisFisico")),
                FormMapUtil.str(a.get("higienico")),
                FormMapUtil.str(a.get("nutricional")),
                FormMapUtil.str(a.get("ayudaMovilizarse")),
                FormMapUtil.str(a.get("inmovilizacion")),
                FormMapUtil.str(a.get("autorizaInmovilizacion")),
                FormMapUtil.str(a.get("caminaSolo")),
                FormMapUtil.str(a.get("caminaBaston")),
                FormMapUtil.str(a.get("sillaRuedas")),
                FormMapUtil.str(a.get("mss")),
                FormMapUtil.str(a.get("mii")));
    }

    private void loadAutopercepcion(String fichaId, Map<String, Object> data) {
        Map<String, Object> autopercepcion = new LinkedHashMap<>();
        jdbc.query("SELECT * FROM autopercepcion WHERE ficha_id = ?", rs -> {
            autopercepcion.put("estadoSalud", rs.getString("estado_salud"));
            autopercepcion.put("anamnesisAspecto", rs.getString("anamnesis_aspecto"));
            autopercepcion.put("anamnesisEmocional", rs.getString("anamnesis_emocional"));
            autopercepcion.put("anamnesisFisico", rs.getString("anamnesis_fisico"));
            autopercepcion.put("higienico", rs.getString("higienico"));
            autopercepcion.put("nutricional", rs.getString("nutricional"));
            autopercepcion.put("ayudaMovilizarse", rs.getString("ayuda_movilizarse"));
            autopercepcion.put("inmovilizacion", rs.getString("inmovilizacion"));
            autopercepcion.put("autorizaInmovilizacion", rs.getString("autoriza_inmovilizacion"));
            autopercepcion.put("caminaSolo", rs.getString("camina_solo"));
            autopercepcion.put("caminaBaston", rs.getString("camina_baston"));
            autopercepcion.put("sillaRuedas", rs.getString("silla_ruedas"));
            autopercepcion.put("mss", rs.getString("mss"));
            autopercepcion.put("mii", rs.getString("mii"));
        }, fichaId);
        data.put("autopercepcion", autopercepcion);
    }

    private void upsertHabitos(String fichaId, Map<String, Object> data) {
        Map<String, Object> riesgo = FormMapUtil.asMap(data.get("riesgoSalud"));
        Map<String, Object> tabaco = FormMapUtil.asMap(riesgo.get("tabaco"));
        Map<String, Object> alcohol = FormMapUtil.asMap(riesgo.get("alcohol"));
        Map<String, Object> otra = FormMapUtil.asMap(riesgo.get("otraSustancia"));
        jdbc.update("""
                INSERT INTO habito_tabaco (ficha_id, consume, frecuencia) VALUES (?,?,?)
                ON CONFLICT (ficha_id) DO UPDATE SET consume=EXCLUDED.consume, frecuencia=EXCLUDED.frecuencia
                """, fichaId, FormMapUtil.str(tabaco.get("consume")), FormMapUtil.str(tabaco.get("frecuencia")));
        jdbc.update("""
                INSERT INTO habito_alcohol (ficha_id, consume, frecuencia) VALUES (?,?,?)
                ON CONFLICT (ficha_id) DO UPDATE SET consume=EXCLUDED.consume, frecuencia=EXCLUDED.frecuencia
                """, fichaId, FormMapUtil.str(alcohol.get("consume")), FormMapUtil.str(alcohol.get("frecuencia")));
        jdbc.update("""
                INSERT INTO otra_sustancia_principal (ficha_id, nombre, frecuencia) VALUES (?,?,?)
                ON CONFLICT (ficha_id) DO UPDATE SET nombre=EXCLUDED.nombre, frecuencia=EXCLUDED.frecuencia
                """, fichaId, FormMapUtil.str(otra.get("nombre")), FormMapUtil.str(otra.get("frecuencia")));
    }

    private void loadHabitos(String fichaId, Map<String, Object> data) {
        Map<String, Object> riesgoSalud = new LinkedHashMap<>();
        Map<String, Object> tabaco = new LinkedHashMap<>();
        Map<String, Object> alcohol = new LinkedHashMap<>();
        Map<String, Object> otraSustancia = new LinkedHashMap<>();
        jdbc.query("SELECT consume, frecuencia FROM habito_tabaco WHERE ficha_id = ?", rs -> {
            tabaco.put("consume", rs.getString("consume"));
            tabaco.put("frecuencia", rs.getString("frecuencia"));
        }, fichaId);
        jdbc.query("SELECT consume, frecuencia FROM habito_alcohol WHERE ficha_id = ?", rs -> {
            alcohol.put("consume", rs.getString("consume"));
            alcohol.put("frecuencia", rs.getString("frecuencia"));
        }, fichaId);
        jdbc.query("SELECT nombre, frecuencia FROM otra_sustancia_principal WHERE ficha_id = ?", rs -> {
            otraSustancia.put("nombre", rs.getString("nombre"));
            otraSustancia.put("frecuencia", rs.getString("frecuencia"));
        }, fichaId);
        riesgoSalud.put("tabaco", tabaco);
        riesgoSalud.put("alcohol", alcohol);
        riesgoSalud.put("otraSustancia", otraSustancia);
        data.put("riesgoSalud", riesgoSalud);
    }

    private void upsertAntecedentes(String fichaId, Map<String, Object> data) {
        Map<String, Object> a = FormMapUtil.asMap(data.get("antecedentes"));
        Map<String, Object> c = FormMapUtil.asMap(data.get("antecedentesCaidas"));
        jdbc.update("""
                INSERT INTO antecedentes (ficha_id, quirurgicos, patologicos, farmacologicos, alergicos, cancer)
                VALUES (?,?,?,?,?,?)
                ON CONFLICT (ficha_id) DO UPDATE SET
                    quirurgicos=EXCLUDED.quirurgicos, patologicos=EXCLUDED.patologicos,
                    farmacologicos=EXCLUDED.farmacologicos, alergicos=EXCLUDED.alergicos, cancer=EXCLUDED.cancer
                """,
                fichaId,
                FormMapUtil.str(a.get("quirurgicos")),
                FormMapUtil.str(a.get("patologicos")),
                FormMapUtil.str(a.get("farmacologicos")),
                FormMapUtil.str(a.get("alergicos")),
                FormMapUtil.str(a.get("cancer")));
        jdbc.update("""
                INSERT INTO antecedentes_caidas (ficha_id, caidas_propia_altura, riesgo_caida)
                VALUES (?,?,?)
                ON CONFLICT (ficha_id) DO UPDATE SET
                    caidas_propia_altura=EXCLUDED.caidas_propia_altura, riesgo_caida=EXCLUDED.riesgo_caida
                """,
                fichaId,
                FormMapUtil.str(c.get("caidasPropiaAltura")),
                FormMapUtil.str(c.get("riesgoCaida")));
    }

    private void loadAntecedentes(String fichaId, Map<String, Object> data) {
        Map<String, Object> antecedentes = new LinkedHashMap<>();
        Map<String, Object> antecedentesCaidas = new LinkedHashMap<>();
        jdbc.query("SELECT * FROM antecedentes WHERE ficha_id = ?", rs -> {
            antecedentes.put("quirurgicos", rs.getString("quirurgicos"));
            antecedentes.put("patologicos", rs.getString("patologicos"));
            antecedentes.put("farmacologicos", rs.getString("farmacologicos"));
            antecedentes.put("alergicos", rs.getString("alergicos"));
            antecedentes.put("cancer", rs.getString("cancer"));
        }, fichaId);
        jdbc.query("SELECT * FROM antecedentes_caidas WHERE ficha_id = ?", rs -> {
            antecedentesCaidas.put("caidasPropiaAltura", rs.getString("caidas_propia_altura"));
            antecedentesCaidas.put("riesgoCaida", rs.getString("riesgo_caida"));
        }, fichaId);
        data.put("antecedentes", antecedentes);
        data.put("antecedentesCaidas", antecedentesCaidas);
    }

    private void upsertSignosVitalesIngreso(String fichaId, Map<String, Object> data) {
        Map<String, Object> v = FormMapUtil.asMap(data.get("signosVitales"));
        jdbc.update("""
                INSERT INTO signos_vitales_ingreso (ficha_id, ta, fc, fr, spo2, peso, talla, imc)
                VALUES (?,?,?,?,?,?,?,?)
                ON CONFLICT (ficha_id) DO UPDATE SET
                    ta=EXCLUDED.ta, fc=EXCLUDED.fc, fr=EXCLUDED.fr, spo2=EXCLUDED.spo2,
                    peso=EXCLUDED.peso, talla=EXCLUDED.talla, imc=EXCLUDED.imc
                """,
                fichaId,
                FormMapUtil.str(v.get("ta")),
                FormMapUtil.str(v.get("fc")),
                FormMapUtil.str(v.get("fr")),
                FormMapUtil.str(v.get("spo2")),
                FormMapUtil.decimal(v.get("peso")),
                FormMapUtil.decimal(v.get("talla")),
                FormMapUtil.decimal(v.get("imc")));
    }

    private void loadSignosVitalesIngreso(String fichaId, Map<String, Object> data) {
        Map<String, Object> signosVitales = new LinkedHashMap<>();
        jdbc.query("SELECT * FROM signos_vitales_ingreso WHERE ficha_id = ?", rs -> {
            signosVitales.put("ta", rs.getString("ta"));
            signosVitales.put("fc", rs.getString("fc"));
            signosVitales.put("fr", rs.getString("fr"));
            signosVitales.put("spo2", rs.getString("spo2"));
            signosVitales.put("peso", decimalToString(rs.getBigDecimal("peso")));
            signosVitales.put("talla", decimalToString(rs.getBigDecimal("talla")));
            signosVitales.put("imc", decimalToString(rs.getBigDecimal("imc")));
        }, fichaId);
        data.put("signosVitales", signosVitales);
    }

    private void upsertModeloCorporal(String fichaId, Map<String, Object> data) {
        jdbc.update("""
                INSERT INTO modelo_corporal (
                    ficha_id, body_paint_image, body_print_front, body_print_back, descripcion_observaciones
                ) VALUES (?,?,?,?,?)
                ON CONFLICT (ficha_id) DO UPDATE SET
                    body_paint_image=EXCLUDED.body_paint_image,
                    body_print_front=EXCLUDED.body_print_front,
                    body_print_back=EXCLUDED.body_print_back,
                    descripcion_observaciones=EXCLUDED.descripcion_observaciones
                """,
                fichaId,
                FormMapUtil.str(data.get("bodyPaintImage")),
                FormMapUtil.str(data.get("bodyPrintFrontImage")),
                FormMapUtil.str(data.get("bodyPrintBackImage")),
                FormMapUtil.str(data.get("descripcionCuerpoObservaciones")));
    }

    private void loadModeloCorporal(String fichaId, Map<String, Object> data) {
        jdbc.query(
                """
                SELECT body_paint_image, body_print_front, body_print_back, descripcion_observaciones
                FROM modelo_corporal WHERE ficha_id = ?
                """,
                rs -> {
                    data.put("bodyPaintImage", rs.getString("body_paint_image"));
                    data.put("bodyPrintFrontImage", rs.getString("body_print_front"));
                    data.put("bodyPrintBackImage", rs.getString("body_print_back"));
                    data.put("descripcionCuerpoObservaciones", rs.getString("descripcion_observaciones"));
                },
                fichaId);
    }

    private void upsertValoracionGeriatrica(String fichaId, Map<String, Object> data) {
        jdbc.update("""
                INSERT INTO valoracion_geriatrica (ficha_id, escalas_observaciones) VALUES (?,?)
                ON CONFLICT (ficha_id) DO UPDATE SET escalas_observaciones=EXCLUDED.escalas_observaciones
                """, fichaId, FormMapUtil.str(data.get("escalasObservaciones")));
    }

    private void loadValoracionGeriatrica(String fichaId, Map<String, Object> data) {
        jdbc.query("SELECT escalas_observaciones FROM valoracion_geriatrica WHERE ficha_id = ?", rs -> {
            data.put("escalasObservaciones", rs.getString("escalas_observaciones"));
        }, fichaId);
    }

    private void upsertDeclaracion(String fichaId, Map<String, Object> data) {
        Map<String, Object> d = FormMapUtil.asMap(data.get("declaracion"));
        jdbc.update("""
                INSERT INTO declaracion_acudiente (ficha_id, nombre, documento, firma_url, fecha)
                VALUES (?,?,?,?,?)
                ON CONFLICT (ficha_id) DO UPDATE SET
                    nombre=EXCLUDED.nombre, documento=EXCLUDED.documento,
                    firma_url=EXCLUDED.firma_url, fecha=EXCLUDED.fecha
                """,
                fichaId,
                FormMapUtil.str(d.get("nombre")),
                FormMapUtil.str(d.get("documento")),
                FormMapUtil.str(d.get("firma")),
                toSqlDate(FormMapUtil.parseDate(d.get("fecha"))));
    }

    private void loadDeclaracion(String fichaId, Map<String, Object> data) {
        Map<String, Object> declaracion = new LinkedHashMap<>();
        jdbc.query("SELECT * FROM declaracion_acudiente WHERE ficha_id = ?", rs -> {
            declaracion.put("nombre", rs.getString("nombre"));
            declaracion.put("documento", rs.getString("documento"));
            declaracion.put("firma", rs.getString("firma_url"));
            declaracion.put("fecha", formatDate(rs.getDate("fecha")));
        }, fichaId);
        data.put("declaracion", declaracion);
    }

    private void ensureExamHeaders(String fichaId) {
        jdbc.update("INSERT INTO examen_fisico (ficha_id) VALUES (?) ON CONFLICT (ficha_id) DO NOTHING", fichaId);
        jdbc.update("INSERT INTO revision_sistemas (ficha_id) VALUES (?) ON CONFLICT (ficha_id) DO NOTHING", fichaId);
        jdbc.update("INSERT INTO examen_mental (ficha_id) VALUES (?) ON CONFLICT (ficha_id) DO NOTHING", fichaId);
    }

    private void upsertIncontinencia(String fichaId, Map<String, Object> data) {
        Map<String, Object> examen = FormMapUtil.asMap(data.get("examenFisico"));
        Map<String, Object> inc = FormMapUtil.asMap(examen.get("incontinencia"));
        jdbc.update("""
                INSERT INTO incontinencia (
                    examen_fisico_id, presenta, momento, lesiones, ulceras, hongos, secreciones, prolapso, presencia_sonda
                ) VALUES (?,?,?,?,?,?,?,?,?)
                ON CONFLICT (examen_fisico_id) DO UPDATE SET
                    presenta=EXCLUDED.presenta, momento=EXCLUDED.momento, lesiones=EXCLUDED.lesiones,
                    ulceras=EXCLUDED.ulceras, hongos=EXCLUDED.hongos, secreciones=EXCLUDED.secreciones,
                    prolapso=EXCLUDED.prolapso, presencia_sonda=EXCLUDED.presencia_sonda
                """,
                fichaId,
                FormMapUtil.str(inc.get("presenta")),
                FormMapUtil.str(inc.get("momento")),
                FormMapUtil.str(inc.get("lesiones")),
                FormMapUtil.str(inc.get("ulceras")),
                FormMapUtil.str(inc.get("hongos")),
                FormMapUtil.str(inc.get("secreciones")),
                FormMapUtil.str(inc.get("prolapso")),
                FormMapUtil.str(inc.get("presenciaSonda")));
    }

    private void replaceHijos(String fichaId, Map<String, Object> data) {
        jdbc.update("DELETE FROM hijos WHERE ficha_id = ?", fichaId);
        int orden = 0;
        for (Map<String, Object> row : FormMapUtil.asListOfMaps(data.get("hijos"))) {
            jdbc.update(
                    "INSERT INTO hijos (ficha_id, orden, nombre, contacto, email) VALUES (?,?,?,?,?)",
                    fichaId, orden++,
                    FormMapUtil.str(row.get("nombre")),
                    FormMapUtil.str(row.get("contacto")),
                    FormMapUtil.str(row.get("email")));
        }
    }

    private void loadHijos(String fichaId, Map<String, Object> data) {
        List<Map<String, Object>> hijos = jdbc.query(
                "SELECT nombre, contacto, email FROM hijos WHERE ficha_id = ? ORDER BY orden",
                (rs, rowNum) -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("nombre", rs.getString("nombre"));
                    row.put("contacto", rs.getString("contacto"));
                    row.put("email", rs.getString("email"));
                    return row;
                },
                fichaId);
        data.put("hijos", hijos);
    }

    private void replaceReferencias(String fichaId, Map<String, Object> data) {
        jdbc.update("DELETE FROM referencias_personales WHERE ficha_id = ?", fichaId);
        int orden = 0;
        for (Map<String, Object> row : FormMapUtil.asListOfMaps(data.get("referencias"))) {
            jdbc.update(
                    "INSERT INTO referencias_personales (ficha_id, orden, nombre, contacto, direccion, relacion, foto_url) VALUES (?,?,?,?,?,?,?)",
                    fichaId, orden++,
                    FormMapUtil.str(row.get("nombre")),
                    FormMapUtil.str(row.get("contacto")),
                    FormMapUtil.str(row.get("direccion")),
                    FormMapUtil.str(row.get("relacion")),
                    FormMapUtil.str(row.get("foto")));
        }
    }

    private void loadReferencias(String fichaId, Map<String, Object> data) {
        List<Map<String, Object>> referencias = jdbc.query(
                "SELECT nombre, contacto, direccion, relacion, foto_url FROM referencias_personales WHERE ficha_id = ? ORDER BY orden",
                (rs, rowNum) -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("nombre", rs.getString("nombre"));
                    row.put("contacto", rs.getString("contacto"));
                    row.put("direccion", rs.getString("direccion"));
                    row.put("relacion", rs.getString("relacion"));
                    row.put("foto", rs.getString("foto_url"));
                    return row;
                },
                fichaId);
        data.put("referencias", referencias);
    }

    private void replaceAcudientes(String fichaId, Map<String, Object> data) {
        jdbc.update("DELETE FROM acudientes WHERE ficha_id = ?", fichaId);
        int orden = 0;
        for (Map<String, Object> row : FormMapUtil.asListOfMaps(data.get("acudientes"))) {
            jdbc.update(
                    """
                    INSERT INTO acudientes (
                        ficha_id, orden, nombre, identificacion, contacto, email, direccion,
                        ingresos_dependen, parentesco, foto_url
                    ) VALUES (?,?,?,?,?,?,?,?,?,?)
                    """,
                    fichaId, orden++,
                    FormMapUtil.str(row.get("nombre")),
                    FormMapUtil.str(row.get("identificacion")),
                    FormMapUtil.str(row.get("contacto")),
                    FormMapUtil.str(row.get("email")),
                    FormMapUtil.str(row.get("direccion")),
                    FormMapUtil.str(row.get("ingresosDependen")),
                    FormMapUtil.str(row.get("parentesco")),
                    FormMapUtil.str(row.get("foto")));
        }
    }

    private void loadAcudientes(String fichaId, Map<String, Object> data) {
        List<Map<String, Object>> acudientes = jdbc.query(
                """
                SELECT nombre, identificacion, contacto, email, direccion, ingresos_dependen, parentesco, foto_url
                FROM acudientes WHERE ficha_id = ? ORDER BY orden
                """,
                (rs, rowNum) -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("nombre", rs.getString("nombre"));
                    row.put("identificacion", rs.getString("identificacion"));
                    row.put("contacto", rs.getString("contacto"));
                    row.put("email", rs.getString("email"));
                    row.put("direccion", rs.getString("direccion"));
                    row.put("ingresosDependen", rs.getString("ingresos_dependen"));
                    row.put("parentesco", rs.getString("parentesco"));
                    row.put("foto", rs.getString("foto_url"));
                    return row;
                },
                fichaId);
        data.put("acudientes", acudientes);
    }

    private void replaceMedicamentos(String fichaId, Map<String, Object> data) {
        jdbc.update("DELETE FROM medicamentos WHERE ficha_id = ?", fichaId);
        Map<String, Object> clinica = FormMapUtil.asMap(data.get("clinica"));
        int orden = 0;
        for (Map<String, Object> row : FormMapUtil.asListOfMaps(clinica.get("medicamentos"))) {
            jdbc.update(
                    "INSERT INTO medicamentos (ficha_id, orden, nombre, dosis, horarios, soporte_formula_pdf, soporte_formula_nombre) VALUES (?,?,?,?,?,?,?)",
                    fichaId, orden++,
                    FormMapUtil.str(row.get("nombre")),
                    FormMapUtil.str(row.get("dosis")),
                    FormMapUtil.str(row.get("horarios")),
                    "",
                    "");
        }
    }

    private void loadMedicamentos(String fichaId, Map<String, Object> data) {
        Map<String, Object> clinica = FormMapUtil.asMap(data.get("clinica"));
        List<Map<String, Object>> medicamentos = jdbc.query(
                "SELECT nombre, dosis, horarios, soporte_formula_pdf, soporte_formula_nombre FROM medicamentos WHERE ficha_id = ? ORDER BY orden",
                (rs, rowNum) -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("nombre", rs.getString("nombre"));
                    row.put("dosis", rs.getString("dosis"));
                    row.put("horarios", rs.getString("horarios"));
                    row.put("soporteFormulaPdf", rs.getString("soporte_formula_pdf"));
                    row.put("soporteFormulaNombre", rs.getString("soporte_formula_nombre"));
                    return row;
                },
                fichaId);
        clinica.put("medicamentos", medicamentos);
        mergeLegacyMedicamentoFormula(clinica);
        data.put("clinica", clinica);
    }

    /** Fichas antiguas guardaban el PDF en la primera fila de medicamentos. */
    private void mergeLegacyMedicamentoFormula(Map<String, Object> clinica) {
        if (FormMapUtil.hasText(clinica.get("soporteFormulaPdf"))) {
            return;
        }
        for (Map<String, Object> row : FormMapUtil.asListOfMaps(clinica.get("medicamentos"))) {
            if (!FormMapUtil.hasText(row.get("soporteFormulaPdf"))) {
                continue;
            }
            clinica.put("soporteFormulaPdf", FormMapUtil.str(row.get("soporteFormulaPdf")));
            clinica.put("soporteFormulaNombre", FormMapUtil.str(row.get("soporteFormulaNombre")));
            row.put("soporteFormulaPdf", "");
            row.put("soporteFormulaNombre", "");
            return;
        }
    }

    private void replaceOtrasSustancias(String fichaId, Map<String, Object> data) {
        jdbc.update("DELETE FROM otras_sustancias WHERE ficha_id = ?", fichaId);
        Map<String, Object> riesgo = FormMapUtil.asMap(data.get("riesgoSalud"));
        int orden = 0;
        for (Map<String, Object> row : FormMapUtil.asListOfMaps(riesgo.get("otrasSustancias"))) {
            jdbc.update(
                    "INSERT INTO otras_sustancias (ficha_id, orden, nombre, frecuencia) VALUES (?,?,?,?)",
                    fichaId, orden++,
                    FormMapUtil.str(row.get("nombre")),
                    FormMapUtil.str(row.get("frecuencia")));
        }
    }

    private void loadOtrasSustancias(String fichaId, Map<String, Object> data) {
        Map<String, Object> riesgoSalud = FormMapUtil.asMap(data.get("riesgoSalud"));
        List<Map<String, Object>> otrasSustancias = jdbc.query(
                "SELECT nombre, frecuencia FROM otras_sustancias WHERE ficha_id = ? ORDER BY orden",
                (rs, rowNum) -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("nombre", rs.getString("nombre"));
                    row.put("frecuencia", rs.getString("frecuencia"));
                    return row;
                },
                fichaId);
        riesgoSalud.put("otrasSustancias", otrasSustancias);
        data.put("riesgoSalud", riesgoSalud);
    }

    private void replaceEspecialistas(String fichaId, Map<String, Object> data) {
        jdbc.update("DELETE FROM remisiones_especialistas WHERE ficha_id = ?", fichaId);
        int orden = 0;
        for (Map<String, Object> row : FormMapUtil.asListOfMaps(data.get("especialistas"))) {
            jdbc.update(
                    "INSERT INTO remisiones_especialistas (ficha_id, orden, especialidad, frecuencia, tratamiento) VALUES (?,?,?,?,?)",
                    fichaId, orden++,
                    FormMapUtil.str(row.get("especialidad")),
                    FormMapUtil.str(row.get("frecuencia")),
                    FormMapUtil.str(row.get("tratamiento")));
        }
    }

    private void loadEspecialistas(String fichaId, Map<String, Object> data) {
        List<Map<String, Object>> especialistas = jdbc.query(
                "SELECT especialidad, frecuencia, tratamiento FROM remisiones_especialistas WHERE ficha_id = ? ORDER BY orden",
                (rs, rowNum) -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("especialidad", rs.getString("especialidad"));
                    row.put("frecuencia", rs.getString("frecuencia"));
                    row.put("tratamiento", rs.getString("tratamiento"));
                    return row;
                },
                fichaId);
        data.put("especialistas", especialistas);
    }

    private void replaceProfesionales(String fichaId, Map<String, Object> data) {
        jdbc.update("DELETE FROM profesionales_diligencia WHERE ficha_id = ?", fichaId);
        int orden = 0;
        for (Map<String, Object> row : FormMapUtil.asListOfMaps(data.get("profesionales"))) {
            jdbc.update(
                    "INSERT INTO profesionales_diligencia (ficha_id, orden, nombre, cargo, documento, fecha, firma_url) VALUES (?,?,?,?,?,?,?)",
                    fichaId, orden++,
                    FormMapUtil.str(row.get("nombre")),
                    FormMapUtil.str(row.get("cargo")),
                    FormMapUtil.str(row.get("documento")),
                    toSqlDate(FormMapUtil.parseDate(row.get("fecha"))),
                    FormMapUtil.str(row.get("firma")));
        }
    }

    private void loadProfesionales(String fichaId, Map<String, Object> data) {
        List<Map<String, Object>> profesionales = jdbc.query(
                "SELECT nombre, cargo, documento, fecha, firma_url FROM profesionales_diligencia WHERE ficha_id = ? ORDER BY orden",
                (rs, rowNum) -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("nombre", rs.getString("nombre"));
                    row.put("cargo", rs.getString("cargo"));
                    row.put("documento", rs.getString("documento"));
                    row.put("fecha", formatDate(rs.getDate("fecha")));
                    row.put("firma", rs.getString("firma_url"));
                    return row;
                },
                fichaId);
        data.put("profesionales", profesionales);
    }

    private void replaceConceptos(String fichaId, Map<String, Object> data) {
        jdbc.update("DELETE FROM conceptos_aprobacion WHERE ficha_id = ?", fichaId);
        persistConcepto(fichaId, "institucional", FormMapUtil.asMap(data.get("conceptoInstitucional")));
        persistConcepto(fichaId, "independiente", FormMapUtil.asMap(data.get("aprobacionIndependiente")));
        persistConcepto(fichaId, "familia", FormMapUtil.asMap(data.get("aprobacionFamilia")));
    }

    private void persistConcepto(String fichaId, String tipo, Map<String, Object> concepto) {
        if (concepto.isEmpty()) {
            return;
        }
        Long conceptoId = jdbc.queryForObject(
                """
                INSERT INTO conceptos_aprobacion (ficha_id, tipo, fecha, favorable, justificacion)
                VALUES (?,?,?,?,?) RETURNING id
                """,
                Long.class,
                fichaId,
                tipo,
                toSqlDate(FormMapUtil.parseDate(concepto.get("fecha"))),
                FormMapUtil.str(concepto.get("favorable")),
                FormMapUtil.str(concepto.get("justificacion")));
        if (conceptoId == null) {
            return;
        }
        Object firmasObj = concepto.get("firmas");
        List<String> firmas = new ArrayList<>();
        if (firmasObj instanceof List<?> list) {
            for (Object item : list) {
                String firma = FormMapUtil.str(item);
                if (firma != null) {
                    firmas.add(firma);
                }
            }
        }
        int orden = 0;
        for (String firma : firmas) {
            jdbc.update(
                    "INSERT INTO firmas_aprobacion (concepto_id, orden, firma_url) VALUES (?,?,?)",
                    conceptoId, orden++, firma);
        }
    }

    private void loadConceptos(String fichaId, Map<String, Object> data) {
        jdbc.query(
                "SELECT id, tipo, fecha, favorable, justificacion FROM conceptos_aprobacion WHERE ficha_id = ?",
                rs -> {
                    Map<String, Object> concepto = new LinkedHashMap<>();
                    concepto.put("fecha", formatDate(rs.getDate("fecha")));
                    concepto.put("favorable", rs.getString("favorable"));
                    concepto.put("justificacion", rs.getString("justificacion"));
                    long conceptoId = rs.getLong("id");
                    List<String> firmas = jdbc.query(
                            "SELECT firma_url FROM firmas_aprobacion WHERE concepto_id = ? ORDER BY orden",
                            (frs, rowNum) -> frs.getString("firma_url"),
                            conceptoId);
                    concepto.put("firmas", firmas.isEmpty() ? List.of("") : firmas);
                    String key = switch (rs.getString("tipo")) {
                        case "institucional" -> "conceptoInstitucional";
                        case "independiente" -> "aprobacionIndependiente";
                        case "familia" -> "aprobacionFamilia";
                        default -> null;
                    };
                    if (key != null) {
                        data.put(key, concepto);
                    }
                },
                fichaId);
    }

    private void replaceEscalas(String fichaId, Map<String, Object> data) {
        jdbc.update("DELETE FROM respuestas_escala WHERE ficha_id = ?", fichaId);
        Map<String, Object> escalas = FormMapUtil.asMap(data.get("escalas"));
        for (Map.Entry<String, Object> escalaEntry : escalas.entrySet()) {
            Map<String, Object> items = FormMapUtil.asMap(escalaEntry.getValue());
            for (Map.Entry<String, Object> item : items.entrySet()) {
                Object value = item.getValue();
                if (value == null) {
                    continue;
                }
                String valor = value instanceof Boolean b
                        ? (b ? "true" : "false")
                        : FormMapUtil.str(value);
                if (valor == null) {
                    continue;
                }
                Integer puntaje = value instanceof Number n ? n.intValue() : FormMapUtil.integer(value);
                jdbc.update(
                        "INSERT INTO respuestas_escala (ficha_id, escala, item_id, valor, puntaje) VALUES (?,?,?,?,?)",
                        fichaId, escalaEntry.getKey(), item.getKey(), valor, puntaje);
            }
        }
    }

    private void loadEscalas(String fichaId, Map<String, Object> data) {
        Map<String, Map<String, Object>> grouped = new LinkedHashMap<>();
        jdbc.query(
                "SELECT escala, item_id, valor, puntaje FROM respuestas_escala WHERE ficha_id = ?",
                rs -> {
                    String escala = rs.getString("escala");
                    grouped.computeIfAbsent(escala, k -> new LinkedHashMap<>());
                    String valor = rs.getString("valor");
                    Integer puntaje = (Integer) rs.getObject("puntaje");
                    Object parsed = parseScaleValue(valor, puntaje);
                    grouped.get(escala).put(rs.getString("item_id"), parsed);
                },
                fichaId);
        Map<String, Object> escalas = new LinkedHashMap<>();
        for (Map.Entry<String, Map<String, Object>> entry : grouped.entrySet()) {
            escalas.put(entry.getKey(), entry.getValue());
        }
        data.put("escalas", escalas);
    }

    private void replaceHallazgosExamenFisico(String fichaId, Map<String, Object> data) {
        jdbc.update("DELETE FROM hallazgos_examen_fisico WHERE examen_fisico_id = ?", fichaId);
        Map<String, Object> examen = FormMapUtil.asMap(data.get("examenFisico"));
        for (Map.Entry<String, Object> regionEntry : examen.entrySet()) {
            if ("incontinencia".equals(regionEntry.getKey())) {
                continue;
            }
            Map<String, Object> fields = FormMapUtil.asMap(regionEntry.getValue());
            for (Map.Entry<String, Object> field : fields.entrySet()) {
                String valor = FormMapUtil.str(field.getValue());
                if (valor == null) {
                    continue;
                }
                jdbc.update(
                        "INSERT INTO hallazgos_examen_fisico (examen_fisico_id, region, campo, valor) VALUES (?,?,?,?)",
                        fichaId, regionEntry.getKey(), field.getKey(), valor);
            }
        }
    }

    private void loadExamenFisico(String fichaId, Map<String, Object> data) {
        Map<String, Object> examenFisico = new LinkedHashMap<>();
        Map<String, Map<String, Object>> regions = new LinkedHashMap<>();
        jdbc.query(
                "SELECT region, campo, valor FROM hallazgos_examen_fisico WHERE examen_fisico_id = ?",
                rs -> {
                    String region = rs.getString("region");
                    regions.computeIfAbsent(region, k -> new LinkedHashMap<>());
                    regions.get(region).put(rs.getString("campo"), rs.getString("valor"));
                },
                fichaId);
        examenFisico.putAll(regions);
        Map<String, Object> incontinencia = new LinkedHashMap<>();
        jdbc.query("SELECT * FROM incontinencia WHERE examen_fisico_id = ?", rs -> {
            incontinencia.put("presenta", rs.getString("presenta"));
            incontinencia.put("momento", rs.getString("momento"));
            incontinencia.put("lesiones", rs.getString("lesiones"));
            incontinencia.put("ulceras", rs.getString("ulceras"));
            incontinencia.put("hongos", rs.getString("hongos"));
            incontinencia.put("secreciones", rs.getString("secreciones"));
            incontinencia.put("prolapso", rs.getString("prolapso"));
            incontinencia.put("presenciaSonda", rs.getString("presencia_sonda"));
        }, fichaId);
        examenFisico.put("incontinencia", incontinencia);
        data.put("examenFisico", examenFisico);
    }

    private void replaceValoresSistema(String fichaId, Map<String, Object> data) {
        jdbc.update("DELETE FROM valores_sistema WHERE revision_id = ?", fichaId);
        Map<String, Object> revision = FormMapUtil.asMap(data.get("revisionSistemas"));
        for (Map.Entry<String, String> entry : flattenRevisionSistemas(revision).entrySet()) {
            jdbc.update(
                    "INSERT INTO valores_sistema (revision_id, sistema, valor) VALUES (?,?,?)",
                    fichaId, entry.getKey(), entry.getValue());
        }
    }

    private Map<String, String> flattenRevisionSistemas(Map<String, Object> revision) {
        Map<String, String> out = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : revision.entrySet()) {
            Object value = entry.getValue();
            if (value instanceof Map<?, ?> nested) {
                for (Map.Entry<?, ?> sub : nested.entrySet()) {
                    String subVal = FormMapUtil.str(sub.getValue());
                    if (subVal != null) {
                        out.put(entry.getKey() + "." + sub.getKey(), subVal);
                    }
                }
                continue;
            }
            String valor = FormMapUtil.str(value);
            if (valor != null) {
                out.put(entry.getKey(), valor);
            }
        }
        return out;
    }

    private void loadRevisionSistemas(String fichaId, Map<String, Object> data) {
        Map<String, Object> revisionSistemas = new LinkedHashMap<>();
        Map<String, Map<String, Object>> nestedGroups = new LinkedHashMap<>();
        jdbc.query(
                "SELECT sistema, valor FROM valores_sistema WHERE revision_id = ?",
                rs -> {
                    String sistema = rs.getString("sistema");
                    String valor = rs.getString("valor");
                    if (sistema == null) {
                        return;
                    }
                    int dot = sistema.indexOf('.');
                    if (dot > 0) {
                        String parent = sistema.substring(0, dot);
                        String child = sistema.substring(dot + 1);
                        nestedGroups
                                .computeIfAbsent(parent, key -> new LinkedHashMap<>())
                                .put(child, valor != null ? valor : "");
                    } else {
                        revisionSistemas.put(sistema, valor != null ? valor : "");
                    }
                },
                fichaId);
        for (Map.Entry<String, Map<String, Object>> entry : nestedGroups.entrySet()) {
            revisionSistemas.put(entry.getKey(), entry.getValue());
        }
        normalizeLegacyRespiratorio(revisionSistemas);
        data.put("revisionSistemas", revisionSistemas);
    }

    private void normalizeLegacyRespiratorio(Map<String, Object> revisionSistemas) {
        Object resp = revisionSistemas.get("respiratorio");
        if (!(resp instanceof String raw)) {
            return;
        }
        String trimmed = raw.trim();
        if (!trimmed.startsWith("{") || !trimmed.contains("=")) {
            Map<String, Object> nested = new LinkedHashMap<>();
            nested.put("sonoridad", trimmed);
            nested.put("eupnea", "");
            nested.put("bradipnea", "");
            nested.put("taquipnea", "");
            revisionSistemas.put("respiratorio", nested);
            return;
        }
        revisionSistemas.put("respiratorio", parseJavaMapString(trimmed));
    }

    private Map<String, Object> parseJavaMapString(String raw) {
        Map<String, Object> out = new LinkedHashMap<>();
        String inner = raw.trim();
        if (inner.startsWith("{")) {
            inner = inner.substring(1);
        }
        if (inner.endsWith("}")) {
            inner = inner.substring(0, inner.length() - 1);
        }
        if (inner.isBlank()) {
            return out;
        }
        for (String part : inner.split(",\\s*")) {
            int eq = part.indexOf('=');
            if (eq <= 0) {
                continue;
            }
            String key = part.substring(0, eq).trim();
            String val = part.substring(eq + 1).trim();
            out.put(key, val);
        }
        return out;
    }

    private void replaceCamposExamenMental(String fichaId, Map<String, Object> data) {
        jdbc.update("DELETE FROM campos_examen_mental WHERE examen_mental_id = ?", fichaId);
        Map<String, Object> mental = FormMapUtil.asMap(data.get("examenMental"));
        for (Map.Entry<String, Object> entry : mental.entrySet()) {
            String valor = FormMapUtil.str(entry.getValue());
            if (valor == null) {
                continue;
            }
            jdbc.update(
                    "INSERT INTO campos_examen_mental (examen_mental_id, campo, valor) VALUES (?,?,?)",
                    fichaId, entry.getKey(), valor);
        }
    }

    private void loadExamenMental(String fichaId, Map<String, Object> data) {
        Map<String, Object> examenMental = new LinkedHashMap<>();
        jdbc.query(
                "SELECT campo, valor FROM campos_examen_mental WHERE examen_mental_id = ?",
                rs -> {
                    examenMental.put(rs.getString("campo"), rs.getString("valor"));
                },
                fichaId);
        data.put("examenMental", examenMental);
    }

    private static Date toSqlDate(LocalDate date) {
        return date != null ? Date.valueOf(date) : null;
    }

    private static String formatDate(Date date) {
        return date != null ? date.toLocalDate().toString() : "";
    }

    private static String decimalToString(BigDecimal value) {
        return value != null ? value.stripTrailingZeros().toPlainString() : "";
    }

    private static Object parseScaleValue(String valor, Integer puntaje) {
        if ("true".equals(valor)) {
            return true;
        }
        if ("false".equals(valor)) {
            return false;
        }
        if ("si".equals(valor) || "no".equals(valor)) {
            return valor;
        }
        if (puntaje != null) {
            return puntaje;
        }
        try {
            return Integer.parseInt(valor);
        } catch (NumberFormatException ex) {
            return valor;
        }
    }
}
