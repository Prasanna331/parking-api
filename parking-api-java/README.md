# Parking API — Java Spring Boot

Java Spring Boot port of the Node.js Parking API. Mirrors the same domain model, REST endpoints, JWT authentication, and WebSocket support using idiomatic Java / Spring conventions.

---

## Tech Stack

| Layer             | Technology                        |
|-------------------|-----------------------------------|
| Framework         | Spring Boot 3.2.0                 |
| Language          | Java 17                           |
| Database          | PostgreSQL (via Spring Data JPA)  |
| ORM               | Hibernate / Spring Data JPA       |
| Authentication    | JWT (jjwt 0.12.3)                 |
| Real-time         | Spring WebSocket + STOMP          |
| Validation        | Jakarta Bean Validation           |
| Boilerplate       | Lombok                            |
| Build Tool        | Maven                             |
| Dev Reload        | Spring Boot DevTools              |

---

## Package Structure

```
parking-api-java/
└── src/main/java/com/parking/
    ├── ParkingApiApplication.java       # Entry point
    ├── config/
    │   ├── SecurityConfig.java          # Spring Security + JWT filter chain
    │   └── WebSocketConfig.java         # STOMP / SockJS broker
    ├── controller/
    │   ├── AuthController.java          # POST /api/auth/register|login|logout, GET /api/auth/me
    │   ├── ParkingLotController.java    # /api/lots  (Day 3)
    │   └── ParkingSpotController.java   # /api/spots (Day 4)
    ├── dto/
    │   ├── AuthResponse.java
    │   ├── LoginRequest.java
    │   └── RegisterRequest.java
    ├── exception/
    │   └── GlobalExceptionHandler.java  # @RestControllerAdvice
    ├── model/
    │   ├── ParkingLot.java
    │   ├── ParkingSpot.java
    │   └── User.java                    # implements UserDetails
    ├── repository/
    │   ├── ParkingLotRepository.java
    │   ├── ParkingSpotRepository.java
    │   └── UserRepository.java
    ├── security/
    │   ├── JwtAuthFilter.java           # OncePerRequestFilter
    │   └── JwtService.java              # Token generation / validation
    └── service/
        ├── AuthService.java
        └── UserDetailsServiceImpl.java
```

### Node.js → Java mapping

| Node.js (Express)           | Java Spring Boot                                  |
|-----------------------------|---------------------------------------------------|
| `src/routes/auth.js`        | `controller/AuthController.java`                  |
| `src/middleware/auth.js`    | `security/JwtAuthFilter.java`                     |
| `src/utils/jwt.js`          | `security/JwtService.java`                        |
| `src/models/User.js`        | `model/User.java` + `repository/UserRepository`   |
| `src/models/ParkingLot.js`  | `model/ParkingLot.java` + `ParkingLotRepository`  |
| `src/models/ParkingSpot.js` | `model/ParkingSpot.java` + `ParkingSpotRepository`|
| `src/services/authService`  | `service/AuthService.java`                        |
| `app.js` / `server.js`      | `ParkingApiApplication.java`                      |
| `config/database.js`        | `application.properties` (datasource block)       |

---

## Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 14+ running locally

---

## Getting Started

### 1. Create the database

```sql
CREATE DATABASE parking_db;
CREATE USER parking_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE parking_db TO parking_user;
```

### 2. Configure credentials

Edit [`src/main/resources/application.properties`](src/main/resources/application.properties) and set:

```properties
spring.datasource.password=your_password_here
app.jwt.secret=<base64-encoded-secret-at-least-256-bits>
```

### 3. Run the application

```bash
mvn spring-boot:run
```

Or build and run the JAR:

```bash
mvn clean package -DskipTests
java -jar target/parking-api-1.0.0.jar
```

The server starts on **http://localhost:8080**.

---

## API Endpoints

### Auth — `/api/auth`

