# Employee Task Manager - Architecture & Design Document

This document outlines the architectural design, directory structure, and technical implementation details of the Employee Task Manager application. 

## 1. High-Level Architecture

The application follows a full-stack, decoupled architecture utilizing the **MERN (plus Next.js)** stack:
- **Frontend**: Next.js (App Router), React, TailwindCSS, TypeScript.
- **Backend**: Node.js, Express, MongoDB (Mongoose), TypeScript.
- **Authentication**: JWT (JSON Web Tokens) with AES-256-GCM encrypted OTP verification.
- **Storage**: Cloudinary (for avatar uploads).

---

## 2. Directory Structure

### Frontend (Next.js Application)
Located at the root directory (`/src`):
- `/src/app`: Implements the Next.js App Router paradigm. Contains individual page components for routing (`/login`, `/register`, `/dashboard`, `/tasks`, `/employees`, `/communication`).
- `/src/components`: Reusable UI components.
  - `/task`: Task-related components like `TaskCard`, `StatusBadge`.
  - `/employee`: Components like `EmployeeCard`.
- `/src/context`: React Context API providers managing global application state (`AuthContext`, `TaskContext`).
- `/src/api`: Axios interceptors and API interaction layers connecting to the backend.
- `/src/types`: Shared TypeScript interfaces mirroring backend models.
- `/src/utils`: Frontend utility functions (formatting, validation).

### Backend (Node.js/Express Application)
Located inside the `/server/src` directory:
- `/config`: Database configuration and environment variables logic (`db.ts`).
- `/models`: Mongoose ODM schemas defining the database structure (`User.ts`, `Task.ts`, `Conversation.ts`, `Message.ts`, `Announcement.ts`).
- `/controllers`: The core business logic handling API requests (`authController.ts`, `taskController.ts`, `communicationController.ts`).
- `/routes`: Express router definitions, mapping HTTP endpoints to controllers.
- `/middleware`: Authentication middleware (`authMiddleware.ts`) and validation error catching (`validateRequest.ts`).
- `/validators`: `express-validator` chains enforcing strict payload schemas (`authValidator.ts`, `taskValidator.ts`).
- `/utils`: Backend utility modules (`crypto.ts` for AES encryption, `jwt.ts` for token signing, `mailer.ts` for nodemailer integration, `cloudinary.ts` for image uploads).

---

## 3. Database Schema Design (MongoDB)

### **User Collection**
- Core identity schema (`name`, `email`, `password`, `role`).
- Implements **Role-Based Access Control (RBAC)** via the `role` enum (`admin` vs `member`).
- Secures authentication using a combination of hashed passwords and encrypted 6-digit OTP codes required for email verification.

### **Task Collection**
- Tracks tasks assigned within the workspace.
- Fields: `title`, `description`, `status` (todo, in_progress, completed, overdue, cancelled), `priority` (low, medium, high), and `dueDate`.
- Relationships:
  - `assignedTo`: References a target `User`.
  - `assignedBy`: References the `admin User` who delegated the task.

### **Communication Collections**
- Used for internal team messaging.
- **Conversation**: Tracks participants between users.
- **Message**: Stores individual chat payloads linked to a Conversation.
- **Announcement**: Workspace-wide broadcasts authored by the Admin.

---

## 4. Key Implementation Patterns

### Role-Based Access Control (RBAC)
The system enforces strict permission boundaries:
- **Admins** have elevated privileges. They can manage all users, update roles, create tasks for members, edit all task properties, and author announcements.
- **Members** have restricted privileges. They can only view tasks assigned to them and update the `status` of their own tasks.
- The backend actively blocks unauthorized access (e.g., returning `403 Forbidden` if a member attempts to dispatch a task).

### Data Flow & Security
- **Registration**: Employs AES-256-GCM encryption for storing OTPs prior to email verification. Email addresses are strictly validated.
- **Authentication**: JWT is exchanged upon login and appended to subsequent requests via `Authorization` headers.
- **Design Aesthetic**: The frontend extensively uses Glassmorphism UI patterns (`backdrop-blur`), dynamic Tailwind gradients, micro-animations, and modern SVG iconography (Lucide React) to deliver a premium UX.

