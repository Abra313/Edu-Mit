# Scholara - Role-based UI (roadmap Section 6) - Product Requirements Document

## Overview
- **Summary**: Make the prototype navigation, visible quick actions, landing views, command palette, dashboard hero and 4-card quick-action grid reflect each of the 7 prototype roles (Owner/Principal/School admin/Bursar/Teacher/Parent/Student) exactly as prescribed by the roadmap table in `roadmap.mdx#L155-163`. Introduce 3 new routes that appear in the roadmap but are currently missing: `#today` (Teacher landing), `#timetable` (Student), `#assignments` (Student). Ensure permission key names continue following the server-model naming convention (`students.read`, `attendance.mark`, `results.enter`, `results.approve`, `results.publish`, `fees.invoice.create` etc).
- **Purpose**: Demonstrate role-tailored UX to evaluators without needing a backend — the role switcher must *visibly* change the product experience in the sidebar, dashboard hero, first-actions grid, landing view after role-switch, and command palette quick-nav suggestions.
- **Target Users**: Demo evaluators (switching roles in the prototype) and browser reviewers verifying role separation.

## Goals
- G1. Sidebar nav order + visible items match the "Primary UI" column in the roadmap table for each role; items NOT listed in a role's Primary UI are still accessible if the role has `*.read` permission (not hidden) but sink to the bottom under a "More" nav-label section.
- G2. Immediately after roleSwitcher change → land on that role's FIRST Primary UI view (not always Dashboard). E.g. switching to Bursar lands on `#finance`; switching to Teacher lands on `#today`.
- G3. Dashboard hero CTA button + the 4-card "What next" quick-action grid below the chart-panel match the roadmap "First actions" column wording for each role.
- G4. `#today` (Teacher-only), `#timetable` (Student+Teacher+Parent), `#assignments` (Student+Teacher+Parent) new views render correctly with skeleton wrapper, role-visible actions, and breadcrumb/nav active-state.
- G5. Permission names already in `rolePolicies[*].permissions` stay compliant with the future server model (`<scope>.<action>` form, no ad-hoc spellings). Add only the minimal missing permissions needed by the new views: `today.read`, `timetable.read`, `assignments.read`, `debtors.read`, `invoices.read`, `payments.read`.

