# Employee Task Management System

A comprehensive, full-stack Employee Management and Task Tracking system built with modern web technologies. This application allows organizations to manage their workforce, assign and track tasks, manage leaves, track attendance, and facilitate team communication.

## 🚀 Features

- **Role-Based Access Control (RBAC):** Strict permissions for Super Admins (CEO), Admins, and standard Employees.
- **Employee Management:** Add, update, block, archive, and manage employee records and designations.
- **Task Management:** Create, assign, track, and archive tasks with priority and status updates.
- **Attendance Tracking:** Monitor daily attendance, working hours, and remote work statuses.
- **Leave Management:** Request, approve, and track employee leaves with calendar integrations.
- **Real-time Communication:** In-app chat, announcements, and direct messaging between team members.
- **Dark/Light Mode:** Full theming support with modern UI (Tailwind CSS).
- **Secure Authentication:** OTP-based login, password resets, and JWT-based session management.

## 🛠️ Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS, Lucide Icons, Context API
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (JSON Web Tokens), Nodemailer for OTPs
- **File Storage:** Cloudinary (for profile pictures and documents)

## 📦 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB instance (local or Atlas)
- Cloudinary account (for media uploads)
- SMTP Server/Credentials (for emails)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://gitlab.mobiloitte.io/AbhishekYadav/employee-task-management-system.git
   cd employee-task-management-system
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   # From the project root
   npm install
   ```

4. **Environment Variables:**
   Create a `.env` file in the `server` directory and add your configurations (MongoDB URI, JWT Secret, Cloudinary keys, SMTP config).

5. **Run the Application:**
   ```bash
   # Start the backend server
   cd server
   npm run dev

   # Start the frontend app (in a new terminal)
   cd ..
   npm run dev
   ```

## 🔒 Security & Access

- **Super Admin (CEO):** Full system access. Can manage admins, employees, and view all system data.
- **Admin:** Can manage employees, assign tasks, and approve leaves. Cannot manage Super Admins or other Admins.
- **Employee:** Can view own tasks, submit leave requests, mark attendance, and communicate with the team.

## 📝 License
This project is proprietary and confidential.
