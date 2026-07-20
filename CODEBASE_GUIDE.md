# Codebase Structure and File Guide

This guide details the structural layout of this repository and describes the purpose and function of each directory and file across the frontend and backend applications.

---
# Abhishek Yadav 
## 📂 Root Level Configuration Files

- **`package.json`**: Configures dependencies, scripts (`dev`, `build`, `start`, `lint`), and meta configuration for the Next.js frontend application.
- **`tsconfig.json`**: TypeScript compiler setup for code transpilation in the frontend.
- **`next.config.ts`**: Holds framework configurations for the Next.js runtime environment.
- **`postcss.config.mjs`**: Utility style processor configuration loading Tailwind CSS v4.
- **`eslint.config.mjs`**: Contains static code analysis and rules configuration for keeping the codebase clean.
- **`.env.local`**: Configures environment variables for the frontend client (such as `NEXT_PUBLIC_API_BASE_URL`).
- **`README.md`**: Provides high-level instructions, onboarding details, and technical descriptions of the project.

---

## 📂 Frontend Application Directory (`/src`)

The client application is built with React 19, TypeScript 5, and the Next.js 16 App Router.

### 📁 1. API Client Call handlers (`/src/api`)
- **[auth.ts](file:///c:/Users/Mobiloitte/Documents/Mini%20Employee%20Task%20Manager/src/api/auth.ts)**: Formulates AXIOS client queries to server-side authentication endpoints (`/auth/register`, `/auth/login`, `/auth/verify-otp`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/users/:id`, and user deletion).
- **[mockAuth.ts](file:///c:/Users/Mobiloitte/Documents/Mini%20Employee%20Task%20Manager/src/api/mockAuth.ts)**: Stub verification actions used when local mock mode is active.
- **[tasks.ts](file:///c:/Users/Mobiloitte/Documents/Mini%20Employee%20Task%20Manager/src/api/tasks.ts)**: Maps tasks CRUD requests to backend routes.

### 📁 2. Next.js App Routes (`/src/app`)
- **`layout.tsx`**: The main page shell providing theme classes, Sonner toast handlers, and context bindings (`AuthProvider`, `TaskProvider`, `ThemeProvider`).
- **`page.tsx`**: The application dashboard containing metrics panels, analytics charts, recent logs lists, and team sidebars.
- **`login/page.tsx`**: UI view where users sign in using credentials.
- **`register/page.tsx`**: New account onboarding page supporting picture upload, name, email, and password registrations.
- **`forgot-password/page.tsx`**: recovery code email submission form.
- **`reset-password/page.tsx`**: Recover validation form verifying 6-digit OTP codes and setting new passwords.
- **`tasks/page.tsx`**: Points to the client task manager view.
- **`tasks/TasksClient.tsx`**: Serves as the main tasks log interface containing search bars, status filters, creation form toggles, and modifiable modals.

### 📁 3. Components (`/src/components`)
- **`Header.tsx`**: Header navbar rendering layout themes, session profiles, and recent activity logs.
- **`Sidebar.tsx`**: Side dashboard links drawer.
- **`MockAuthBanner.tsx`**: Testing banner that can be hidden/dismissed via a close button. The dismissal status is preserved in local storage.
- **`ProtectedRoute.tsx` & `LayoutGuard.tsx`**: Checks if the user is authenticated before allowing them to access private pages.
- **`employee/EmployeeCard.tsx`**: Renders team member cards. Shows an interactive designations dropdown selector to admins, static badges to standard users, and a delete button for account removals.
- **`task/TaskCard.tsx`**: Formats status badges, priority levels, assignees, dates, status dropdown selectors, and action triggers.
- **`task/TaskTable.tsx`**: Interactive grid displaying tasks. Exposes inline status change selectors and Edit/Pencil triggers to admins.
- **`task/TaskEditorModal.tsx`**: Dialog window where admins update task titles, scopes, assignees, and dates.
- **`task/StatusBadge.tsx`**: Renders visual indicator badges based on status variables (todo, in_progress, completed, cancelled).
- **`task/TaskSummaryCard.tsx`**: Renders dynamic metrics blocks counting task levels.
- **`analytics/` (`PieChartCard.tsx`, `LineChartCard.tsx`, `BarChartCard.tsx`)**: Renders task data distributions visually using Recharts.
- **`ui/` (`EmptyState.tsx`, `LoadingState.tsx`, `ConfirmationModal.tsx`)**: Fallback screens, spinners, and general-purpose dialog prompts.

### 📁 4. Contexts (`/src/context`)
- **[AuthContext.tsx](file:///c:/Users/Mobiloitte/Documents/Mini%20Employee%20Task%20Manager/src/context/AuthContext.tsx)**: Manages JWT token storage, logs, profile caches, and session lifecycles.
- **[TaskContext.tsx](file:///c:/Users/Mobiloitte/Documents/Mini%20Employee%20Task%20Manager/src/context/TaskContext.tsx)**: Handles global state management for tasks, members, and activity logs. Defines dispatches like task updates, employee removals, and activity logs formatting.
- **[ThemeContext.tsx](file:///c:/Users/Mobiloitte/Documents/Mini%20Employee%20Task%20Manager/src/context/ThemeContext.tsx)**: Toggles dark mode.

### 📁 5. Services, Types & Utilities
- **`services/axios.ts`**: Intercepts HTTP client calls to attach Bearer JWT tokens dynamically.
- **`types/index.ts`**, **`types/auth.ts`**: Exposes TypeScript models for Employees, Tasks, Activities, and Auth payload interfaces.
- **`utils/dashboardUtils.ts`**: Groups algorithms that count metrics, isolate overdue items, and slice list values.
- **`utils/format.ts`**: String formatting and date-string parser helpers.

---

## 📂 Backend Server Directory (`/server`)

Built with Node.js, Express, TypeScript, and MongoDB (via Mongoose).

### 📁 1. Config & Main Launch Scripts (`/server/src`)
- **`server.ts`**: Server entrypoint loading environment variables, connecting to MongoDB, and launching on designated ports.
- **`app.ts`**: Configures express middlewares (CORS, body parsers, Helmet headers) and sets base endpoint URL paths.
- **`config/db.ts`**: Mongoose connection instance setup.

### 📁 2. Controllers (`/server/src/controllers`)
- **[authController.ts](file:///c:/Users/Mobiloitte/Documents/Mini%20Employee%20Task%20Manager/server/src/controllers/authController.ts)**: Handlers for registration, login, verification OTP triggers, password recovery OTPs, password updates, user catalogs retrieving, designation updates, and admin user removals.
- **[taskController.ts](file:///c:/Users/Mobiloitte/Documents/Mini%20Employee%20Task%20Manager/server/src/controllers/taskController.ts)**: Handles task CRUD logic. Restricts normal employees to task lists they created or are assigned to, and allows admins total access to all tasks.

### 📁 3. Middleware (`/server/src/middleware`)
- **`authMiddleware.ts`**: Decodes JWT headers and sets the authenticated user context (`req.user`).
- **`validateRequest.ts`**: Validates request parameters and body structure using express-validator.
- **`errorHandler.ts` & `notFoundHandler.ts`**: Exception catchers and fallback handlers for invalid paths.

### 📁 4. Models (`/server/src/models`)
- **`User.ts`**: MongoDB model for users. Stores verification codes, designations, roles (`user`, `admin`), names, emails, and profile paths.
- **`Task.ts`**: MongoDB model for tasks. Stores deadlines, priorities, assignees, creators, and descriptions.

### 📁 5. Routes (`/server/src/routes`)
- **`authRoutes.ts`**: Maps authentication endpoints to controllers.
- **`taskRoutes.ts`**: Maps task lifecycle endpoints to controllers.

### 📁 6. Server Utilities & Validators
- **`utils/jwt.ts`**: Secret-backed encoder/decoder utility for access token generation.
- **`utils/cloudinary.ts`**: Handles profile picture asset storage in Cloudinary cloud buckets.
- **`utils/mailer.ts`**: Configures Nodemailer to dispatch verification and recovery verification email templates.
- **`validators/authValidator.ts` & `validators/taskValidator.ts`**: Input validators checking strings, emails, dates, and schema requirements.




Client Request
      │
      ▼
Route
      │
      ▼
Middleware (JWT, etc.)
      │
      ▼
Validator
      │
      ▼
Controller
      │
      ▼
Model
      │
      ▼
MongoDB
      │
      ▼
Response