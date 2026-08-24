package com.humanscratch.repository;

import com.humanscratch.domain.SignoVitalDiario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SignoVitalDiarioRepository extends JpaRepository<SignoVitalDiario, String> {
    List<SignoVitalDiario> findByFichaIdOrderByFechaDescTurnoAsc(String fichaId);

    Optional<SignoVitalDiario> findByFichaIdAndFechaAndTurno(String fichaId, LocalDate fecha, String turno);
}
