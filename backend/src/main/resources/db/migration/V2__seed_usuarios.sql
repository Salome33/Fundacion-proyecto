-- Roles del sistema (usuarios se crean al arrancar Spring Boot con BCrypt)

INSERT INTO rol_usuario (rol, nombre, descripcion) VALUES
    ('coordinador', 'Coordinador administrativo', 'Puede crear y editar fichas clínicas'),
    ('junta', 'Junta directiva', 'Solo consulta');
