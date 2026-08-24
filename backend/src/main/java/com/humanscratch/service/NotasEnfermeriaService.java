package com.humanscratch.service;

import com.humanscratch.domain.FichaClinica;
import com.humanscratch.domain.NotaEnfermeria;
import com.humanscratch.repository.FichaClinicaRepository;
import com.humanscratch.repository.NotaEnfermeriaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class NotasEnfermeriaService {

    private final NotaEnfermeriaRepository notaRepository;
    private final FichaClinicaRepository fichaRepository;

    public NotasEnfermeriaService(NotaEnfermeriaRepository notaRepository, FichaClinicaRepository fichaRepository) {
        this.notaRepository = notaRepository;
        this.fichaRepository = fichaRepository;
    }

    public List<NotaDto> listAll() {
        return notaRepository.findAll().stream()
                .sorted(Comparator.comparing(NotaEnfermeria::getFecha).reversed().thenComparing(NotaEnfermeria::getHora).reversed())
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public NotaDto create(NotaInput input) {
        FichaClinica ficha = resolveFicha(input.patientNombre(), input.patientIdentificacion());
        NotaEnfermeria nota = new NotaEnfermeria();
        nota.setId(UUID.randomUUID().toString());
        nota.setFichaId(ficha.getId());
        nota.setFecha(DateParseUtil.parseDate(input.fecha()));
        nota.setHora(input.hora());
        nota.setDetalle(input.detalle());
        nota.setCreatedAt(Instant.now());
        return toDto(notaRepository.save(nota));
    }

    @Transactional
    public void delete(String id) {
        notaRepository.deleteById(id);
    }

    private FichaClinica resolveFicha(String nombre, String identificacion) {
        return fichaRepository.findAll().stream()
                .filter(f -> f.getNombre().equalsIgnoreCase(nombre.trim())
                        && f.getIdentificacion().equalsIgnoreCase(identificacion.trim()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ficha no registrada"));
    }

    private NotaDto toDto(NotaEnfermeria n) {
        FichaClinica ficha = fichaRepository.findById(n.getFichaId()).orElse(null);
        return new NotaDto(
                n.getId(),
                n.getFichaId(),
                ficha != null ? ficha.getNombre() : "",
                ficha != null ? ficha.getIdentificacion() : "",
                DateParseUtil.formatDisplay(n.getFecha()),
                n.getHora(),
                n.getDetalle(),
                n.getCreatedAt().toString()
        );
    }

    public record NotaInput(String patientNombre, String patientIdentificacion, String fecha, String hora, String detalle) {}

    public record NotaDto(
            String id,
            String fichaId,
            String patientNombre,
            String patientIdentificacion,
            String fecha,
            String hora,
            String detalle,
            String createdAt
    ) {}
}
