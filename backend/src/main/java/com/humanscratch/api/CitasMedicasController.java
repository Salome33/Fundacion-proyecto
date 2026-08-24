package com.humanscratch.api;

import com.humanscratch.service.CitasMedicasService;
import com.humanscratch.service.CitasMedicasService.CitaDto;
import com.humanscratch.service.CitasMedicasService.CitaInput;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = {"http://localhost:4200"})
public class CitasMedicasController {

    private final CitasMedicasService citasService;

    public CitasMedicasController(CitasMedicasService citasService) {
        this.citasService = citasService;
    }

    @GetMapping
    public List<CitaDto> list() {
        return citasService.listAll();
    }

    @PostMapping
    public CitaDto create(@RequestBody CitaInput body) {
        return citasService.create(body);
    }

    @PatchMapping("/{id}/finalizar")
    public CitaDto finalizeCita(@PathVariable String id) {
        return citasService.finalizeCita(id);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable String id) {
        citasService.delete(id);
        return Map.of("status", "deleted");
    }
}
