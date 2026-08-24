package com.humanscratch.api;

import com.humanscratch.service.AuthService;
import com.humanscratch.service.AuthService.AuthSessionDto;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthSessionDto login(@RequestBody LoginRequest request) {
        return authService.login(request.username(), request.password());
    }

    public record LoginRequest(String username, String password) {}
}
