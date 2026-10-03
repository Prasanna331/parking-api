# 🅿️ Parking UI — React Frontend

Real-time parking availability frontend for the Parking Management System.

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| **React** | 18.3 | UI component framework |
| **TypeScript** | 5.5 | Static typing |
| **Vite** | 5.3 | Dev server & bundler |
| **Tailwind CSS** | 3.4 | Utility-first styling |
| **React Router v6** | 6.26 | Client-side routing |
| **TanStack React Query** | 5.51 | Server state management & caching |
| **Axios** | 1.7 | HTTP client |
| **Zustand** | 4.5 | Lightweight global state (auth) |
| **Socket.IO Client** | 4.7 | Real-time WebSocket events |

---

## Folder Structure

```
parking-ui/
├── index.html                  # HTML entry point (Vite root)
├── vite.config.ts              # Vite config + dev proxy to Spring Boot
├── tailwind.config.js          # Tailwind content paths
├── postcss.config.js           # PostCSS (required by Tailwind)
├── tsconfig.json               # TypeScript config (src/)
├── tsconfig.node.json          # TypeScript config (vite.config.ts)
├── package.json                # Dependencies & scripts
└── src/
    ├── main.tsx                # App bootstrap — mounts React tree
    ├── index.css               # Global styles (Tailwind directives)
    ├── App.tsx                 # Route definitions & PrivateRoute guard
    ├── api/
    │   ├── axiosClient.ts      # Axios instance + JWT & 401 interceptors
    │   ├── auth.ts             # login / register / getMe API calls
    │   ├── lots.ts             # getLots / getLot API calls
    │   └── spots.ts            # getSpots API call
    ├── store/
    │   └── authStore.ts        # Zustand store — token/email/role (localStorage-backed)
    ├── components/
    │   └── Layout.tsx          # App shell — top nav, sidebar, <Outlet />
    └── pages/
        ├── LoginPage.tsx       # /login — email + password form
        ├── RegisterPage.tsx    # /register — name + email + password form
        ├── DashboardPage.tsx   # / — summary cards + build progress
        ├── LotsPage.tsx        # /lots — list all parking lots
        └── SpotsPage.tsx       # /lots/:lotId/spots — spot grid with status colours
```

---

## Java ↔ React Concept Mapping

| Spring Boot (Java) | React Frontend | Purpose |
|---|---|---|
| `@RestController` | `src/pages/*.tsx` | Handles a route / renders UI for that URL |
| `@Service` | `src/api/*.ts` | Business logic / data-fetching functions |
| `Spring Security Filter` | `axiosClient` interceptors | Attaches JWT, catches 401 globally |
| `SecurityContext` / `Principal` | `authStore.ts` (Zustand) | Holds the currently logged-in user |
| `application.properties` | `vite.config.ts` proxy | Maps `/api/*` → `localhost:8080` in dev |
| `@Entity` / DTO | TypeScript `interface` | Typed data shape (ParkingLot, ParkingSpot…) |
| `Spring MVC DispatcherServlet` | `react-router-dom` `<Routes>` | Routes requests to the right handler |
| `HttpSession` / JWT cookie | `localStorage` | Persists auth across page reloads |
| `@Autowired` | React Context / Zustand `useStore` | Injects shared state/services |
| `ResponseEntity<T>` | `axios` response `r.data` (typed `<T>`) | Typed HTTP response |
| `@ControllerAdvice` (global error) | `axiosClient` response interceptor | Centralised error handling |
| WebSocket `@MessageMapping` | `socket.io-client` | Real-time spot status updates |

---

## Getting Started

### 1. Install dependencies

```bash
cd parking-ui
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

App runs at **http://localhost:5173**

> Make sure the Spring Boot API is running on **http://localhost:8080** — the Vite proxy forwards all `/api/*` requests automatically.

### 3. Build for production

```bash
npm run build
```

Output goes to `parking-ui/dist/`.

---

## Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/login` | `LoginPage.tsx` | ❌ Public |
| `/register` | `RegisterPage.tsx` | ❌ Public |
| `/` | `DashboardPage.tsx` | ✅ Private |
| `/lots` | `LotsPage.tsx` | ✅ Private |
| `/lots/:lotId/spots` | `SpotsPage.tsx` | ✅ Private |

Private routes are protected by `<PrivateRoute>` in [`App.tsx`](src/App.tsx) — unauthenticated users are redirected to `/login`.

---

## Proxy & Environment Config

In development, Vite proxies API calls so you never need to hardcode the backend URL or deal with CORS:

```
Browser → http://localhost:5173/api/lots
         → (Vite proxy) → http://localhost:8080/api/lots
```

This is configured in [`vite.config.ts`](vite.config.ts):

```ts
proxy: {
  '/api': { target: 'http://localhost:8080', changeOrigin: true },
  '/ws':  { target: 'ws://localhost:8080',  ws: true },
}
```

In production, configure your reverse proxy (nginx / cloud gateway) to forward `/api/*` to the Spring Boot service. No code changes needed — `axiosClient` always calls `/api` as a relative path.

---

## Authentication Flow

1. User submits login form → [`login()`](src/api/auth.ts) POSTs to `/api/auth/login`
2. Spring Boot returns `{ token, email, role }`
3. [`authStore.setAuth()`](src/store/authStore.ts) saves to Zustand state **and** `localStorage`
4. Every subsequent request — [`axiosClient`](src/api/axiosClient.ts) reads the token from `localStorage` and adds `Authorization: Bearer <token>`
5. On 401 response — interceptor clears storage and redirects to `/login`
6. On logout — [`clearAuth()`](src/store/authStore.ts) removes all keys from `localStorage` and Zustand state
