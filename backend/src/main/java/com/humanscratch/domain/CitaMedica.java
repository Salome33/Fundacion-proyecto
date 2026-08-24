package com.humanscratch.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "citas_medicas")
public class CitaMedica {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "ficha_id", nullable = false, length = 64)
    private String fichaId;

    @Column(name = "tipo_cita", nullable = false, length = 120)
    private String tipoCita;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(length = 10)
    private String hora;

    @Column(name = "nombre_medico", nullable = false)
    private String nombreMedico;

    @Column(nullable = false)
    private boolean finalizada;

    @Column(name = "finalizada_at")
    private Instant finalizadaAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public CitaMedica() {
    }

    public String getId() { return id; }
    public String getFichaId() { return fichaId; }
    public String getTipoCita() { return tipoCita; }
    public LocalDate getFecha() { return fecha; }
    public String getHora() { return hora; }
    public String getNombreMedico() { return nombreMedico; }
    public boolean isFinalizada() { return finalizada; }
    public Instant getFinalizadaAt() { return finalizadaAt; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setFichaId(String fichaId) { this.fichaId = fichaId; }
    public void setTipoCita(String tipoCita) { this.tipoCita = tipoCita; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public void setHora(String hora) { this.hora = hora; }
    public void setNombreMedico(String nombreMedico) { this.nombreMedico = nombreMedico; }
    public void setFinalizada(boolean finalizada) { this.finalizada = finalizada; }
    public void setFinalizadaAt(Instant finalizadaAt) { this.finalizadaAt = finalizadaAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
