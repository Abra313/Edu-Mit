# Scholara - UI Foundation & Information Architecture Implementation Plan

## Task 1: Complete visual palette tokens & typography font coverage
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Add any missing CSS custom properties (Intelligence Teal, Success/Warning/Danger/Info, all Slate levels) to `:root`.
  - Remove duplicate inline hex usage where tokens suffice.
  - Load Source Serif 4 & JetBrains Mono via Google Fonts `<link>` in index.html.
  - Add CSS selectors that apply Source Serif 4 to `.report-card-preview` block text and JetBrains Mono to `.mono`, `.admission-no`, invoice IDs, and the existing admission number column.
  - Add `@media (prefers-reduced-motion: reduce)` block neutralizing transitions/animations.
  - Audit radii: ensure buttons/inputs use 6px, cards 12px, modals 16px.
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-6
- **Test Requirements**:
  - `rule` TR-1.1: 14+ unique color tokens defined in `:root` covering every blueprint color; CSS grep for un-tokenized hex returns only color inputs and seed data.
  - `rule` TR-1.2: index.html `<head>` loads Plus Jakarta Sans, Inter, Source Serif 4, JetBrains Mono (or Lora fallback). `.report-card-preview` applies Source Serif 4. Admission numbers/invoice IDs/IDs classes apply JetBrains Mono.
  - `rule` TR-1.3: A `@media (prefers-reduced-motion: reduce)` block sets `transition: none !important`, `animation: none !important` on `*`.
  - `rubric` TR-1.4: Radius discipline; scale 1-5; 1=inconsistent; 3=mostly correct; 5=buttons/inputs 6px, cards 12px, modals 16px exactly; threshold >= 4; evidence: search for `border-radius` values across [styles.css](file:///c:/Users/USER/Desktop/Edu-mit/styles.css).

## Task 2: Build missing shared components part A (buttons, inputs, skeletons, drawer, confirm dialog, combobox, date picker)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Add button variants: `ghost` (no bg, indigo text, hover wash) and `danger` (danger bg, white text) to CSS. Use them: ghost for "Cancel" in modals and danger for the "Reset demo data" action after confirmation.
  - Build a `<textarea>` demo form group and use it where longer text is expected (e.g. announcement composer or teacher remark in a modal).
  - Add a simulated combobox with filtered suggestions (e.g. class picker or student selector) implemented as a text input + suggestion popover.
  - Build a date picker widget: button + popover calendar grid with month navigation (no external lib). Demonstrate on Attendance or Reports page.
  - Create loading skeleton component (`.skeleton`, shimmer CSS) and display them briefly after navigation, then replace with real content.
  - Create a drawer component (slide-in side panel) for a "Record payment" action on Finance page — a `drawer-backdrop` + `<aside class="drawer">` with form and close buttons.
  - Create a type-to-confirm dialog: modal with a text input; the destructive submit button is disabled until the user types the required confirmation string exactly (e.g. `RESET` or the school slug). Wire it to the "Reset demo data" action.
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `rule` TR-2.1: `.button.ghost` and `.button.danger` classes exist and are each used at least once in rendered views.
  - `rule` TR-2.2: Combobox renders suggestions on focus/type; selecting one fills the input. Date picker opens on button click, shows a 6×7 grid, and writes a chosen date to a field.
  - `rule` TR-2.3: Drawer opens from right when clicking "Record payment" on Finance page; clicking backdrop/close hides it. Drawer has a form with 3+ fields.
  - `rule` TR-2.4: Type-to-confirm dialog: destructive button is disabled until typed string matches the required confirmation phrase. Reset demo data now opens this dialog instead of native `confirm()`.
  - `rule` TR-2.5: Loading skeletons appear for ~700ms after a view change before real content paints (demo mode; either flag-based or every navigation).
  - `rubric` TR-2.6: Component consistency with rest of system; scale 1-5; 1=jarring; 3=okay; 5=indistinguishable in style from existing components; threshold >= 4.

## Task 3: Build missing shared components part B (tabs/segmented, stepper polish, table extras, AI panel & approval, print helper)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - Add segmented control and tabs components. Host segmented control on Dashboard (e.g. Week/Term/Year selector) or Settings. Add tabs to Settings to switch between School profile / Academic rules / Finance rules / Modules sections.
  - Enhance setup stepper: keyboard-accessible steps, visible progress, aria-current.
  - Add data table extras: pagination demo (page size selector + clickable page numbers using `.pagination`), multi-row selection via checkboxes in a header column and per-row column, plus a bulk-actions bar (e.g. "Email selected parents" / "Mark selected as present"). Demonstrate on Students or Attendance table.
  - Build AI generation panel with: input area, subject picker, "Generate" button, status badges, and explicit approve / edit / discard actions. Wire it to the existing `generate-comment` / `generate-lesson` actions so that, after generating, the result appears in this panel with approve/edit/discard.
  - Ensure print layout wrapper: a `.print-layout` class wrapped around report cards that hides all chrome when printed (already partly covered by @media print — just add the class and verify it also hides the newly added drawer/confirm/AI panels).
- **Acceptance Criteria Addressed**: AC-3, NFR-1
- **Test Requirements**:
  - `rule` TR-3.1: Settings page has 4 tabs; clicking each switches the panel content below without leaving the route. Segmented control exists and toggles a filter on at least one view.
  - `rule` TR-3.2: Students table has checkbox selectors for each row + "Select all" header. A bulk-actions bar appears when rows are checked with at least one working action (toast is fine). Pagination controls exist and visually slice the rows (actual slice or just UI is acceptable as demo).
  - `rule` TR-3.3: AI Studio page renders an AI generation panel after clicking generate. The panel contains "Approve" / "Edit" / "Discard" buttons. Approve updates the generation status to "Approved by [name]" and shows a toast.
  - `rule` TR-3.4: When window.print() is triggered, the report card is the only visible content (drawers, modals, AI panels, drawers, bulk bars all hidden via @media print).
  - `rubric` TR-3.5: Visual polish vs. blueprint; scale 1-5; 1=rough; 3=usable; 5=pixel-conscious spacing and typography; threshold >= 4.

## Task 4: Implement student detail `/students/:id` route and expand information architecture fidelity
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Update the router to support subroutes like `#students/stu-1`. Split `window.location.hash.slice(1)` by `/`, detect `students` with an id, set a `currentStudentId` state, and render a new `renderStudentDetail` view.
  - Build `renderStudentDetail`: tabs (Profile / Attendance / Results / Guardians), stat cards for attendance/average/balance, timeline of events, guardian record table, a "Quick actions" bar (email parent, view report card, etc.).
  - Add clickable student rows in the Students table that navigate to `#students/<id>`. Add a "Back to directory" breadcrumb/button.
  - Ensure all other routes from section 5.1 (landing/pricing/register/setup/login) and section 5.3 (admin/*) are reachable via the command palette or navigation. Add admin routes to the role policy for "School owner" only so they appear in the nav when switched to Owner (still with the deferred-preview notice).
- **Acceptance Criteria Addressed**: AC-4, AC-5
- **Test Requirements**:
  - `rule` TR-4.1: URL `#students/stu-1` (and any valid student id from seed) opens the profile; clicking a student row in Students table navigates correctly.
  - `rule` TR-4.2: Student detail has 4 content tabs (Profile/Attendance/Results/Guardians), each with sample data. Attendance and Results show class-specific mini-tables.
  - `rule` TR-4.3: Back-to-directory returns to `#students`. Role policies still hide admin nav for non-owner roles; switching to Owner shows admin links.
  - `rule` TR-4.4: `routeNames` includes `student-detail` or the router handles `students/:id` paths without error. Console has 0 errors on any route navigation.
  - `rubric` TR-4.5: Layout density and narrative feel of student detail; scale 1-5; 1=sparse; 3=passable; 5=informative without overwhelming; threshold >= 4.

## Task 5: End-to-end verification pass — responsive, accessible, persistence, role smoke tests
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Tasks 2, 3, 4
- **Description**:
  - Run manual resize checks at 1440/1024/680/390 widths, fix any overflow/overlap.
  - Tab through all interactive elements on one page; verify visible focus ring on every focusable element.
  - Exercise each role in the role switcher and verify sidebar and destructive-action permissions behave per `rolePolicies`.
  - Add content to localStorage via some actions (add a student, save settings), then refresh and confirm data persists.
  - Run the prototype via `npx serve .` and confirm no 404s and no console errors across 10+ navigations.
- **Acceptance Criteria Addressed**: AC-5, AC-7, NFR-2, NFR-3
- **Test Requirements**:
  - `rule` TR-5.1: No console errors after navigation to: landing → pricing → register → login (as Teacher) → dashboard → students → student detail → attendance → results → finance → AI studio → settings → (as Owner) → admin/audit.
  - `rule` TR-5.2: Adding a student + saving settings and reloading the page keeps the new row and values in localStorage.
  - `rule` TR-5.3: Role switched to "Parent": sidebar shows only the allowed views; clicking "add-student" shows "Your role cannot create student records" toast.
  - `rubric` TR-5.4: Responsive quality; scale 1-5 per AC-7; threshold >= 4.
  - `rubric` TR-5.5: Focus and keyboard usability; scale 1-5; 1=mostly broken; 3=works; 5=every element reachable and focus ring clear; threshold >= 4.
