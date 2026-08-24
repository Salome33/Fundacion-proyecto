package com.humanscratch.service;

import com.humanscratch.domain.auth.RolUsuario;
import com.humanscratch.domain.auth.Sesion;
import com.humanscratch.domain.auth.Usuario;
import com.humanscratch.repository.RolUsuarioRepository;
import com.humanscratch.repository.SesionRepository;
import com.humanscratch.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final SesionRepository sesionRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UsuarioRepository usuarioRepository, SesionRepository sesionRepository) {
        this.usuarioRepository = usuarioRepository;
        this.sesionRepository = sesionRepository;
    }

    @Transactional
    public AuthSessionDto login(String username, String password) {
        Usuario user = usuarioRepository.findByUsername(username.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));
        if (!"activo".equalsIgnoreCase(user.getEstado())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario inactivo");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
        }
        Sesion sesion = new Sesion();
        sesion.setUsuario(user);
        sesion.setInicioAt(Instant.now());
        sesionRepository.save(sesion);
        RolUsuario rol = user.getRol();
        return new AuthSessionDto(user.getUsername(), rol.getRol(), rol.getNombre());
    }

    public record AuthSessionDto(String username, String role, String displayName) {}
}
