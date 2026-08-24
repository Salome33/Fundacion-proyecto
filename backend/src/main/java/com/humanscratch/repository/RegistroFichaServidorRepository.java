package com.humanscratch.repository;

import com.humanscratch.domain.RegistroFichaServidor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegistroFichaServidorRepository extends JpaRepository<RegistroFichaServidor, Long> {
    Optional<RegistroFichaServidor> findByFichaId(String fichaId);
}
