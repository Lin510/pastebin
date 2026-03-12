# Copilot Instructions — Personal PasteBin

## Stack
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4, responsive design (mobile-first)
- **Database**: MongoDB Atlas (free tier) via Mongoose
- **Auth**: Admin-only, JWT stored in httpOnly cookie
- **Syntax highlight**: `highlight.js` sau `shiki`

## MongoDB
- Folosim un singur proiect/cluster existent pe MongoDB Atlas
- Toate colecțiile vor avea prefixul `pastebin_` (ex: `pastebin_pastes`)
- **Nu** se creează baze de date noi, totul merge în db-ul configurat în `MONGODB_URI`

## Next.js 16 — convenții specifice (breaking changes față de 15)
- **`src/proxy.ts`** — înlocuiește `middleware.ts` din Next.js 15. Export-ul se numește `proxy`, nu `middleware`
- `params` în pages/route handlers sunt `Promise<{...}>` (async) — neschimbat față de 15.x
- `cookies()` din `next/headers` este async — neschimbat față de 15.x

```ts
// CORECT în Next.js 16
export async function proxy(request: NextRequest) { ... }
export const config = { matcher: ['/admin/:path*'] };

// GREȘIT (Next.js 15 și mai vechi)
export async function middleware(request: NextRequest) { ... }
```

## Structura proiect
```
src/
  app/
    page.tsx                  # Home — formular creare paste
    [id]/
      page.tsx                # Vizualizare paste public
    admin/
      page.tsx                # Admin dashboard (listat/șters paste-uri)
      login/
        page.tsx              # Login admin
    api/
      paste/
        route.ts              # POST /api/paste — creare
      paste/[id]/
        route.ts              # GET /api/paste/[id] — citire
      admin/
        pastes/route.ts       # GET /api/admin/pastes — list (auth required)
        paste/[id]/route.ts   # DELETE /api/admin/paste/[id] (auth required)
        login/route.ts        # POST /api/admin/login
        logout/route.ts       # POST /api/admin/logout
  lib/
    mongodb.ts                # Singleton Mongoose connection
    auth.ts                   # JWT helpers
  models/
    Paste.ts                  # Mongoose model cu prefix pastebin_
  proxy.ts                    # Protejare rute /admin/* (exceptând /admin/login)
```

## Reguli importante
1. **Nicio listă de paste-uri nu e vizibilă public** — doar adminul autentificat vede toate paste-urile
2. **Paste-urile publice** sunt accesibile doar dacă știi ID-ul (slug scurt)
3. **Admin auth**: credențiale din `.env` (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`), JWT secret din `JWT_SECRET`
4. **Password hash**: bcrypt, niciodată plain text în `.env`
5. **Middleware Next.js** protejează `/admin/*` exceptând `/admin/login`
6. **API routes** pentru admin verifică JWT din cookie la fiecare request
7. **Paste-urile** pot fi: publice (accesibile via link), cu expirare opțională, cu titlu opțional, cu limbaj selectabil pentru syntax highlight
8. **IDs**: nanoid scurt (8 chars) — nu ObjectId MongoDB expus

## Environment variables (`.env.local`)
```
MONGODB_URI=mongodb+srv://...
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$...   # bcrypt hash
JWT_SECRET=...                    # string random lung
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Convenții cod
- TypeScript strict
- Server Components by default, `"use client"` doar unde e nevoie
- API routes returnează `{ error: string }` la erori cu statusul HTTP corespunzător
- Niciodată se loghează sau expune `MONGODB_URI`, `JWT_SECRET`, sau `ADMIN_PASSWORD_HASH`
- Validare input pe server (nu doar client)
- Sanitizare XSS: conținutul paste-urilor se afișează escaped sau în highlight.js (safe)
