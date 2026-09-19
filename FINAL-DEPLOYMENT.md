# SBH EHR Portal — Final v3.0

## Final modules

### Resident Workspace
- Dashboard / Home
- Resident List with Add / Edit / Delete / Search
- Appointments with Book / Edit / Reschedule / Delete / Status tracking
- Therapy Progress Notes
- Mileage Log
- Resident Chart forms and saved records
- Resident Vitals
- Resident Tracking
- Re-Assessment shortcuts
- Medications
  - Resident Medication
  - Medication Administration Record (MAR)
  - Medication Reconciliation
  - Medication Count
  - Informed Consent for Medications
  - PRN

### Employee / HR Workspace
- Employment Application
- Employment Information
- Training
- Time Off Request
- Time Sheet / BHT Schedule
- Employee Performance
- Employee Tracking / Upload
- Employee Information forms including Personal Information, Offer Letter, TB Risk Assessment, LRC-1031A, Job Description, FW4, APS Consent, FW9, I-9, Employee Termination and All Employee Forms

### Administration
- Super Admin full-access bypass
- Users & Staff management
- Organizations
- Facilities
- Role Capabilities checkbox matrix
- Audit Logs
- Settings
- Notifications
- Custom Form Builder

## Permission model

Super Admin always has access to every capability. Other roles are controlled by the Role Capabilities screen at `/admin/roles`.

Permissions cover residents, appointments, clinical forms, vitals, tracking, medications/MAR, therapy notes, mileage, Employee/HR, notifications, settings, form builder and administration modules.

The application enforces access in multiple places:
- Sidebar/menu visibility
- Route proxy protection
- Server/API capability checks
- Supabase RLS for key direct-browser data modules

## Fresh database setup

For a fresh Supabase project, run these SQL files in this order:

1. `supabase/schema.sql`
2. `supabase/employee-module.sql`
3. `supabase/therapy-progress-notes.sql`
4. `supabase/mileage-log.sql`
5. `supabase/complete-module-updates.sql`
6. `supabase/FINAL-PRODUCTION-MIGRATION.sql`

If the earlier module SQL has already been run, run `FINAL-PRODUCTION-MIGRATION.sql` last. It is written to be safe to re-run for the final capabilities and appointment setup.

## Environment

Copy `.env.example` to `.env.local` and provide:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Never expose the service-role key in browser code or commit `.env.local`.

## Local final check

```bash
npm install
npm run typecheck
npm run build
npm run start
```

## Deployment

Set the same environment variables on the production server/provider, deploy the project, and set `NEXT_PUBLIC_SITE_URL` to the production HTTPS domain.

The private application routes are intentionally disallowed in `robots.ts`; the sitemap contains only appropriate public authentication entry routes.

## Branding

- SBH EHR Portal branding
- High-resolution SBH logo in `public/sbh-logo.png`
- Favicon in `public/favicon.png` and App Router icon in `app/icon.png`
