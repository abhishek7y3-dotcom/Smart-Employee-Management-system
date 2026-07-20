# Project Structure: Employee Task Manager

This document maps out the specific files and directories used in the Employee Task Manager project to help developers navigate both the Frontend (Next.js) and Backend (Node.js/Express) codebases.

---

## 1. Frontend Structure (Next.js)

The frontend is housed in the root directory, primarily operating out of the `/src` folder, utilizing the Next.js **App Router** paradigm.

```text
/ (Project Root)
├── /public/                   # Static assets (images, icons)
├── /src/                      # Frontend Source Code
│   ├── /api/                  # Axios configuration and API interceptors
│   │   └── axios.ts           # Centralized API client for backend communication
│   ├── /app/                  # Next.js App Router Pages
│   │   ├── /communication/    # Chat and Announcements page
│   │   ├── /dashboard/        # Main Admin/Member Dashboard overview
│   │   ├── /employees/        # Team Members directory and management
│   │   ├── /login/            # Authentication login page
│   │   ├── /register/         # Employee registration & OTP verification
│   │   ├── /tasks/            # Task management list and creation
│   │   ├── globals.css        # Global TailwindCSS styles
│   │   ├── layout.tsx         # Root application layout (wrappers, fonts)
│   │   └── page.tsx           # Application entry (redirects to login/dashboard)
│   ├── /components/           # Reusable UI Components
│   │   ├── /auth/             # Login/Register form components
│   │   ├── /common/           # Generic UI (Buttons, Modals, Inputs)
│   │   ├── /communication/    # Chat interface components
│   │   ├── /dashboard/        # Dashboard widgets (Stats, charts)
│   │   ├── /employee/         # EmployeeCard, EmployeeList components
│   │   ├── /layout/           # Sidebar, Navbar, and Page wrappers
│   │   └── /task/             # TaskCard, StatusBadge, Task filters
│   ├── /context/              # Global React State (Context API)
│   │   ├── AuthContext.tsx    # Manages user session, JWT token, and roles
│   │   └── TaskContext.tsx    # Manages loaded tasks, employees, and operations
│   ├── /types/                # TypeScript Type Definitions
│   │   └── index.ts           # Interfaces for User, Task, AuthResponses
│   └── /utils/                # Frontend Helpers
│       ├── format.ts          # Date and string formatting utilities
│       └── emailValidator.ts  # Regex and email domain validations
├── next.config.ts             # Next.js configuration settings
├── tailwind.config.ts         # Tailwind theme, colors, and plugin config
└── package.json               # Frontend dependencies and scripts
```

---

## 2. Backend Structure (Node.js / Express)

The backend operates entirely inside the `/server` directory, structured using a modular MVC (Model-View-Controller) architecture.

```text
/server/                       # Backend Source Code
├── /src/                      
│   ├── /config/               # Environment & Infrastructure configuration
│   │   └── db.ts              # MongoDB Mongoose connection logic
│   ├── /constants/            # Static variables and enums
│   │   └── validationMessages.ts # Centralized error messages
│   ├── /controllers/          # Core Business Logic handling Requests
│   │   ├── authController.ts  # Login, Registration, OTP handling, Roles
│   │   ├── communicationController.ts # Chat messages, Announcements
│   │   └── taskController.ts  # Task CRUD, Assignment, RBAC checks
│   ├── /middleware/           # Express Request Interceptors
│   │   ├── authMiddleware.ts  # JWT verification and user population
│   │   └── validateRequest.ts # Catches and formats validation errors
│   ├── /models/               # Database Schemas (Mongoose)
│   │   ├── Announcement.ts    # Broadcast messages schema
│   │   ├── Conversation.ts    # 1-on-1 and Group Chat schemas
│   │   ├── Task.ts            # Task schema (assignedTo, assignedBy, status)
│   │   └── User.ts            # Employee identity and roles (admin/member)
│   ├── /routes/               # API Endpoint Definitions
│   │   ├── authRoutes.ts      # Maps POST /login, POST /register, etc.
│   │   ├── communicationRoutes.ts # Maps chat and announcement endpoints
│   │   └── taskRoutes.ts      # Maps GET/POST /tasks endpoints
│   ├── /utils/                # Backend Helpers
│   │   ├── cloudinary.ts      # Cloudinary API for avatar uploads
│   │   ├── crypto.ts          # AES-256-GCM encryption for OTPs
│   │   ├── emailValidator.ts  # Backend email structural checks
│   │   ├── jwt.ts             # JWT token signing logic
│   │   └── mailer.ts          # Nodemailer setup for sending OTP emails
│   ├── /validators/           # Express-Validator Validation Chains
│   │   ├── authValidator.ts   # Enforces payload strictness for auth
│   │   └── taskValidator.ts   # Ensures task parameters match the enum sets
│   ├── app.ts                 # Express application setup (CORS, JSON parser)
│   └── server.ts              # Server execution (app.listen)
├── .env                       # Backend secrets (DB URI, JWT secret, AES Key)
└── package.json               # Backend dependencies (express, mongoose, etc.)
```
