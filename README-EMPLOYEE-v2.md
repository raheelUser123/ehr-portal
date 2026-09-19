# EHR Portal Resident + Employee v2.0
This replacement build merges the Resident module, Medications, Therapy Progress Notes, Mileage Log, Super Admin pages and the new Employee/HR workspace.

## Employee Workspace
- Employment Application (5-step)
- Employment Information
  - Personal Information
  - Offer Letter
  - TB Risk Assessment
  - Forms 2023
  - LRC-1031A
  - Job Description
  - FW4
  - APS Consent
  - FW9
  - I-9
  - Employee Termination
  - All Employee Forms
- Training
  - Tuberculosis Training
  - Assistance with Self-Administration of Medication
  - Fall Prevention and Recovery
  - Infection Control
  - On Site / Facility Orientation
  - Skills and Knowledge
- Time Off Request
- Time Sheet
- BHT Schedule
- Employee Performance
- Employee Tracking / Upload

## Database
Run these SQL files in Supabase SQL Editor:
1. `supabase/complete-module-updates.sql` (if not already run on this database)
2. `supabase/employee-module.sql`

The Employee SQL creates `employee_records`, RLS policies, and the private `employee-documents` Storage bucket.

## Run
Copy your existing `.env.local` into this project, then:
`npm install`
`npm run dev`
