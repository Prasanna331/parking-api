# 🅿️ Parking API

Real-time parking availability backend built with Node.js, Express, PostgreSQL, and Socket.io.

---

## 📁 Project Structure

```
parking-api/
├── schema.sql              # Full DB schema (run once)
├── docker-compose.yml      # Local PostgreSQL + Redis
├── .env.example            # Copy to .env and fill in values
└── src/
    ├── index.js            # Entry point
    ├── app.js              # Express app
    ├── config/
    │   ├── db.js           # PostgreSQL connection pool
    │   └── migrate.js      # Runs schema.sql migration
    ├── routes/
    │   ├── auth.js         # Auth routes (Day 2)
    │   ├── lots.js         # Parking lot routes (Day 3)
    │   └── spots.js        # Parking spot routes (Day 4)
    ├── services/
    │   └── socketService.js # WebSocket (Socket.io) setup
    └── utils/
        └── logger.js       # Winston logger
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your DB credentials and JWT secret
```

### 3. Start local database
```bash
docker-compose up -d
```

### 4. Run DB migration
```bash
npm run migrate
```

### 5. Start the server
```bash
npm run dev
```

---

## 🗄️ Database Tables

| Table | Description |
|---|---|
| `users` | Admins, operators, viewers |
| `parking_lots` | Physical parking locations |
| `parking_zones` | Sections within a lot (Floor 1, Zone A, etc.) |
| `parking_spots` | Individual spots with real-time status |
| `spot_history` | Full audit log of every status change |

---

## 📅 Build Progress

- [x] Day 1 — Project setup, DB schema, environment config
- [x] Day 2 — Auth (JWT, register, login, roles)
- [ ] Day 3 — Parking lot CRUD
- [ ] Day 4 — Parking spot CRUD + status management
- [ ] Day 5 — Review & testing
- [ ] Day 6 — Real-time WebSocket layer
- [ ] Day 7 — Sensor/camera data ingestion (MQTT)
- [ ] Day 8 — Manual override + admin controls
- [ ] Day 9 — Availability query API
- [ ] Day 10 — Integration testing
- [ ] Day 11 — Booking/reservation module
- [ ] Day 12 — History & analytics endpoints
- [ ] Day 13 — Rate limiting, error handling hardening
- [ ] Day 14 — API documentation (Swagger)
- [ ] Day 15 — Final testing & deployment-ready
