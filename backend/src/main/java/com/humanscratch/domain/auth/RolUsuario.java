package com.humanscratch.domain.auth;

import jakarta.persistence.*;

@Entity
@Table(name = "rol_usuario")
public class RolUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String rol;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(columnDefinition = "text")
    private String descripcion;

    public Long getId() { return id; }
    public String getRol() { return rol; }
    public String getNombre() { return nombre; }
    public String getDescripcion() { return descripcion; }

    public void setRol(String rol) { this.rol = rol; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
