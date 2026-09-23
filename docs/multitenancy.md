# Edu-mit local multi-tenancy

This workspace is browser-only, so tenant isolation is implemented by `tenant-store.js` rather than Supabase. It is a development boundary, not a production security boundary.

## Local records

- `edumit:schools:v1`: school records with unique `id` and `status`
- `edumit:users:v1`: users with `role` and `schoolId`
- `edumit:students:v1`: student records grouped by `schoolId`
- `edumit:school-settings:v1`: settings grouped by `schoolId`
- `edumit:subscriptions:v1`: subscriptions grouped by `schoolId`
- `edumit:session:v1`: active tab-scoped session with `userId`, `role`, and `schoolId`

Existing legacy `scholara:*` data is migrated once into the current school. New school-admin signup creates a school and user together. Student creation always writes the authenticated school ID, and dashboard reads use the current session's school ID.

The Admin Overview reads the active tenant's stored students, teachers, classes, subjects, attendance, fees, events, documents, and scores. It refreshes on local data changes and never falls back to another school's records.

## Roles

- `school_admin`: can access only records returned by its own `schoolId`
- `teacher`: can access its own school's role dashboard
- `student`: can access its own school's student record
- `super_admin`: can view all schools and manage active/suspended/deleted school records

Demo Super Admin credentials are `superadmin@edumit.local` and `superadmin123`.

## Production migration

When Supabase is introduced, move the same contract to a `schools` table, a profile table containing `school_id`, and `school_id NOT NULL` foreign keys on students, teachers, classes, subjects, attendance, exams, results, fees, announcements, library, payroll, hostel, events, and every other school-owned table. Enable RLS on each table. Policies should compare the row's `school_id` with the authenticated profile's `school_id`; only a server-controlled Super Admin claim should bypass that comparison. Never accept a client-provided `school_id` for ordinary inserts or updates.
