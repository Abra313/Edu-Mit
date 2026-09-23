# Scholara - UI Foundation & Information Architecture Spec

## Overview
- **Summary**: Implement the remaining UI foundation components and information architecture routes defined in roadmap.mdx sections 4 and 5. Complete the visual system, typography coverage, shared component library, and all route pages to form a cohesive prototype.
- **Purpose**: Deliver a locally runnable prototype where every page and component specified in the blueprint is available, visually consistent, and navigable via hash-based routing.
- **Target Users**: Product reviewers, design stakeholders, and prototype testers exploring the Scholara school management workspace.

## Goals
- Complete the Scholara visual palette with accessible color tokens and semantic usage.
- Ensure every required font (Plus Jakarta Sans, Inter, Source Serif 4, JetBrains Mono) is loaded and applied to the correct elements.
- Ship all 20+ shared components listed in the blueprint with demo usage where appropriate.
- Implement every route from the information architecture section with a functional page.
- Keep full role-scoped navigation and permission enforcement working for 7 roles.

## Non-Goals
- Backend authentication, real multi-tenant data isolation, or 2FA (explicitly deferred; admin pages remain security-preview placeholders).
- Live payment processing, real email/SMS delivery, or external API integrations.
- Persistent cross-device storage beyond localStorage (the prototype remains browser-local).
- Production-grade build tooling or a framework rewrite; stay dependency-free.

## Background & Context
The repository is a plain HTML/CSS/JS prototype at `c:\Users\USER\Desktop\Edu-mit` served by `npx serve .`.
- `index.html` provides the app shell, sidebar, topbar, mobile nav, toast, command palette, modal, and notification panel markup.
- `styles.css` declares CSS variables for the Scholara palette plus layout components.
- `app.js` holds a `seedState`, route renderer lookup, event binding, localStorage persistence, and hash-based routing.
Current gaps (from code inspection) include: Source Serif 4 and JetBrains Mono fonts not linked; ghost and danger buttons; date pickers and comboboxes; loading skeletons; drawer; segmented controls/tabs; type-to-confirm dialog; AI generation panel and approval controls; student profile detail route (`/students/:id`); richer admin route previews; reduced-motion toggle; and spacing/radius discipline.

## Functional Requirements
- **FR-1**: Every CSS color token from the blueprint has an equivalent variable and is used by components, not hard-coded hex values.
- **FR-2**: The four required font families are loaded via Google Fonts and applied: headings → Plus Jakarta Sans, body/tables → Inter, report cards → Source Serif 4 or Lora, IDs → JetBrains Mono.
- **FR-3**: All 16+ shared component types from the blueprint are represented with at least one demo occurrence across the views (app shell, navs, topbar, breadcrumbs, buttons of all variants, inputs/selects/combobox/date/textarea, data table, status badge/avatar/empty/loading/toast, stat card/chart/progress, drawer/modal/confirm, stepper, tabs, print, AI badge/panel/approval, command palette).
- **FR-4**: Every route in sections 5.1, 5.2, 5.3 of the blueprint resolves via hash routing and renders a page. `/students/:id` opens a student profile detail.
- **FR-5**: Role-based access control hides unauthorized sidebar items and gates destructive actions for all 7 roles.
- **FR-6**: Reduced motion preferences are respected via CSS media query.
- **FR-7**: `localStorage` state survives navigation and every save action shows a toast confirmation.

## Non-Functional Requirements
- **NFR-1 (Visual coherence)**: Component radii, spacing, and font choices match the blueprint scales exactly (buttons 6px, cards 12px, modals 16px; spacing 4/8/12/16/24/32/48/64 px; motion 150ms micro, 250ms panels).
- **NFR-2 (Accessibility)**: Focus-visible outlines; interactive elements use native buttons/links with labels; color contrast for normal text is AA where possible.
- **NFR-3 (Responsive)**: Desktop, tablet (≤1050px) and mobile (≤720px) layouts remain usable with no horizontal scroll.
- **NFR-4 (Maintainability)**: No framework; keep vanilla JS, avoid new npm dependencies.
- **NFR-5 (Performance)**: All views render in a single `innerHTML` paint and interactions feel instant on a typical laptop.

## Constraints
- **Technical**: Stay dependency-free. No build step. Data persists exclusively in `localStorage` keys `scholara:data:v1` and `scholara:session:v1`.
- **Business**: Admin surfaces (`/admin/*`) remain preview-only and must surface a security notice. No production claims.
- **Dependencies**: Fonts from `fonts.googleapis.com`; the prototype must work without them falling back sensibly.

## Assumptions
- The demo tenant  stays as the seeded data; `/students/:id` will view the first student and allow switching via the URL hash or from the students table.
- Combobox, date picker, and drawer components are simulated with accessible HTML + JS (no native `<input type=date>` styling dependency).
- Type-to-confirm dialogs require the user to type the school name (or a short code) before the destructive button activates.
- Tabs and segmented controls are demonstrated on the Students, Results, or Settings page.
- Loading skeletons are shown for 700ms after navigation as a content preview option (opt-in demo).

