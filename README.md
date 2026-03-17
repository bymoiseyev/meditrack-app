# MediTrack

## 1. Purpose

MediTrack is an internal tool for managing medication orders and stock levels across care units. Today many care units rely on manual lists and email, which creates unnecessary risks and delays. MediTrack digitizes that flow, from order to delivery, getting the right information to the right person at the right time.

---

<img width="1713" height="898" alt="Skärmbild 2026-03-16 172504" src="https://github.com/user-attachments/assets/6b7b868e-a475-4f42-8452-ab16a95c5964" />

---

## 2. Technical Choices & Architecture

The goal was to keep the stack simple and consistent for a project of this scope. I considered Ruby on Rails for the backend but chose to stick with TypeScript across the full stack, React on the frontend and Express on Node.js on the backend. This kept the context switching low and let me move fast without sacrificing clarity.

PostgreSQL was a natural fit given the relational nature of the data. medications, orders, order lines and care units all have clear relationships that it handles well. Prisma made working with it in TypeScript smooth and type-safe. Vite was chosen for its speed and easy compatibility with Tailwind CSS, and JWT handled authentication without adding unnecessary complexity.

---

## 3. How to Run
**Requirements:** Docker and Docker Desktop installed.
1. Clone the repository
2. Create a `.env` file in the root of the project based on `.env.example` and fill in your values:
   - `JWT_SECRET` — any long random string, used to sign authentication tokens
   - `OPENAI_API_KEY` — only required to use the AI order parsing feature, the rest of the app works without it
3. Run the following command from the root:
```bash
docker compose up --build
```
4. Seed the database on first run:
```bash
docker exec meditrack-backend npx prisma db seed
```

The app will be available at [http://localhost:5173](http://localhost:5173/)

---

## 4. Features

### Core (mandatory)

- List medications with name, ATC code, form, strength and stock balance
- Add, edit and delete medications
- Search and filter by name, ATC code or form
- Create orders with one or more medications and quantities
- Order status flow: Utkast → Skickad → Bekräftad → Levererad
- Stock balance updates automatically on delivery
- Low stock warning when a medication falls below its defined threshold

### Extensions (optional)

- AI feature, user can describe an order in free-text Swedish and the app parses it into a structured order using OpenAI
- Authentication, JWT-based login with role-based access control (Admin, Apotekare, Sjuksköterska)
- Audit log, every meaningful action is tracked with user, role, timestamp and details

---

## 5. Architecture Choices & Design Decisions

### TypeScript + React + Express on Node.js
Same language across the full stack, reduced context switching and kept the codebase consistent throughout.

### PostgreSQL + Prisma
The data has clear relational structure, medications, orders, order lines and care units all relate to each other. PostgreSQL was the natural fit. Prisma added type-safe database access and made migrations straightforward.

### REST API
Straightforward to reason about, easy to test, and sufficient for the scope of this application. Given the data requirements I see no need for GraphQL.

### JWT Authentication
Stateless and simple to implement across a REST API. Roles are embedded in the token so the middleware can check permissions on every request without a database lookup. Note: tokens are currently stored in localStorage, in production this should be moved to an HttpOnly cookie to prevent XSS exposure.

### Role-based access control
Three roles, Admin, Apotekare and Sjuksköterska, modeled after real healthcare responsibilities. Each role can only access what their real-world counterpart would be trusted to do. Enforced on both the backend (middleware) and frontend (conditional rendering).

### Snapshot pattern on OrderLine
Order lines store a copy of the medication name, form and strength at the time of the order. The foreign key to the medication still exists for stock incrementing, but the historical record is frozen and unaffected by future edits to the medication registry.

### Audit log
Every meaningful action, creating an order, advancing a status, adding or deleting a medication, is logged with the user, their role at the time, and relevant details. In a healthcare context, traceability is critical. Logging happens at the end of each successful handler so only completed actions are recorded.

### AI order parsing
User can describe an order in free-text Swedish and the app sends that input to OpenAI alongside the current medication and care unit list, which returns a structured order that pre-fills the form. The limitation of this approach is that pasting the full medication list into the prompt does not scale, a larger dataset would require a smarter retrieval step before calling the model.

---

## 6. Known Limitations

- JWT token is stored in localStorage, which is vulnerable to XSS attacks, something I noticed but chose to document and reflect on rather than patch over. In production this should be moved to an HttpOnly cookie.
- Login has a 2 second delay on failed attempts as a basic brute force mitigation, but there is no proper rate limiter that blocks repeated attempts entirely.
- The JWT token expiry is set to 7 days for the sake of the demo. In production this should be much shorter, ideally 15-30 minutes, paired with a refresh token that silently issues a new access token without forcing the user to log in again. Without a refresh token, a short expiry just means the user gets kicked out mid-session with no recovery.
- The AI feature sends the full medication and care unit list in every prompt, this does not scale with a large dataset. A vector database could be one solution for larger catalogs.
- No user registration UI, users are currently created via database seed only.
- At the start I calculated the app would be two pages at most, so I used state-based navigation to keep things simple and move fast. After completing the mandatory parts ahead of time I added authentication, an audit log and at that point state-based navigation was no longer the right fit. It works, but it was a scope decision, not a technical preference. React Router would be the natural choice in any real application.
- Git commit messages are inconsistent in style throughout the project, some follow conventional commits, others do not. Having mostly worked solo and very small teams, consistent commit conventions haven't been a hard requirement, but it is something I am actively improving on.

---

## 7. With more time, I would have…

- Move JWT token storage from localStorage to an HttpOnly cookie over HTTPS.
- Add a proper rate limiter on the login endpoint to block repeated failed attempts.
- Build a user management UI for admins to create and manage users without touching the database directly.
- Replace the AI prompt approach with a smarter retrieval step, find the closest matching medications first before sending to the model, so it scales with a larger catalog.
- Add real-time low stock notifications, currently the threshold warning is visible in the UI but there is no active notification when stock drops.
- Add React Router for proper client-side routing instead of the current manual approach.
- Add pagination to the medications and orders lists, fine for a demo dataset but loading everything at once does
  not scale to production.
- Write more comprehensive tests, currently there is coverage on the order panel and auth but several handlers and UI flows are untested.
- Short-lived access tokens with a refresh token mechanism for more secure session handling.
