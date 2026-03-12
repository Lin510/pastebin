# Copilot Instructions — Personal PasteBin

## Project Overview
This repository is a private personal PasteBin app.

### Stack
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4, responsive design (mobile-first)
- **Database**: MongoDB Atlas via Mongoose
- **Auth**: admin-only, JWT stored in httpOnly cookie
- **Syntax highlighting**: `highlight.js` or `shiki`

## Core Product Rules
1. No public paste listing exists. Only the authenticated admin can see all pastes.
2. Public pastes are accessible only if the user knows the short ID.
3. Admin credentials come from `.env.local`:
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD_HASH`
   - `JWT_SECRET`
4. Passwords are always stored as bcrypt hashes, never plain text.
5. **Next.js proxy** protects `/admin/*` except `/admin/login`.
6. Admin API routes must verify JWT from cookie on every request.
7. Pastes may have:
   - optional title
   - optional expiration
   - selected language for syntax highlighting
8. Public IDs use short `nanoid` values (8 chars). Never expose Mongo ObjectId.

## MongoDB Rules
- Use the single existing MongoDB Atlas project/cluster.
- Do not create new databases.
- Everything goes into the database configured in `MONGODB_URI`.
- All collections must use the `pastebin_` prefix.

Examples:
- `pastebin_pastes`

## Next.js 16 Rules
- Use `src/proxy.ts`, not `middleware.ts`
- Export name must be `proxy`, not `middleware`
- `params` in pages/route handlers are async (`Promise<{ ... }>` where applicable)
- `cookies()` from `next/headers` is async

### Correct pattern
```ts
export async function proxy(request: NextRequest) { ... }
export const config = { matcher: ['/admin/:path*'] };
```

### Incorrect pattern
```ts
export async function middleware(request: NextRequest) { ... }
```

## Project Structure
```text
src/
  app/
    page.tsx
    [id]/
      page.tsx
    admin/
      page.tsx
      login/
        page.tsx
    api/
      paste/
        route.ts
      paste/[id]/
        route.ts
      admin/
        pastes/route.ts
        paste/[id]/route.ts
        login/route.ts
        logout/route.ts
  lib/
    mongodb.ts
    auth.ts
  models/
    Paste.ts
  proxy.ts
```

## Environment Variables
`.env.local`
```env
MONGODB_URI=mongodb+srv://...
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$...
JWT_SECRET=...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Code Conventions
- Use strict TypeScript
- Server Components by default
- Use `"use client"` only where necessary
- API routes return `{ error: string }` on failure, with proper HTTP status
- Never log or expose:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `ADMIN_PASSWORD_HASH`
- Validate input on the server
- Prevent XSS when rendering paste content
- Keep code simple and local
- Prefer existing project patterns over introducing new abstractions

## Agent Behavior (very important)

### Execution Style
- For obvious tasks, execute directly with minimal narration.
- Do not restate the user's request unless there is real ambiguity.
- Do not write visible plans for trivial changes.
- Prefer action first, explanation after edits.
- If the task is simple, do not turn it into a ceremony.

### Search Discipline
- Do not run repeated grep/search/find commands for symbols that are already visible in the current file or were just modified.
- Before searching, inspect:
  1. the current file
  2. local imports/exports
  3. directly adjacent files only if clearly relevant
- If search is needed, do one narrow search and stop once the relevant location is found.
- Do not repeat the same search in multiple forms.
- Do not do repo-wide exploration for local and obvious fixes.

### Editing Discipline
- Prefer small, local diffs.
- Modify only the files required by the task.
- Do not refactor unrelated code.
- Do not rename, reformat, or reorganize unrelated files.
- Do not add comments unless they are necessary or explicitly requested.
- Do not create extra documentation files unless explicitly asked.

### Framework Discipline
- Prefer current Next.js 16 conventions over deprecated ones.
- If a warning clearly points to a modern convention, apply the modern convention directly.
- Do not suggest outdated patterns when the repository already uses newer ones.

### Validation Discipline
- Run the minimum validation needed for confidence.
- Prefer targeted validation over full builds when the change is local.
- Do not run expensive checks if a smaller check is enough.
- If no validation is run, say so plainly.

### Communication Style
- Keep responses short, concrete, and proportional to the task.
- Do not explain obvious facts.
- Do not narrate your internal process.
- Do not produce "stand-up meeting" style summaries.
- For simple tasks, respond with:
  - what changed
  - what was checked

### Anti-Patterns to Avoid
- Do not do theatrical analysis for trivial fixes.
- Do not turn an explicit warning into broad exploration.
- Do not waste time on redundant searches.
- Do not over-explain local edits.
- Do not make the task feel larger than it is.

## Preferred Working Style
- Low ceremony
- Minimal narration
- Direct execution
- Small diffs
- Targeted validation
- Modern Next.js 16 conventions
