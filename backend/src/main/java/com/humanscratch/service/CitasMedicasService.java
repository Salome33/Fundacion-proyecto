package com.humanscratch.service;

import com.humanscratch.domain.CitaMedica;
import com.humanscratch.domain.FichaClinica;
import com.humanscratch.repository.CitaMedicaRepository;
import com.humanscratch.repository.FichaClinicaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class CitasMedicasService {

    private final CitaMedicaRepository citaRepository;
    private final FichaClinicaRepository fichaRepository;

    public CitasMedicasService(CitaMedicaRepository citaRepository, FichaClinicaRepository fichaRepository) {
        this.citaRepository = citaRepository;
        this.fichaRepository = fichaRepository;
    }

    public List<CitaDto> listAll() {
        return citaRepository.findAll().stream()
                .sorted(Comparator.comparing(CitaMedica::getFecha).thenComparing(CitaMedica::getHora))
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public CitaDto create(CitaInput input) {
        FichaClinica ficha = resolveFicha(input.fichaId(), input.patientNombre(), input.patientIdentificacion());
        CitaMedica cita = new CitaMedica();
        cita.setId(UUID.randomUUID().toString());
        cita.setFichaId(ficha.getId());
        cita.setTipoCita(input.tipoCita());
        cita.setFecha(DateParseUtil.parseDate(input.fecha()));
        cita.setHora(input.hora());
        cita.setNombreMedico(input.nombreMedico());
        cita.setFinalizada(false);
        cita.setCreatedAt(Instant.now());
        return toDto(citaRepository.save(cita));
    }

    @Transactional
    public CitaDto finalizeCita(String id) {
        CitaMedica cita = citaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        cita.setFinalizada(true);
        cita.setFinalizadaAt(Instant.now());
        return toDto(citaRepository.save(cita));
    }

    @Transactional
    public void delete(String id) {
        citaRepository.deleteById(id);
    }

    private FichaClinica resolveFicha(String fichaId, String nombre, String identificacion) {
        if (fichaId != null && !fichaId.isBlank()) {
            return fichaRepository.findById(fichaId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ficha no registrada"));
        }
        return fichaRepository.findAll().stream()
                .filter(f -> f.getNombre().equalsIgnoreCase(nombre.trim())
                        && f.getIdentificacion().equalsIgnoreCase(identificacion.trim()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ficha no registrada"));
    }

    private CitaDto toDto(CitaMedica cita) {
        FichaClinica ficha = fichaRepository.findById(cita.getFichaId()).orElse(null);
        return new CitaDto(
                cita.getId(),
                cita.getFichaId(),
                ficha != null ? ficha.getNombre() : "",
                ficha != null ? ficha.getIdentificacion() : "",
                cita.getTipoCita(),
                cita.getFecha().toString(),
                cita.getHora(),
                cita.getNombreMedico(),
                cita.isFinalizada(),
                cita.getFinalizadaAt() != null ? cita.getFinalizadaAt().toString() : null,
                cita.getCreatedAt().toString()
        );
    }

    public record CitaInput(
            String fichaId,
            String patientNombre,
            String patientIdentificacion,
            String tipoCita,
            String fecha,
            String hora,
            String nombreMedico
    ) {}

    public record CitaDto(
            String id,
            String fichaId,
            String patientNombre,
            String patientIdentificacion,
            String tipoCita,
            String fecha,
            String hora,
            String nombreMedico,
            boolean finalizada,
            String finalizadaAt,
            String createdAt
    ) {}
}
