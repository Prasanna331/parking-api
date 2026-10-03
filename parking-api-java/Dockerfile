# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Cache dependencies first (only re-runs when pom.xml changes)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build the JAR
COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=build /app/target/parking-api-1.0.0.jar app.jar

EXPOSE 8080
EXPOSE 5005

# DEBUG_MODE env var toggles remote debugging (default: off)
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
