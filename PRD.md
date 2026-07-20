# Product Requirements Document (PRD): Employee Task Manager

## 1. Product Overview
The **Employee Task Manager** is a centralized, full-stack application designed to streamline internal company operations, specifically focusing on user management, task delegation, and internal team communication. It provides a secure, role-based ecosystem where administrators can orchestrate work and members can track their assigned duties.

## 2. Target Audience
- **Administrators / Managers (CEO, HR, Project Managers):** Require tools to oversee the team, manage access, distribute workload, and broadcast announcements.
- **Members / Employees:** Require a streamlined dashboard to receive tasks, track their own workload, update task statuses, and communicate with colleagues.

## 3. Core Features

### 3.1 Authentication & Security
- **Registration**: Users must register with their name, email, and password. An AES-256-GCM encrypted OTP is generated and sent via email for verification.
- **Login**: Secure login using JWT (JSON Web Tokens).
- **Session Management**: Persistent sessions managed via React Context and Axios interceptors on the frontend.
- **Role-Based Access Control (RBAC)**: System strictly enforces authorization based on two roles: `admin` and `member`.

### 3.2 Workspace & Dashboard
- **Admin View**: Unified overview of all organizational tasks, active team members, and recent activities.
- **Member View**: Filtered dashboard showing only their individually assigned tasks.

### 3.3 Task Management
- **Task Creation**: Strictly restricted to Administrators. Admins can assign tasks to any registered employee.
- **Task Tracking**: Tasks possess states (`todo`, `in_progress`, `completed`, `overdue`, `cancelled`) and priorities (`low`, `medium`, `high`).
- **Status Updates**: Both members (for their own tasks) and admins can update the status of a task as work progresses.
- **Task Deletion**: Restricted to Administrators.

### 3.4 Team & Employee Management
- **Directory**: View all registered team members.
- **Role Editing**: Admins can promote/demote members (e.g., from `member` to `admin`).
- **Profile Customization**: Users can upload avatars (integrated with Cloudinary).

### 3.5 Internal Communication
- **Announcements**: Admins can broadcast messages to the entire workspace.
- **Direct Messaging**: Employees can engage in 1-on-1 text-based communication.

## 4. Technical Requirements

### 4.1 Frontend Stack
- **Framework**: Next.js (App Router)
- **Library**: React 18+
- **Styling**: TailwindCSS (incorporating Glassmorphism and responsive design)
- **Language**: TypeScript
- **Icons**: Lucide React

### 4.2 Backend Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (managed via Mongoose ODM)
- **Language**: TypeScript

### 4.3 Third-Party Integrations
- **Nodemailer**: For sending registration OTPs.
- **Cloudinary**: For hosting user profile avatars.
- **JWT & bcrypt/crypto**: For secure identity verification and payload encryption.

## 5. Security & Constraints
- **API Protection**: All private routes must implement the `authMiddleware` to verify JWTs.
- **Validation**: Strict payload validation using `express-validator` to prevent NoSQL injection and ensure data integrity.
- **Data Privacy**: A member should never be able to intercept or fetch tasks assigned to another member. Backend queries dynamically filter `assignedTo` properties based on the requester's JWT role.

## 6. Future Scope
- **Push Notifications**: Real-time notifications (via WebSockets or Server-Sent Events) when a new task is assigned.
- **File Attachments**: Ability to attach PDF or image references directly to a task.
- **Analytics Dashboard**: Weekly reporting on task completion rates and overdue metrics.