## Non-Goals
- NG1. No role-based row-level data filtering (e.g. Parent only sees their own children's data). Data stays tenant-wide; only navigation/views/actions are role-tailored.
- NG2. No server RLS, impersonation, 2FA or audit logging (same as Section 5 admin-deferred scope).
- NG3. No new shared components; Section 4 components (drawer/confirm/tabs/segmented/datepicker/combobox/pagination/bulk-bar/ai-panel/skeleton) are reused only.
- NG4. No print styles changes; existing `@media print` block is left untouched.

## Background & Context
- Prior work `roadmap-ui-ia` delivered Section 4 (palette/tokens/typography/16 shared components) and Section 5 (IA routes incl `/students/:id` and 6 `/admin/*`). This spec is Section 6 of the same contiguous roadmap slice and must preserve *all* behaviour from that prior completed work.
- Existing artefacts: `app.js` routeNames, rolePolicies views/permissions objects, renderDashboard (has quick-actions 4-card grid and roleAction button), roleSwitcher combobox in `index.html:L43` with 7 options, `bindViewActions` has a `switch-role` case. `applyRoleNavigation` hides nav items whose `item.dataset.view ∉ rolePolicies[role].views`.
- Current gaps (verifiable by grepping `app.js`):
  1. No `renderToday`, route `today` missing from routeNames.
  2. No `renderTimetable`, route `timetable` missing from routeNames.
  3. No `renderAssignments`, route `assignments` missing from routeNames.
  4. Sidebar order is ONE static HTML list in index.html; identical order for all roles regardless of Primary UI priority.
  5. Dashboard role-based hero + quick-actions 4-card grid uses `hasPermission()` for visibility but the CTA button text + 4-card wording doesn't match roadmap "First actions" table strings for Teacher, Bursar, or Student.
  6. Role-switch change handler re-renders but does NOT navigate to role's first Primary UI view; always remains on current hash.

## Functional Requirements
- **FR-1 (Sidebar ordering)**: `applyRoleNavigation` must do more than just `.hidden=true/false`. It must re-group sidebar children into *two* `<div class="nav-label">`-separated sections: (1) "Primary" = roadmap "Primary UI" in EXACT roadmap order; (2) "More workspace" = everything else in `rolePolicies[role].views` that isn't in Primary UI, in stable alphanumeric sort. Items NOT in `rolePolicies[role].views` remain hidden.
- **FR-2 (Landing view on role switch)**: `switch-role` handler (after set role + saveState) → `window.location.hash = firstPrimaryView[role]` using the roadmap table first column view:
  - Owner → `dashboard`; Principal → `dashboard`; School admin → `students`; Bursar → `finance`; Teacher → `today`; Parent → `dashboard`; Student → `timetable`.
- **FR-3 (Dashboard Hero role copy)**: Overhaul the renderDashboard `dashboardCopy[i]` arrays + `roleAction` button text/action so each role has unique heading/subtitle/CTA text = roadmap "First actions" column sentence case:
  - Owner: "Review revenue, enrolment and outstanding fees" → button "Review finances" (existing, keep)
  - Principal: "Review attendance and approve results" → button "Approve results" (navigate #results)
  - School admin: "Maintain records and school setup" → button "Continue setup" (navigate #setup)
  - Bursar: "Record payment and follow up debt" → button "Record payment" (open drawer)
  - Teacher: "Mark a class and enter scores" → button "Mark attendance" (navigate #attendance)
  - Parent: "Check progress and view fee balance" → button "View fees" (navigate #finance)
  - Student: "View work and results" → button "See timetable" (navigate #timetable)
- **FR-4 (Dashboard 4-card quick-action grid role-tailored)**: The 4 cards after the `Today at a glance` panel in `renderDashboard` now use role-aware content (not permission-gated). For each role exactly 4 cards matching first-actions theme:
  - Teacher Primary 4 cards: Today's classes (#today), Mark attendance (#attendance), Enter results (#results), Draft lesson plan (#ai)
  - Bursar Primary 4 cards: Record payment (drawer), Invoices (#finance), Recent payments (anchor), Debtors list (#finance)
  - Parent Primary 4 cards: Latest results (#results), Attendance (#attendance), Fee balance (#finance), Contact school (#communications)
  - Student Primary 4 cards: Timetable (#timetable), Assignments (#assignments), Latest results (#results), Announcements (#communications)
  - Admin, Principal, Owner continue existing cards or tweak wording to match "First actions".
- **FR-5 (New view `#today`)**: Renderer `renderToday` Teacher-visible default, with: (a) 3-slot "Today's classes" cards with subj/time/room/teacher-avatar + "Mark register" button navigates to #attendance; (b) pending score-entry list (5 classes, link to #results); (c) recent AI drafts quick-list (from `state.aiGenerations`); (d) timetable reference button. Permission `today.read`.
- **FR-6 (New view `#timetable`)**: Week × 5-day Mon–Fri grid with 6 period rows. Mon–Fri period cells pre-seeded for 9A, 10A classes. Nav "Timetable" is in Teacher/Parent/Student More section. Permission `timetable.read`.
- **FR-7 (New view `#assignments`)**: Homework/assignment listing table with Subject/Title/Set date/Due date/Status (Open/Due soon/Overdue). Filters by student/class via segmented on top. Permission `assignments.read`.
- **FR-8 (Role tailoring of 3 new views)**: `#today` ONLY Teacher role has in Primary; other roles can navigate via URL but show empty state "This view is tailored for Teachers". `#timetable` Student sees their own class timetable; Teacher sees all classes. `#assignments` Student sees assignments due for them. No row-level filtering in this prototype (NG1) — visuals only differ by static tables/tab counts.
- **FR-9 (Command palette + breadcrumb)**: Command palette navigate list (FR of previous spec `roadmap-ui-ia`) now ranks role's Primary UI items FIRST in the filtered list; new routes today/timetable/assignments appear only when role has the matching `*.read` permission. Breadcrumb crumbMap extended with today/timetable/assignments entries.
- **FR-10 (Permission naming)**: Audit every permission in rolePolicies vs `<scope>.<action>` server-model form. Rename any violations (none expected) and add only these 6 new ones (sparingly): `today.read`, `timetable.read`, `assignments.read`, `invoices.read`, `payments.read`, `debtors.read` — assign them to the roles that see the corresponding Primary UI section per roadmap.

## Non-Functional Requirements
- **NFR-1**: Role switcher interaction must be < 2 visual re-renders per change. No jank on the skeleton wrapper when changing role.
- **NFR-2**: Hashchange / parseHash flow preserved (all 3 new route strings added to routeNames array so existing includes() checks continue).
- **NFR-3**: localStorage schema stays `scholara:data:v1` / `scholara:session:v1` only. No new top-level keys; any new state arrays nest under `state.today`, `state.timetable`, `state.assignments`.
- **NFR-4**: Existing Section 4/5 CSS not broken. Any new CSS for timetable grid / assignment list MUST use existing tokens only (no new colors/fonts without root-level tokens).
- **NFR-5**: Browser smoke-tests must pass 0 console errors after EVERY role switch followed by clicking into the Primary first view for that role.
- **NFR-6**: All 3 new views work with the skeleton wrapper.

## Constraints
- **Technical**: Vanilla HTML/CSS/JS only, 0 npm deps, npx serve . runs it. localStorage persistence only. No History API pushState beyond existing replaceState. Breakpoints ≤1050 tablet / ≤720 mobile preserved. Role switcher is still the <select> combobox (no drag/pick component rebuild).
- **Business**: All 7 roles MUST have a visibly different dashboard hero headline + quick-action grid after role-switch. Demo evaluators should be able to flip roles once and immediately perceive the UX difference without navigation.
- **Dependencies**: Builds on completed prior Spec `roadmap-ui-ia` artifacts (palette, 16 components, 25 routes, student-detail subroute, admin 6 routes, confirm dialog / drawer / datepicker / combobox wiring). All those behaviours must remain passing when this spec lands.

## Assumptions
- A1. "More workspace" nav section is acceptable UX sink for items outside roadmap Primary UI. Evaluators won't require exact alphabetical sort; stable grouping is enough.
- A2. Teacher `#today` landing view doesn't need real class-session data (local 3 hardcoded cards is prototype-grade, same pattern as `state.students` seed).
- A3. Timetable grid Mon–Fri × 6 periods has static 30 cells; no drag-drop rescheduling in prototype (non-goal NG3).
- A4. Assignment status (Open/Due soon/Overdue) is purely visual static badges; no auto-computation of "today" date vs due-date (avoids date drift bugs).
- A5. Roadmap "Invoices, payments, debtors" for Bursar are three distinct action *shortcuts* within the single `#finance` view (no separate #invoices/#payments/#debtors routes — this aligns with Section 5 IA which only lists `finance` under school-app routes; the 3 labels are sub-navigation shortcuts within finance page OR the 4 dashboard card quick-actions grid entries).

## Acceptance Criteria

### AC-1: Role Primary UI sidebar ordering
- **Type**: `rule`
- **Given**: Prototype is running with any active role
- **When**: `applyRoleNavigation()` runs after render()
- **Then**: Sidebar `nav-list` has exactly TWO non-adjacent `<div class="nav-label">` dividers: first divider text is "Primary navigation" (contains exactly roadmap Primary UI items in EXACT roadmap order for that role), second divider text is "More workspace" (contains remaining views the role can see, sorted alphabetically)
- **Pass Condition**: For ALL 7 roles, DOM order of sidebar `.nav-item` primary block matches the roadmap Primary UI column. Manual DOM snapshot from browser evaluate for each role produces a list where the first N items === roadmap list.
- **Evidence**: `browser_evaluate()` script that switches role, calls applyRoleNavigation, snapshots primary item dataset.view array and compares deep-equal to a hardcoded expectation map; boolean.

### AC-2: Role-switch navigates to first Primary view
- **Type**: `rule`
- **Given**: Current location is any route
- **When**: User picks role X via the role switcher `<select>` change event fires
- **Then**: `window.location.hash` becomes `#${firstPrimaryView[X]}` (per FR-2 mapping)
- **Pass Condition**: Browser script: start at #settings; switch to Bursar → hash === #finance; switch to Teacher → hash === #today; switch to Admin → hash === #students; switch to Student → hash === #timetable. All 4 transitions pass.
- **Evidence**: browser_evaluate step-script with hashes captured before/after roleSwitcher.dispatchEvent(change).

### AC-3: Dashboard role-first-actions hero + 4-card grid wording per role
- **Type**: `rubric`
- **Dimension**: Role-tailored hero + 4-card grid fidelity to roadmap "First actions"
- **Scale**: 1-5
- **Anchors**: 1 = dashboard unchanged for any role; 3 = hero CTA differs per role but 4-card grid stays permission-based generic; 5 = role EITHER has its role-specific hero headline text + CTA button AND its role-tailored 4-card quick-action grid (6 roles must differ visibly from Owner baseline; identical grid across 2+ roles deducts points).
- **Pass Threshold**: >= 4
- **Evidence**: Snapshot textContent of hero h1 + button + 4 card h3 + button for Owner/Principal/Admin/Bursar/Teacher/Parent/Student; count DISTINCT tuples. >5 distinct = 5; 5 = 4; 4 = 3; etc.

### AC-4: New views #today / #timetable / #assignments render correctly
- **Type**: `rule`
- **Given**: Server running
- **When**: Navigate via location.hash = "#today" as Teacher; "#timetable" as Student; "#assignments" as Student
- **Then**: All 3 views render with skeleton content first (650ms), then real content with breadcrumb updated, nav active-state highlighted, and 0 console errors. Each view contains its distinguishing structural element (today: 3 classes cards grid; timetable: 5×6=30 cells; assignments: data-table with 4+ rows).
- **Pass Condition**: Each view present a unique structural element after skeleton resolves. No JS errors in console across navigation + render of each.
- **Evidence**: browser_evaluate hash set, wait SKELETON_MS + 100, check for distinguishing classes, console messages count === 0.

### AC-5: Permission `<scope>.<action>` naming compliance
- **Type**: `rule`
- **Given**: rolePolicies permissions arrays across all 7 roles
- **When**: A script joins all permissions and runs regex /^[a-z.-]+\.[a-z.-]+$/ on every string, plus checks that at least the 6 roadmap-listed permissions (students.read/create, attendance.mark, results.enter/approve/publish, fees.invoice.create) are each assigned to at least one role.
- **Then**: Every single permission string matches the regex. No rogue strings like "resetData" or "admin" without a dot separator. AND 6+ expected roadmap permissions are present AND assigned.
- **Pass Condition**: 100% permission strings match regex + 6 required keys exist each with ≥1 assignee.
- **Evidence**: Node string parse (grep app.js for permissions arrays) or browser_evaluate JSON.stringify rolePolicies + regex test.

### AC-6: Command palette role-tailored ranking
- **Type**: `rule`
- **Given**: Role = Teacher, opened command palette with empty query
- **When**: renderCommandResults('') populates #commandResults
- **Then**: First 4 visible .command-item <strong> labels EXACTLY match order ["Open overview", "Open today", "Mark attendance", "Enter results"] (Teacher's Primary UI).
- **Pass Condition**: First 4 items' text match for Teacher case. Optionally verify Bursar: ["Open finance", "Record payment", "Invoices", "Payments"] — if not implemented it's a small deduction but Teacher case is required.
- **Evidence**: browser_evaluate switches role Teacher, openCommandPalette(''), reads first 4 items, compares.

## Open Questions
- [ ] Q1. Assumption A5 confirmed? "Invoices/payments/debtors" for Bursar are dashboard shortcuts WITHIN #finance (not 3 separate routes). If separate routes wanted, FR-10 new permissions `invoices.read payments.read debtors.read` still work; routeNames needs 3 additions. → DEFAULT: Treat as shortcuts (single #finance route) per Section 5 IA.
- [ ] Q2. Is 4-card quick-action grid order important vs content-only? DEFAULT: Content only (all 4 visible, correct titles/actions) is enough.
- [ ] Q3. "Child dashboard" for Parent: roadmap lists it as Parent Primary UI first item. Current we re-use the regular #dashboard with role-tailored hero. Is a separate #child-dashboard route required? DEFAULT: No — role-tailored dashboard hero (FR-3/FR-4) is sufficient "child dashboard" semantics for prototype demo.
