package com.humanscratch.repository;

import com.humanscratch.domain.CitaMedica;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CitaMedicaRepository extends JpaRepository<CitaMedica, String> {
    List<CitaMedica> findByFichaIdOrderByFechaDescHoraDesc(String fichaId);
}
