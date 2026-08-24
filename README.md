# Historia Clínica — human-scratch-three

Formulario de **historia clínica / ingreso institucional** con Angular 19, Spring Boot y modelo 3D del cuerpo para rayado (Three.js).

## Requisitos

- **Docker Desktop** (PostgreSQL, compilar y ejecutar el backend sin Maven local)
- **Node.js 20+** y **npm** (frontend Angular)
- Navegador moderno (Chrome, Edge, Firefox)

## Base de datos PostgreSQL

La aplicación persiste fichas clínicas, citas, signos vitales diarios, notas de enfermería y usuarios en **PostgreSQL 16** (Flyway + JPA).

| Parámetro | Valor por defecto |
|-----------|-------------------|
| Base de datos | `manos_unidas` |
| Usuario | `manos` |
| Contraseña | `manos` |
| Puerto | `5432` |

`scripts\start.cmd` levanta PostgreSQL automáticamente antes del backend.

**Usuarios de prueba** (seed al arrancar el backend):

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| `coordinador` | `coordinador` | Edición completa |
| `junta` | `junta` | Solo consulta |

## Inicializar (primera vez)

Abre **CMD** en la carpeta del proyecto:

```cmd
cd /d "C:\Users\JOHN JAIRO\Projects\human-scratch-three"
scripts\init.cmd
```

Eso compila el backend con Maven en Docker e instala las dependencias del frontend.

## Abrir la aplicación

```cmd
scripts\start.cmd
```

Se abrirán dos procesos:

| Servicio | URL |
|----------|-----|
| **Frontend** (Angular) | http://localhost:4200 |
| **Backend** (Spring Boot) | http://localhost:8080 |
| **PostgreSQL** | localhost:5432 |

### Rutas útiles

| Página | URL |
|--------|-----|
| Inicio / dashboard | http://localhost:4200 |
| **Nuevo ingreso** (historia clínica) | http://localhost:4200/nuevo |
| Demo modelo 3D | http://localhost:4200/demo-3d |

## Manual (dos terminales)

**Terminal 1 — backend:**

```cmd
scripts\run-backend-docker.cmd
```

**Terminal 2 — frontend:**

```cmd
scripts\run-frontend.cmd
```

## Estructura

```
human-scratch-three/
├── frontend/          Angular 19 — formulario clínico, escalas, rayado 3D
│   └── src/app/clinical/
├── backend/           Spring Boot — API y modelo human.obj
└── scripts/
    ├── init.cmd       Inicialización completa
    └── start.cmd      Backend + frontend
```

## Problemas frecuentes

| Error | Solución |
|-------|----------|
| Docker no corre | Abre Docker Desktop |
| `Falta el JAR` | Ejecuta `scripts\init.cmd` |
| Puerto 8080 o 4200 ocupado | Cierra otras apps o cambia puerto en `application.properties` / `ng serve` |
| `mvn` no reconocido | Usa `run-backend-docker.cmd` (no necesitas Maven local) |

## Controles del modelo 3D (dentro del formulario)

- **Rayar**: clic izquierdo + arrastrar
- **Girar**: clic derecho + arrastrar
- **Zoom**: rueda del ratón
- **Limpiar**: `R`
