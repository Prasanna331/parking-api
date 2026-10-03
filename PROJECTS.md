# 🅿️ Parking Management System — All Projects

Three implementations of the same Parking API, plus a shared React frontend.

---

## 📁 Folder Overview

```
parking-api/           ← Node.js + Express (original)
parking-api-java/      ← Java 17 + Spring Boot 3 (same API, Java stack)
parking-ui/            ← React 18 + TypeScript + Tailwind (shared frontend)
schema.sql             ← Shared PostgreSQL schema (used by both backends)
docker-compose.yml     ← Shared PostgreSQL + Redis (used by both backends)
```

---

## 🔧 Tech Stack Comparison

| Layer              | Node.js Version         | Java Version                     | Frontend          |
|--------------------|-------------------------|----------------------------------|-------------------|
| Language           | JavaScript (ES6+)       | Java 17                          | TypeScript        |
| Framework          | Express 4               | Spring Boot 3.2                  | React 18 + Vite   |
| Auth               | jsonwebtoken + bcryptjs | Spring Security + jjwt           | Axios interceptor |
| Database           | pg (raw SQL)            | Spring Data JPA + Hibernate      | —                 |
| Real-time          | Socket.IO               | Spring WebSocket (STOMP/SockJS)  | Socket.IO client  |
| Validation         | express-validator       | @Valid + Bean Validation         | —                 |
| Logging            | winston                 | Logback (via SLF4J)              | —                 |
| Config             | dotenv (.env)           | application.properties           | vite proxy        |
| Package manager    | npm                     | Maven                            | npm               |
| Dev reload         | nodemon                 | spring-boot-devtools             | Vite HMR          |
| Port               | 3000                    | 8080                             | 5173              |

---

## 🚀 How to Run

### 1. Start the database (shared)
```bash
docker-compose up -d
```

### 2A. Run Node.js backend
```bash
cd parking-api
npm install
npm run dev        # http://localhost:3000
```

### 2B. Run Java backend
```bash
cd parking-api-java
mvn spring-boot:run   # http://localhost:8080
```

### 3. Run React frontend
```bash
cd parking-ui
npm install
npm run dev        # http://localhost:5173
```

> The React frontend proxies `/api` to whichever backend is running.
> To switch backends, edit `parking-ui/vite.config.ts` proxy target:
> - Node.js → `http://localhost:3000`
> - Java   → `http://localhost:8080`

---

## 📅 Build Progress (same for both backends)

- [x] Day 1  — Project setup, DB schema, environment config
- [x] Day 2  — Auth (JWT, register, login, roles)
- [x] Day 3  — Parking lot CRUD
- [x] Day 4  — Parking spot CRUD + status management
- [x] Day 5  — Review & testing
- [ ] Day 6  — Real-time WebSocket layer
- [ ] Day 7  — Sensor/camera data ingestion
- [ ] Day 8  — Manual override + admin controls
- [ ] Day 9  — Availability query API
- [ ] Day 10 — Integration testing
- [ ] Day 11 — Booking/reservation module
- [ ] Day 12 — History & analytics endpoints
- [ ] Day 13 — Rate limiting, error handling hardening
- [ ] Day 14 — API documentation (Swagger)
- [ ] Day 15 — Final testing & deployment-ready
