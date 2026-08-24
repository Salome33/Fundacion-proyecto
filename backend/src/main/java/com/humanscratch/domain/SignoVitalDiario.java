package com.humanscratch.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "signos_vitales_diarios")
public class SignoVitalDiario {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "ficha_id", nullable = false, length = 64)
    private String fichaId;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false, length = 20)
    private String turno;

    private String ta;
    private String fc;
    private String fr;
    private String spo2;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public SignoVitalDiario() {
    }

    public String getId() { return id; }
    public String getFichaId() { return fichaId; }
    public LocalDate getFecha() { return fecha; }
    public String getTurno() { return turno; }
    public String getTa() { return ta; }
    public String getFc() { return fc; }
    public String getFr() { return fr; }
    public String getSpo2() { return spo2; }
    public Instant getCreatedAt() { return createdAt; }

    public void setId(String id) { this.id = id; }
    public void setFichaId(String fichaId) { this.fichaId = fichaId; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public void setTurno(String turno) { this.turno = turno; }
    public void setTa(String ta) { this.ta = ta; }
    public void setFc(String fc) { this.fc = fc; }
    public void setFr(String fr) { this.fr = fr; }
    public void setSpo2(String spo2) { this.spo2 = spo2; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
