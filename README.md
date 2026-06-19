# Corsair Command Center

> A premium, AI-native email & calendar command center built on the T3 Stack with Corsair integrations.

Corsair is a Superhuman-inspired productivity tool that connects to your Gmail and Google Calendar, providing a keyboard-first, high-performance interface powered by AI.

## Tech Stack

| Layer             | Technology                            |
| ----------------- | ------------------------------------- |
| Framework         | Next.js 15 (App Router)               |
| Language          | TypeScript 5.8                        |
| API               | tRPC v11                              |
| Database          | PostgreSQL (Neon)                     |
| ORM               | Drizzle ORM 0.41                      |
| Auth              | Better Auth 1.6                       |
| Integrations      | Corsair SDK (Gmail + Google Calendar) |
| AI                | MiMo V2.5 Pro (Xiaomi)                |
| Styling           | Tailwind CSS 4 + shadcn/ui            |
| Rich Text         | TipTap (StarterKit)                   |
| State             | Zustand 5                             |
| Virtualization    | @tanstack/react-virtual               |
| Command Palette   | cmdk                                  |
| Animation         | Motion (Framer Motion v12) + GSAP     |
| HTML Sanitization | DOMPurify                             |
| Keyboard          | react-hotkeys-hook                    |

## Features

### Real Email & Calendar Integration

- Gmail threads synced via Corsair SDK with full message body parsing (HTML + plain text)
- Google Calendar events with meeting link extraction (Google Meet, Zoom)
- OAuth flow for connecting Gmail and Calendar accounts
- Gmail push notifications via Google Cloud Pub/Sub webhooks

### AI Command Center

- AI chat assistant with tool calling (summarize inbox, search emails, draft emails, check calendar)
- MiMo V2.5 Pro integration for email summarization, drafting, and priority scoring
- Streaming-style responses in the AI drawer

### Premium UI

- Dark/Light theme with custom CSS variable system
- Animated landing page with gradient orbs and floating product previews
- Linear-inspired sidebar with animated active indicators
- AI Drawer with chat interface and suggestion buttons
- Virtualized inbox list with 72px rows and hover micro-actions
- Premium thread view with HTML email rendering (DOMPurify sanitized)
- Compose modal with TipTap rich text editor and AI Draft button
- Calendar with month grid sidebar and agenda view
- Command palette (Cmd+K) with search across emails and events
- Keyboard shortcuts page with animated key badges

### Keyboard-First Navigation

| Key         | Action           |
| ----------- | ---------------- |
| `j` / `k`   | Navigate up/down |
| `Enter`     | Open thread      |
| `e`         | Archive          |
| `s`         | Snooze (1 hour)  |
| `#`         | Delete (trash)   |
| `c`         | Compose          |
| `r`         | Reply            |
| `Cmd+K`     | Command palette  |
| `Cmd+Enter` | Send email       |
| `]`         | Toggle sidebar   |
| `Escape`    | Close / Go back  |

## Route Structure

| Route                     | Page                     |
| ------------------------- | ------------------------ |
| `/`                       | Landing page (marketing) |
| `/signin`                 | Sign in                  |
| `/signup`                 | Sign up                  |
| `/dashboard`              | Inbox                    |
| `/dashboard/calendar`     | Calendar                 |
| `/dashboard/integrations` | Integrations             |
| `/dashboard/thread/[id]`  | Thread detail            |
| `/dashboard/starred`      | Starred threads          |
| `/dashboard/snoozed`      | Snoozed threads          |
| `/dashboard/drafts`       | Drafts                   |
| `/dashboard/sent`         | Sent                     |
| `/dashboard/spam`         | Spam                     |
| `/dashboard/trash`        | Trash                    |
| `/dashboard/shortcuts`    | Keyboard shortcuts       |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database (Neon recommended)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Fill in your real values in .env

# Push database schema
pnpm db:push

# Start development server
pnpm run dev
```

### Environment Variables

| Variable                           | Description                  |
| ---------------------------------- | ---------------------------- |
| `DATABASE_URL`                     | PostgreSQL connection string |
| `BETTER_AUTH_SECRET`               | Session encryption secret    |
| `BETTER_AUTH_GITHUB_CLIENT_ID`     | GitHub OAuth client ID       |
| `BETTER_AUTH_GITHUB_CLIENT_SECRET` | GitHub OAuth client secret   |
| `GOOGLE_CLIENT_ID`                 | Google OAuth client ID       |
| `GOOGLE_CLIENT_SECRET`             | Google OAuth client secret   |
| `CORSAIR_KEK`                      | Corsair Key Encryption Key   |
| `MIMO_API_KEY`                     | MiMo AI API key              |
| `MIMO_BASE_URL`                    | MiMo API base URL            |
| `MIMO_MODEL`                       | MiMo model name              |

### Corsair Setup

```bash
# Set OAuth credentials
pnpm corsair setup --gmail client_id=... client_secret=...
pnpm corsair setup --googlecalendar client_id=... client_secret=...

