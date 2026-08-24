package com.humanscratch.repository;

import com.humanscratch.domain.NotaEnfermeria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotaEnfermeriaRepository extends JpaRepository<NotaEnfermeria, String> {
    List<NotaEnfermeria> findByFichaIdOrderByFechaDescHoraDesc(String fichaId);
}
