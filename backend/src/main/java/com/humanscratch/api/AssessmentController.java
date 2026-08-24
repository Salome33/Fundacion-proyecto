package com.humanscratch.api;

import com.humanscratch.service.FichaService;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/** Compatibilidad con el frontend existente (/api/assessments). */
@RestController
@RequestMapping("/api/assessments")
@CrossOrigin(origins = {"http://localhost:4200"})
public class AssessmentController {

    private final FichaService fichaService;

    public AssessmentController(FichaService fichaService) {
        this.fichaService = fichaService;
    }

    @GetMapping
    public List<AssessmentRecord> list() {
        return fichaService.listAssessments().stream()
                .map(a -> new AssessmentRecord(a.id(), Instant.parse(a.savedAt()), a.data()))
                .toList();
    }

    @PostMapping
    public Map<String, String> create(@RequestBody Map<String, Object> body) {
        var saved = fichaService.save(fromPayload(null, body));
        return Map.of("id", saved.id(), "status", "saved");
    }

    @PutMapping("/{id}")
    public Map<String, String> upsert(@PathVariable String id, @RequestBody Map<String, Object> body) {
        body.put("_clientId", id);
        var saved = fichaService.save(fromPayload(id, body));
        return Map.of("id", saved.id(), "status", "saved");
    }

    @DeleteMapping
    public Map<String, String> clearAll() {
        fichaService.deleteAll();
        return Map.of("status", "cleared");
    }

    @GetMapping("/{id}")
    public AssessmentRecord get(@PathVariable String id) {
        var dto = fichaService.findById(id);
        if (dto == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND);
        }
        return new AssessmentRecord(dto.id(), Instant.parse(dto.updatedAt()), dto.data());
    }

    private static FichaService.IntakeRecordDto fromPayload(String id, Map<String, Object> body) {
        String resolvedId = id;
        if (resolvedId == null) {
            Object client = body.get("_clientId");
            resolvedId = client instanceof String s ? s : null;
        }
        return new FichaService.IntakeRecordDto(resolvedId, null, null, null, null, body);
    }

    public record AssessmentRecord(String id, Instant savedAt, Map<String, Object> data) {}
}
