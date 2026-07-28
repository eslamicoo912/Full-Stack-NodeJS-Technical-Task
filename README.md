# Team Task Board

A full-stack task management application built as a technical assessment. Authenticated users can create projects, manage tasks, assign tasks to users, and track status changes.

## Tech Stack

**Backend**
- Node.js + Express.js 5
- MongoDB + Mongoose
- JWT authentication with bcrypt password hashing
- Zod for request validation
- Socket.IO for real-time updates
- Jest + Supertest for testing

**Frontend**
- React 19 + Vite + TypeScript
- Tailwind CSS 4
- React Router DOM (routing)
- Axios (HTTP client)
- TanStack React Query (server-state management)
- React Hook Form + Zod (forms & validation)
- Socket.IO Client for real-time task updates

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── database/models/     # Mongoose schemas (User, Project, Task, TaskAuditLog)
│   │   ├── modules/
│   │   │   ├── auth/            # Register, login, session restore
│   │   │   ├── project/         # Project CRUD + member management
│   │   │   ├── task/            # Task CRUD + audit log + state machine
│   │   │   └── user/            # Admin-only user listing
│   │   ├── shared/              # Config, middleware, utils, seed script
│   │   └── tests/               # Jest test suites
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/                 # Typed API clients (auth, project, task, user, member)
    │   ├── components/          # Shared UI (Modal, ConfirmDialog, Layout, ProtectedRoute)
    │   ├── features/            # Feature modules (auth, projects, tasks)
    │   ├── pages/               # Route pages
    │   ├── types/               # TypeScript types mirroring backend models
    │   └── lib/                 # Token storage helper
    └── .env.example
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB running locally on `mongodb://localhost:27017` (or update `MONGODB_URI`)

## Setup

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend (separate terminal)
cd frontend
npm install
```

### 2. Configure environment variables

**Backend** — copy `.env.example` to `.env` and adjust as needed:

```env
NODE_ENV=dev
PORT=3000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/full_stack_node_technical_task
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=1d
SALT_ROUNDS=10
```

**Frontend** — copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 3. Seed the database

```bash
cd backend
npm run seed
```

This creates two test accounts:

| Role   | Email                 | Password    |
|--------|-----------------------|-------------|
| Admin  | eslam@example.com     | Admin@123   |
| Member | ahmed@example.com     | Member@123  |

It also seeds one project with three tasks (one per status) for testing.

### 4. Start the application

```bash
# Backend (port 3000)
cd backend
npm run dev

# Frontend (port 5173) — separate terminal
cd frontend
npm run dev
```

Open http://localhost:5173 and log in with one of the seed accounts.

## API Endpoints

### Auth
- `POST /api/auth/register` — `{name, email, password}` → `{user, token}`
- `POST /api/auth/login` — `{email, password}` → `{user, token}`
- `GET /api/auth/me` — current user (requires Bearer token)

### Projects (all require authentication)
- `GET /api/projects` — paginated list with `?search,sort,page,limit`
- `POST /api/projects` — create project
- `GET /api/projects/:id` — get project
- `PATCH /api/projects/:id` — update project (owner/Admin only)
- `DELETE /api/projects/:id` — delete project + cascade tasks (owner/Admin only)
- `POST /api/projects/:id/members` — add member (Admin only)
- `DELETE /api/projects/:id/members/:userId` — remove member (Admin only)

### Tasks (all require authentication, nested under project)
- `GET /api/projects/:projectId/tasks` — paginated list with `?search,sort,status,priority,assignee,page,limit`
- `POST /api/projects/:projectId/tasks` — create task
- `GET /api/projects/:projectId/tasks/:taskId` — get task
- `PATCH /api/projects/:projectId/tasks/:taskId` — update task (status changes follow state machine)
- `DELETE /api/projects/:projectId/tasks/:taskId` — delete task (Admin/project owner/task creator)
- `GET /api/projects/:projectId/tasks/:taskId/audit-logs` — status change history

### Users (Admin only)
- `GET /api/users` — paginated list with `?search,sort,role,page,limit`

## Task Status State Machine

Tasks can only transition one step at a time in both directions:

```
To Do ↔ In Progress ↔ Done
```

Direct transitions like `To Do → Done` are rejected with a 400 error.

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend build check
cd frontend
npm run build
```

