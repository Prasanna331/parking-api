# 🅿️ Parking API

A RESTful backend for a parking management system built with **Node.js, Express.js, PostgreSQL, and Redis**. The project includes JWT-based authentication, role-aware access control, database configuration, and a modular structure designed to support parking lot and parking spot management.

## 🚀 Features

- **JWT Authentication** — Token-based authentication with registration and login.
- **Role-Based Access Control** — Support for admin, operator, and viewer roles.
- **PostgreSQL Database** — Relational data model for users, parking lots, zones, parking spots, and status history.
- **Docker Compose** — Local database and Redis service configuration.
- **Modular Architecture** — Organized routes, configuration, services, and utility modules.
- **Logging** — Winston-based application logging.
- **Real-Time Architecture** — Socket.io service module for real-time parking updates.

*Note: Parking management endpoints and real-time functionality should be documented as available features only after their implementations are complete.*

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Runtime | Node.js |
| Backend Framework | Express.js |
| Database | PostgreSQL |
| Caching | Redis |
| Authentication | JSON Web Tokens (JWT) |
| Real-Time Communication | Socket.io |
| Logging | Winston |
| Containerization | Docker, Docker Compose |

## 📁 Project Structure

```text
parking-api/
├── schema.sql
├── docker-compose.yml
├── .env.example
├── package.json
└── src/
    ├── index.js
    ├── app.js
    ├── config/
    │   ├── db.js
    │   └── migrate.js
    ├── routes/
    │   ├── auth.js
    │   ├── lots.js
    │   └── spots.js
    ├── services/
    │   └── socketService.js
    └── utils/
        └── logger.js
```

## ⚙️ Getting Started

### Prerequisites

Ensure the following tools are installed:

- Node.js and npm
- Docker and Docker Compose
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Prasanna331/parking-api.git
cd parking-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local environment file from the example:

```bash
cp .env.example .env
```

Update `.env` with the required database connection details, JWT secret, and other application configuration.

**Security:** Never commit your `.env` file or production secrets to GitHub.

### 4. Start database services

```bash
docker compose up -d
```

This starts the services configured in `docker-compose.yml`.

### 5. Initialize the database

```bash
npm run migrate
```

Run the migration after configuring the database connection.

### 6. Start the development server

```bash
npm run dev
```

Check `package.json` for the available scripts and required configuration.

## 🗄️ Database Design

The database schema defines the following core entities:

| Table | Purpose |
|---|---|
| `users` | Stores user accounts and role information. |
| `parking_lots` | Represents parking locations. |
| `parking_zones` | Organizes parking areas into zones or sections. |
| `parking_spots` | Represents individual parking spaces and their status. |
| `spot_history` | Maintains a history of parking spot status changes. |

## 🔐 Authentication

The authentication module uses JSON Web Tokens (JWT) to support authenticated API access.

The authentication workflow includes:

- User registration and login endpoints.
- Token-based authentication.
- User roles for access-control requirements.

Protected endpoints should validate the JWT and enforce the appropriate role permissions.

## 🏗️ Architecture

The application follows a modular backend structure:

- **Routes:** Define API endpoints and request handling.
- **Configuration:** Manage database connectivity and schema migration.
- **Services:** Encapsulate reusable application services, including real-time communication.
- **Utilities:** Provide shared functionality such as logging.
- **Database:** Store user and parking management data in PostgreSQL.

This structure supports incremental development, separation of concerns, and easier testing and maintenance.

## 🔭 Planned Enhancements

- Complete parking lot and parking spot CRUD operations.
- Add parking spot availability management.
- Implement and validate real-time status updates.
- Integrate sensor or camera data ingestion through MQTT.
- Add administrative controls and manual status overrides.
- Develop parking availability and reservation APIs.
- Add parking history and analytics endpoints.
- Strengthen input validation, rate limiting, and error handling.
- Publish interactive API documentation using Swagger/OpenAPI.
- Expand automated unit and integration test coverage.
- Prepare the application for deployment.

## 🧪 Testing

Automated testing will help validate authentication, authorization, database operations, API behavior, and parking availability rules.

Test commands should match the scripts configured in `package.json`.

## 📄 License

Add a license file if you intend to distribute this project under an open-source license.

---

Developed by **Prasanna Patyam**.
