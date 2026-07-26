# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Intellecta is an intelligent study companion app with gamification, analytics, and study management. It is a monorepo with two separate projects:

- `intellecta-frontend/` — React SPA (Create React App)
- `intellecta-backend/` — Spring Boot REST API

## Commands

### Frontend (`cd intellecta-frontend`)

```bash
npm start        # Dev server on http://localhost:3000
npm run build    # Production build
npm test         # Run tests (interactive watch mode)
npm test -- --watchAll=false  # Run tests once (CI mode)
```

### Backend (`cd intellecta-backend`)

```bash
./mvnw spring-boot:run   # Dev server on http://localhost:8080
./mvnw test              # Run tests
./mvnw clean package     # Build JAR
```

The backend requires a SQL Server instance. Dev DB config is in `src/main/resources/application-dev.properties` (connection string, username, password). The active profile is always `dev`.

## Architecture

### Frontend

**Entry points and routing:**
- `src/App.jsx` — thin BrowserRouter wrapper only; add global providers here
- `src/AppRoutes.jsx` — all route definitions; two protected groups: `STUDENT` and `ADMIN`
- `src/components/ProtectedRoute.jsx` — role-based auth guard; calls `GET /api/auth/me` on every mount to verify the session cookie

**API and auth:**
- `src/services/api.js` — central Axios instance targeting `http://localhost:8080/api` with `withCredentials: true` (required for the HttpOnly JWT cookie). Auto-redirects to `/login` on 401/403 for non-auth requests.
- `src/utils/auth.js` — in-memory auth state (userId, role). Populated after `ProtectedRoute` resolves. Use `getUserId()` / `getRole()` / `logout()` from here throughout the app.
- Auth state is **not** persisted to localStorage; it lives only in memory and is re-fetched on each protected page load.

**UI conventions:**
- Shadcn/ui-style component primitives live in `src/components/ui/` (Button, Card, Input, Label, etc.)
- Two sidebar components: `components/dashboard/Sidebar.jsx` (admin), `components/dashboard/StudentSidebar.jsx` (student)
- Tailwind CSS v3 for styling; global styles in `src/styles/global.css`
- `lucide-react` for icons, `framer-motion` for animations, `recharts` for charts, `sweetalert2` for modals/toasts

**Service layer:** Each feature has a service file under `src/services/` (e.g. `quizService.js`, `notesService.js`) that wraps the central `api` instance.

### Backend

**Package:** `com.intellecta.intellecta_backend`

**Layer structure:**
- `controller/` — REST controllers mapping to `/api/**`
- `service/` — Service interfaces + implementations (pattern: `XService.java` interface + `XServiceImpl.java`)
- `repository/` — Spring Data JPA repositories
- `model/` — JPA entities (mapped to SQL Server via Hibernate `ddl-auto=update`)
- `dto/request/` and `dto/response/` — separate DTOs for inbound and outbound data
- `config/` — `SecurityConfig`, `WebConfig` (CORS + static file serving), `DataSeeder`, `ContentDataSeeder`
- `filter/JwtAuthFilter.java` — JWT extraction and validation per request
- `enums/` — `UserRoles`, `BadgeType`, `TopicStatus`, etc.
- `util/` — `DateUtils`, `FileNameParser`

**Security:**
- JWT is stored in an HttpOnly cookie (not Authorization header), so `withCredentials: true` is mandatory on the frontend.
- Sessions are stateless (`SessionCreationPolicy.STATELESS`).
- Public endpoints: `/api/auth/**`, `/uploads/**`, `/api/badges/*/image`.
- Admin-only: `/api/admin/**`, POST/PUT/DELETE on `/api/content/**`, POST `/api/quizzes`.
- CORS is configured for `http://localhost:3000` only (see `SecurityConfig` and `WebConfig`).

**File uploads:** Files are stored in an `uploads/` directory relative to where the backend runs, served at `/uploads/**`.

**Key dependencies:** Spring Boot 4.0.3, Java 25, JJWT 0.11.5, google-api-client 2.2.0 (for Google OAuth token verification), Lombok, Microsoft SQL Server JDBC.