| Method | Path                  | Auth required | Description          |
|--------|-----------------------|---------------|----------------------|
| POST   | `/api/auth/register`  | No            | Register a new user  |
| POST   | `/api/auth/login`     | No            | Login, receive JWT   |
| POST   | `/api/auth/logout`    | Yes           | Logout (client-side) |
| GET    | `/api/auth/me`        | Yes           | Current user info    |

### Parking Lots — `/api/lots` *(Day 3)*

| Method | Path             | Auth required | Description              |
|--------|------------------|---------------|--------------------------|
| GET    | `/api/lots`      | Yes           | List all parking lots    |
| POST   | `/api/lots`      | Yes (admin)   | Create a parking lot     |
| GET    | `/api/lots/{id}` | Yes           | Get parking lot by ID    |
| PUT    | `/api/lots/{id}` | Yes (admin)   | Update a parking lot     |
| DELETE | `/api/lots/{id}` | Yes (admin)   | Delete a parking lot     |

### Parking Spots — `/api/spots` *(Day 4)*

| Method | Path                          | Auth required | Description                  |
|--------|-------------------------------|---------------|------------------------------|
| GET    | `/api/spots?lotId=`           | Yes           | List spots (optionally by lot)|
| POST   | `/api/spots`                  | Yes (admin)   | Create a parking spot        |
| GET    | `/api/spots/{id}`             | Yes           | Get spot by ID               |
| PUT    | `/api/spots/{id}`             | Yes (operator)| Update spot / change status  |
| DELETE | `/api/spots/{id}`             | Yes (admin)   | Delete a spot                |

### Health

| Method | Path               | Auth required | Description   |
|--------|--------------------|---------------|---------------|
| GET    | `/actuator/health` | No            | Health check  |

---

## WebSocket

Connect via SockJS + STOMP at `ws://localhost:8080/ws`.

| Destination              | Direction   | Description                    |
|--------------------------|-------------|--------------------------------|
| `/topic/spots/{lotId}`   | Subscribe   | Real-time spot status updates  |
| `/app/spots/update`      | Publish     | Trigger a status update        |

---

## Build Progress Checklist

Mirrors the Node.js project day-by-day roadmap.

- [x] **Day 1** — Project scaffold, Maven POM, Spring Boot entry point
- [x] **Day 2** — JWT auth (register / login / me), `User` entity, Spring Security filter chain
- [x] **Day 3** — Parking lot CRUD (`ParkingLotController`, `ParkingLotService`)
- [x] **Day 4** — Parking spot CRUD + status management (`ParkingSpotController`)
- [x] **Day 5** — WebSocket: real-time spot availability broadcast
- [ ] **Day 6** — Role-based access control (`@PreAuthorize` on endpoints)
- [ ] **Day 7** — Pagination, filtering, and sorting on list endpoints
- [ ] **Day 8** — Flyway / Liquibase database migrations
- [ ] **Day 9** — Booking / reservation model and endpoints
- [ ] **Day 10** — Pricing / rate model
- [ ] **Day 11** — Reporting endpoints (occupancy, revenue)
- [ ] **Day 12** — Email notifications (Spring Mail)
- [ ] **Day 13** — Unit tests (JUnit 5 + Mockito)
- [ ] **Day 14** — Integration tests (Spring Boot Test + Testcontainers)
- [ ] **Day 15** — Docker / docker-compose, production hardening

---

## Environment Variables (alternative to properties file)

| Variable                       | Default                   | Description             |
|--------------------------------|---------------------------|-------------------------|
| `SPRING_DATASOURCE_URL`        | `jdbc:postgresql://...`   | PostgreSQL JDBC URL     |
| `SPRING_DATASOURCE_USERNAME`   | `parking_user`            | DB username             |
| `SPRING_DATASOURCE_PASSWORD`   | *(required)*              | DB password             |
| `APP_JWT_SECRET`               | *(required)*              | Base64 JWT signing key  |
| `APP_JWT_EXPIRATION_MS`        | `604800000` (7 days)      | Token lifetime (ms)     |
| `SERVER_PORT`                  | `8080`                    | HTTP port               |