## Acceptance Criteria

### AC-1: Palette tokens applied globally
- **Type**: `rule`
- **Given**: The prototype renders the dashboard view
- **When**: The stylesheet is inspected
- **Then**: Every blueprint color (Midnight Indigo, Scholara Indigo, Indigo Wash, Achievement Amber, Intelligence Teal, Slate 900/600/200/50, Success/Warning/Danger/Info) exists as a CSS custom property and no UI element uses an inline hex that duplicates a token
- **Pass Condition**: 14 unique color tokens defined in `:root`; grep for `#[0-9a-fA-F]{6}` outside `:root` returns only the `<input type=color>` defaults or seed data
- **Evidence**: Manual inspection of [styles.css](file:///c:/Users/USER/Desktop/Edu-mit/styles.css) `:root` block + source scan

### AC-2: Font families loaded and applied correctly
- **Type**: `rule`
- **Given**: The index.html `<head>` and rendered views
- **When**: Source Serif 4 and JetBrains Mono links exist and elements use them
- **Then**: Headings use Plus Jakarta Sans; body/tables use Inter; report cards use Source Serif 4 (or Lora fallback); admission numbers use JetBrains Mono
- **Pass Condition**: `<head>` links all four font families; report-card-preview sets `font-family: 'Source Serif 4', Georgia, serif`; `.data-table td` for admissionNo columns uses JetBrains Mono
- **Evidence**: Font links in [index.html](file:///c:/Users/USER/Desktop/Edu-mit/index.html) and selectors in [styles.css](file:///c:/Users/USER/Desktop/Edu-mit/styles.css)

### AC-3: Shared components present with demo usage
- **Type**: `rubric`
- **Dimension**: Coverage + fidelity of shared components against the blueprint checklist
- **Scale**: 1-5
- **Anchors**: 1 = fewer than half of components present, low visual fidelity; 3 = 80% of components present with basic style; 5 = every component listed renders somewhere, styled consistently with the rest of the system
- **Pass Threshold**: >= 4
- **Evidence**: Walkthrough across all views confirms each of: ghost/danger button variants, combobox, date picker, textarea, table filters + pagination demo, loading skeleton, drawer, type-to-confirm dialog, stepper, tabs/segmented controls, print wrapper demo, AI panel + approval controls

### AC-4: Every IA route renders a page
- **Type**: `rule`
- **Given**: The router `routeNames` list and render() dispatcher
- **When**: A user navigates to each hash route
- **Then**: All routes from sections 5.1, 5.2, 5.3 resolve; no white-screen or JS errors. `/students/stu-1` opens a student detail profile
- **Pass Condition**: Every route in the blueprint section appears in `routeNames`; `views` object has a renderer for each; navigating to `#students/stu-1` produces a profile page
- **Evidence**: Code inspection of route lookup in [app.js](file:///c:/Users/USER/Desktop/Edu-mit/app.js) and manual navigation smoke test

### AC-5: Role enforcement works for all 7 roles
- **Type**: `rule`
- **Given**: The role switcher on the topbar
- **When**: Role is switched to Teacher or Parent
- **Then**: Navigation items not in that role's policy are hidden; `add-student` and `approve-result` actions either show a permission toast or are absent
- **Pass Condition**: `applyRoleNavigation()` hides the right items; `handleAction()` rejects unauthorized destructive actions with a toast
- **Evidence**: Role policies and permission guard code paths in [app.js](file:///c:/Users/USER/Desktop/Edu-mit/app.js)

### AC-6: Reduced-motion preference respected
- **Type**: `rule`
- **Given**: A user with `prefers-reduced-motion: reduce` enabled
- **When**: Any transition plays
- **Then**: CSS transitions and transforms are disabled or reduced to 0ms; spinner animation respects the preference
- **Pass Condition**: At least one `@media (prefers-reduced-motion: reduce)` block exists that overrides `transition` and `animation` to `none` or `0ms`
- **Evidence**: Block in [styles.css](file:///c:/Users/USER/Desktop/Edu-mit/styles.css)

### AC-7: Responsive breakpoints preserve functionality
- **Type**: `rubric`
- **Dimension**: Layout behavior at desktop, tablet, and mobile widths
- **Scale**: 1-5
- **Anchors**: 1 = layout breaks with scroll or overlap at one breakpoint; 3 = layout usable but cramped at small widths; 5 = clean grid collapse, mobile nav visible, no overlap on any tested width
- **Pass Threshold**: >= 4
- **Evidence**: Resize smoke test checks 1440px, 1024px, 680px, 390px widths

## Open Questions
- [ ] Should student detail routes use `#students/stu-1` (path-like) or `#student-detail&id=stu-1` (query-like)? → Assumed path-like; adjust easily in the router.
- [ ] Do we want actual pagination controls (clicks that recompute slice) or visual-only pagination demo? → Assumed visual-only with a demo page slice.
- [ ] Which view should host the segmented-control/tabs demo? → Assumed Settings page (Academic rules / Finance rules / Modules tabs).
