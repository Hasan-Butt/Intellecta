# Intellecta — Project Context

**Last Updated:** 2026-05-02  
**Status:** Authentication live. Student Dashboard fully wired. Study sessions, courses, distractions, notes, documents, and subjects implemented.

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
├── docs/
├── intellecta-backend/
│   └── src/main/java/com/intellecta/intellecta_backend/
│       ├── config/                # SecurityConfig, WebConfig (CORS)
│       ├── controller/            # REST endpoints
│       ├── dto/
│       │   ├── request/           # CourseRequest, StudySessionRequest, DistractionRequest, SubjectRequest, NoteRequest, LoginRequest, DocumentTagRequest, QuizAttemptRequest
│       │   └── response/          # DashboardResponse, CourseResponse, StudySessionResponse, SubjectResponse, NoteResponse, DocumentResponse, FocusDayDTO, ScheduleBlockDTO, ReviewItemDTO, DistractionSummaryDTO, LeaderboardEntryDTO
│       ├── enums/                 # UserRoles, DocumentCategory, NoteCategory, CourseDifficulty
│       ├── model/                 # All JPA entities
│       ├── repository/            # All JPA repositories
│       ├── service/               # Business logic
│       └── util/                  # DateUtils, FileNameParser
├── intellecta-frontend/
│   ├── public/
│   └── src/
│       ├── components/            # Navbar, Sidebar, StudentSidebar, LoginForm, ApiButton, shadcn/ui
│       ├── lib/                   # cn utility
│       ├── pages/
│       │   ├── Auth/              # Login.jsx, Register.jsx (stub)
│       │   ├── StudentDashboard/  # Dashboard.jsx (fully wired)
│       │   ├── SubjectFolder/     # SubjectFolderpage.jsx
│       │   └── ...                # Other stubs
│       ├── services/              # api.js, dashboardService.js, documentService.js, authService.js, notesService.js, quizService.js, courseService.js
│       ├── styles/                # global.css
│       ├── App.jsx
│       └── index.js
```

---

## 4. Backend — Configuration

### SecurityConfig.java
- CORS: allows `http://localhost:3000`, methods `GET POST PUT DELETE PATCH OPTIONS`, credentials allowed
- CSRF: **disabled**
- All `/api/**` endpoints are **publicly accessible** (temporary — to be locked down with JWT)
- No form login, no HTTP Basic
- `PasswordEncoder` = `BCryptPasswordEncoder`

### WebConfig.java
- Additional CORS mapping on `/api/**`

### application.properties
- Active profile: `dev`
- Database: SQL Server (`ddl-auto=update`)
- JWT secret and expiration: **placeholders only**, not functional yet
- **DB credentials are NOT in this file** — provide via `application-dev.properties` or environment variables

---

## 5. Backend — Implemented Features

### Controllers & Endpoints

| Controller | Endpoint | Method | Description |
|---|---|---|---|
| `TestController` | `/api/hello` | GET | Connection check |
| `AuthController` | `/api/auth/login` | POST | Login, returns `"LOGIN SUCCESS"` |
| `DashboardController` | `/api/dashboard/user/{userId}` | GET | Full dashboard data |
| `StudySessionController` | `/api/sessions/user/{userId}/start` | POST | Start a study session |
| `StudySessionController` | `/api/sessions/{sessionId}/end` | PATCH | End a study session |
| `StudySessionController` | `/api/sessions/user/{userId}` | GET | Get all sessions for user |
| `CourseController` | `/api/courses/user/{userId}` | POST | Add a course/exam |
| `CourseController` | `/api/courses/user/{userId}` | GET | Get all courses for user |
| `CourseController` | `/api/courses/user/{userId}/{courseId}` | PUT | Update a course |
| `CourseController` | `/api/courses/user/{userId}/{courseId}` | DELETE | Delete a course |
| `SubjectController` | `/api/subjects/user/{userId}` | POST | Create a subject folder |
| `SubjectController` | `/api/subjects/user/{userId}` | GET | Get all subjects |
| `SubjectController` | `/api/subjects/user/{userId}/{subjectId}` | DELETE | Delete a subject |
| `DocumentController` | `/api/documents/upload/user/{userId}` | POST | Upload a document (multipart) |
| `DocumentController` | `/api/documents/user/{userId}/subject` | GET | Get docs by subject |
| `DocumentController` | `/api/documents/user/{userId}/search` | GET | Search documents |
| `DocumentController` | `/api/documents/user/{userId}/{documentId}/tags` | PUT | Update tags |
| `DocumentController` | `/api/documents/user/{userId}/{documentId}` | DELETE | Delete document |
| `DistractionController` | `/api/distractions/user/{userId}` | POST | Log a distraction |
| `AnalyticsController` | `/api/analytics` | — | Stub only |

