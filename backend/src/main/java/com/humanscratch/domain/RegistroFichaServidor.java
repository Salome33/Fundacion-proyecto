package com.humanscratch.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "registro_ficha_servidor")
public class RegistroFichaServidor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ficha_id", nullable = false, unique = true, length = 64)
    private String fichaId;

    @Column(name = "guardado_en", nullable = false)
    private Instant guardadoEn;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> datos;

    @Column(name = "id_cliente", nullable = false, unique = true, length = 64)
    private String idCliente;

    protected RegistroFichaServidor() {
    }

    public RegistroFichaServidor(String fichaId, Instant guardadoEn, Map<String, Object> datos, String idCliente) {
        this.fichaId = fichaId;
        this.guardadoEn = guardadoEn;
        this.datos = datos;
        this.idCliente = idCliente;
    }

    public Long getId() { return id; }
    public String getFichaId() { return fichaId; }
    public Instant getGuardadoEn() { return guardadoEn; }
    public Map<String, Object> getDatos() { return datos; }
    public String getIdCliente() { return idCliente; }

    public void setGuardadoEn(Instant guardadoEn) { this.guardadoEn = guardadoEn; }
    public void setDatos(Map<String, Object> datos) { this.datos = datos; }
}
