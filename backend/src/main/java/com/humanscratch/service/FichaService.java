package com.humanscratch.service;

import com.humanscratch.domain.FichaClinica;
import com.humanscratch.domain.RegistroFichaServidor;
import com.humanscratch.repository.FichaClinicaRepository;
import com.humanscratch.repository.RegistroFichaServidorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class FichaService {

    private final FichaClinicaRepository fichaRepository;
    private final RegistroFichaServidorRepository registroRepository;
    private final FichaFormPersistenceService formPersistence;

    public FichaService(
            FichaClinicaRepository fichaRepository,
            RegistroFichaServidorRepository registroRepository,
            FichaFormPersistenceService formPersistence) {
        this.fichaRepository = fichaRepository;
        this.registroRepository = registroRepository;
        this.formPersistence = formPersistence;
    }

    public List<IntakeRecordDto> listAll() {
        return fichaRepository.findAll().stream()
                .sorted(Comparator.comparing(FichaClinica::getUpdatedAt).reversed())
                .map(this::toDto)
                .filter(Objects::nonNull)
                .toList();
    }

    public IntakeRecordDto findById(String id) {
        return fichaRepository.findById(id).map(this::toDto).orElse(null);
    }

    @Transactional
    public IntakeRecordDto save(IntakeRecordDto input) {
        Instant now = Instant.now();
        String id = input.id() != null && !input.id().isBlank() ? input.id() : UUID.randomUUID().toString();
        Map<String, Object> data = input.data() != null ? new LinkedHashMap<>(input.data()) : Map.of();
        data.put("_clientId", id);

        String nombre = extractNombre(data, input.nombre());
        String identificacion = extractIdentificacion(data, input.identificacion());
        String contrato = stringField(data.get("contratoNumero"));
        String observaciones = stringField(data.get("observacionesGenerales"));

        FichaClinica ficha = fichaRepository.findById(id).orElseGet(() ->
                new FichaClinica(id, id, nombre, identificacion,
                        input.createdAt() != null ? Instant.parse(input.createdAt()) : now, now));
        ficha.setNombre(nombre);
        ficha.setIdentificacion(identificacion);
        ficha.setContratoNumero(contrato);
        ficha.setObservacionesGenerales(observaciones);
        ficha.setUpdatedAt(now);
        fichaRepository.save(ficha);
        fichaRepository.flush();

        formPersistence.persist(id, data);

        RegistroFichaServidor registro = registroRepository.findByFichaId(id).orElseGet(() ->
                new RegistroFichaServidor(id, now, data, id));
        registro.setGuardadoEn(now);
        registro.setDatos(data);
        registroRepository.save(registro);

        return new IntakeRecordDto(
                id,
                ficha.getCreatedAt().toString(),
                ficha.getUpdatedAt().toString(),
                nombre,
                identificacion,
                data
        );
    }

    @Transactional
    public void deleteAll() {
        registroRepository.deleteAll();
        fichaRepository.deleteAll();
    }

    /** Compatibilidad con /api/assessments */
    public List<AssessmentDto> listAssessments() {
        return listAll().stream()
                .map(r -> new AssessmentDto(r.id(), r.updatedAt() != null ? r.updatedAt() : r.createdAt(), r.data()))
                .toList();
    }

    private IntakeRecordDto toDto(FichaClinica ficha) {
        String id = ficha.getId();
        Map<String, Object> data;
        if (formPersistence.hasNormalizedData(id)) {
            data = formPersistence.load(id);
            data.put("_clientId", id);
        } else {
            Optional<RegistroFichaServidor> legacy = registroRepository.findByFichaId(id);
            if (legacy.isEmpty()) {
                return null;
            }
            data = new LinkedHashMap<>(legacy.get().getDatos());
            data.put("_clientId", id);
            formPersistence.persist(id, data);
        }
        return new IntakeRecordDto(
                id,
                ficha.getCreatedAt().toString(),
                ficha.getUpdatedAt().toString(),
                ficha.getNombre(),
                ficha.getIdentificacion(),
                data);
    }

    private static String extractNombre(Map<String, Object> data, String fallback) {
        Object personal = data.get("personal");
        if (personal instanceof Map<?, ?> map) {
            Object name = map.get("nombreApellidos");
            if (name instanceof String s && !s.isBlank()) {
                return s.trim();
            }
        }
        return fallback != null ? fallback : "Sin nombre";
    }

    private static String extractIdentificacion(Map<String, Object> data, String fallback) {
        Object personal = data.get("personal");
        if (personal instanceof Map<?, ?> map) {
            Object doc = map.get("identificacion");
            if (doc instanceof String s) {
                return s.trim();
            }
        }
        return fallback != null ? fallback : "";
    }

    private static String stringField(Object value) {
        return value instanceof String s ? s : null;
    }

    public record IntakeRecordDto(
            String id,
            String createdAt,
            String updatedAt,
            String nombre,
            String identificacion,
            Map<String, Object> data
    ) {}

    public record AssessmentDto(String id, String savedAt, Map<String, Object> data) {}
}
