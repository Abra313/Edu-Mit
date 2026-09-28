# EDU-MIT Supabase Multi-Tenancy

The role-based application uses Supabase Auth and Postgres row-level security. `tenant-store.js` reads and writes the remote tables; browser storage is not used for business records.

## Tenant records

- `schools` owns each school workspace and its active/suspended state.
- `profiles` links each Auth user to a role and optional `school_id`.
- `students`, `teachers`, school settings, subscriptions, academics, attendance, exams, and results carry a school ID directly or through their parent record.
- RLS derives the current school and role from the authenticated profile; ordinary browser requests cannot choose another tenant.

## Roles

- `school_admin` manages records only for the profile's active school.
- `teacher` reads assigned school data and writes attendance/results within that school.
- `student` reads their own student record and their own attendance, timetable, and results.
- `super_admin` manages platform schools and can inspect cross-tenant records.

School Admin signup creates a school/profile through a database trigger. Teacher and Student signup is allowed only when an administrator has already created a matching teacher or student record. Super Admin access is provisioned manually by the database owner; it cannot be requested through public signup.

The schema and policies live in `supabase-schema.sql`. Apply any schema changes to Supabase before deploying matching frontend code.