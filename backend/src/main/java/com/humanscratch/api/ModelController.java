package com.humanscratch.api;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/model")
@CrossOrigin(origins = {"http://localhost:4200"})
public class ModelController {

    @GetMapping(value = "/human.obj", produces = "model/obj")
    public ResponseEntity<Resource> humanObj() {
        Resource resource = new ClassPathResource("models/human.obj");
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"human.obj\"")
                .contentType(MediaType.parseMediaType("model/obj"))
                .body(resource);
    }
}
