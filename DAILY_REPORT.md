🗓️ **What I Did Today**

✅ **Foundation & Architecture Setup**
Built the entire Employee Task Manager from scratch (Level 0).
Initialized a full-stack Next.js (App Router) frontend and a Node.js/Express backend.
Configured MongoDB with Mongoose to handle complex relational schemas (`User`, `Task`, `Conversation`).

✅ **Authentication & Security Engine**
Engineered a secure registration pipeline utilizing Nodemailer for email verification.
Implemented AES-256-GCM encryption to securely store 6-digit OTPs in the database prior to user verification.
Deployed stateless JWT (JSON Web Tokens) for secure route protection and Axios interceptors for automated token attachment.

✅ **Role-Based Access Control (RBAC)**
Designed a strict two-tier permission system (`admin` and `member`).
Locked task creation endpoints behind administrative authorization.
Built dynamic backend queries ensuring Members can only fetch tasks explicitly assigned to their `_id`.

✅ **Task Delegation & State Management**
Developed the core Task model mapping relationships between delegators (`assignedBy`) and executors (`assignedTo`).
Added strictly validated task states (`todo`, `in_progress`, `completed`, `overdue`, `cancelled`) and priority levels.

✅ **Design System & Theming**
Built a premium, dynamic Glassmorphism UI from scratch using Tailwind CSS.
Configured seamless Light/Dark mode transitions using custom CSS variables for backgrounds, glass borders, and shadow overlays.
Integrated a 20-second animated mesh gradient for the authentication screens.

✅ **Frontend Form Intelligence**
Implemented aggressive auto-capitalization logic on the Last Name input field to trigger dynamically as the user types.
Engineered a custom country dial-code dropdown featuring an integrated search bar to filter global regions.

✅ **Extensive Project Documentation**
Generated comprehensive, open-source ready documentation including `README.md`, `design.md`, `RULES.md`, `MEMORY.md`, `phases.md`, and `structure.md`.
Successfully bypassed local Windows Git credential blocks to force-push the entire finalized codebase to GitLab and GitHub.

---

🤖 **Antigravity Used For**
- Bootstrapping the full-stack architecture and designing complex Mongoose relational databases from scratch.
- Identifying and resolving deep database validation bugs where frontend states mismatched backend Enums.
- Automating the creation of a massive, comprehensive markdown documentation suite mapping the entire project's architecture, memory, and rules.
- Diagnosing Git Credential Manager GUI hangs in the background and executing complex remote branching, rebasing, and force-push commands.

---

⚠️ **Issues Faced & How I Resolved Them**

**Issue 1:** The frontend allowed Admins to demote users by sending the role `"employee"`, but the database strictly expected `"member"`, causing update failures.
**Resolution:** Updated the frontend dropdowns to map the visual "Employee" text to a `"member"` value, and injected a sanitization fallback (`sanitizedRole = role === 'employee' ? 'member' : role`) in the backend controller to intercept legacy payloads.

**Issue 2:** Marking a task as `"Cancelled"` on the dashboard triggered a Mongoose Validation Error and failed to save.
**Resolution:** Discovered the `"cancelled"` state was missing from the backend schemas. Simultaneously updated the Mongoose Enum in `Task.ts`, the TypeScript interface type, and the `express-validator` chain in `taskValidator.ts` to accept the new state.

**Issue 3:** The country code search bar immediately closed the dropdown menu whenever a user tried to type a country name.
**Resolution:** Implemented `e.stopPropagation()` on the search input's `onClick` and `onKeyDown` events to stop event bubbling to the parent dropdown wrapper.

**Issue 4:** Automated git pushes hung indefinitely because the Windows Git Credential Manager opened a graphical login window that background processes cannot click.
**Resolution:** Guided the generation of a GitHub Personal Access Token (PAT) and embedded the token directly into the git remote URL to bypass the GUI requirement and successfully push the code.

**Issue 5:** GitLab automatically generated a default `README.md` on the `main` branch, preventing a standard code push due to unrelated histories.
**Resolution:** Executed a manual fetch, aborted a hung rebase, and merged the remote `main` branch using `-X ours --allow-unrelated-histories` to forcefully overwrite the remote README with our custom documentation before pushing.

---

💡 **Key Learnings**
- **Full-Stack Synchronization:** A new feature (like adding a `"cancelled"` task state) doesn't just exist on the frontend. It must be perfectly mirrored across UI elements, TypeScript types, middleware validators, and database schemas to function.
- **Security in Transit:** Storing plain text OTPs in a database is a massive security risk. Pre-encrypting them with `AES-256-GCM` ensures that even if the database is compromised, the verification codes remain useless to attackers.
- **Semantic Data Relationships:** When building assignment engines, tracking `createdBy` is insufficient. Moving to an `assignedBy` and `assignedTo` structure semantically defines the flow of authority in an RBAC system.
- **Event Bubbling is Dangerous:** Complex UI components (like a search bar inside a dropdown button) require strict event management (`stopPropagation`) to prevent nested elements from triggering the closures of their parent containers.