### Validation
Dual-layer validation is enforced:
- **Frontend**: Real-time validation (regex, length limits, character restrictions) preventing invalid submissions.
- **Backend**: `express-validator` middleware enforcing a strict contract on incoming request bodies prior to controller execution.

### Chatbot UI & Chat Management
- **ChatGPT-Style Sidebar**: Incorporates inline rename functionalities, pinning important chats to the top, archiving chats for a decluttered view, and nesting chats into specific project folders.
- **Filtering & Organization**: Real-time frontend filtering (`All`, `Pinned`, `Unpinned`) and dedicated modal views (`ArchiveView`, `LibraryView`, `ProjectView`) implemented seamlessly without full page reloads.

### Profile Settings Management
- **Inline Editing**: Allows users to dynamically update their `FullName` and `Designation` directly from the Settings page, complementing the existing Security (password change) controls.

---

## 5. Design System & UI/UX Guidelines

The Employee Task Manager utilizes a custom, premium design system built on top of TailwindCSS, aiming for a modern "Glassmorphic" and dynamic aesthetic.

### 5.1 Color Palette & Variables
The core application relies heavily on dynamic CSS variables to seamlessly transition between Light and Dark modes.

**Base Theme Variables (`globals.css`)**
- **Backgrounds**: Light (`#fcfcfd`) / Dark (`#060608`)
- **Foregrounds (Text)**: Light (`#09090b`) / Dark (`#fafafa`)
- **Glassmorphism Backgrounds**: Light (`rgba(255, 255, 255, 0.7)`) / Dark (`rgba(9, 9, 11, 0.6)`)
- **Glassmorphism Borders**: Light (`rgba(228, 228, 231, 0.6)`) / Dark (`rgba(39, 39, 42, 0.4)`)
- **Shadow Overlays**: Light (`rgba(9, 9, 11, 0.05)`) / Dark (`rgba(0, 0, 0, 0.3)`)

**Authentication Mesh Gradient**
The login and registration pages feature an animated `.mesh-gradient` background.
- It blends radial gradients of Blue (`#3b82f6`), Indigo (`#6366f1`), Purple (`#8b5cf6`), and Pink (`#ec4899`) over a deep black base (`#0c0a09`).
- Features a `waveGlow` CSS keyframe animation spanning 20 seconds for continuous, subtle movement.

### 5.2 Typography
The application pairs two modern Google Fonts to establish visual hierarchy:
- **Primary Body Text (Inter)**: Used for readability across forms, task descriptions, and chat logs. (Weights: 300 to 800)
- **Display & Headings (Outfit)**: A geometric sans-serif used for dashboard titles and heavy emphasis headers. (Weights: 400 to 900)
- **Monospace Fallbacks**: `Lucida Sans` / `Lucida Grande` as safe fallbacks.

### 5.3 Component-Level Theming

**Task Priorities (Semantic Colors)**
- **High**: Red palette. Light (`bg-red-50 text-red-700`) / Dark (`bg-red-950/30 text-red-400`).
- **Medium**: Amber palette. Light (`bg-amber-50 text-amber-700`) / Dark (`bg-amber-950/30 text-amber-400`).
- **Low**: Green palette. Light (`bg-green-50 text-green-700`) / Dark (`bg-green-950/30 text-green-400`).

**Enterprise Cards (`.enterprise-card`)**
All primary dashboard surfaces utilize the `.enterprise-card` global CSS utility class.
- Uses `backdrop-filter: blur(16px)` to achieve the glass effect.
- Interactions are enhanced with `.enterprise-card-hover`, which translates the Y-axis (`-2px`), deepens the box shadow, and illuminates the border with a subtle blue tint (`rgba(59, 130, 246, 0.25)`).

**Scrollbars & Ambience**
- Global Webkit scrollbars are customized to be minimal (5-6px width) with transparent tracks and rounded, semi-transparent gray thumbs that darken on hover.
- Backgrounds utilize `.ambient-glow` spheres (`blur(80px)`) to inject subtle color bleeds into the UI without distracting from content.
