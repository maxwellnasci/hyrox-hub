## Hyrox Training App — Build Plan

A modern dark-mode web app for Hyrox training with student and coach roles, built on TanStack Start + Lovable Cloud.

### Visual direction

- Dark theme inspired by Strava: near-black background, vivid orange accent (`#FC5200`-style), high-contrast white text, generous spacing, bold sans-serif (e.g. Inter/Space Grotesk pairing).
- Card-based weekly feed, subtle dividers, animated check interaction.
- All colors defined as oklch tokens in `src/styles.css` (background, foreground, primary/orange, muted, card, border).

### Pages & routes

```
/                          Landing → redirects to /login or /dashboard
/login                     Email + password sign in
/signup                    Email + password + optional coach invite code
/_authenticated/dashboard  Student week view (workouts + check buttons)
/_authenticated/admin      Coach-only: list + add/edit/delete workouts
```

- `_authenticated` layout guards via `beforeLoad`.
- `/admin` additionally checks `has_role('admin')` and redirects students to `/dashboard`.

### Backend (Lovable Cloud)

Enable Cloud, then create:

**Tables**

- `app_role` enum: `'admin' | 'student'`
- `user_roles (id, user_id → auth.users, role, unique(user_id, role))`
- `workouts (id, title, description, day_of_week 0–6, week_start date, duration_min, created_by, created_at)`
- `workout_completions (id, workout_id, user_id, completed_at, unique(workout_id, user_id))`

**Security**

- `has_role(_user_id, _role)` SECURITY DEFINER function.
- RLS:
  - `workouts`: SELECT for any authenticated user; INSERT/UPDATE/DELETE only `has_role(auth.uid(),'admin')`.
  - `workout_completions`: user can SELECT/INSERT/DELETE only their own rows.
  - `user_roles`: user can SELECT their own; INSERT only via the invite-code edge path.

**Invite code → admin role**

- Store `COACH_INVITE_CODE` as a Cloud secret (asked via add_secret).
- Server function `claimCoachRole({ code })` (createServerFn + requireSupabaseAuth) compares against `process.env.COACH_INVITE_CODE` and inserts an `admin` row in `user_roles` using the admin client. Default new users get a `student` row via a signup trigger (or via the same server fn called right after signup with no code).

### Auth flow

- Supabase email/password using the browser client.
- Signup form: email, password, optional "coach invite code" field. After `signUp`, call `claimCoachRole` if code provided; otherwise insert `student` role (handled by DB trigger on `auth.users`).
- `useAuth` hook exposes `{ user, isAdmin, loading }` using `onAuthStateChange` + a `getUserRole` server fn.

### Student dashboard

- Header: week of <Mon date>, with prev/next week arrows.
- 7 day cards (Mon–Sun); each lists that day's workouts.
- Each workout row: title, duration, expandable description, large circular Check button (orange when done, outlined when not). Toggle inserts/deletes from `workout_completions`.
- Empty days show a muted "Rest day" placeholder.

### Admin panel

- "This week" selector (date picker for `week_start`, defaults to current Monday).
- Table of workouts grouped by day with edit/delete actions.
- "Add workout" dialog: title, description, day of week, duration, week_start. Mutations via authenticated server fns; React Query invalidation refreshes the list.

### Technical notes

- Server functions live in `src/lib/workouts.functions.ts`, `src/lib/roles.functions.ts` (thin files, only `createServerFn` + their imports).
- Use `requireSupabaseAuth` middleware for all data access; admin mutations re-check `has_role` server-side as defense in depth (RLS already enforces it).
- React Query for fetching/mutations.
- `head()` metadata per route (titles like "Dashboard — Hyrox Training").
- shadcn components: button, card, dialog, input, label, select, sonner (toasts).

### Build order

1. Enable Lovable Cloud + add `COACH_INVITE_CODE` secret.
2. Migration: enum, tables, RLS, `has_role`, signup trigger for default `student` role.
3. Design tokens in `src/styles.css` (dark palette + orange accent).
4. Auth pages (`/login`, `/signup`) + `useAuth` hook + `_authenticated` guard.
5. `claimCoachRole` server fn + role lookup.
6. Student dashboard with week navigation and check toggle.
7. Admin panel with CRUD dialog.
8. Polish: empty states, loading skeletons, toasts, responsive layout.
