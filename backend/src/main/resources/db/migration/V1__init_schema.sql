-- Esquema relacional — Fundación Manos Unidas de Dios
-- IDs de ficha: VARCHAR(64) UUID del cliente Angular

CREATE TABLE rol_usuario (
    id          BIGSERIAL PRIMARY KEY,
    rol         VARCHAR(50)  NOT NULL UNIQUE,
    nombre      VARCHAR(120) NOT NULL,
    descripcion TEXT
);

CREATE TABLE usuarios (
    id                   BIGSERIAL PRIMARY KEY,
    username             VARCHAR(80)  NOT NULL UNIQUE,
    password_hash        VARCHAR(255) NOT NULL,
    nombres              VARCHAR(120),
    apellidos            VARCHAR(120),
    correo               VARCHAR(160),
    documento_identidad  VARCHAR(40),
    rol_id               BIGINT NOT NULL REFERENCES rol_usuario (id),
    estado               VARCHAR(20) NOT NULL DEFAULT 'activo',
    fecha_registro       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sesiones (
    id          BIGSERIAL PRIMARY KEY,
    usuario_id  BIGINT NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
    inicio_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fin_at      TIMESTAMPTZ,
    ip_address  VARCHAR(64)
);

CREATE TABLE ficha_clinica (
    id                      VARCHAR(64) PRIMARY KEY,
    creado_por_id           BIGINT REFERENCES usuarios (id),
    actualizado_por_id      BIGINT REFERENCES usuarios (id),
    contrato_numero         VARCHAR(80),
    nombre                  VARCHAR(255) NOT NULL,
    identificacion          VARCHAR(64),
    observaciones_generales TEXT,
    client_id               VARCHAR(64) NOT NULL UNIQUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE registro_ficha_servidor (
    id          BIGSERIAL PRIMARY KEY,
    ficha_id    VARCHAR(64) NOT NULL UNIQUE REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    guardado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    datos       JSONB       NOT NULL,
    id_cliente  VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE datos_personales (
    ficha_id              VARCHAR(64) PRIMARY KEY REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    fecha_ingreso         DATE,
    fecha_actualizacion   DATE,
    modalidad             VARCHAR(80),
    nombre_apellidos      VARCHAR(255),
    identificacion        VARCHAR(64),
    lugar_expedicion      VARCHAR(120),
    fecha_expedicion      DATE,
    lugar_nacimiento      VARCHAR(120),
    fecha_nacimiento      DATE,
    edad                  VARCHAR(20),
    rh                    VARCHAR(10),
    sexo                  VARCHAR(20),
    estado_civil          VARCHAR(40),
    nombre_conyuge        VARCHAR(255),
    estudios              VARCHAR(120),
    eps                   VARCHAR(120),
    regimen               VARCHAR(80),
    lugar_atencion        VARCHAR(120),
    servicios_funerarios  VARCHAR(120),
    profesion             VARCHAR(120),
    confesion_religiosa   VARCHAR(120),
    foto_url              TEXT
);

CREATE TABLE datos_economicos (
    ficha_id              VARCHAR(64) PRIMARY KEY REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    ingresos_de           VARCHAR(120),
    apoyo_gubernamental   VARCHAR(120),
    vivienda_tipo         VARCHAR(80),
    direccion             TEXT
);

CREATE TABLE datos_familiares (
    ficha_id                VARCHAR(64) PRIMARY KEY REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    nombre_madre            VARCHAR(255),
    nombre_padre            VARCHAR(255),
    con_quien_vive          VARCHAR(255),
    cuidador_principal      VARCHAR(255),
    familiares_cercanos     TEXT,
    frecuencia_visitas      VARCHAR(80),
    relacion_familia        TEXT,
    decision_emergencia     VARCHAR(255),
    actividades_sociales    TEXT,
    antecedentes_maltrato   TEXT,
    expectativas            TEXT,
    razon_ingreso           TEXT
);

CREATE TABLE perfil_clinico (
    ficha_id       VARCHAR(64) PRIMARY KEY REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    patologia      TEXT,
    alergias_med   TEXT,
    alergias_alim  TEXT,
    alergias_otros TEXT
);

CREATE TABLE autopercepcion (
    ficha_id                  VARCHAR(64) PRIMARY KEY REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    estado_salud              TEXT,
    anamnesis_aspecto         TEXT,
    anamnesis_emocional       TEXT,
    anamnesis_fisico          TEXT,
    higienico                 TEXT,
    nutricional               TEXT,
    ayuda_movilizarse         TEXT,
    inmovilizacion            TEXT,
    autoriza_inmovilizacion   TEXT,
    camina_solo               TEXT,
    camina_baston             TEXT,
    silla_ruedas              TEXT,
    mss                       TEXT,
    mii                       TEXT
);

CREATE TABLE habito_tabaco (
    ficha_id   VARCHAR(64) PRIMARY KEY REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    consume    VARCHAR(20),
    frecuencia VARCHAR(80)
);

CREATE TABLE habito_alcohol (
    ficha_id   VARCHAR(64) PRIMARY KEY REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    consume    VARCHAR(20),
    frecuencia VARCHAR(80)
);

CREATE TABLE otra_sustancia_principal (
    ficha_id   VARCHAR(64) PRIMARY KEY REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    nombre     VARCHAR(120),
    frecuencia VARCHAR(80)
);

CREATE TABLE antecedentes (
    ficha_id        VARCHAR(64) PRIMARY KEY REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    quirurgicos     TEXT,
    patologicos     TEXT,
    farmacologicos  TEXT,
    alergicos       TEXT,
    cancer          TEXT
);

CREATE TABLE antecedentes_caidas (
    ficha_id              VARCHAR(64) PRIMARY KEY REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    caidas_propia_altura  TEXT,
    riesgo_caida          TEXT
);

CREATE TABLE signos_vitales_ingreso (
    ficha_id VARCHAR(64) PRIMARY KEY REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    ta       VARCHAR(40),
    fc       VARCHAR(40),
    fr       VARCHAR(40),
    spo2     VARCHAR(40),
    peso     DECIMAL(8, 2),
    talla    DECIMAL(8, 2),
    imc      DECIMAL(8, 2)
);

CREATE TABLE modelo_corporal (
    ficha_id                    VARCHAR(64) PRIMARY KEY REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    body_paint_image            TEXT,
    descripcion_observaciones   TEXT
);

CREATE TABLE valoracion_geriatrica (
    ficha_id               VARCHAR(64) PRIMARY KEY REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    escalas_observaciones  TEXT
);

CREATE TABLE declaracion_acudiente (
    ficha_id   VARCHAR(64) PRIMARY KEY REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    nombre     VARCHAR(255),
    documento  VARCHAR(64),
    firma_url  TEXT,
    fecha      DATE
);

CREATE TABLE examen_fisico (
    ficha_id VARCHAR(64) PRIMARY KEY REFERENCES ficha_clinica (id) ON DELETE CASCADE
);

CREATE TABLE revision_sistemas (
    ficha_id VARCHAR(64) PRIMARY KEY REFERENCES ficha_clinica (id) ON DELETE CASCADE
);

CREATE TABLE examen_mental (
    ficha_id VARCHAR(64) PRIMARY KEY REFERENCES ficha_clinica (id) ON DELETE CASCADE
);

CREATE TABLE incontinencia (
    examen_fisico_id VARCHAR(64) PRIMARY KEY REFERENCES examen_fisico (ficha_id) ON DELETE CASCADE,
    presenta         VARCHAR(20),
    momento          VARCHAR(80),
    lesiones         TEXT,
    ulceras          TEXT,
    hongos           TEXT,
    secreciones      TEXT,
    prolapso         TEXT,
    presencia_sonda  TEXT
);

CREATE TABLE hijos (
    id        BIGSERIAL PRIMARY KEY,
    ficha_id  VARCHAR(64) NOT NULL REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    orden     INT NOT NULL DEFAULT 0,
    nombre    VARCHAR(255),
    contacto  VARCHAR(80),
    email     VARCHAR(160)
);

CREATE TABLE referencias_personales (
    id         BIGSERIAL PRIMARY KEY,
    ficha_id   VARCHAR(64) NOT NULL REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    orden      INT NOT NULL DEFAULT 0,
    nombre     VARCHAR(255),
    contacto   VARCHAR(80),
    direccion  TEXT,
    relacion   VARCHAR(80),
    foto_url   TEXT
);

CREATE TABLE acudientes (
    id                BIGSERIAL PRIMARY KEY,
    ficha_id          VARCHAR(64) NOT NULL REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    orden             INT NOT NULL DEFAULT 0,
    nombre            VARCHAR(255),
    identificacion    VARCHAR(64),
    contacto          VARCHAR(80),
    email             VARCHAR(160),
    direccion         TEXT,
    ingresos_dependen VARCHAR(80),
    parentesco        VARCHAR(80),
    foto_url          TEXT
);

CREATE TABLE medicamentos (
    id        BIGSERIAL PRIMARY KEY,
    ficha_id  VARCHAR(64) NOT NULL REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    orden     INT NOT NULL DEFAULT 0,
    nombre    VARCHAR(255),
    dosis     VARCHAR(120),
    horarios  VARCHAR(120)
);

CREATE TABLE otras_sustancias (
    id         BIGSERIAL PRIMARY KEY,
    ficha_id   VARCHAR(64) NOT NULL REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    orden      INT NOT NULL DEFAULT 0,
    nombre     VARCHAR(120),
    frecuencia VARCHAR(80)
);

CREATE TABLE remisiones_especialistas (
    id            BIGSERIAL PRIMARY KEY,
    ficha_id      VARCHAR(64) NOT NULL REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    orden         INT NOT NULL DEFAULT 0,
    especialidad  VARCHAR(120),
    frecuencia    VARCHAR(80),
    tratamiento   TEXT
);

CREATE TABLE profesionales_diligencia (
    id         BIGSERIAL PRIMARY KEY,
    ficha_id   VARCHAR(64) NOT NULL REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    orden      INT NOT NULL DEFAULT 0,
    nombre     VARCHAR(255),
    cargo      VARCHAR(120),
    documento  VARCHAR(64),
    fecha      DATE,
    firma_url  TEXT
);

CREATE TABLE conceptos_aprobacion (
    id             BIGSERIAL PRIMARY KEY,
    ficha_id       VARCHAR(64) NOT NULL REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    tipo           VARCHAR(80),
    fecha          DATE,
    favorable      VARCHAR(20),
    justificacion  TEXT
);

CREATE TABLE firmas_aprobacion (
    id           BIGSERIAL PRIMARY KEY,
    concepto_id  BIGINT NOT NULL REFERENCES conceptos_aprobacion (id) ON DELETE CASCADE,
    orden        INT NOT NULL DEFAULT 0,
    firma_url    TEXT
);

CREATE TABLE respuestas_escala (
    id        BIGSERIAL PRIMARY KEY,
    ficha_id  VARCHAR(64) NOT NULL REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    escala    VARCHAR(80) NOT NULL,
    item_id   VARCHAR(80) NOT NULL,
    valor     VARCHAR(255),
    puntaje   INT
);

CREATE TABLE hallazgos_examen_fisico (
    id               BIGSERIAL PRIMARY KEY,
    examen_fisico_id VARCHAR(64) NOT NULL REFERENCES examen_fisico (ficha_id) ON DELETE CASCADE,
    region           VARCHAR(80),
    campo            VARCHAR(80),
    valor            TEXT
);

CREATE TABLE valores_sistema (
    id          BIGSERIAL PRIMARY KEY,
    revision_id VARCHAR(64) NOT NULL REFERENCES revision_sistemas (ficha_id) ON DELETE CASCADE,
    sistema     VARCHAR(80),
    valor       TEXT
);

CREATE TABLE campos_examen_mental (
    id               BIGSERIAL PRIMARY KEY,
    examen_mental_id VARCHAR(64) NOT NULL REFERENCES examen_mental (ficha_id) ON DELETE CASCADE,
    campo            VARCHAR(80),
    valor            TEXT
);

CREATE TABLE citas_medicas (
    id              VARCHAR(64) PRIMARY KEY,
    ficha_id        VARCHAR(64) NOT NULL REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    tipo_cita       VARCHAR(120) NOT NULL,
    fecha           DATE NOT NULL,
    hora            VARCHAR(10),
    nombre_medico   VARCHAR(255) NOT NULL,
    finalizada      BOOLEAN NOT NULL DEFAULT FALSE,
    finalizada_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE signos_vitales_diarios (
    id         VARCHAR(64) PRIMARY KEY,
    ficha_id   VARCHAR(64) NOT NULL REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    fecha      DATE NOT NULL,
    turno      VARCHAR(20) NOT NULL,
    ta         VARCHAR(40),
    fc         VARCHAR(40),
    fr         VARCHAR(40),
    spo2       VARCHAR(40),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (ficha_id, fecha, turno)
);

CREATE TABLE notas_enfermeria (
    id         VARCHAR(64) PRIMARY KEY,
    ficha_id   VARCHAR(64) NOT NULL REFERENCES ficha_clinica (id) ON DELETE CASCADE,
    fecha      DATE NOT NULL,
    hora       VARCHAR(10) NOT NULL,
    detalle    TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ficha_clinica_nombre ON ficha_clinica (nombre);
CREATE INDEX idx_ficha_clinica_identificacion ON ficha_clinica (identificacion);
CREATE INDEX idx_citas_ficha ON citas_medicas (ficha_id);
CREATE INDEX idx_vitales_ficha ON signos_vitales_diarios (ficha_id);
CREATE INDEX idx_notas_ficha ON notas_enfermeria (ficha_id);