### AuthServiceImpl — Login Flow
1. Fetch user by email via `UserRepository.findByEmail(email)`
2. Validate password: `passwordEncoder.matches(plainPassword, storedHash)`
3. Return `"LOGIN SUCCESS"` — **JWT not yet implemented**

---

## 6. Implemented Models (fully annotated JPA entities)

| Model | Table | Notes |
|---|---|---|
| `User` | `users` | Has `xp`, `level`, `streakDays`, `lastStudyDate` fields added |
| `StudySession` | `study_sessions` | `subject`, `startTime`, `endTime`, `pomodorosCompleted`, `deepWork` |
| `Course` | `courses` | `courseName`, `examDate`, `difficulty` (enum), `plannedHoursPerDay` |
| `Subject` | `subjects` | `name`, `semester`, `color`, linked to `User` |
| `Notes` | `notes` | `title`, `content`, `tags`, `category`, `flaggedForReview`, `isPinned` |
| `Document` | `documents` | `fileName`, `filePath`, `subject`, `tags`, `uploadDate` |
| `Achievement` | `achievements` | `badgeName`, `description`, `earnedAt`, linked to `User` |
| `Analytics` | `analytics` | One-to-one with `User`, currently minimal |
| `DistractionEntry` | `distraction_entries` | `reason`, `loggedAt`, linked to `User` |

### Stub models (exist but empty — need full implementation)
`Quiz`, `Question`, `QuizAttempt`, `Schedule`, `Admin`, `Student`

---

## 7. Implemented Repositories

| Repository | Key Methods |
|---|---|
| `UserRepository` | `findByEmail`, `findAll` |
| `StudySessionRepository` | `findByUserIdOrderByStartTimeDesc`, `findTop5ByUserId`, `findByUserIdAndStartTimeAfter`, `countByUserId`, `sumPomodorosByUserId` (returns `Integer` not `int`), `dailyFocusMinutes` |
| `CourseRepository` | `findByUserIdOrderByExamDateAsc`, `findByUserIdAndExamDateAfterOrderByExamDateAsc` |
| `SubjectRepository` | `findByUserIdOrderBySemesterAscNameAsc`, `findByUserIdAndNameAndSemester`, `countByUserId` |
| `NotesRepository` | `findByUserIdOrderByIsPinnedDescCreatedAtDesc`, `findByUserIdAndFlaggedForReviewTrue`, `searchByKeyword`, `countByUserId`, `countByUserIdAndFlaggedForReviewTrue` |
| `DocumentRepository` | `findByUserIdOrderByUploadDateDesc`, `findByUserIdAndSubjectOrderByUploadDateDesc`, `searchByNameOrTag`, `countByUserId` |
| `AchievementRepository` | `findTop3ByUserIdOrderByEarnedAtDesc`, `countByUserId` |
| `DistractionRepository` | `findTopByUserIdOrderByLoggedAtDesc`, `findByUserIdAndLoggedAtAfterOrderByLoggedAtDesc`, `dailyDistractionCounts` |
| `AnalyticsRepository` | `findByUserId` |

### Stub repositories (exist but empty)
`QuizRepository`, `ScheduleRepository`

---

## 8. Implemented Services

