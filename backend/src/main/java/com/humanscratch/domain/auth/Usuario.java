package com.humanscratch.domain.auth;

import jakarta.persistence.*;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 80)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rol_id", nullable = false)
    private RolUsuario rol;

    @Column(nullable = false, length = 20)
    private String estado = "activo";

    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public RolUsuario getRol() { return rol; }
    public String getEstado() { return estado; }

    public void setUsername(String username) { this.username = username; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setRol(RolUsuario rol) { this.rol = rol; }
    public void setEstado(String estado) { this.estado = estado; }
}
