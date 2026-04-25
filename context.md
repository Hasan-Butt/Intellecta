# Intellecta — Project Context

**Last Updated:** 2026-04-25  
**Status:** Core authentication live and verified. Most features are stubs awaiting implementation.

---

## 1. Project Overview

Intellecta is a full-stack intelligent study companion that helps students plan, execute, and analyze study sessions. It provides gamification, analytics, study management (schedules, quizzes, notes, documents), and role-based access control (Student / Admin).

**Domain:** Academia  
**Architecture:** REST API backend + SPA frontend

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Backend** | Java 25, Spring Boot 4.0.3, Spring Data JPA, Spring Security, Maven, Lombok | Runs on port 8080 |
| **Frontend** | React 19 (Create React App), React Router 7, Axios, Tailwind CSS 3, shadcn/ui | Runs on port 3000 |
| **Database** | Microsoft SQL Server 17.0 | JDBC driver, SQLServerDialect |
| **Auth** | Spring Security + BCrypt | JWT placeholders exist but not yet implemented |
| **Build** | Maven (backend), npm / react-scripts (frontend) | |

---

## 3. Project Structure

```
hasan-butt-intellecta/
├── docs/                          # Word documents (proposals, ideas)
├── intellecta-backend/
│   └── src/main/java/com/intellecta/intellecta_backend/
│       ├── config/                # SecurityConfig, WebConfig (CORS)
│       ├── controller/            # REST endpoints
│       ├── dto/
│       │   ├── request/           # Incoming request bodies
│       │   └── response/          # Outgoing response shapes
│       ├── enums/                 # UserRoles (STUDENT, ADMIN)
│       ├── model/                 # JPA entities
│       ├── repository/            # JPA repositories
│       ├── service/               # Business logic
│       └── util/                  # Helper classes
├── intellecta-frontend/
│   ├── public/                    # index.html, manifest, robots.txt
│   └── src/
│       ├── components/            # Atomic UI (shadcn/ui, ApiButton, LoginForm)
│       ├── lib/                   # cn utility for Tailwind
│       ├── pages/                 # Full-screen views
│       │   ├── Auth/              # Login.jsx
│       │   ├── Dashboard/         # Dashboard.jsx
│       │   └── ...                # Admin, Quiz stubs
│       ├── routes/                # AppRoutes.jsx
│       ├── services/              # api.js (Axios instance) + stubs
│       ├── styles/                # global.css (Tailwind directives)
│       ├── App.jsx                # Router provider
│       └── index.js               # Entry point
```

---

## 4. Backend — Configuration

### SecurityConfig.java
- CORS: allows `http://localhost:3000`, methods `GET POST PUT DELETE OPTIONS`, credentials allowed
- CSRF: **disabled**
- All `/api/**` endpoints are **publicly accessible** (temporary — to be locked down with JWT)
- No form login, no HTTP Basic
- `PasswordEncoder` = `BCryptPasswordEncoder`

### WebConfig.java
- Additional CORS mapping on `/api/**` (defensive double-config alongside SecurityConfig)

### application.properties
- Active profile: `dev`
- Database: SQL Server (`ddl-auto=update` — tables auto-created/updated from entities)
- JWT secret and expiration: **placeholders only**, not functional yet
- Default Spring Security user: `admin` / `password123` (for non-API endpoints only, not used for `/api/auth/login`)
- **DB credentials (`url`, `username`, `password`) are NOT in this file** — provide via `application-dev.properties` or environment variables

---

## 5. Backend — Implemented Features

### Controllers & Endpoints

| Controller | Endpoint | Method | Response |
|---|---|---|---|
| `TestController` | `/api/hello` | GET | `"Connection Successful! Hello from Spring Boot."` |
| `AuthController` | `/api/auth/login` | POST | `"LOGIN SUCCESS"` (200) or error message (401) |

All other controllers (`AdminController`, `QuizController`, `ScheduleController`, `StudySessionController`, `AnalyticsController`) are **empty stubs**.

