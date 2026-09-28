# EDU-MIT prototype

This is the EDU-MIT school management workspace prototype.

## Supabase setup

The role-based app uses Supabase Auth and the project tables. Business records are not stored in browser localStorage; the Auth SDK keeps its short-lived session in `sessionStorage`.

The schema and role policies have been applied to the configured project. Keep `supabase-schema.sql` as the source of truth for future project setup. Email/password authentication must be enabled in Supabase Auth.

School Admins register from `admin-signup.html`; the database trigger creates their school and profile. A School Admin adds teacher profiles and student admissions first. Teachers then create accounts using their invited work email. Students create accounts using the email and admission number already on their student record. Email confirmation may be required by the Supabase Auth settings.

### First Super Admin

Super Admin is intentionally not self-registerable. Create the platform owner's user in Supabase Dashboard > Authentication > Users, then run this once in SQL Editor using that account's email:

```sql
do $$
declare bootstrap record;
begin
	select id, school_id into bootstrap
	from public.profiles
	where lower(email) = lower('owner@example.com');

	if bootstrap.id is null then
		raise exception 'Create the Auth user first and confirm the email.';
	end if;

	update public.profiles
	set role = 'super_admin', school_id = null
	where id = bootstrap.id;

	if bootstrap.school_id is not null then
		delete from public.schools
		where id = bootstrap.school_id
			and not exists (select 1 from public.profiles where school_id = bootstrap.school_id);
	end if;
end $$;
```

Replace `owner@example.com` with the same email, then sign in at `super-admin.html`.

## Run it

Open `login.html` for the role entry point, or serve the folder with any static server. `index.html` redirects to that entry point. Use **Settings -> Export JSON** to download a database snapshot.

## Included in this slice

- Separate Admin, Teacher and Student dashboards
- Admin, Teacher, Student, and Super Admin authentication with role checks
- School-scoped Supabase records protected by row-level security
- Invited Teacher/Student registration tied to existing school records
- Supabase-backed student, staff, academic, attendance, examination, and results records
- Dedicated HTML, CSS and JavaScript ownership for each role page
- Three-role login portal with local sign-out actions
- Responsive Edu-mit application shell
- Seeded  data
- Owner dashboard with fee, attendance and setup signals
- Role-oriented navigation surfaces
- Student directory with search and add-student flow
- Attendance register with database persistence
- Results entry and review with database persistence
- Finance overview with invoice and debtor data
- Communications preview
- AI Studio mock workflows with approval-oriented copy
- School branding settings
- Export and reset demo data controls

## Page paths and ownership

The original prototype uses one HTML shell with hash-based page paths. The new role entry points are standalone pages, with their own CSS and JavaScript files, and the ownership map is documented in [docs/page-structure.md](docs/page-structure.md).

The main runtime files currently have these responsibilities:

- `index.html`: redirect to the role-based Supabase app
- `styles.css`: design tokens, shared components, responsive layout, and page styles
- `app.js`: legacy prototype, no longer loaded by the role-based app

The finance, communications, and AI surfaces remain prototypes and do not yet write to dedicated tables. Review Supabase Auth email-confirmation settings and the RLS policies before using real student records.