# Provision tenant
pnpm corsair setup --tenant=your-tenant-id

# Authenticate via CLI
pnpm corsair auth --plugin=gmail
pnpm corsair auth --plugin=googlecalendar

# Subscribe to webhooks (optional)
pnpm corsair auth --plugin=gmail --webhook
```

### Google Cloud Console

1. Enable **Gmail API** and **Google Calendar API**
2. Add redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (Better Auth)
   - `http://localhost:3000/api/corsair/callback` (Corsair)
3. Add your email as a **Test user** on the OAuth consent screen

## Available Scripts

| Script        | Command                | Description                     |
| ------------- | ---------------------- | ------------------------------- |
| `dev`         | `next dev --turbo`     | Start dev server with Turbopack |
| `build`       | `next build`           | Production build                |
| `start`       | `next start`           | Start production server         |
| `lint`        | `next lint`            | Run ESLint                      |
| `lint:fix`    | `next lint --fix`      | Auto-fix ESLint issues          |
| `typecheck`   | `tsc --noEmit`         | TypeScript type checking        |
| `db:generate` | `drizzle-kit generate` | Generate migration files        |
| `db:migrate`  | `drizzle-kit migrate`  | Run pending migrations          |
| `db:push`     | `drizzle-kit push`     | Push schema directly to DB      |
| `db:studio`   | `drizzle-kit studio`   | Open Drizzle Studio             |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (providers + theme)
│   ├── page.tsx                # Landing page (marketing)
│   ├── signin/page.tsx         # Sign in page
│   ├── signup/page.tsx         # Sign up page
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard layout (sidebar + AI drawer + auth guard)
│   │   ├── page.tsx            # Inbox
│   │   ├── calendar/page.tsx   # Calendar with month grid
│   │   ├── integrations/       # Gmail/Calendar connection management
│   │   ├── thread/[id]/        # Thread detail
│   │   ├── starred/            # Starred threads
│   │   ├── snoozed/            # Snoozed threads
│   │   ├── drafts/             # Drafts
│   │   ├── sent/               # Sent emails
│   │   ├── spam/               # Spam
│   │   ├── trash/              # Trash
│   │   └── shortcuts/          # Keyboard shortcuts reference
│   └── api/
│       ├── connect/route.ts    # OAuth connect route
│       ├── corsair/callback/   # OAuth callback
│       ├── auth/[...all]/      # Better Auth handler
│       ├── trpc/[trpc]/        # tRPC HTTP handler
│       └── webhooks/           # Corsair webhook handler
├── components/
│   ├── layout/
│   │   ├── app-layout.tsx      # Main layout with AI drawer
│   │   ├── sidebar.tsx         # Navigation sidebar
│   │   └── command-palette.tsx # Cmd+K command palette
│   ├── inbox/
│   │   ├── thread-list.tsx     # Virtualized inbox list
│   │   ├── thread-row.tsx      # Individual thread row
│   │   ├── thread-view.tsx     # Thread detail view
│   │   └── email-renderer.tsx  # Sanitized HTML email renderer
│   ├── compose/
│   │   └── compose-modal.tsx   # Rich text compose modal
│   ├── calendar/
│   │   └── month-grid.tsx      # Month calendar grid
│   ├── auth-buttons.tsx        # Sign in/up panel
│   └── theme-provider.tsx      # Theme provider
├── server/
│   ├── corsair.ts              # Corsair SDK initialization
│   ├── corsair-tenant.ts       # Tenant resolution + provisioning
│   ├── agents/agent.ts         # AI agent (MiMo integration)
│   ├── api/
│   │   ├── root.ts             # Router aggregation
│   │   ├── trpc.ts             # tRPC context + middleware
│   │   └── routers/
│   │       ├── inbox.ts        # Email CRUD + AI
│   │       ├── calendar.ts     # Calendar events
│   │       ├── search.ts       # Unified search
│   │       ├── integrations.ts # Connection status
│   │       └── ai.ts           # AI chat + tool calling
│   ├── better-auth/
│   │   ├── config.ts           # Auth config (GitHub + Google + Email)
│   │   ├── server.ts           # Server-side session
│   │   └── client.ts           # Client-side auth
│   └── db/
│       ├── index.ts            # Drizzle client
│       └── schema.ts           # Database schema (15 tables)
├── styles/
│   ├── globals.css             # Tailwind + shadcn theme variables
│   └── theme.css               # Custom light/dark theme tokens
├── store/
│   └── ui.ts                   # Zustand UI state
├── hooks/
│   └── use-keyboard.ts         # Keyboard shortcut hook
└── trpc/
    ├── react.tsx               # Client-side tRPC provider
    ├── server.ts               # Server-side tRPC caller
    └── query-client.ts         # React Query client
```

## License

MIT