### AuthServiceImpl — Login Flow
1. Fetch user by email via `UserRepository.findByEmail(email)`
2. Validate password: `passwordEncoder.matches(plainPassword, storedHash)`
3. Return `"LOGIN SUCCESS"` — **JWT token generation not yet implemented**

### User Entity (only fully implemented entity)
```java
@Entity
@Table(name = "users")
public class User {
    Long id;
    String username;
    String email;
    String password;      // BCrypt hash, VARCHAR(255)
    @Enumerated(STRING)
    UserRoles role;       // STUDENT or ADMIN (uppercase in DB)
}
```

### UserRepository
```java
Optional<User> findByEmail(String email);
```

### All Other Models (empty placeholders — need full implementation)
`Course`, `Quiz`, `Schedule`, `StudySession`, `Achievement`, `Notes`, `Document`, `Question`, `QuizAttempt`, `Analytics`, `Admin`, `Student`

### All Other Repositories (empty stubs)
`QuizRepository`, `ScheduleRepository`, `StudySessionRepository`, `NoteRepository`, `DocumentRepository`, `AnalyticsRepository`, `AchievementRepository`

### All Other Services (empty stubs)
`AnalyticsService`, `QuizService`, `ScheduleService`, `StudySessionService`, `GamificationService`, `NotesService`

---

## 6. Frontend — Implemented Features

### Routing (AppRoutes.jsx)
| Path | Page |
|---|---|
| `/` | `HomePage` |
| `/login` | `LoginPage` (Auth/Login.jsx) |
| `/dashboard` | `DashboardPage` |

### Working Pages
- **HomePage** — displays "Intellecta is Live!" and tests `GET /api/hello`, shows connection status
- **LoginPage** — email/password form using `LoginForm` component, calls `POST /api/auth/login`, redirects to `/dashboard` on success, shows `err.response?.data` on failure
- **DashboardPage** — simple placeholder shell

### Empty/Stub Pages (need implementation)
- `Admin/`: `ManageQuizzes`, `ManageUsers`, `QuestionBank`
- `Auth/`: `Register`
- `Dashboard/`: `Analytics`, `StudyPlanner`
- `Quiz/`: `AttemptQuiz`, `QuizList`, `Result`

### Key Components
- **`ApiButton`** — reusable button for API calls
- **`LoginForm`** — fully functional, uses shadcn/ui `Card`, `Input`, `Label`, `Button`
- **shadcn/ui** components: `Button`, `Card`, `Input`, `Label`

### Axios Instance (src/services/api.js)
```javascript
import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});
export default api;
```
**All API calls must use this instance — never hardcode the base URL.**

### Login Request Pattern
```javascript
const res = await api.post("/auth/login", { email, password });
// On success: navigate("/dashboard")
// On error: alert(err.response?.data)
```

### Styling Rules
- `global.css` imports Tailwind base/components/utilities
- CSS variables follow shadcn/ui default zinc palette
- Primary button color: black (login button)
- New components: use `cn` utility from `src/lib/`, import UI from `@/components/ui`

---

## 7. Database — Critical Rules

| Rule | Detail |
|---|---|
| Password column type | `VARCHAR(255)` — **never** `CHAR` (trailing spaces break BCrypt equality check) |
| Role column values | **Uppercase only**: `STUDENT` or `ADMIN` — must match Java enum exactly |
| String length checks | Use `LEN()` — SQL Server does **not** support `LENGTH()` |
| DDL | `ddl-auto=update` — tables auto-created from entity definitions |

### Test Data Insert
```sql
INSERT INTO users (username, email, password, role)
VALUES (
  'hasan',
  'hasan@test.com',
  '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMp99Y6O0sba',
  'STUDENT'
);
```

### Generating a BCrypt Hash (for manual inserts)
```java
// Run in a test or temporary main method
String hash = new BCryptPasswordEncoder().encode("plainPassword");
System.out.println(hash);
```

---

## 8. Troubleshooting Reference

