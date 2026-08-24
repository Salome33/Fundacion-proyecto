package com.humanscratch.domain.auth;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "sesiones")
public class Sesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "inicio_at", nullable = false)
    private Instant inicioAt;

    @Column(name = "fin_at")
    private Instant finAt;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public Instant getInicioAt() { return inicioAt; }

    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public void setInicioAt(Instant inicioAt) { this.inicioAt = inicioAt; }
    public void setFinAt(Instant finAt) { this.finAt = finAt; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
}
