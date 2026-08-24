package com.humanscratch.config;

import com.humanscratch.domain.auth.RolUsuario;
import com.humanscratch.domain.auth.Usuario;
import com.humanscratch.repository.RolUsuarioRepository;
import com.humanscratch.repository.UsuarioRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements ApplicationRunner {

    private final RolUsuarioRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public DatabaseSeeder(RolUsuarioRepository rolRepository, UsuarioRepository usuarioRepository) {
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (usuarioRepository.count() > 0) {
            return;
        }
        RolUsuario coordinador = rolRepository.findByRol("coordinador").orElseThrow();
        RolUsuario junta = rolRepository.findByRol("junta").orElseThrow();
        createUser("coordinador", "coordinador", coordinador);
        createUser("junta", "junta", junta);
    }

    private void createUser(String username, String password, RolUsuario rol) {
        Usuario user = new Usuario();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRol(rol);
        user.setEstado("activo");
        usuarioRepository.save(user);
    }
}