| Service | Status |
|---|---|
| `AuthServiceImpl` | Login only, no JWT yet |
| `DashboardServiceImpl` | Full — aggregates all dashboard data |
| `StudySessionServiceImpl` | Start, end, get sessions — returns `StudySessionResponse` DTO |
| `CourseServiceImpl` | Full CRUD |
| `SubjectServiceImpl` | Full CRUD |
| `DocumentServiceImpl` | Upload, list, search, tag, delete |
| `NotesServiceImpl` | Full CRUD |

### Stub services (interface only, no impl)
`AnalyticsService`, `QuizService`, `ScheduleService`, `GamificationService`

---

## 9. Frontend — Implemented Features

### Routing (AppRoutes.jsx)
| Path | Page | Status |
|---|---|---|
| `/` | `HomePage` | Working |
| `/login` | `LoginPage` | Working |
| `/dashboard` | `StudentDashboard/Dashboard.jsx` | Fully wired to API |
| `/subjects` | `SubjectFolderpage.jsx` | Working |

### Working Pages
- **HomePage** — connection test
- **LoginPage** — calls `POST /api/auth/login`, redirects to `/dashboard`
- **StudentDashboard/Dashboard.jsx** — fully wired, all widgets pull live data:
  - Greeting with capitalized username
  - Daily goal circular progress (today study hours / 6h goal)
  - Focus streak (days)
  - Focus intensity chart (7-day bar chart with distraction dots)
  - Today's itinerary (from courses, scrollable after 3)
  - Review queue (from flagged notes, scrollable after 3)
  - Pre-exam checklist (seeded from courses, scrollable after 3)
  - Distraction log (live POST + summary refresh)
  - XP / Level / Progress bar
  - Recent achievement badges
  - Cohort leaderboard (all users ranked by XP)
  - Skeleton loading state while fetching
- **SubjectFolderpage.jsx** — subject/document management working

### Frontend Services
| File | Purpose |
|---|---|
| `api.js` | Axios instance, baseURL `http://localhost:8080/api` |
| `dashboardService.js` | `getDashboard()`, `logDistraction()`, `startSession()`, `endSession()` |
| `documentService.js` | Subject and document CRUD |
| `authService.js` | Login |
| `notesService.js` | Notes CRUD |

### USER_ID Note
All frontend services currently use `const USER_ID = 2` hardcoded — **must be replaced with JWT-decoded userId in Phase 1**.

---

## 10. Database — Critical Rules

| Rule | Detail |
|---|---|
| Password column type | `VARCHAR(255)` — never `CHAR` |
| Role column values | Uppercase only: `STUDENT` or `ADMIN` |
| String length checks | Use `LEN()` — SQL Server does not support `LENGTH()` |
| DDL | `ddl-auto=update` — tables auto-created from entities |
| `sumPomodorosByUserId` return type | Must be `Integer` (not `int`) — returns `null` when no sessions exist |

### Test User
```sql
INSERT INTO users (username, email, password, role)
VALUES (
  'hasan',
  'hasan@test.com',
  '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMp99Y6O0sba',
  'STUDENT'
);
-- password: password123
-- id: 2
```

---

## 11. Enums

```java
// UserRoles.java — exists
STUDENT, ADMIN

// CourseDifficulty.java — exists
EASY, MEDIUM, HARD

// NoteCategory.java — exists
// DocumentCategory.java — exists
PAST_PAPERS, LECTURE_NOTES, ASSIGNMENTS, OTHER

// TopicStatus.java — to be created
NOT_STARTED, IN_PROGRESS, REVIEWED, MASTERED

// QuestionType.java — to be created
MCQ, DESCRIPTIVE
```

---

## 12. Troubleshooting Reference

| Symptom | Likely Cause & Fix |
|---|---|
| `403 Forbidden` | Backend not restarted after changes — always restart after adding new controllers |
| `403 on /api/**` | Check `SecurityConfig` — pattern must match exactly. Try `anyRequest().permitAll()` temporarily |
| `401 Unauthorized` | Wrong credentials · Password not BCrypt-hashed · Role lowercase in DB |
| `NullPointerException` on `sumPomodoros` | Return type must be `Integer` not `int` — SQL SUM returns null when no rows |
| `Not a managed type` | Model class missing `@Entity` annotation |
| Duplicate bean on startup | Two `SecurityConfig.java` files exist — delete the duplicate |
| SQL Server errors | Using `LENGTH()` instead of `LEN()` · Using `CHAR` instead of `VARCHAR` |
| Password exposed in response | Returning raw entity — always map to DTO before returning from controller |
| Dashboard shows zeros | No data in DB yet — add sessions/courses/notes via Postman first |
| Itinerary/checklist not scrolling | Add `max-h-[280px] overflow-y-auto pr-1` to the items container div |

