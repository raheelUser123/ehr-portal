# SBH EHR Portal - Feedback Fixes v4

This package is based on the uploaded `ehr-portal(4).zip` and keeps the existing portal structure intact.

## Fixed in this version

1. Shift Progress Note
   - Shift Timing is editable.
   - Morning / Evening / Night / Custom options added.
   - Beginning and End Time are real time inputs.
   - Standard shifts auto-fill the times and remain editable.
   - Date is a date input.

2. Resident Chart
   - Shift Progress Note is always the first card.

3. Therapy Progress Notes
   - Resident dropdown now loads through the existing `/api/residents` server route.
   - This avoids the browser RLS/field-mapping problem that caused an empty dropdown.

4. Drawn signatures
   - Added reusable mouse/touch/stylus Signature Pad.
   - Therapy BHT and BHP signatures are drawable.
   - Mileage Log Driver, Resident/Representative and Witness signatures are drawable.
   - Informed Consent medication signatures are drawable.
   - Employee forms/modules with Signature fields are drawable.
   - Resident Chart form fields named/labeled Signature use the drawable pad.
   - Existing Signers selectors are left unchanged.

5. Monthly Medication Administration Record (MAR)
   - Resident details header.
   - Previous / next month navigation.
   - One medication block per active medication.
   - Exact scheduled dose-time rows (for example 8:00 AM and 8:00 PM).
   - Day columns for the selected month.
   - Administration cells store GIVEN / H / HP / RM / HO / UN / D.
   - Each record stores staff name, role, initials and timestamp.
   - Staff digital-signature history table.
   - Refill count, expiration date and other instructions.
   - Printable monthly report layout.

6. Resident Medication
   - Exact dose times can be added/removed with time inputs.
   - Refill Count, Expiration Date and Other Instructions added.
   - MAR automatically uses the configured times.
   - For older medications without configured times, MAR derives a sensible display time from frequency/instructions.

## REQUIRED DATABASE STEP

Before using the new medication scheduling/MAR fields on the live site, run this in Supabase SQL Editor:

`supabase/FEEDBACK-FIXES-v4.sql`

The same statements have also been appended to `supabase/FINAL-PRODUCTION-MIGRATION.sql`.

## Local verification

Run:

```bash
npm install
npm run build
```

The uploaded ZIP did not contain the root package/config files, so the matching package.json, package-lock.json, tsconfig.json, Next config and proxy files from the immediately preceding reviewed SBH build were restored into this package.
