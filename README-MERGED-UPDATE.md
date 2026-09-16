# EHR Portal - Merged Resident Workspace Update

This build contains the existing Resident/Super Admin portal plus:

- Medications module
  - Resident Medication
  - Medication Administration Record (MAR)
  - Medication Reconciliation
  - Medication Count
  - Informed Consent for Medications
  - PRN
- Therapy Progress Notes
  - list/search
  - create
  - edit/update
  - delete
  - draft/submit
  - BHT/BHP signer fields
  - rich text Note Summary and Recommendation
- Mileage Log
  - list/search
  - create
  - edit/update
  - delete
  - draft/submit
  - automatic Total Mileage calculation
  - driver/witness/resident signature fields

## Replace/setup

1. Extract this ZIP to a NEW folder. Do not merge it into the old project.
2. Copy your existing `.env.local` into this folder.
3. Run this SQL once in Supabase SQL Editor:
   `supabase/complete-module-updates.sql`
4. In terminal:
   `npm install`
   `npm run dev`

If you already ran the medications SQL earlier, the combined SQL uses safe `if not exists` / `add column if not exists` statements where applicable.

Routes added:
- `/therapy-progress-notes`
- `/therapy-progress-notes/new`
- `/mileage-log`
- `/mileage-log/new`

The sidebar already includes Therapy Progress Notes and Mileage Log.
