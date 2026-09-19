# SBH EHR Portal FINAL v3.3

## Final pre-deployment order
1. Copy `.env.example` to `.env.local` and fill all Supabase keys plus `NEXT_PUBLIC_SITE_URL`.
2. In Supabase SQL Editor run `supabase/FINAL-PRODUCTION-MIGRATION.sql` once on the target project.
3. Sign out and sign back in after role/capability migrations.
4. Run:
   - `npm install`
   - `npm run typecheck`
   - `npm run build`
5. Deploy only after both commands pass.

## Security/permission model
- SUPER_ADMIN bypasses capability restrictions and has all portal rights.
- Other roles are controlled from **Administration → Role Capabilities**.
- Form Builder means template creation; clinical staff can separately receive **Create form records**.
- Resident create/edit/delete, appointment management, medication management, HR management and system admin are separate capabilities.
- Sensitive API mutations also check capabilities server-side.

## v3.3 polish
- My Profile page for every logged-in user.
- Topbar profile link.
- Friendly access-denied banner.
- 404 and global error states.
- Loading skeleton.
- Private portal metadata set to no-index/no-follow.
- Final version label updated to v3.3.
