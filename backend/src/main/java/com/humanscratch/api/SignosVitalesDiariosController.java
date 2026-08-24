package com.humanscratch.api;

import com.humanscratch.service.SignosVitalesService;
import com.humanscratch.service.SignosVitalesService.VitalDto;
import com.humanscratch.service.SignosVitalesService.VitalInput;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/signos-vitales-diarios")
@CrossOrigin(origins = {"http://localhost:4200"})
public class SignosVitalesDiariosController {

    private final SignosVitalesService vitalesService;

    public SignosVitalesDiariosController(SignosVitalesService vitalesService) {
        this.vitalesService = vitalesService;
    }

    @GetMapping
    public List<VitalDto> list() {
        return vitalesService.listAll();
    }

    @PutMapping
    public VitalDto upsert(@RequestBody VitalInput body) {
        return vitalesService.upsert(body);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable String id) {
        vitalesService.delete(id);
        return Map.of("status", "deleted");
    }
}
