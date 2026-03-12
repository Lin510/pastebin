# 📋 PasteBin Personal

> Serviciu personal de partajare cod și text — self-hosted, fără listă publică, cu syntax highlighting și panou de administrare securizat.

Built with **Next.js 16**, **MongoDB Atlas**, **Tailwind CSS v4**, **highlight.js**.

---

## Funcționalități

- **Creare paste** — titlu opțional, limbaj selectabil (23 limbaje), expirare configurabilă (10 min → 30 zile → niciodată)
- **Vizualizare** — syntax highlighting prin highlight.js (tema dark), copiere cu un click, link direct
- **Fără listă publică** — paste-urile sunt accesibile doar prin link direct (ID nanoid de 8 caractere)
- **Admin panel** — autentificat cu JWT în cookie httpOnly, listare paginată, ștergere paste
- **Expirare automată** — TTL index MongoDB șterge paste-urile expirate automat
- **Securitate** — parolă hash-uită cu bcrypt, JWT cu `jose` (Edge-compatible), validare input server-side, XSS safe

## Stack tehnic

| | |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT (jose) + bcrypt, httpOnly cookie |
| Syntax highlight | highlight.js |
| ID-uri | nanoid (8 chars) |

## Setup

### 1. Clonare și instalare

```bash
git clone https://github.com/USER/paste-bin.git
cd paste-bin
npm install
```

### 2. Variabile de mediu

```bash
cp .env.example .env.local
```

Completează `.env.local`:

```env
MONGODB_URI=mongodb+srv://...
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$...
JWT_SECRET=string_random_minim_32_chars
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Generare hash parolă admin

```bash
node scripts/hash-password.mjs PAROLA_TA
```

Copiază hash-ul rezultat în `ADMIN_PASSWORD_HASH`.

### 4. Pornire

```bash
npm run dev      # development
npm run build    # production build
npm start        # production server
```

## Structură

```
src/
├── app/
│   ├── page.tsx              # Home — creare paste
│   ├── [id]/page.tsx         # Vizualizare paste
│   ├── admin/
│   │   ├── page.tsx          # Dashboard admin
│   │   └── login/page.tsx    # Login admin
│   └── api/
│       ├── paste/route.ts           # POST creare
│       ├── paste/[id]/route.ts      # GET citire
│       └── admin/
│           ├── login/route.ts       # POST login
│           ├── logout/route.ts      # POST logout
│           ├── pastes/route.ts      # GET list (auth)
│           └── paste/[id]/route.ts  # DELETE (auth)
├── lib/
│   ├── mongodb.ts            # Conexiune MongoDB singleton
│   └── auth.ts               # JWT helpers
├── models/
│   └── Paste.ts              # Schema Mongoose (pastebin_pastes)
└── middleware.ts             # Protecție rute /admin/*
```

## Securitate

- Nicio listă publică de paste-uri
- Parola adminului niciodată în plain text
- Cookie `httpOnly` + `sameSite: lax` + `secure` în producție
- Validare și sanitizare input pe server
- ID-uri opace (nanoid), nu ObjectId MongoDB
- Middleware Next.js verifică JWT pe Edge runtime

