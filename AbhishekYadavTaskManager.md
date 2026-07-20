# Mini Employee Task Manager

Welcome to the **Mini Employee Task Manager**, a premium, state-of-the-art task tracking and team collaboration platform designed for managers, administrators, and employee teams. The project is split into a Next.js frontend client and a Node.js Express backend API server.

---
# Abhishek Yadav
## 🚀 Key Features

### 🔐 1. Authentication & Security
- **JWT Session Security**: Secure authentication flows verified via JSON Web Tokens attached dynamically to HTTP request headers.
- **OTP Verification**: Multi-factor OTP validation during user registration and password recovery.
- **Hide/Show Password Input**: Toggle button to view or mask credentials on registration and log-in pages.
- **Mock Bypass Mode**: Dismissible Mock Auth banner enabling developers/testers to bypass backend requirements.

### 👥 2. Employee Management
- **Interactive Directory**: Displays all active employees with their profile pictures, email addresses, roles, and designations.
- **Admin Creation of Employees**: Admins can manually register employees by entering credentials, uploading an avatar picture, and selecting predefined designations from a dropdown.
- **Role Control**: Admins can update employee designations inline using dropdowns or completely remove accounts.
- **Employee Designation Filtering**: Removes manager designations from onboarding options, focusing strictly on employee roles.

### 📝 3. Task Management
- **Complete CRUD Operations**: Create, edit, list, and delete tasks.
- **Inline Status Control**: Admins can update task status directly from the table lists using status dropdown selectors.
- **Responsive Layout & Alignment**: Side-by-side positioning of edit and delete actions inside table lists and card widgets.
- **Advanced Description Truncation**: Limits description previews to exactly 25 characters to keep list views uniform, with support for word-wrapping on long unbroken text inputs.
- **Details Modal Viewer**: A green eye-icon details button allows any employee or administrator to open a read-only popup to read the full description and complete task attributes.

### 📊 4. Interactive Dashboard Analytics
- **Task Metrics Summary**: Highlights overall, pending, in-progress, completed, and cancelled task counters.
- **Data Visualizations**: Recharts-powered graphs displaying:
  - **Pie Chart**: Task status distributions.
  - **Bar Chart**: Tasks grouped by priority levels.
  - **Line Chart**: Recent activity log distributions over time.
- **Audit Logs (Recent Activity)**: Live-updated logs showing who created, deleted, or changed tasks, attributing each action to the real authenticated user.

---

## 🛠️ Technology Stack

### Frontend Client
- **Core Framework**: Next.js 16.2.9 (Turbopack) & React 19
- **Typing**: TypeScript 5
- **Styling**: Tailwind CSS v4 & Vanilla CSS custom design systems
- **Charts**: Recharts (Pie, Bar, Line charts)
- **Icons**: Lucide React
- **Notifications**: Sonner Toasts

### Backend Server
- **Core Framework**: Node.js & Express
- **Database ORM**: MongoDB & Mongoose
- **Cloud Storage**: Cloudinary (avatar image uploads)
- **Email Service**: Nodemailer (OTP and password recovery messages)
- **Validations**: Express Validator

---

## 📂 Project Directory Structure

```text
Mini Employee Task Manager/
├── src/                          # Frontend Application Code
│   ├── api/                      # Axios calls (auth, mockAuth, tasks)
│   ├── app/                      # Next.js App routes (login, register, reset-password, tasks, etc.)
│   ├── components/               # UI components
│   │   ├── analytics/            # Recharts layout wrappers (Pie, Bar, Line charts)
│   │   ├── employee/             # Employee card directories
│   │   ├── task/                 # Task list widgets, editors, details modals
│   │   └── ui/                   # Loading, empty, and confirmation templates
│   ├── context/                  # Context APIs (AuthContext, TaskContext, ThemeContext)
│   ├── services/                 # Axios clients configured with JWT interceptors
│   ├── styles/                   # Global style sheets (globals.css)
│   ├── types/                    # TypeScript interfaces for auth, tasks, and employees
│   └── utils/                    # Formatting helpers and metrics counting algorithms
│
└── server/                       # Backend Express Application Code
    ├── src/
    │   ├── config/               # Database configurations
    │   ├── controllers/          # Controllers (auth, tasks)
    │   ├── middleware/           # Auth validation and error-catcher middleware
    │   ├── models/               # MongoDB / Mongoose Schemas (User, Task)
    │   ├── routes/               # Express endpoints router maps
    │   └── utils/                # JWT encodes, Cloudinary uploaders, Nodemailer triggers
```

---

## ⚙️ Getting Started & Local Installation

### 1. Prerequisites
- **Node.js** (v18.x or newer)
- **MongoDB** (Local instance or MongoDB Atlas cluster connection string)
- **Cloudinary Account** (For profile photo upload integration)

### 2. Backend Server Configuration (`/server`)
1. Open a terminal in the `/server` directory:
   ```bash
   cd server
   npm install
   ```
2. Create a `.env` file in the `/server` directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_phrase
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_pass
   ```
3. Run the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Client Configuration (Root)
1. Open a new terminal in the root project directory:
   ```bash
   npm install
   ```
2. Verify or add details to the `.env.local` file:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
   ```
3. Run the Next.js development client:
   ```bash
   npm run dev
   ```
4. Access the web application in your browser at `http://localhost:3000`.

---

## 👥 Authors
- **Abhishek Yadav**