---

## 13. Development Roadmap

### ✅ Completed
- Login (email + BCrypt)
- Student Dashboard fully wired (all widgets live)
- Study sessions (start/end/list)
- Courses/exams (full CRUD)
- Subject folders (full CRUD)
- Document management (upload, list, search, tag, delete)
- Notes (full CRUD with flagged review)
- Distraction logging
- Leaderboard (ranked by XP)
- Username capitalization in dashboard greeting

### Phase 1 — Security Hardening (next priority)
- Implement JWT token generation in `AuthServiceImpl.login()`
- Add `JwtUtil.java` — generate, validate, extract claims
- Add `JwtAuthFilter.java` — reads `Authorization: Bearer <token>`
- Update `SecurityConfig` to register JWT filter and restrict by role
- Frontend: store JWT in `localStorage`, attach via Axios request interceptor
- Frontend: replace hardcoded `USER_ID = 2` with JWT-decoded userId
- Frontend: add `ProtectedRoute` wrapper — redirect unauthenticated users to `/login`

### Phase 2 — User Onboarding
- `POST /api/auth/register` — validate unique email, BCrypt-hash, assign role
- Frontend: `/register` page

### Phase 3 — Remaining Core Entities
- `Quiz`, `Question`, `QuizAttempt` — full implementation
- `Schedule` — generation algorithm in `util/ScheduleAlgorithm.java`
- XP calculation on session end in `util/XpCalculator.java`
- `GamificationService` — award XP, check badge criteria, level-up

### Phase 4 — Analytics & Gamification
- `AnalyticsService` — aggregate study time, score trends, weak topic detection
- Expose via `/api/analytics/user/{userId}`
- Frontend: analytics charts using recharts

### Phase 5 — Remaining Features
- AI chatbot proxy (`POST /api/chat`)
- Export study plan as CSV/PDF
- Active window tracking

### Phase 6 — Polish & Hardening
- Global exception handler (`@ControllerAdvice`) — consistent JSON error shape
- Frontend: toast notifications, error boundaries, form validation
- Full RBAC: `@PreAuthorize("hasRole('ADMIN')")` on admin endpoints
- Responsive UI pass

---

## 14. Running the Application

### Backend
```bash
cd intellecta-backend
./mvnw clean install
./mvnw spring-boot:run
# Starts on http://localhost:8080
```
DB credentials via `application-dev.properties`:
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

## 15. Contributor Rules

1. **Never store plain-text passwords** — always BCrypt-hash before persisting.
2. **Always use the `api` Axios instance** from `src/services/api.js` — never hardcode `http://localhost:8080`.
3. **Role strings in DB must be uppercase** — `STUDENT`, `ADMIN`.
4. **New UI components** must follow shadcn/ui pattern: import from `@/components/ui`, use `cn()` from `src/lib/`, Tailwind only.
5. **No business logic in controllers** — call one service method, return result.
6. **No DB queries in services** — call repositories only.
7. **DTOs in, DTOs out** — never expose raw JPA entities in API responses.
8. **SQL Server syntax** — `LEN()` not `LENGTH()`, `VARCHAR` not `CHAR`.
9. **`sumPomodorosByUserId` must return `Integer`** — primitive `int` causes NPE when no sessions exist.
10. **Check for existing stubs** before creating new files — fill in, don't duplicate.
11. **Always restart backend** after adding new controllers or models.
12. **Username display** — capitalize first letter in `DashboardServiceImpl` before setting in response DTO.

---

*This file is the single source of truth for Intellecta's development context. Update it whenever a major feature is completed.*