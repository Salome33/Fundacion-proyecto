package com.humanscratch.repository;

import com.humanscratch.domain.auth.Sesion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SesionRepository extends JpaRepository<Sesion, Long> {
}
