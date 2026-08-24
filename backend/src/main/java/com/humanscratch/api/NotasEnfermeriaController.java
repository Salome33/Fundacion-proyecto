package com.humanscratch.api;

import com.humanscratch.service.NotasEnfermeriaService;
import com.humanscratch.service.NotasEnfermeriaService.NotaDto;
import com.humanscratch.service.NotasEnfermeriaService.NotaInput;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notas-enfermeria")
@CrossOrigin(origins = {"http://localhost:4200"})
public class NotasEnfermeriaController {

    private final NotasEnfermeriaService notasService;

    public NotasEnfermeriaController(NotasEnfermeriaService notasService) {
        this.notasService = notasService;
    }

    @GetMapping
    public List<NotaDto> list() {
        return notasService.listAll();
    }

    @PostMapping
    public NotaDto create(@RequestBody NotaInput body) {
        return notasService.create(body);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable String id) {
        notasService.delete(id);
        return Map.of("status", "deleted");
    }
}
