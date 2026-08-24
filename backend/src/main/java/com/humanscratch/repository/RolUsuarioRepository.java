package com.humanscratch.repository;

import com.humanscratch.domain.auth.RolUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RolUsuarioRepository extends JpaRepository<RolUsuario, Long> {
    Optional<RolUsuario> findByRol(String rol);
}
