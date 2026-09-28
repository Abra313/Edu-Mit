# Edu-mit page structure

Edu-mit uses standalone role pages backed by Supabase Auth and database records. The role pages are intentionally independent so each role can grow without making the other dashboards carry unrelated markup or behavior.

## Role pages

| HTML page | Role | CSS | JavaScript |
| --- | --- | --- | --- |
| `login.html` | Role selection | `login.css` | `login.js` |
| `admin-signup.html` | Admin account creation | `admin-signup.css` | `admin-signup.js` |
| `admin.html` | Admin school operations | `admin.css` | `admin.js` |
| `teacher.html` | Teacher classes and results | `teacher.css` | `teacher.js` |
| `student.html` | Student learning day | `student.css` | `student.js` |

All role pages link back to `login.html` for sign out. `tenant-store.js` initializes the Supabase session and loads the role-scoped records used by each dashboard.

The Admin dashboard uses clean query routes instead of hash anchors: `admin.html?page=overview`, `admin.html?page=students`, `admin.html?page=teachers`, `admin.html?page=academics`, `admin.html?page=attendance`, `admin.html?page=examinations`, `admin.html?page=finance`, `admin.html?page=library`, `admin.html?page=payroll`, `admin.html?page=reports`, `admin.html?page=ai`, and `admin.html?page=subscription`. Related sub-tools are grouped in the fixed Admin sidebar and use the same `page` query convention.

School Settings and Subscription Plan persist to the `school_settings`, `schools`, and `school_subscriptions` tables.

## Authentication

Supabase Auth manages passwords and short-lived sessions. The database trigger creates school profiles on signup; the Auth role in the profile determines the destination dashboard. Teachers and students must match an existing school record before account creation.

## Current runtime paths

| URL hash | Page | JavaScript renderer | CSS scope |
| --- | --- | --- | --- |
| `#landing` or `/` | Marketing landing | `renderLanding()` | `.public-*` |
| `#pricing` | Pricing | `renderPricing()` | `.public-page`, `.pricing-*` |
| `#register` | School registration | `renderRegister()` | `.auth-*` |
| `login.html` | Role selection | `login.html` | `login.css`, `login.js` |
| `#provisioning` | Workspace provisioning | `renderProvisioning()` | `.provisioning-*` |
| `#dashboard` | Workspace overview | `renderDashboard()` | `.stat-*`, `.dashboard-*` |
| `#setup` | Setup wizard | `renderSetup()` | `.setup-*` |
| `#students` | Student directory | `renderStudents()` | `.table-*`, `.student-*` |
| `#students/:id` | Student profile | `renderStudentDetail()` | `.student-detail-*`, `.timeline-*` |
| `#staff` | Staff directory | `renderStaff()` | `.staff-*`, `.table-*` |
| `#academics` | Academic structure | `renderAcademics()` | `.academics-*`, `.tabs` |
| `#attendance` | Attendance register | `renderAttendance()` | `.attendance-*`, `.table-*` |
| `#results` | Results and scores | `renderResults()` | `.results-*`, `.score-*` |
| `#report-cards` | Report card preview | `renderReportCards()` | `.report-card-*`, `.print-layout` |
| `#finance` | Fees and payments | `renderFinance()` | `.finance-*`, `.drawer-*` |
| `#communications` | Announcements | `renderCommunications()` | `.communications-*` |
| `#ai` | AI Studio | `renderAi()` | `.ai-*` |
| `#reports` | Reports | `renderReports()` | `.reports-*` |
| `#settings` | School settings | `renderSettings()` | `.settings-*`, `.tabs` |
| `#admin-overview` | Platform overview | `renderAdminPreview('admin-overview')` | `.admin-preview-*` |
| `#admin-schools` | Platform schools | `renderAdminPreview('admin-schools')` | `.admin-preview-*` |
| `#admin-billing` | Platform billing | `renderAdminPreview('admin-billing')` | `.admin-preview-*` |
| `#admin-support` | Platform support | `renderAdminPreview('admin-support')` | `.admin-preview-*` |
| `#admin-flags` | Feature flags | `renderAdminPreview('admin-flags')` | `.admin-preview-*` |
| `#admin-audit` | Audit log | `renderAdminPreview('admin-audit')` | `.admin-preview-*` |

## File responsibilities

```text
index.html                 HTML shell and shared overlays
styles.css                 Shared tokens, shell, components, and page styles
app.js                     State, hash routing, renderers, and interactions
roadmap.mdx                Product scope and information architecture

future structure/
  pages/
    public/                 Landing, pricing, register, login
    workspace/              Dashboard and school operations pages
    admin/                  Platform administration pages
  styles/
    tokens.css              Design tokens and global reset
    shell.css               Sidebar, topbar, mobile navigation
    components.css          Buttons, tables, forms, panels, dialogs
    pages/
      public.css
      workspace.css
      admin.css
  scripts/
    app.js                  Bootstrap and route orchestration
    router.js               Hash parsing and route definitions
    state.js                localStorage state and persistence
    components/              Shared interactive UI bindings
    pages/
      public.js
      workspace.js
      admin.js
```

## Path convention

Use lowercase kebab-case for URL paths and renderer names that match the page concept:

- `/students` -> `renderStudents()`
- `/students/:id` -> `renderStudentDetail()`
- `/report-cards` -> `renderReportCards()`
- `/admin/feature-flags` -> `renderAdminPreview('admin-flags')` in the current hash prototype

When the prototype moves to a server-backed app, the hash paths can become normal browser paths without changing the page ownership model. The route definition should remain the source of truth, and page-specific CSS or JavaScript should only be added when a page has behavior that is not shared by another page.