| Symptom | Likely Cause & Fix |
|---|---|
| `403 Forbidden` | URL mismatch (e.g., `/api/login` vs `/api/auth/login`), or Spring Security blocking — check `SecurityConfig` `permitAll` pattern |
| `401 Unauthorized` | Wrong credentials · Password not BCrypt-hashed · Role in DB is lowercase (`student` not `STUDENT`) · Email not found |
| SQL Server errors | Using `LENGTH()` instead of `LEN()` · Using `CHAR` instead of `VARCHAR` for password/role columns |
| JS deprecation warning | Add `"ignoreDeprecations": "6.0"` to `jsconfig.json` to silence `baseUrl` warnings |
| Login works but no redirect | Check `useNavigate()` is called only after confirming `res.data === "LOGIN SUCCESS"` |

---

## 9. Core Domain — Feature List

This is the complete feature set the application must ultimately support.

### Student Features
- Study schedule generator (input courses, exam dates, difficulty level → auto-generated timetable with subject time blocks; auto-adjusts when student falls behind)
- Pomodoro timer (configurable work/break intervals — default 25 min/5 min, session counter per subject, XP awarded on completion, reminder popup if session inactive too long)
- Focus analytics dashboard (planned vs actual study time, subject-wise focus breakdown, productive hours heatmap, distraction log with reason tracking, weak topic detection from quiz performance, score trend charts)
- Notes (create during study sessions, tag by subject/topic, keyword search, review queue for notes marked "review later", link notes to specific sessions)
- Document management (upload PDFs/images/Word docs, drag-and-drop, per-subject folder structure, auto-categorization by filename, custom tags, quick-open, search by name or tag)
- Coverage tracker (topic checklist per subject: Not Started → In Progress → Reviewed → Mastered, progress bar per subject)
- Exam countdown with panic meter (visual countdown, days remaining vs % material covered alert)
- Pre-exam checklist (things to review, things to bring — e.g., calculator, ID)
- Review queue (notes and topics flagged for later review)
- Quiz/exam attempt (MCQ and descriptive questions, countdown timer, auto-submit on expiry, results screen with score and correct answers highlighted, XP awarded)
- Gamification: XP system, level progression, achievement badges (Early Bird, Night Owl, Marathon, Focused Week, Subject Master, Distraction Slayer, Comeback, Balanced Learner), level-up unlocks themes and avatars, streak tracking
- Leaderboard and peer comparison (rank, XP, study hours, badge showcase)
- Export study plan as CSV or PDF
- AI chatbot integration (proxied through backend to protect API key)
- Active window tracking (classify productive apps vs distractions by window title)
- Distraction blocker (fullscreen motivational quotes mode with custom quote support)

### Admin Features
- User account management (create, update, delete accounts, assign roles)
- Question bank (add/edit/delete MCQ and descriptive questions, filter by subject)
- Quiz/exam builder (select questions from bank, set marks per question, configure time limit, set auto-grading rules, preview, publish)
- Manual grading interface for descriptive answers
- Platform-wide analytics dashboard (total users, active sessions, avg scores, top performers)
- Monitor student performance trends over time
- Configure achievement badges and XP rule thresholds

---

## 10. Planned Entity Relationships

| Relationship | Type |
|---|---|
| Student → Schedule | One-to-many |
| Student → StudySession | One-to-many |
| Student → Note | One-to-many |
| Student → Document | One-to-many |
| Student → QuizAttempt | One-to-many |
| Student → Achievement | Many-to-many |
| Admin → Quiz | One-to-many |
| Quiz → Question | Composition one-to-many |
| QuizAttempt → Quiz | Many-to-one |
| Schedule → Course | One-to-many |
| StudySession → Course | Many-to-one |
| Analytics → Student | One-to-one |

---

## 11. Enums Required

```java
// UserRoles.java — already exists
STUDENT, ADMIN

// TopicStatus.java — to be created
NOT_STARTED, IN_PROGRESS, REVIEWED, MASTERED

// QuestionType.java — to be created
MCQ, DESCRIPTIVE

// DocumentCategory.java — to be created
PAST_PAPERS, LECTURE_NOTES, ASSIGNMENTS, OTHER
```

---

## 12. Development Roadmap

