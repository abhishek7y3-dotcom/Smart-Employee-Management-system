# Codebase Rules & Guidelines (`RULES.md`)

This document establishes the strict architectural, stylistic, and security guidelines that **must** be followed when contributing to the Employee Task Manager project. Consistency is paramount to maintaining a secure, scalable, and premium application.

---

## 1. Architectural Guidelines

### 1.1 Strict Separation of Concerns (Frontend vs. Backend)
- **Frontend (`/src`)**: Strictly handles UI rendering, state management, and client-side routing. No direct database access or heavy business logic should reside here.
- **Backend (`/server/src`)**: Strictly handles data validation, business logic, and database interactions. Must only return predictable JSON responses, never HTML.

### 1.2 The Controller-Route-Validator Pattern
Every new backend endpoint **must** follow this strict pipeline:
1. **Route (`routes/`)**: Defines the HTTP verb and path.
2. **Middleware (`middleware/`)**: Injects `authenticate` (for protected routes) and `validateRequest` (for error formatting).
3. **Validator (`validators/`)**: Uses `express-validator` to strictly define the expected request body/params structure.
4. **Controller (`controllers/`)**: Executes the business logic (DB queries) only after validation passes.

---

## 2. Frontend Development Rules (Next.js & React)

### 2.1 State Management
- Prefer local component state (`useState`) for transient UI interactions (like opening a dropdown).
- Use React Context (`AuthContext`, `TaskContext`) strictly for global state that spans across multiple views.
- **Do not** drill props deeper than 2 levels. If data needs to go deeper, elevate it to Context.

### 2.2 Styling & TailwindCSS Constraints
- **Tailwind Only**: Do not create or import external `.css` files unless extending the core `globals.css`.
- **Aesthetic Enforcement**: The application relies on a premium aesthetic. 
  - Utilize `backdrop-blur` for Glassmorphism overlays.
  - Rely on `dark:` variants for seamless Dark Mode transition.
  - Implement micro-interactions (e.g., `hover:-translate-y-0.5`, `transition-all`, `duration-300`).
- **Semantic HTML**: Prioritize tags like `<article>`, `<section>`, and `<nav>` over generic `<div>` wrappers for accessibility.

### 2.3 Component Modularity
- Limit components to a single responsibility.
- If a component exceeds 150 lines, refactor its internal elements into smaller sub-components (e.g., pulling a complicated form out of a page component).

---

## 3. Backend & Database Rules (Node.js & MongoDB)

### 3.1 Role-Based Access Control (RBAC)
- Always assume the requester is unauthorized. 
- Controllers mutating global state (like `createTask` or `updateUserRole`) **must** include an explicit check for `req.user.role === 'admin'`.
- Return `403 Forbidden` rather than generic `500 Server Errors` when blocking access.
- Valid roles are strictly limited to `"admin"` and `"member"`. Do **not** inject legacy string values like `"user"` or `"employee"` into database fields.

### 3.2 MongoDB / Mongoose Constraints
- Define strict Enums in Mongoose schemas (e.g., `status: ['todo', 'in_progress', 'completed', 'overdue', 'cancelled']`).
- Use `ObjectId` references (`ref: 'User'`) instead of raw strings for relational data (`assignedTo`, `assignedBy`).
- **Do not** return raw password hashes or OTP fields in API responses. Utilize Mongoose `.select('-password')` or explicit property mapping.

### 3.3 Security & Environment Variables
- Never hardcode secrets (`JWT_SECRET`, `AES_KEY`, `MONGODB_URI`). Always rely on `process.env`.
- OTP codes must be encrypted using `AES-256-GCM` before resting in the database.

---

## 4. TypeScript Guidelines

### 4.1 Strict Typing
- **No `any`**: The use of `any` is strictly prohibited. If a type is unknown, use `unknown` and implement type-guard checks.
- **Interfaces over Types**: Use `interface` for object shapes to allow declaration merging. Use `type` strictly for Unions or Tuples.
- **Synchronicity**: Frontend interfaces (`src/types/index.ts`) must perfectly mirror the expected JSON output of Backend models (`server/src/models`).

### 4.2 Error Handling
- Use structured `try/catch` blocks.
- The backend must always return a consistent JSON schema for errors:
  ```json
  {
    "success": false,
    "message": "Human readable error",
    "errors": [] 
  }
  ```

---

## 5. Git & Workflow Standards

### 5.1 Commit Messages
- Use conventional commits:
  - `feat: [Description]` for new features.
  - `fix: [Description]` for bug fixes.
  - `refactor: [Description]` for structural code changes.
  - `docs: [Description]` for documentation updates like this file.

### 5.2 Pull Request Criteria
- Code must compile without TypeScript warnings.
- Backend schemas and frontend forms must strictly align (e.g., if a new Task status is added, it must be added to the Frontend UI, Backend Route Validator, and Database Schema simultaneously).
