package com.humanscratch.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "notas_enfermeria")
public class NotaEnfermeria {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "ficha_id", nullable = false, length = 64)
    private String fichaId;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, length = 10)
    private String hora;

    @Column(nullable = false, columnDefinition = "text")
    private String detalle;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public NotaEnfermeria() {
    }

    public String getId() { return id; }
    public String getFichaId() { return fichaId; }
    public LocalDate getFecha() { return fecha; }
    public String getHora() { return hora; }
    public String getDetalle() { return detalle; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setFichaId(String fichaId) { this.fichaId = fichaId; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public void setHora(String hora) { this.hora = hora; }
    public void setDetalle(String detalle) { this.detalle = detalle; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