### Phase 1 — Security Hardening (current priority)
- Implement JWT token generation in `AuthServiceImpl.login()` (return signed token instead of plain string)
- Add `JwtUtil.java` — generate token, validate token, extract claims
- Add `JwtAuthFilter.java` — extends `OncePerRequestFilter`, reads `Authorization: Bearer <token>` header
- Update `SecurityConfig` to register JWT filter and restrict non-auth endpoints by role
- Frontend: store JWT in `localStorage`, attach to every request via Axios request interceptor
- Frontend: add `ProtectedRoute` wrapper component that redirects unauthenticated users to `/login`

### Phase 2 — User Onboarding
- `POST /api/auth/register` — validate unique email, BCrypt-hash password, assign role, save user
- Frontend: `/register` page with name, email, password, role selector fields

### Phase 3 — Core Domain Entities
- Implement all empty JPA entity classes with full fields, annotations, and relationships
- Fill in all repository interfaces with required query methods
- Build CRUD services and controllers for: `Schedule`, `StudySession`, `Quiz`, `Question`, `QuizAttempt`, `Notes`, `Document`, `Course`
- Implement schedule generation algorithm in `util/ScheduleAlgorithm.java`
- Implement XP calculation logic in `util/XpCalculator.java`

### Phase 4 — Analytics & Gamification
- `AnalyticsService` — aggregate study time, compute quiz score trends, detect weak topics
- `GamificationService` — award XP on session completion, check badge unlock criteria, handle level-up
- Expose analytics and gamification data via REST endpoints
- Frontend: analytics charts using recharts

### Phase 5 — Remaining Features
- Leaderboard endpoint aggregating user XP and study hours
- Document upload: multipart file endpoint, store file path in `Document` entity
- AI chatbot: proxy endpoint (`POST /api/chat`) that forwards to external AI API (key stays on server)
- Export: server-side CSV/PDF generation for study plans
- Active window tracking integration

### Phase 6 — Polish & Hardening
- Global exception handler (`@ControllerAdvice`) returning consistent JSON: `{ "error": "...", "status": 404 }`
- Frontend: loading states, error boundaries, toast notifications, form validation
- Full RBAC: `@PreAuthorize("hasRole('ADMIN')")` on all admin endpoints
- Responsive UI pass for mobile compatibility

---

## 13. Running the Application

### Backend
```bash
cd intellecta-backend
./mvnw clean install
./mvnw spring-boot:run
# Starts on http://localhost:8080
```
DB credentials must be provided externally (not in `application.properties`):
```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=intellecta
spring.datasource.username=your_user
spring.datasource.password=your_password
```

### Frontend
```bash
cd intellecta-frontend
npm install
npm start
# Starts on http://localhost:3000
```

---

## 14. Contributor Rules

1. **Never store plain-text passwords** — always BCrypt-hash before persisting.
2. **Always use the `api` Axios instance** from `src/services/api.js` — never hardcode `http://localhost:8080`.
3. **Role strings in DB must be uppercase** — `STUDENT`, `ADMIN` — to match the Java enum.
4. **New UI components** must follow shadcn/ui pattern: import from `@/components/ui`, use `cn()` from `src/lib/`, Tailwind classes only.
5. **No business logic in controllers** — controllers receive the request, call one service method, return the result.
6. **No DB queries in services** — services call repositories only; never write raw JDBC in a service.
7. **DTOs in, DTOs out** — never expose raw JPA entity objects in API responses; always map to a response DTO.
8. **SQL Server syntax** — use `LEN()` not `LENGTH()`, `VARCHAR` not `CHAR` for password and enum columns.
9. **Security is currently permissive** (`/api/**` is open) — when adding JWT, update `SecurityConfig` to add the filter chain and restrict endpoints by role.
10. **When implementing any feature** — check if the model, repository, service, and controller already exist as stubs. If they do, fill them in rather than creating duplicates.

---

*This file is the single source of truth for Intellecta's development context. Update it whenever a major feature (JWT, registration, a new entity, a new working endpoint) is completed.*