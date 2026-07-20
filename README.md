# 🚀 Employee Task Manager (MERN + Next.js)

A premium, full-stack enterprise application designed to streamline internal company operations, user management, task delegation, and intra-team communication. Built utilizing a modernized MERN architecture coupled with a Next.js App Router frontend.

---

## 📖 Table of Contents
1. [Overview](#-overview)
2. [Tech Stack](#-tech-stack)
3. [Core Features](#-core-features)
4. [Architecture & Design](#-architecture--design)
5. [Getting Started](#-getting-started)
6. [Available Scripts](#-available-scripts)
7. [Environment Variables](#-environment-variables)
8. [Project Documentation](#-project-documentation)

---

## 🌟 Overview

The Employee Task Manager serves as a centralized hub for organizations. It enforces strict **Role-Based Access Control (RBAC)** to ensure that Administrators can dictate workflow while Members focus on execution. 
The application guarantees high security via AES-encrypted One-Time Passwords (OTPs) during registration, protected JWT-based route access, and Mongoose-level validation schemas.

---

## 🛠 Tech Stack

### Frontend (Client-Side)
- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **UI Library**: [React 18+](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Extensive use of Glassmorphism and CSS variables)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend (Server-Side)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Managed via Mongoose ODM)
- **Validation**: `express-validator`

### Security & Integrations
- **Authentication**: JWT (JSON Web Tokens)
- **Encryption**: Built-in Node `crypto` (AES-256-GCM) & `bcrypt`
- **Email Delivery**: Nodemailer
- **Media Storage**: Cloudinary API

---

## ✨ Core Features

- 🔐 **Bulletproof Authentication**: Secure email validation loop requiring AES-encrypted 6-digit OTPs before account creation.
- 🛡️ **Role-Based Access Control (RBAC)**: Strict separation of concerns. Admins have omnipotent read/write access (assigning tasks, broadcasting announcements), whereas Members are isolated to only view and update tasks specifically assigned to them.
- 📊 **Dynamic Dashboard**: Beautiful UI featuring Glassmorphism, animated mesh gradients, and automatic Dark Mode transitions.
- 💬 **Integrated Communication**: Real-time ready schema supporting internal 1-on-1 team messaging and global Admin announcements.
- 📝 **Intelligent UI Forms**: Frontend forms feature smart typing (auto-capitalizing trailing names) and integrated search filtering inside country-code dropdowns.

---

## 🏗 Architecture & Design

The project is decoupled into two primary working directories:
- `/src` (Frontend)
- `/server/src` (Backend)

The **Backend** strictly adheres to a **Controller-Route-Validator** pattern:
1. `routes/` define the HTTP endpoints.
2. `middleware/` verifies JWT tokens.
3. `validators/` sanitize payloads to prevent NoSQL injection.
4. `controllers/` execute database operations.

The **Frontend** focuses on seamless UX, leveraging Next.js server-components alongside client-side React hooks. Global states (Auth, Tasks) are preserved using React Context.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone the repository
```bash
git clone https://github.com/your-username/employee-task-manager.git
cd employee-task-manager
```

### 2. Setup the Backend
```bash
cd server
npm install
```
Configure your `/server/.env` (See Environment Variables section below).
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal window:
```bash
# from the root of the project
npm install
```
Configure your `.env.local` file.
```bash
npm run dev
```

The application will be running on `http://localhost:3000`.

---

## 📜 Available Scripts

### Frontend Scripts (Root)
- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Compiles the application for production deployment.
- `npm start`: Starts the Next.js production server.

### Backend Scripts (`/server`)
- `npm run dev`: Starts the Express server using `nodemon` for hot-reloading.
- `npm run build`: Compiles the TypeScript backend into the `/dist` directory.
- `npm start`: Runs the compiled Node output.

---

## 🔐 Environment Variables

You must provide the following variables for the application to function securely:

**Backend (`/server/.env`)**
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/task-manager
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=32_character_aes_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

**Frontend (`/.env.local`)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📚 Project Documentation
For deep-dives into the architecture, rules, and historical fixes, please refer to the internal markdown files generated at the root of the project:
- `design.md`: In-depth Architectural & UI/UX Design guidelines.
- `RULES.md`: Coding standards, strict conventions, and Git protocols.
- `phases.md`: Breakdown of historical development phases and future scope.
- `MEMORY.md`: Contextual memory regarding bug fixes and database relationships.
- `structure.md`: Visual directory tree mappings.
- `PRD.md`: The official Product Requirements Document.
