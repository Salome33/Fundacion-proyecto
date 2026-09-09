package com.humanscratch.config;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Entrega index.html para rutas del SPA de Angular. */
@Controller
public class SpaForwardController {

    @GetMapping(value = {"/", "/index.html"})
    public ResponseEntity<Resource> index() {
        return serveIndex();
    }

    private static ResponseEntity<Resource> serveIndex() {
        Resource index = resolveIndex();
        if (!index.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(index);
    }

    private static Resource resolveIndex() {
        Resource browser = new ClassPathResource("static/browser/index.html");
        if (browser.exists()) {
            return browser;
        }
        return new ClassPathResource("static/index.html");
    }
}
