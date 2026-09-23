# Edu-mit prototype

This is the first local browser prototype for the Edu-mit school management workspace.

## Run it

Open `login.html` for the three-role entry point, or serve the folder with any static server. The existing `index.html` remains the original hash-routed Edu-mit prototype, while unauthenticated access redirects to `login.html`.

The prototype stores demo data in `localStorage` under `scholara:data:v1`. Use **Settings -> Export JSON** before resetting the demo data.

## Included in this slice

- Separate Admin, Teacher and Student dashboards
- Admin-only sign-up page with local form validation
- Local Admin authentication with saved email, password, session and profile data
- Local multi-tenant isolation with school IDs, school-scoped records, and Super Admin controls
- Teacher email/password login and Student admission-number login on the shared login page
- No Teacher or Student sign-up flow
- Dedicated HTML, CSS and JavaScript ownership for each role page
- Three-role login portal with local sign-out actions
- Responsive Edu-mit application shell
- Seeded  data
- Owner dashboard with fee, attendance and setup signals
- Role-oriented navigation surfaces
- Student directory with search and add-student flow
- Attendance register with local persistence
- Results score grid with local autosave and grade calculation
- Finance overview with invoice and debtor data
- Communications preview
- AI Studio mock workflows with approval-oriented copy
- School branding settings
- Export and reset demo data controls

## Page paths and ownership

The original prototype uses one HTML shell with hash-based page paths. The new role entry points are standalone pages, with their own CSS and JavaScript files, and the ownership map is documented in [docs/page-structure.md](docs/page-structure.md).

The main runtime files currently have these responsibilities:

- `index.html`: shared application shell, navigation, modals, drawers, and overlays
- `styles.css`: design tokens, shared components, responsive layout, and page styles
- `app.js`: local state, hash routing, page renderers, and interactions

This is not production-ready for real children's records. Authentication, server-side authorization, multi-tenant isolation, payment webhooks, encrypted storage and real messaging must be implemented before pilot use.
