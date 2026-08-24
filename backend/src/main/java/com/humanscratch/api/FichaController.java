package com.humanscratch.api;

import com.humanscratch.service.FichaService;
import com.humanscratch.service.FichaService.IntakeRecordDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fichas")
@CrossOrigin(origins = {"http://localhost:4200"})
public class FichaController {

    private final FichaService fichaService;

    public FichaController(FichaService fichaService) {
        this.fichaService = fichaService;
    }

    @GetMapping
    public List<IntakeRecordDto> list() {
        return fichaService.listAll();
    }

    @GetMapping("/{id}")
    public IntakeRecordDto get(@PathVariable String id) {
        IntakeRecordDto dto = fichaService.findById(id);
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return dto;
    }

    @PostMapping
    public IntakeRecordDto create(@RequestBody IntakeRecordDto body) {
        return fichaService.save(body);
    }

    @PutMapping("/{id}")
    public IntakeRecordDto update(@PathVariable String id, @RequestBody IntakeRecordDto body) {
        return fichaService.save(new IntakeRecordDto(
                id,
                body.createdAt(),
                body.updatedAt(),
                body.nombre(),
                body.identificacion(),
                body.data()
        ));
    }

    @DeleteMapping
    public Map<String, String> clearAll() {
        fichaService.deleteAll();
        return Map.of("status", "cleared");
    }
}
