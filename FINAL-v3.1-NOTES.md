# SBH EHR Portal Final v3.1

This build consolidates the Resident, Employee/HR, Appointment, Medication, Therapy Progress Notes, Mileage, Admin, RBAC and Super Admin access fixes.

## Access model

- `SUPER_ADMIN`: full access to every capability and every Administration page. It cannot be restricted from the Role Capabilities UI.
- `ADMIN` and staff roles: permissions are controlled from **Administration -> Role Capabilities**.
- **Form Builder** means creating/managing form templates. It is separate from creating a resident form record.
- Staff can be permitted to create/edit resident chart records without giving access to Form Builder.
- Resident Add/Edit/Delete and Appointment management are separate capabilities.

## Super Admin access fix

`proxy.ts` checks access through the Postgres `has_capability()` SECURITY DEFINER RPC. This prevents profile RLS from incorrectly downgrading a Super Admin to Staff and causing `/dashboard?access=denied`.

Run `supabase/FINAL-PRODUCTION-MIGRATION.sql` on the existing database before testing the final build. The standalone `supabase/FIX-SUPER-ADMIN-ACCESS.sql` is also included for installations that only need the access fix.

## Before deployment

1. Copy your real `.env.local` into the project. Required values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
2. Run `supabase/FINAL-PRODUCTION-MIGRATION.sql` in Supabase SQL Editor.
3. Log out and back in after the migration so the role/session refreshes.
4. Run:
   - `npm install`
   - `npm run typecheck`
   - `npm run build`
5. Deploy only after the production build passes.

## Source review completed

- No Prisma references in `app`, `lib`, `components` or `package.json`.
- Only Next.js 16 `proxy.ts` is present; no conflicting `middleware.ts`.
- 40 `page.tsx` routes found and all 40 resolve to unique URL paths.
- Super Admin bypass is enforced in server session helpers and the database capability function.
- Admin user/organization/facility/role APIs use server-side authorization checks.
- Resident create/edit/delete APIs use separate capability checks.
- Form Builder label is explicit to avoid confusing form-template creation with clinical form-entry creation.
