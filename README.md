# EHR Portal - Resident Module (Next.js + Supabase)

This build is the Supabase-only version of the Resident module. Prisma/SQLite has been removed.

## Included
- Supabase Auth: sign up, login, email OTP verification, forgot/reset password, logout
- Resident CRUD
- Resident Chart and supplied forms
- Form builder for future resident forms
- Draft / submit / edit / update / delete form records
- Resident vitals history
- Resident tracking
- Notifications
- Dashboard analytics
- Audit log writes

## 1. Install
```bash
npm install
```

## 2. Environment
Copy `.env.example` to `.env.local` and set:

```env
NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
```

Keep the service role key server-side only. Never expose it in a `NEXT_PUBLIC_` variable.

## 3. Supabase SQL
Open Supabase > SQL Editor and run the full contents of:

`supabase/schema.sql`

It is written to work with the tables already used by the project and adds the missing fields/tables required by this build, including notifications and form slugs/titles.

## 4. Email OTP templates
In Supabase Authentication > Email Templates:

For **Confirm signup**, include the token in the email body using Supabase's token variable so the user can enter the 6-digit code on `/verify`.

For **Reset password**, also include the recovery token so the user can enter it on `/reset-password`.

## 5. Run
```bash
npm run dev
```
Open http://localhost:3000

## Important
- Do not run Prisma commands. Prisma has been removed.
- There should be no duplicate `app/login`, `app/signup`, `app/dashboard`, or `app/residents` folders. Routes live inside `(auth)` and `(portal)` route groups.
- If you copied this over an older project, delete `.next` before starting:

```bash
rm -rf .next
npm run dev
```
