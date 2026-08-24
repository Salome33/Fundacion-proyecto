package com.humanscratch.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ficha_clinica")
public class FichaClinica {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "client_id", nullable = false, unique = true, length = 64)
    private String clientId;

    @Column(nullable = false)
    private String nombre;

    @Column(length = 64)
    private String identificacion;

    @Column(name = "contrato_numero", length = 80)
    private String contratoNumero;

    @Column(name = "observaciones_generales", columnDefinition = "text")
    private String observacionesGenerales;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected FichaClinica() {
    }

    public FichaClinica(String id, String clientId, String nombre, String identificacion, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.clientId = clientId;
        this.nombre = nombre;
        this.identificacion = identificacion;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public String getClientId() { return clientId; }
    public String getNombre() { return nombre; }
    public String getIdentificacion() { return identificacion; }
    public String getContratoNumero() { return contratoNumero; }
    public String getObservacionesGenerales() { return observacionesGenerales; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setIdentificacion(String identificacion) { this.identificacion = identificacion; }
    public void setContratoNumero(String contratoNumero) { this.contratoNumero = contratoNumero; }
    public void setObservacionesGenerales(String observacionesGenerales) { this.observacionesGenerales = observacionesGenerales; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
