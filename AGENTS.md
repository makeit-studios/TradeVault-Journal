# TradeVault Journal — Agent Guide

## Project Identity & Stack

TradeVault Journal is a trading journal MVP for accounts, trades, prop firm rule tracking, payouts, psychology notes, calendars, and analytics. It will evolve toward the TradeLog spec.

| Concern | Technology |
|---|---|
| Framework | Next.js 14 — App Router |
| Language | TypeScript — strict mode |
| Styling | Tailwind CSS v3 + `cn()` utility |
| Database | Prisma ORM + SQLite (prod: PostgreSQL) |
| Auth | NextAuth v4 (Credentials provider) |
| Forms | Server Actions (Zod for API validation) |
| Charts | Recharts |
| File uploads | Local `public/uploads` (prod: Vercel Blob / S3) |

## Agent Behavior Rules

### Scope Discipline
- Never modify files outside the explicit scope of the task. If a task requires touching an out-of-scope file, stop and ask before proceeding.
- Do not refactor, rename, or "clean up while you're in there." All changes must be directly traceable to the stated task.

### Types Before Implementation
- Define types and interfaces before writing implementation code.
- For any new data shape, API response, props object, or store, the type must exist before the logic that consumes it.

### Server Components First
- Default to Server Components. Only add `'use client'` when a component explicitly needs browser APIs, event handlers, hooks, or state.
- Push the `'use client'` boundary as far down the tree as possible.

## TypeScript Rules

- Strict mode is always on. Never disable strict flags.
- `any` is banned. If an escape hatch is unavoidable, add an inline `// reason:` comment.
- Type assertions (`as`) require a comment explaining why the assertion is safe.
- Prefer `interface` for object shapes (props, API responses). Use `type` for unions, intersections, utility types.
- Never use `object`, `Function`, or `{}` as a type. Be explicit.

## Conventions

### Exports
- Named exports for all components, hooks, utilities, and types.
- Default exports only for `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` (Next.js requirement).

### Props Interface
- Always define a named `interface` for component props. Suffix with `Props`.
- Never use anonymous inline prop types.

### Styling
- Tailwind CSS classes only. No inline `style={{}}` props.
- Always use the `cn()` utility for conditional or merged class names. Never concatenate class strings manually.

### Forms
- Server Actions for mutations (existing pattern in `app/actions.ts`).
- API routes only for non-form operations (e.g. registration).
- Zod for API-level validation only.

### File naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- Types: `camelCase.d.ts` (global) or inline

## Design Direction

Draw from `Tradevault_-antigravity/DESIGN.md`:
- Colors: primary blue (#3859F9), cyan accents, clean dark surfaces
- Cards with subtle borders, rounded corners (12-16px), gentle shadows
- Generous whitespace, consistent 24px card padding
- Dark theme default (current MVP already uses a dark green/teal scheme)

## Feature Roadmap (from project_specification.txt)

### Phase 1 — Polish & Foundation (current)
- [x] Auth (login/register)
- [x] Trade logging (required fields)
- [x] Trade list table with edit/delete
- [x] Account management
- [x] Basic analytics (equity curve, win rate, P/L by symbol/strategy)
- [x] Trading calendar
- [x] Psychology entries
- [x] Payout tracking

### Phase 2 — Full Logging & Data
- [ ] CSV import/export for trades
- [ ] Tags system (user-defined emotion/setup/mistake tags)
- [ ] Emotional state tag selector on trade form
- [ ] Mistakes multi-select on trade form
- [ ] Trade rating (1-5 stars)
- [ ] R:R ratio auto-calculation
- [ ] Pre-trade plan + post-trade reflection fields

### Phase 3 — Calendar & Goals
- [ ] Goals/rules tracker (monthly P/L target, win rate target, max daily loss, min R:R)
- [ ] Goal progress bars on dashboard
- [ ] Visual warnings when approaching limits
- [ ] Daily compliance checklist
- [ ] Daily journal entries (separate from psychology)

### Phase 4 — Enhanced Analytics
- [ ] P/L by day of week
- [ ] P/L by time of day (hourly heatmap)
- [ ] Win rate by emotional state
- [ ] Win rate by timeframe
- [ ] Drawdown chart
- [ ] R-multiple distribution histogram
- [ ] Trade duration vs P/L scatter
- [ ] Date range filters on all analytics

### Phase 5 — Production Readiness
- [ ] Migrate SQLite → PostgreSQL (Supabase)
- [ ] Migrate file uploads → Vercel Blob / Supabase Storage
- [ ] NEXTAUTH_SECRET rotation
- [ ] Loading states on all pages
- [ ] Error boundaries
- [ ] Mobile responsiveness polish
- [ ] Search functionality (currently UI-only placeholder)

## Non-Negotiables

- Never add a new dependency without asking. State the package name, the exact reason, and whether existing deps suffice.
- Every interactive element must have hover and active states.
- Maintain touchable minimum sizes (44px height for buttons/inputs).
- No magic strings inline — use typed constants.
