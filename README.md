# Mini Employee Task Manager

A beginner-friendly Employee Task Manager training project built using Next.js, TypeScript, and Tailwind CSS. This project is structured specifically to teach React patterns, state management, and basic CRUD features.

## Project Purpose
The purpose of this project is to serve as a hands-on training template for developers learning React and Next.js with TypeScript. It provides a structured sandbox to understand:
- Component-driven development (atoms vs. features).
- React state management and Context API.
- TypeScript interfaces, types, and compile-time safety.
- Next.js folder routing (App Router).
- Local storage state persistence (offline-first development).

---

## Tech Stack
- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Context API
- **Persistence**: browser `localStorage` (Offline Mock Data)

---

## How to Install

Ensure you have [Node.js](https://nodejs.org/) installed (v18.x or above recommended).

1. Clone or navigate to the project root directory.
2. Install the necessary dependencies:
   ```bash
   npm install
   ```

---

## How to Run

To run the development server locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To check for compilation or linting errors:
- **Lint check**: `npm run lint`
- **TypeScript compilation check**: `npx tsc --noEmit`

---

## Folder Structure

The project code resides inside the `src/` directory to keep configuration files clean and separated from the application logic. Below is an explanation of the directory structure:

```text
src/
├── app/               # Next.js App Router (pages, layouts, and routing logic)
│   ├── favicon.ico    # Website icon
│   ├── globals.css    # Global CSS styles including Tailwind configurations
│   ├── layout.tsx     # Application shell and HTML wrapper
│   └── page.tsx       # Root landing page (dashboard view)
├── components/        # Reusable React UI components
│   ├── ui/            # Generic, low-level UI elements (e.g., Button, Input, Modal, Badge)
│   ├── task/          # Feature components related to tasks (e.g., TaskList, TaskCard, TaskForm)
│   └── employee/      # Feature components related to employees (e.g., EmployeeCard, EmployeeSelector)
├── context/           # Global React Context providers (state stores, e.g., TaskContext)
├── data/              # Static constants and local mock data files (initial tasks and employees list)
├── hooks/             # Custom React hooks (e.g., useLocalStorage)
├── types/             # Centralized TypeScript interface and type declarations
│   └── auth.ts
└── utils/             # Reusable helper and utility functions (e.g., date formatters)
```

### Why each folder is needed:
- **`src/app/`**: Essential for Next.js App Router architecture. It handles routing automatically based on folder layout.
- **`src/components/`**: Groups UI blocks. Splitting it into `ui` (atoms) and feature-specific directories like `task` and `employee` prevents files from cluttering and makes the layout modular.
- **`src/context/`**: Allows passing down state (tasks and employee lists) without prop-drilling, mimicking a global state store or database client.
- **`src/data/`**: Provides seeding mock records for initial loading so the app looks populated right away.
- **`src/hooks/`**: Encourages code reuse. Encapsulating custom behaviors (like local storage syncing) into reusable hooks keeps components clean.
- **`src/types/`**: Enforces strict contract contracts on objects, minimizing runtime bugs and enabling auto-complete during development.
- **`src/utils/`**: Keeps non-component helper logic (such as converting date stamps) separated and testable.

---

## Basic Development Rules

To maintain high code quality and consistency throughout the training, adhere to the following development rules:

1. **Strict Type Safety**: Avoid using `any` under any circumstances. Ensure every parameter, variable, and return type is explicitly typed.
2. **Component Separation**:
   - Save low-level styling components (e.g., inputs, selectors) in `src/components/ui/` with zero business logic.
   - Keep business/data logic inside `src/components/task/` and `src/components/employee/`.
3. **Keep Context Simple**: Use `TaskContext` only for holding state and persistence. Avoid putting complex UI-related state (like sidebar open/close toggle state) in it.
4. **Tailwind Best Practices**: Use utility classes directly in elements. For complicated custom rules or complex CSS integrations, define them in `globals.css` using standard Tailwind syntax.
5. **No Placeholders**: Do not check in unfinished placeholders or console logs in production files. Keep error logs descriptive.