## Key Features

- **JWT authentication** with secure password hashing and role-based access control (Admin/Member)
- **Project management** with member access control (Admins can add/remove members)
- **Task board** with three-column Kanban view (To Do / In Progress / Done)
- **Status transitions** enforced by a state machine with audit logging
- **Real-time updates** — task changes are instantly reflected across all connected clients using Socket.IO with toast notifications
- **Filtering & search** — filter tasks by status, priority, assignee; search by title/description
- **Pagination & sorting** — all list endpoints support pagination and custom sorting
- **Responsive design** — works on desktop and mobile
- **Client-side validation** mirroring backend Zod schemas
- **Loading, error, and empty states** handled throughout the UI

## Design Decisions

- **Module-based structure** — backend and frontend both organize code by feature (auth, project, task)
- **Type mirroring** — frontend TypeScript types exactly match backend models and enums
- **Simple, junior-level code** — plain components, minimal abstractions, readable direct implementations
- **Centralized error handling** — backend error middleware + frontend axios interceptor for 401 auto-logout

### Backend Architecture

Each backend module follows the same layout: **routes → controller (HTTP only) → service (business rules) → repository (database queries)**, plus a zod validation file and an interface file for types. This keeps each layer small and easy to test.

- **Role cannot be set at registration.** Everyone who signs up becomes a Member. If the API accepted a role field, anyone could register as an Admin. Admin accounts are created through the seed script (or directly in the database).

- **Task status state machine.** A task can only move one step at a time: `To Do ⇄ In Progress ⇄ Done`. Jumping from `To Do` straight to `Done` is rejected with a 400. The rules live in one small file (`task.state-machine.ts`) as a plain lookup table, so they are easy to read and change.

- **Audit log for status changes.** Every task keeps a history: one entry when it is created (`fromStatus: null`) and one entry for each status change. The log is read through its own endpoint and is never edited, only added to.

- **Cascade deleting.** Deleting a project also deletes its tasks and their audit logs. Deleting a task deletes its audit logs. This avoids leaving orphaned records in the database.

- **Access rules.** Admins can see and manage everything. A normal user can only see projects they own or are a member of. Only the Admin or the project owner can update or delete a project. A task's assignee must be part of the project. These checks happen in the service layer, so no route can skip them.

- **One error path.** Services throw an `ApiError` with the right status code (400, 401, 403, 404, 409) and a single error middleware turns it into the response. It also handles zod validation errors, bad ObjectIds, and duplicate keys. Controllers stay small because they never catch errors themselves.

- **Login errors don't leak information.** Wrong email and wrong password return the same message, so an attacker can't find out which emails are registered.

- **Passwords never leave the server.** The password field is excluded from queries by default and stripped from every JSON response. Hashing happens in one place: a Mongoose pre-save hook.

- **Pagination, search, and filtering are allowlisted.** The `APIFeatures` helper only accepts known filter fields and escapes regex characters in search input, so query params can't be abused.

## Real-Time Updates

The application uses **Socket.IO** for real-time task synchronization. When a user creates, updates, or deletes a task, the backend emits an event to all clients viewing that project. Connected clients automatically refresh their task list and display a toast notification.

- **Room-based scoping** — clients only receive events for projects they are actively viewing
- **Toast notifications** — users see non-intrusive popups when other users make changes

## CI/CD with GitHub Actions

The project includes a GitHub Actions workflow (`.github/workflows/main.yaml`) that runs on every push and pull request to `main` and `dev` branches.

**What it does:**
- Checks out the code
- Sets up Node.js 22
- Installs dependencies (using `npm ci` for reproducible builds)
- Runs linters for both backend and frontend
- Builds both applications

**Why it matters:**
- Catches build errors and linting issues early
- Ensures code quality before merging
- Runs automatically — no manual intervention needed
- Fast feedback loop for developers

The workflow runs two parallel jobs: one for the backend and one for the frontend, so they don't block each other.
