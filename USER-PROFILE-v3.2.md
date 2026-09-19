# User & Staff 360 Profile - v3.2

Added to Users & Staff:
- User name is clickable.
- New `View Profile` action.
- New route `/admin/users/[id]`.
- Profile overview with account and employment details.
- Stats for appointments booked, resident chart forms, therapy notes, medication administration, employee/HR records and audit events.
- Tabs for Appointments, Forms & Notes, Employee / HR, and Audit Activity.
- Basic name/phone editing uses the existing protected Admin Users API.
- Super Admin profiles remain protected from non-Super Admin users.

Notes:
- Appointment count currently means appointments booked/created by that staff user because the existing appointment table stores `created_by`. If provider assignment is added later, this can be extended to show assigned appointments separately.
