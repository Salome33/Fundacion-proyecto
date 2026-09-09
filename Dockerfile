# Etapa 1: compilar frontend Angular dentro del backend (static/)
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci
COPY frontend/ ./frontend/
COPY backend/ ./backend/
RUN cd frontend && npm run build:spring

# Etapa 2: compilar backend Spring Boot
FROM maven:3.9-eclipse-temurin-21-alpine AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml .
COPY --from=frontend-build /app/backend/src ./src
RUN mvn -q -DskipTests package

# Etapa 3: imagen de ejecución
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/backend/target/human-scratch-three-1.0.0.jar app.jar
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "java -jar app.jar --server.port=${PORT}"]
