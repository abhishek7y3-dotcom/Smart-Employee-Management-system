# Project Memory & Context (`MEMORY.md`)

This document serves as the contextual memory for the **Employee Task Manager** project. It outlines historical architectural decisions, resolved critical bugs, learned behaviors, and technical quirks unique to this repository. AI assistants and developers should consult this file to avoid regressing on past fixes.

---

## 1. Role-Based Access Control (RBAC) Quirks

### The `user` vs `member` Role Migration
- **Historical Context:** Originally, the basic employee role was defined as `"user"` in the frontend and some parts of the backend, while the dropdowns mistakenly sent `"employee"`.
- **The Fix:** The system was migrated to strictly accept `"admin"` and `"member"` within the `User` Mongoose schema.
- **Learned Behavior:** 
  - **NEVER** use `"user"` or `"employee"` as a role payload when interacting with the database.
  - The backend `authController` contains a sanitization fallback (`sanitizedRole = role === 'employee' || role === 'user' ? 'member' : role`) to prevent legacy client payloads from crashing the database.
  - The frontend `EmployeeCard` explicitly maps its dropdown option to `value="member"`.

---

## 2. Task Model Relationships

### `createdBy` -> `assignedBy`
- **Historical Context:** Originally, tasks tracked their creator using a `createdBy` field.
- **The Fix:** To align with business requirements (semantically distinguishing who delegated a task), the `createdBy` field was formally migrated and renamed to `assignedBy`. 
- **Learned Behavior:** 
  - Do **not** query or populate `createdBy` on the `Task` model. It no longer exists.
  - Always use `assignedBy` when referencing the admin who dispatched the task.
  - Members are restricted from assigning tasks; therefore, a Member's `GET /tasks` query no longer checks the `assignedBy` field (as they cannot assign tasks), and strictly queries `{ assignedTo: req.user._id }`.

---

## 3. Database Validation Quirks

### Task Status: The `"cancelled"` Bug
- **Historical Context:** The frontend included a UI option to mark a task as `"Cancelled"`, but it consistently failed with a "Failed to update task status in database" error.
- **The Fix:** The `TaskStatus` TypeScript type, the Mongoose `enum` in `Task.ts`, and the `express-validator` array in `taskValidator.ts` were strictly limiting values to `['todo', 'in_progress', 'completed', 'overdue']`. We added `'cancelled'` to all three locations.
- **Learned Behavior:** 
  - If you add a new state/enum to the frontend UI, you **must** update it in three backend locations:
    1. The Mongoose Schema (`models/Task.ts`)
    2. The TypeScript interfaces (`models/Task.ts` / `types/index.ts`)
    3. The validation chains (`validators/taskValidator.ts`)

---

## 4. Frontend Form Behaviors

### Auto-Formatting Inputs
- **Last Name Auto-Capitalization**: The registration page (`register/page.tsx`) contains specific formatting logic that automatically capitalizes the first letter of every word (even after spaces and hyphens) in the Last Name field as the user types. 
- **Country Code Search**: The country dial code dropdown has been augmented with an integrated search bar, allowing users to filter by country name (e.g., "India") or code (e.g., "+91"). Ensure `e.stopPropagation()` remains intact on the search input to prevent the dropdown from prematurely closing.

---

## 5. Development Reminders

- **Strict Mode:** TypeScript strict mode is enabled. Do not use `any` types unless absolutely necessary.
- **Validation:** Always rely on `express-validator` before passing payloads to controllers.
- **Styling:** The project utilizes TailwindCSS with dark mode (`dark:` classes) and specific visual paradigms like `backdrop-blur`. Avoid introducing external CSS files; stick to utility classes or extend the `tailwind.config.ts`.
