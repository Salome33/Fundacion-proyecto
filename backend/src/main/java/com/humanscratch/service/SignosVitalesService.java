package com.humanscratch.service;

import com.humanscratch.domain.FichaClinica;
import com.humanscratch.domain.SignoVitalDiario;
import com.humanscratch.repository.FichaClinicaRepository;
import com.humanscratch.repository.SignoVitalDiarioRepository;
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
public class SignosVitalesService {

    private final SignoVitalDiarioRepository vitalesRepository;
    private final FichaClinicaRepository fichaRepository;

    public SignosVitalesService(SignoVitalDiarioRepository vitalesRepository, FichaClinicaRepository fichaRepository) {
        this.vitalesRepository = vitalesRepository;
        this.fichaRepository = fichaRepository;
    }

    public List<VitalDto> listAll() {
        return vitalesRepository.findAll().stream()
                .sorted(Comparator.comparing(SignoVitalDiario::getFecha).reversed())
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public VitalDto upsert(VitalInput input) {
        FichaClinica ficha = resolveFicha(input.patientNombre(), input.patientIdentificacion());
        LocalDate fecha = DateParseUtil.parseDate(input.fecha());
        SignoVitalDiario entity = vitalesRepository
                .findByFichaIdAndFechaAndTurno(ficha.getId(), fecha, input.turno())
                .orElseGet(SignoVitalDiario::new);
        if (entity.getId() == null) {
            entity.setId(UUID.randomUUID().toString());
            entity.setCreatedAt(Instant.now());
        }
        entity.setFichaId(ficha.getId());
        entity.setFecha(fecha);
        entity.setTurno(input.turno());
        entity.setTa(input.ta());
        entity.setFc(input.fc());
        entity.setFr(input.fr());
        entity.setSpo2(input.spo2());
        return toDto(vitalesRepository.save(entity));
    }

    @Transactional
    public void delete(String id) {
        vitalesRepository.deleteById(id);
    }

    private FichaClinica resolveFicha(String nombre, String identificacion) {
        return fichaRepository.findAll().stream()
                .filter(f -> f.getNombre().equalsIgnoreCase(nombre.trim())
                        && f.getIdentificacion().equalsIgnoreCase(identificacion.trim()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ficha no registrada"));
    }

    private VitalDto toDto(SignoVitalDiario e) {
        FichaClinica ficha = fichaRepository.findById(e.getFichaId()).orElse(null);
        return new VitalDto(
                e.getId(),
                e.getFichaId(),
                ficha != null ? ficha.getNombre() : "",
                ficha != null ? ficha.getIdentificacion() : "",
                DateParseUtil.formatDisplay(e.getFecha()),
                e.getTurno(),
                e.getTa(),
                e.getFc(),
                e.getFr(),
                e.getSpo2(),
                e.getCreatedAt().toString()
        );
    }

    public record VitalInput(
            String patientNombre,
            String patientIdentificacion,
            String fecha,
            String turno,
            String ta,
            String fc,
            String fr,
            String spo2
    ) {}

    public record VitalDto(
            String id,
            String fichaId,
            String patientNombre,
            String patientIdentificacion,
            String fecha,
            String turno,
            String ta,
            String fc,
            String fr,
            String spo2,
            String createdAt
    ) {}
}
