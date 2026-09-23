const STORAGE_KEY = 'scholara:data:v1';
const SESSION_KEY = 'scholara:session:v1';

const seedState = {
  version: 1,
  tenant: { name: '', slug: 'greenfield', logoUrl: '', brandPrimary: '#4338CA', country: 'Nigeria', currency: 'NGN', currentSession: '2026/27', currentTerm: 'Term 1', setupProgress: 72 },
  currentUser: { name: 'Amara Okafor', role: 'School owner' },
  setup: { completed: ['identity', 'calendar', 'structure'], current: 'assessment', provisioning: false, assessment: { ca1: 20, assignment: 10, exam: 70, passMark: 50, scale: 'A-F' } },
  staff: [
    { id: 'staff-1', name: 'Amara Okafor', role: 'School owner', subjects: 'All areas', status: 'Active', initials: 'AO' },
    { id: 'staff-2', name: 'Miriam Bello', role: 'Principal', subjects: 'Academic oversight', status: 'Active', initials: 'MB' },
    { id: 'staff-3', name: 'David Eze', role: 'Teacher', subjects: 'Mathematics · JSS 2A', status: 'Active', initials: 'DE' },
    { id: 'staff-4', name: 'Ngozi Adebayo', role: 'Bursar', subjects: 'Finance', status: 'Invite pending', initials: 'NA' }
  ],
  academics: { sessions: ['2026/27'], terms: ['Term 1', 'Term 2', 'Term 3'], classes: ['JSS 2A', 'Primary 5', 'SS 1B', 'Primary 3'], subjects: ['Mathematics', 'English Language', 'Basic Science', 'Social Studies'] },
  students: [
    { id: 'stu-1', firstName: 'Maya', lastName: 'Adeyemi', admissionNo: 'GFA/2026/0147', className: 'JSS 2A', guardian: 'Tunde Adeyemi', status: 'Active', attendance: 96, initials: 'MA' },
    { id: 'stu-2', firstName: 'Daniel', lastName: 'Okoro', admissionNo: 'GFA/2026/0148', className: 'JSS 2A', guardian: 'Chioma Okoro', status: 'Active', attendance: 91, initials: 'DO' },
    { id: 'stu-3', firstName: 'Zainab', lastName: 'Bello', admissionNo: 'GFA/2026/0149', className: 'Primary 5', guardian: 'Amina Bello', status: 'Active', attendance: 98, initials: 'ZB' },
    { id: 'stu-4', firstName: 'Noah', lastName: 'Williams', admissionNo: 'GFA/2026/0150', className: 'SS 1B', guardian: 'Sarah Williams', status: 'Active', attendance: 88, initials: 'NW' },
    { id: 'stu-5', firstName: 'Adaeze', lastName: 'Nwosu', admissionNo: 'GFA/2026/0151', className: 'Primary 3', guardian: 'Emeka Nwosu', status: 'Active', attendance: 94, initials: 'AN' }
  ],
  attendance: { date: '2026-09-17', className: 'JSS 2A', marked: 35, total: 38, exceptions: ['Daniel Okoro', 'Noah Williams', 'Aisha Musa'] },
  invoices: [
    { id: 'INV-1038', student: 'Maya Adeyemi', className: 'JSS 2A', amount: 185000, paid: 185000, status: 'Paid', date: 'Sep 16, 2026' },
    { id: 'INV-1039', student: 'Daniel Okoro', className: 'JSS 2A', amount: 185000, paid: 100000, status: 'Part-paid', date: 'Sep 15, 2026' },
    { id: 'INV-1040', student: 'Noah Williams', className: 'SS 1B', amount: 220000, paid: 0, status: 'Unpaid', date: 'Sep 14, 2026' }
  ],
  announcements: [
    { id: 'ann-1', title: 'Mid-term assessment timetable', audience: 'All parents', date: 'Today', status: 'Published' },
    { id: 'ann-2', title: 'PTA welcome meeting', audience: 'Parents · JSS 2A', date: 'Yesterday', status: 'Published' }
  ],
  scores: { 'Maya Adeyemi': 82, 'Daniel Okoro': 74, 'Zainab Bello': 91, 'Noah Williams': 68 },
  aiGenerations: [],
  notifications: [
    { id: 'note-1', title: 'JSS 2A results need approval', detail: 'Submitted by David Eze · 38 min ago', unread: true },
    { id: 'note-2', title: '3 attendance exceptions', detail: 'Parents can be notified after review · Today', unread: true },
    { id: 'note-3', title: 'Payment reconciled', detail: 'Maya Adeyemi · ₦185,000 · Today', unread: false }
  ]
};

let state = loadState();
const routeNames = ['landing', 'pricing', 'register', 'provisioning', 'dashboard', 'setup', 'students', 'student-detail', 'staff', 'academics', 'attendance', 'results', 'report-cards', 'finance', 'communications', 'ai', 'reports', 'settings', 'admin-overview', 'admin-schools', 'admin-billing', 'admin-support', 'admin-flags', 'admin-audit'];
const rolePolicies = {
  'School owner': { views: ['dashboard', 'setup', 'students', 'staff', 'academics', 'attendance', 'results', 'report-cards', 'finance', 'communications', 'reports', 'ai', 'settings', 'admin-overview', 'admin-schools', 'admin-billing', 'admin-support', 'admin-flags', 'admin-audit'], permissions: ['students.read', 'students.create', 'attendance.mark', 'results.enter', 'results.approve', 'results.publish', 'fees.invoice.create', 'fees.payment.record', 'staff.manage', 'settings.manage', 'reports.read', 'admin.access', 'data.reset'] },
  Principal: { views: ['dashboard', 'students', 'staff', 'academics', 'attendance', 'results', 'report-cards', 'communications', 'reports', 'ai'], permissions: ['students.read', 'attendance.mark', 'results.enter', 'results.approve', 'results.publish', 'staff.read', 'reports.read', 'ai.generate'] },
  'School admin': { views: ['dashboard', 'setup', 'students', 'staff', 'academics', 'attendance', 'results', 'report-cards', 'communications', 'reports', 'settings'], permissions: ['students.read', 'students.create', 'attendance.mark', 'results.enter', 'results.publish', 'staff.manage', 'settings.manage', 'reports.read'] },
  Bursar: { views: ['dashboard', 'students', 'finance', 'communications', 'reports', 'settings'], permissions: ['students.read', 'fees.invoice.create', 'fees.payment.record', 'reports.read'] },
  Teacher: { views: ['dashboard', 'attendance', 'results', 'report-cards', 'communications', 'ai'], permissions: ['attendance.mark', 'results.enter', 'results.read', 'ai.generate'] },
  Parent: { views: ['dashboard', 'attendance', 'results', 'report-cards', 'finance', 'communications'], permissions: ['results.read', 'attendance.read', 'fees.read', 'communications.read'] },
  Student: { views: ['dashboard', 'attendance', 'results', 'report-cards', 'communications'], permissions: ['results.read', 'attendance.read', 'communications.read'] }
};
let session = loadSession();
let currentView = 'dashboard';
let currentStudentId = null;
let settingsTab = 'profile';
let studentDetailTab = 'profile';
let dashboardSegmented = 'term';
let studentsPage = 1;
const STUDENTS_PAGE_SIZE = 10;
let confirmCallback = null;
let paymentDateState = { year: 2026, month: 8, selected: new Date(2026, 8, 17) };
let datePickerBindings = [];
const SKELETON_MS = 650;

function parseHash() {
  const raw = window.location.hash.slice(1);
  const parts = raw.split('/');
  currentStudentId = null;
  if (!session && !['landing', 'pricing', 'register'].includes(parts[0])) {
    window.location.replace('login.html');
    return;
  }
  if (parts[0] === 'students' && parts[1]) {
    currentView = 'student-detail';
    currentStudentId = parts[1];
  } else if (routeNames.includes(parts[0] || 'dashboard')) {
    currentView = parts[0] || 'dashboard';
  } else {
    currentView = 'dashboard';
  }
}
parseHash();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(seedState);
    const stored = JSON.parse(saved);
    return {
      ...structuredClone(seedState),
      ...stored,
      tenant: { ...seedState.tenant, ...(stored.tenant || {}) },
      currentUser: { ...seedState.currentUser, ...(stored.currentUser || {}) },
      setup: { ...seedState.setup, ...(stored.setup || {}), assessment: { ...seedState.setup.assessment, ...((stored.setup || {}).assessment || {}) } },
      academics: { ...seedState.academics, ...(stored.academics || {}) },
      notifications: stored.notifications || structuredClone(seedState.notifications),
      staff: stored.staff || structuredClone(seedState.staff)
    };
  } catch (error) {
    return structuredClone(seedState);
  }
}

function loadSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (!saved || !rolePolicies[saved.role]) return null;
    return { role: saved.role };
  } catch (error) {
    return null;
  }
}

function saveSession(role) {
  session = { role };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  session = null;
  localStorage.removeItem(SESSION_KEY);
}

function saveState(message) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (message) showToast(message);
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

function skeletonMarkup(kind = 'page') {
  if (kind === 'table') {
    return `<section class="panel"><div style="margin-bottom:16px"><div class="skeleton title"></div><div class="skeleton text" style="width:50%"></div></div>${Array.from({ length: 5 }).map(() => `<div style="display:grid;grid-template-columns:40px 1fr 1fr 120px;gap:14px;padding:12px 0;border-bottom:1px solid var(--slate-200)"><div class="skeleton avatar"></div><div><div class="skeleton text" style="width:60%;margin-bottom:8px"></div><div class="skeleton text" style="width:38%;height:10px"></div></div><div class="skeleton text" style="width:52%"></div><div class="skeleton text" style="width:68%"></div></div>`).join('')}</section>`;
  }
  return `<div style="margin-bottom:22px"><div class="skeleton title" style="width:30%"></div><div class="skeleton text" style="width:58%;height:10px"></div></div><div class="stat-grid">${Array.from({ length: 4 }).map(() => `<article class="stat-card"><div class="skeleton text" style="width:45%;height:11px;margin-bottom:18px"></div><div class="skeleton text" style="width:70%;height:22px;margin-bottom:10px"></div><div class="skeleton text" style="width:40%;height:10px"></div></article>`).join('')}</div><div class="dashboard-grid"><section class="panel"><div class="skeleton title" style="width:42%"></div><div class="skeleton" style="height:188px;margin-top:12px;border-radius:var(--radius-md)"></div></section><section class="panel"><div class="skeleton title" style="width:48%"></div>${Array.from({ length: 4 }).map(() => `<div style="display:grid;grid-template-columns:32px 1fr;gap:12px;padding:12px 0;border-bottom:1px solid #f0f2f5"><div class="skeleton avatar" style="width:28px;height:28px"></div><div><div class="skeleton text" style="width:64%;margin-bottom:6px"></div><div class="skeleton text" style="width:48%;height:10px"></div></div></div>`).join('')}</section></div>`;
}

function render() {
  const content = document.getElementById('pageContent');
  const views = {
    landing: renderLanding, pricing: renderPricing, register: renderRegister, provisioning: renderProvisioning,
    dashboard: renderDashboard, setup: renderSetup, students: renderStudents, 'student-detail': renderStudentDetail,
    staff: renderStaff, academics: renderAcademics, attendance: renderAttendance, results: renderResults,
    'report-cards': renderReportCards, finance: renderFinance, communications: renderCommunications,
    ai: renderAi, reports: renderReports, settings: renderSettings,
    'admin-overview': () => renderAdminPreview('admin-overview'), 'admin-schools': () => renderAdminPreview('admin-schools'),
    'admin-billing': () => renderAdminPreview('admin-billing'), 'admin-support': () => renderAdminPreview('admin-support'),
    'admin-flags': () => renderAdminPreview('admin-flags'), 'admin-audit': () => renderAdminPreview('admin-audit')
  };
  const nonSkeletonViews = ['landing', 'pricing', 'register', 'login', 'provisioning'];
  const renderer = views[currentView] || (() => skeletonMarkup());
  if (!nonSkeletonViews.includes(currentView) && SKELETON_MS > 0) {
    content.innerHTML = skeletonMarkup(['students', 'staff', 'finance', 'results', 'attendance'].includes(currentView) ? 'table' : 'page');
    clearTimeout(window._skeletonTimer);
    window._skeletonTimer = setTimeout(() => { content.innerHTML = renderer(); postRenderBindings(); }, SKELETON_MS);
  } else {
    content.innerHTML = renderer();
    postRenderBindings();
  }
  document.querySelectorAll('.brand-mark').forEach(mark => { mark.innerHTML = '<img src="logo.svg" alt="Edu-mit logo">'; });
  document.querySelectorAll('.brand-lockup strong, .auth-brand strong').forEach(name => { name.textContent = 'Edu-mit'; });
  document.body.classList.toggle('public-mode', ['landing', 'pricing', 'register', 'login'].includes(currentView));
  const crumbMap = { ai: 'AI Studio', 'student-detail': 'Students / Profile', 'admin-overview': 'Admin / Overview', 'admin-schools': 'Admin / Schools', 'admin-billing': 'Admin / Billing', 'admin-support': 'Admin / Support', 'admin-flags': 'Admin / Feature flags', 'admin-audit': 'Admin / Audit log' };
  document.getElementById('breadcrumb').textContent = crumbMap[currentView] || currentView.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  document.getElementById('roleLabel').textContent = state.currentUser.role;
  document.getElementById('workspaceContext').textContent = `${state.tenant.currentSession} · ${state.tenant.currentTerm}`;
  applyRoleNavigation();
  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === currentView || (currentView === 'student-detail' && item.dataset.view === 'students') || (String(currentView).startsWith('admin-') && item.dataset.view === 'settings')));
  const termSwitcher = document.getElementById('termSwitcher');
  if (termSwitcher) termSwitcher.value = `${state.tenant.currentSession} · ${state.tenant.currentTerm}`;
}

function postRenderBindings() {
  bindViewActions();
  bindTabsAndSegmented();
  bindPagination();
  bindStudentTableChecks();
  bindAiPanel();
}

function pageHeading(eyebrow, title, description, action = '') {
  return `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${description}</p></div>${action}</div>`;
}

function tabsMarkup(id, items, active) {
  return `<div class="tabs" role="tablist" data-tabs-id="${id}">${items.map(item => `<button role="tab" data-tab="${item.value}" class="${item.value === active ? 'active' : ''}" aria-selected="${item.value === active}">${item.label}</button>`).join('')}</div>`;
}
function segmentedMarkup(id, items, active) {
  return `<div class="segmented" data-segmented-id="${id}">${items.map(item => `<button data-segment="${item.value}" class="${item.value === active ? 'active' : ''}">${item.label}</button>`).join('')}</div>`;
}

function paginationMarkup(total, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageButtons = [];
  for (let i = 1; i <= totalPages; i++) pageButtons.push(i);
  return `<div class="pagination"><div class="pagination-info">${Math.min(total, (page-1)*pageSize + 1)}–${Math.min(total, page*pageSize)} of ${total}</div><div class="pagination-controls"><button class="button secondary" data-page="prev" ${page<=1?'disabled':''}>← Prev</button>${pageButtons.map(p => `<button class="button ${p===page?'primary':'secondary'}" data-page="${p}">${p}</button>`).join('')}<button class="button secondary" data-page="next" ${page>=totalPages?'disabled':''}>Next →</button></div></div>`;
}

function bulkBarMarkup(count) {
  return `<div class="bulk-bar" ${count<=0?'hidden':''}><span><strong>${count}</strong> selected</span><div class="bulk-actions"><button class="button secondary" data-bulk-action="email">✉ Email parents</button><button class="button secondary" data-bulk-action="export">↓ Export</button><button class="button secondary" data-bulk-action="archive">▢ Archive</button></div></div>`;
}

function openConfirm(title, description, phrase, onConfirm) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmDescription').textContent = description;
  document.getElementById('confirmPhrase').textContent = phrase;
  const input = document.getElementById('confirmInput');
  const submit = document.getElementById('confirmSubmit');
  input.value = '';
  submit.disabled = true;
  window._confirmCallback = onConfirm;
  document.getElementById('confirmBackdrop').hidden = false;
  input.focus();
}

function closeConfirm() {
  document.getElementById('confirmBackdrop').hidden = true;
  window._confirmCallback = null;
}

function openDrawer() {
  document.getElementById('drawerBackdrop').hidden = false;
  if (!state.aiGenerations) state.aiGenerations = [];
  setTimeout(() => document.getElementById('invoiceComboboxInput').focus(), 50);
}

function closeDrawer() {
  document.getElementById('drawerBackdrop').hidden = true;
  document.getElementById('paymentForm').reset();
  document.getElementById('invoiceComboboxSuggestions').hidden = true;
  document.getElementById('paymentDatePop').hidden = true;
}

function renderDatePicker() {
  const { year, month, selected } = paymentDateState;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const today = new Date(2026, 8, 17);
  const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const selStr = `${selected.getFullYear()}-${selected.getMonth()}-${selected.getDate()}`;
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push('<span class="day muted"></span>');
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${month}-${d}`;
    const isToday = ds === todayStr;
    const isSelected = ds === selStr;
    cells.push(`<button type="button" class="day ${isToday?'today':''} ${isSelected?'selected':''}" data-day="${d}">${d}</button>`);
  }
  while (cells.length % 7 !== 0) cells.push('<span class="day muted"></span>');
  let rows = [];
  for (let r = 0; r < cells.length / 7; r++) rows.push(`<div class="date-picker-row">${cells.slice(r*7,(r+1)*7).join('')}</div>`);
  return `<div class="date-picker-head"><button type="button" id="datePrevMonth">‹</button><strong>${months[month]} ${year}</strong><button type="button" id="dateNextMonth">›</button></div><div class="date-picker-grid"><div class="date-picker-row head"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span></div>${rows.join('')}</div>`;
}

function buildComboboxSuggestions(query) {
  const q = (query||'').toLowerCase();
  const matches = state.invoices.filter(inv => `${inv.id} ${inv.student} ${inv.className}`.toLowerCase().includes(q)).slice(0, 5);
  if (!matches.length) return '<div class="empty-state"><strong>No matches</strong><p>Type an invoice id or student name.</p></div>';
  return matches.map(inv => `<button type="button" class="combobox-item" data-invoice-id="${inv.id}"><strong>${escapeHtml(inv.id)}</strong><span>${escapeHtml(inv.student)} · ${escapeHtml(inv.className)} · ${formatMoney(inv.amount - inv.paid)} outstanding</span></button>`).join('');
}

function bindTabsAndSegmented() {
  document.querySelectorAll('[data-tabs-id]').forEach(tablist => {
    const id = tablist.dataset.tabsId;
    tablist.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.tab;
        if (id === 'settings-tabs') settingsTab = val;
        if (id === 'student-detail-tabs') studentDetailTab = val;
        showToast(`Switched to ${val} view`);
        render();
      });
    });
  });
  document.querySelectorAll('[data-segmented-id]').forEach(seg => {
    const id = seg.dataset.segmentedId;
    seg.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.segment;
        if (id === 'dash-range') { dashboardSegmented = val; showToast(`Showing ${val} view`); render(); }
        if (id.startsWith('module-')) { const key = id.replace('module-', ''); state.tenant.modules = state.tenant.modules || {}; state.tenant.modules[key] = val === 'on'; saveState(`${key} module ${val}`); render(); }
      });
    });
  });
}

function bindPagination() {
  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const totalPages = Math.max(1, Math.ceil(state.students.length / STUDENTS_PAGE_SIZE));
      let next = studentsPage;
      if (btn.dataset.page === 'prev') next = Math.max(1, studentsPage - 1);
      else if (btn.dataset.page === 'next') next = Math.min(totalPages, studentsPage + 1);
      else next = Number(btn.dataset.page);
      studentsPage = next;
      render();
    });
  });
}

function bindStudentTableChecks() {
  const selectAll = document.getElementById('selectAllStudents');
  if (!selectAll) return;
  const rowChecks = document.querySelectorAll('input[data-student-check]');
  const countLabel = document.querySelector('.bulk-bar span strong');
  const bulkBar = document.querySelector('.bulk-bar');
  const recalc = () => {
    const checked = document.querySelectorAll('input[data-student-check]:checked');
    if (countLabel) countLabel.textContent = checked.length;
    if (bulkBar) bulkBar.hidden = checked.length <= 0;
    if (selectAll) selectAll.checked = checked.length > 0 && checked.length === rowChecks.length;
    selectAll.indeterminate = checked.length > 0 && checked.length < rowChecks.length;
  };
  selectAll.addEventListener('change', () => {
    rowChecks.forEach(cb => { cb.checked = selectAll.checked; });
    recalc();
  });
  rowChecks.forEach(cb => cb.addEventListener('change', recalc));
  document.querySelectorAll('[data-bulk-action]').forEach(btn => btn.addEventListener('click', () => showToast(`Bulk ${btn.dataset.bulkAction}: ${document.querySelectorAll('input[data-student-check]:checked').length} rows (prototype)`)));
}

function bindAiPanel() {
  document.querySelectorAll('[data-ai-approve]').forEach(btn => btn.addEventListener('click', () => {
    const idx = Number(btn.dataset.aiApprove);
    if (state.aiGenerations[idx]) {
      state.aiGenerations[idx].status = `Approved by ${state.currentUser.role}`;
      saveState('AI output approved');
      render();
    }
  }));
  document.querySelectorAll('[data-ai-edit]').forEach(btn => btn.addEventListener('click', () => showToast('Edit mode active — edit the highlighted text, then Approve')));
  document.querySelectorAll('[data-ai-discard]').forEach(btn => btn.addEventListener('click', () => {
    const idx = Number(btn.dataset.aiDiscard);
    const title = state.aiGenerations[idx]?.title || 'Draft';
    openConfirm('Discard AI draft?', `This will remove "${title}" and cannot be undone.`, 'DISCARD', () => {
      state.aiGenerations.splice(idx, 1);
      saveState('AI draft discarded');
      render();
    });
  }));
  document.querySelectorAll('.student-detail-row').forEach(row => row.addEventListener('click', ev => {
    if (ev.target.tagName === 'INPUT' || ev.target.closest('button')) return;
    window.location.hash = `#students/${row.dataset.studentId}`;
  }));
}

function renderStudentDetail() {
  const student = state.students.find(s => s.id === currentStudentId) || state.students[0] || { firstName:'Maya', lastName:'Adeyemi', className:'JSS 2A', admissionNo:'GFA/2026/0152', attendance:94, guardian:'Mrs. Adeyemi', status:'Active', initials:'MA', id:'stu-1' };
  const tabs = tabsMarkup('student-detail-tabs', [
    { label: 'Profile', value: 'profile' },
    { label: 'Attendance', value: 'attendance' },
    { label: 'Results', value: 'results' },
    { label: 'Guardians', value: 'guardians' }
  ], studentDetailTab);
  const avg = state.scores[`${student.firstName} ${student.lastName}`] || 82;
  const feesBalance = state.invoices.find(i => i.student === `${student.firstName} ${student.lastName}`)?.amount - (state.invoices.find(i => i.student === `${student.firstName} ${student.lastName}`)?.paid || 0) || 45000;
  const panel = {
    profile: `<div class="form-grid"><label>First name<input value="${escapeHtml(student.firstName)}" /></label><label>Last name<input value="${escapeHtml(student.lastName)}" /></label><label>Admission no.<input class="admission-no mono" value="${student.admissionNo}" readonly /></label><label>Class<select><option ${student.className==='JSS 2A'?'selected':''}>JSS 2A</option><option>Primary 5</option><option>SS 1B</option></select></label><label>Guardian<input value="${escapeHtml(student.guardian)}" /></label><label>Status<select><option ${student.status==='Active'?'selected':''}>Active</option><option>Withdrawn</option><option>Graduated</option></select></label></div>`,
    attendance: `<div class="stat-grid" style="margin-top:8px"><article class="stat-card"><div class="stat-top"><span>Term attendance</span></div><div class="stat-value">${student.attendance}%</div><div class="stat-foot"><span class="positive">↑ 3.1%</span> vs last term</div></article></div><div class="panel" style="margin-top:18px;padding:24px;border:1px dashed var(--line);border-radius:var(--radius-md);background:#fff"><h3 style="margin:0 0 12px">Last 14 days</h3><div class="chart"><svg viewBox="0 0 400 80" preserveAspectRatio="none" aria-label="Attendance bars"><g fill="#0d9488"><rect x="0" y="20" width="20" height="60" rx="3"/><rect x="28" y="10" width="20" height="70" rx="3"/><rect x="56" y="15" width="20" height="65" rx="3"/><rect x="84" y="5" width="20" height="75" rx="3"/><rect x="112" y="12" width="20" height="68" rx="3"/><rect x="140" y="40" width="20" height="40" rx="3"/><rect x="168" y="8" width="20" height="72" rx="3"/><rect x="196" y="18" width="20" height="62" rx="3"/><rect x="224" y="6" width="20" height="74" rx="3"/><rect x="252" y="30" width="20" height="50" rx="3" fill="#dc2626"/><rect x="280" y="10" width="20" height="70" rx="3"/><rect x="308" y="14" width="20" height="66" rx="3"/><rect x="336" y="9" width="20" height="71" rx="3"/><rect x="364" y="11" width="20" height="69" rx="3"/></g></svg></div></div>`,
    results: `<div class="stat-grid" style="margin-top:8px"><article class="stat-card"><div class="stat-top"><span>Term average</span></div><div class="stat-value">${avg}%</div><div class="stat-foot"><span class="positive">↑ 4.2%</span> vs last term</div></article></div><table class="data-table" style="margin-top:18px"><thead><tr><th>Subject</th><th>CA 1</th><th>Assignment</th><th>Exam</th><th>Total</th><th>Grade</th></tr></thead><tbody>${state.academics.subjects.slice(0,5).map((subj,i)=>{const t=Math.max(55,avg-i*3);const g=t>=75?'A':t>=65?'B':t>=50?'C':'D';return`<tr><td>${subj}</td><td>${Math.round(t*.2)}</td><td>${Math.round(t*.1)}</td><td>${Math.round(t*.7)}</td><td><strong>${t}%</strong></td><td><span class="badge ${g==='D'?'unpaid':'active'}">${g}</span></td></tr>`;}).join('')}</tbody></table>`,
    guardians: `<div class="invite-row"><div class="person-avatar">${(student.guardian||'G')[0]||'G'}</div><div><strong>${escapeHtml(student.guardian)}</strong><span>Primary guardian · Parent</span></div><span class="badge active">Active</span></div><div class="invite-row"><div class="person-avatar" style="background:#e0e7ff;color:#4338ca">${(student.guardian||'GG')[1]||'G'}</div><div><strong>Mr. ${escapeHtml((student.guardian||'Adeyemi').split(' ').pop()||'Adeyemi')}</strong><span>Secondary contact</span></div><span class="badge active">Active</span></div><button class="button secondary" style="margin-top:8px">＋ Add another guardian</button>`
  }[studentDetailTab];
  return `${pageHeading('<button class="button ghost" data-view="students">← Back to directory</button>', `${student.firstName} ${student.lastName}`, `${student.className} · <span class="admission-no mono">${student.admissionNo}</span>`, `<div class="quick-actions" style="margin:0"><button class="button secondary" data-action="email-parent">✉ Email parent</button><button class="button secondary" data-view="report-cards">▧ Report card</button><button class="button primary" data-action="edit-profile">✎ Edit profile</button></div>`)}
    <div class="stat-grid">
      <article class="stat-card"><div class="stat-top"><span>Attendance</span></div><div class="stat-value">${student.attendance}%</div><div class="stat-foot"><span class="positive">On track</span></div></article>
      <article class="stat-card"><div class="stat-top"><span>Average result</span></div><div class="stat-value">${avg}%</div><div class="stat-foot"><span class="warning">3 subjects above 80+</span></div></article>
      <article class="stat-card"><div class="stat-top"><span>Fees balance</span></div><div class="stat-value" style="${feesBalance>0?'color:var(--danger)':'color:var(--success)'}">${formatMoney(Math.max(0,feesBalance))}</div><div class="stat-foot">${feesBalance>0?'<span class="warning">Outstanding</span>':'<span class="positive">Paid up</span>'}</div></article>
      <article class="stat-card"><div class="stat-top"><span>Status</span></div><div class="stat-value" style="font-size:20px;color:var(--success)">${student.status}</div><div class="stat-foot">Enrolled 12 Sep 2026</div></article>
    </div>
    ${tabs}
    <section class="panel" style="margin-top:14px">${panel}</section>
    <section class="panel" style="margin-top:18px"><div class="panel-header"><div><h2 class="panel-title">Activity timeline</h2><p class="panel-subtitle">Key events this term</p></div></div><div class="timeline"><div class="timeline-dot"></div><div class="timeline-content"><strong>Admission confirmed</strong><span>12 Sep 2026 · ${student.admissionNo}</span></div><div class="timeline-dot"></div><div class="timeline-content"><strong>Result published</strong><span>Term 1 CA 1 · 82% average</span></div><div class="timeline-dot"></div><div class="timeline-content"><strong>Invoice raised</strong><span>Term fees · ${formatMoney(90000)}</span></div><div class="timeline-dot"></div><div class="timeline-content"><strong>Payment received</strong><span>Bank transfer · ${formatMoney(45000)}</span></div></div></section>`;
}

function renderLanding() {
  return `<div class="public-shell"><div class="public-nav"><div class="brand-lockup"><div class="brand-mark">S</div><div><strong>Scholara</strong><span>School operations, made clear</span></div></div><div class="public-nav-links"><button data-view="pricing">Pricing</button><button data-href="login.html">Sign in</button><button class="button primary" data-view="register">Start a school</button></div></div><section class="public-hero"><div><p class="eyebrow">The school workspace</p><h1>Every school deserves its own world.</h1><p class="public-lede">Scholara brings students, attendance, results, fees and families into one calm place, configured for the way your school already works.</p><div class="hero-actions"><button class="button primary large" data-view="register">Create your school <span>→</span></button><button class="button secondary large" data-view="pricing">See transparent pricing</button></div><div class="trust-line"><span>✓ 30-day free trial</span><span>✓ No card required</span><span>✓ Setup in minutes</span></div></div><div class="hero-preview"><div class="preview-top"><span></span><span class="badge active">Live today</span></div><div class="preview-number">92.1%<small>attendance this week</small></div><div class="preview-bars"><i style="height:48%"></i><i style="height:64%"></i><i style="height:53%"></i><i style="height:78%"></i><i style="height:92%"></i><i style="height:70%"></i></div><div class="preview-row"><span>Fees collected</span><strong>₦4.2m</strong></div><div class="preview-row"><span>Results ready</span><strong>8 classes</strong></div></div></section><section class="public-proof"><div><strong>One connected school day</strong><span>From first register to final report card.</span></div><div><strong>Built for busy people</strong><span>Fast workflows for teachers and bursars.</span></div><div><strong>Clear by default</strong><span>Every decision has a visible status.</span></div></section></div>`;
}

function renderPricing() {
  const plans = [['Trial', 'Free', '30 days', 'Every feature · 50 students · limited AI'], ['Starter', '₦250', 'per student / term', 'Students · attendance · results · fees'], ['Growth', '₦450', 'per student / term', 'Everything in Starter · payments · AI · 2 branches'], ['Pro', 'Custom', 'for school groups', 'Advanced analytics · CBT · API · dedicated onboarding']];
  return `<div class="public-shell"><div class="public-nav"><div class="brand-lockup"><div class="brand-mark">S</div><div><strong>Scholara</strong><span>Simple pricing for real schools</span></div></div><div class="public-nav-links"><button data-view="landing">Overview</button><button data-href="login.html">Sign in</button><button class="button primary" data-view="register">Start free</button></div></div><div class="public-page">${pageHeading('Plans that grow with you', 'Pricing that matches the school year', 'Start free, choose termly billing, and keep your school records in one place.') }<div class="billing-toggle"><button class="active">Per term</button><button>Annual · 2 months free</button></div><div class="pricing-grid">${plans.map((plan, index) => `<article class="pricing-card ${index === 2 ? 'featured' : ''}">${index === 2 ? '<span class="popular-label">Most chosen</span>' : ''}<h2>${plan[0]}</h2><div class="pricing-price">${plan[1]}<small>${plan[2]}</small></div><p>${plan[3]}</p><button class="button ${index === 2 ? 'primary' : 'secondary'}" data-view="register">Choose ${plan[0]}</button></article>`).join('')}</div><div class="notice amber"><strong>Prototype pricing.</strong> These local prices are for product exploration only. No payment is collected in this browser prototype.</div></div></div>`;
}

function renderRegister() {
  return `<div class="auth-shell"><div class="auth-brand"><div class="brand-mark">S</div><strong>Scholara</strong></div><section class="auth-card"><p class="eyebrow">Start your school</p><h1>Create your workspace</h1><p class="auth-copy">Set up a private school environment in a few minutes. No card required.</p><form id="registerForm"><div class="form-grid"><label>Your name<input required placeholder="Amara Okafor" /></label><label>School name<input required placeholder="" /></label><label>Email address<input required type="email" placeholder="you@school.edu" /></label><label>School slug<input required placeholder="greenfield" /></label></div><label class="checkbox-row"><input type="checkbox" required /> I understand this prototype stores data only in this browser.</label><button class="button primary large" type="submit">Create local workspace <span>→</span></button></form><p class="auth-foot">Already have a workspace? <button data-href="login.html">Sign in</button></p></section></div>`;
}

function renderProvisioning() {
  return `<div class="auth-shell provisioning-shell"><div class="auth-brand"><div class="brand-mark">S</div><strong>Scholara</strong></div><section class="auth-card provisioning-card"><div class="provisioning-mark">✓</div><p class="eyebrow">Your school is being prepared</p><h1>Creating your workspace</h1><p class="auth-copy">We are setting up your classes, roles and starter records so the first screen is useful from the moment you arrive.</p><div class="provisioning-list"><div class="provision-step complete"><span>✓</span><div><strong>School workspace created</strong><small> is ready</small></div></div><div class="provision-step active"><span class="spinner"></span><div><strong>Seeding starter records</strong><small>Roles, subjects and three demo students</small></div></div><div class="provision-step"><span>3</span><div><strong>Preparing your setup wizard</strong><small>Five steps, saved as you go</small></div></div></div><div class="provisioning-progress"><span style="width:68%"></span></div><small class="provisioning-note">This local setup usually takes a few seconds.</small></section></div>`;
}

function renderDashboard() {
  const paid = state.invoices.reduce((sum, invoice) => sum + invoice.paid, 0);
  const outstanding = state.invoices.reduce((sum, invoice) => sum + invoice.amount - invoice.paid, 0);
  const dashboardCopy = { 'School owner': ['Good morning, Amara', 'Here is what is happening at  today.', 'Review money and school health'], Principal: ['Good morning, Miriam', 'Here is what needs your academic attention today.', 'Review attendance and approve results'], 'School admin': ['Good morning, Amara', 'Keep your school records moving with today\'s priorities.', 'Maintain records and setup'], Bursar: ['Good morning, Ngozi', 'Here is the latest view of collections and outstanding fees.', 'Follow up outstanding balances'], Teacher: ['Good morning, David', 'Your classes, registers and score deadlines are ready.', 'Mark a class and enter scores'], Parent: ['Welcome back', 'Here is the latest update for your children.', 'Check progress and fee status'], Student: ['Welcome back', 'Here is what is on your school day.', 'View your learning day'] }[state.currentUser.role] || ['Good morning, Amara', 'Here is what is happening at  today.', 'Review school health'];
  const roleAction = { 'School owner': '<button class="button primary" data-view="finance">Review finances</button>', Principal: '<button class="button primary" data-view="results">Review results</button>', 'School admin': '<button class="button primary" data-view="students">Open student records</button>', Bursar: '<button class="button primary" data-view="finance">Open finance</button>', Teacher: '<button class="button primary" data-view="attendance">Mark attendance</button>', Parent: '<button class="button primary" data-view="report-cards">View latest result</button>', Student: '<button class="button primary" data-view="results">View results</button>' }[state.currentUser.role];
  const canCreateStudent = hasPermission('students.create');
  const addStudentAction = canCreateStudent ? '<button class="quick-action" data-action="add-student"><div class="quick-action-icon">＋</div><strong>Add a student</strong><span>New admission record</span></button>' : '';
  const rangeSegmented = segmentedMarkup('dash-range', [{label:'Week',value:'week'},{label:'Term',value:'term'},{label:'Year',value:'year'}], dashboardSegmented);
  return `${pageHeading('Thursday, 17 September 2026', dashboardCopy[0], dashboardCopy[1], `${rangeSegmented}${roleAction}`.replace(/></g,'> <'))}
    <div class="stat-grid">
      <article class="stat-card"><div class="stat-top"><span>Active students</span><span class="stat-icon">♧</span></div><div class="stat-value">${state.students.length + 243}</div><div class="stat-foot"><span class="positive">↑ 8.4%</span> vs last term</div></article>
      <article class="stat-card"><div class="stat-top"><span>Attendance today</span><span class="stat-icon">◷</span></div><div class="stat-value">92.1%</div><div class="stat-foot"><span class="positive">↑ 2.3%</span> vs yesterday</div></article>
      <article class="stat-card"><div class="stat-top"><span>Fees collected</span><span class="stat-icon">₦</span></div><div class="stat-value">${formatMoney(paid)}</div><div class="stat-foot"><span class="warning">${formatMoney(outstanding)}</span> outstanding</div></article>
      <article class="stat-card"><div class="stat-top"><span>Pending approvals</span><span class="stat-icon">⌁</span></div><div class="stat-value">12</div><div class="stat-foot"><span class="negative">4 urgent</span> before Friday</div></article>
    </div>
    <div class="dashboard-grid">
      <section class="panel chart-panel"><div class="panel-header"><div><h2 class="panel-title">Fee collection</h2><p class="panel-subtitle">Collected versus expected · 2026/27 Term 1 · ${dashboardSegmented[0].toUpperCase()+dashboardSegmented.slice(1)} view</p></div><div class="chart-legend"><span class="legend"><i></i>Collected</span><span class="legend"><i class="amber"></i>Expected</span></div></div><div class="chart"><svg viewBox="0 0 700 180" preserveAspectRatio="none" aria-label="Fee collection chart"><path d="M0 157 C70 145 90 155 140 128 S220 135 270 111 S350 119 400 85 S480 91 530 74 S610 57 700 31" fill="none" stroke="#4338CA" stroke-width="3"/><path d="M0 146 C80 130 110 138 160 115 S230 112 280 96 S360 91 410 69 S500 65 550 47 S635 40 700 20" fill="none" stroke="#F59E0B" stroke-width="2" stroke-dasharray="5 5"/><circle cx="530" cy="74" r="5" fill="#fff" stroke="#4338CA" stroke-width="3"/></svg><div class="chart-tooltip">September<strong>₦4.2m</strong></div></div><div class="chart-labels"><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div></section>
      <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Today at a glance</h2><p class="panel-subtitle">Activity across the school</p></div><button class="panel-link" data-view="attendance">View all</button></div><div class="activity-list"><div class="activity-item"><div class="activity-icon">◷</div><div><strong>Attendance marked for 9 classes</strong><span>3 exceptions need review · 12 min ago</span></div></div><div class="activity-item"><div class="activity-icon">✓</div><div><strong>JSS 2A results submitted</strong><span>Awaiting principal approval · 38 min ago</span></div></div><div class="activity-item"><div class="activity-icon">₦</div><div><strong>${formatMoney(paid)} received today</strong><span>16 payments reconciled · 1 hr ago</span></div></div><div class="activity-item"><div class="activity-icon">✦</div><div><strong>Mid-term timetable published</strong><span>Sent to all parents · 2 hrs ago</span></div></div></div></section>
    </div>
    <div class="quick-actions">${addStudentAction}<button class="quick-action" data-view="attendance"><div class="quick-action-icon">◷</div><strong>${state.currentUser.role === 'Parent' ? 'Check attendance' : 'Mark attendance'}</strong><span>Open today's register</span></button><button class="quick-action" data-view="results"><div class="quick-action-icon">▦</div><strong>${state.currentUser.role === 'Parent' || state.currentUser.role === 'Student' ? 'View results' : 'Enter results'}</strong><span>Continue academic work</span></button>${hasPermission('fees.payment.record') ? '<button class="quick-action" data-view="finance"><div class="quick-action-icon">₦</div><strong>Record payment</strong><span>Update an invoice</span></button>' : '<button class="quick-action" data-view="communications"><div class="quick-action-icon">✦</div><strong>View announcements</strong><span>Keep up with school</span></button>'}</div>
    <div class="dashboard-grid" style="margin-top:18px"><section class="panel progress-panel"><div class="panel-header"><div class="setup-progress-summary"><div class="progress-ring small-ring" style="--progress:${state.tenant.setupProgress * 3.6}deg"><strong>${state.tenant.setupProgress}%</strong></div><div><h2 class="panel-title">Setup progress</h2><p class="panel-subtitle">Make the most of your Scholara workspace</p></div></div><button class="panel-link" data-view="setup">Continue setup →</button></div><div class="progress-row"><span>School profile and branding</span><strong>Complete</strong></div><div class="progress-bar teal"><span style="width:100%"></span></div><div class="progress-row"><span>Academic structure</span><strong>Complete</strong></div><div class="progress-bar"><span style="width:100%"></span></div><div class="progress-row"><span>Invite your staff</span><strong>3 of 8</strong></div><div class="progress-bar amber"><span style="width:38%"></span></div></section><section class="panel"><div class="panel-header"><div><h2 class="panel-title">Recent announcements</h2><p class="panel-subtitle">Keep your school connected</p></div><button class="panel-link" data-view="communications">Manage</button></div>${state.announcements.slice(0, 2).map(announcement => `<div class="activity-item"><div class="activity-icon">✦</div><div><strong>${escapeHtml(announcement.title)}</strong><span>${escapeHtml(announcement.audience)} · ${announcement.date}</span></div></div>`).join('')}</section></div>`;
}

function renderSetup() {
  const steps = [
    ['identity', 'School identity', 'Name, slug, logo and brand colour'],
    ['calendar', 'Academic calendar', 'Session, terms and school hours'],
    ['structure', 'School structure', 'Classes, arms and subjects'],
    ['assessment', 'Assessment model', 'Weightings, grades and pass mark'],
    ['team', 'Invite your team', 'Staff roles and permissions']
  ];
  const completed = state.setup.completed;
  const progress = state.tenant.setupProgress;
  return `${pageHeading('Getting started', 'Set up your school', 'Five focused steps to make your workspace feel like home.', '<button class="button primary" data-action="complete-setup">Save progress</button>')}
    <div class="notice">This setup is saved in your browser. You can leave and return without losing your progress.</div>
    <section class="panel setup-panel"><div class="setup-steps" role="list">${steps.map((step, index) => `<button class="setup-step ${completed.includes(step[0]) ? 'complete' : state.setup.current === step[0] ? 'current' : ''}" data-action="setup-step" data-step="${step[0]}" tabindex="0" ${state.setup.current === step[0] ? 'aria-current="step"' : ''} role="listitem"><span>${completed.includes(step[0]) ? '✓' : index + 1}</span><strong>${step[1]}</strong><small>${step[2]}</small></button>`).join('')}</div><div class="setup-form"><div class="setup-progress-summary"><div class="progress-ring" style="--progress:${progress * 3.6}deg"><strong>${progress}%</strong><span>complete</span></div><div><p class="eyebrow">Step ${steps.findIndex(step => step[0] === state.setup.current) + 1} of 5</p><h2>${steps.find(step => step[0] === state.setup.current)[1]}</h2><p class="panel-subtitle">${steps.find(step => step[0] === state.setup.current)[2]}</p></div></div>${setupForm(state.setup.current)}<div class="setup-actions"><button class="button secondary" data-action="previous-setup">Back</button><button class="button primary" data-action="next-setup">Continue</button></div></div></section>`;
}

function setupForm(step) {
  if (step === 'identity') return `<div class="form-grid"><label>School name<input data-autosave="tenant.name" value="${escapeHtml(state.tenant.name)}" /></label><label>School slug<input data-autosave="tenant.slug" value="${escapeHtml(state.tenant.slug)}" /></label><label>Logo URL placeholder<input data-autosave="tenant.logoUrl" value="${escapeHtml(state.tenant.logoUrl)}" placeholder="Optional image URL" /></label><label>Country<select data-autosave="tenant.country"><option ${state.tenant.country === 'Nigeria' ? 'selected' : ''}>Nigeria</option><option ${state.tenant.country === 'Ghana' ? 'selected' : ''}>Ghana</option><option ${state.tenant.country === 'Kenya' ? 'selected' : ''}>Kenya</option></select></label><label>Primary colour<input data-autosave="tenant.brandPrimary" type="color" value="${state.tenant.brandPrimary}" /></label></div>`;
  if (step === 'calendar') return `<div class="form-grid"><label>Academic session<input data-autosave="tenant.currentSession" value="${state.tenant.currentSession}" /></label><label>Current term<select data-autosave="tenant.currentTerm"><option ${state.tenant.currentTerm === 'Term 1' ? 'selected' : ''}>Term 1</option><option ${state.tenant.currentTerm === 'Term 2' ? 'selected' : ''}>Term 2</option><option ${state.tenant.currentTerm === 'Term 3' ? 'selected' : ''}>Term 3</option></select></label><label>School opens<input data-autosave="tenant.schoolOpens" type="time" value="${state.tenant.schoolOpens || '07:30'}" /></label><label>School closes<input data-autosave="tenant.schoolCloses" type="time" value="${state.tenant.schoolCloses || '15:30'}" /></label></div>`;
  if (step === 'structure') return `<div class="setup-summary"><div><strong>${state.academics.classes.length}</strong><span>Class arms</span></div><div><strong>${state.academics.subjects.length}</strong><span>Subjects</span></div><div><strong>${state.students.length}</strong><span>Demo students</span></div></div><div class="chip-list">${state.academics.classes.map(item => `<span>${item}</span>`).join('')}</div><button class="button secondary" data-view="academics">Manage academic structure</button>`;
  if (step === 'assessment') return `<div class="weighting-list"><label><span>CA 1</span><input class="mini-input" data-autosave="setup.assessment.ca1" type="number" min="0" max="100" value="${state.setup.assessment.ca1}" />%</label><label><span>Assignment</span><input class="mini-input" data-autosave="setup.assessment.assignment" type="number" min="0" max="100" value="${state.setup.assessment.assignment}" />%</label><label><span>Exam</span><input class="mini-input" data-autosave="setup.assessment.exam" type="number" min="0" max="100" value="${state.setup.assessment.exam}" />%</label></div><div class="form-grid compact-form"><label>Grade scale<select data-autosave="setup.assessment.scale"><option ${state.setup.assessment.scale === 'A-F' ? 'selected' : ''}>A-F</option><option ${state.setup.assessment.scale === 'A1-C6' ? 'selected' : ''}>A1-C6</option><option ${state.setup.assessment.scale === '1-7' ? 'selected' : ''}>1-7</option></select></label><label>Pass mark<input data-autosave="setup.assessment.passMark" type="number" min="0" max="100" value="${state.setup.assessment.passMark}" /></label></div><div class="notice teal" style="margin-top:18px;margin-bottom:0">Assessment changes save locally and will drive the score-entry and report-card views.</div>`;
  return `<div class="invite-row"><div class="person-avatar">MB</div><div><strong>Miriam Bello</strong><span>Principal · Invited</span></div><span class="badge active">Ready</span></div><div class="invite-row"><div class="person-avatar">DE</div><div><strong>David Eze</strong><span>Teacher · Mathematics</span></div><span class="badge active">Ready</span></div><button class="button secondary" data-action="invite-staff">＋ Invite another staff member</button>`;
}

function renderStaff() {
  return `${pageHeading('People', 'Staff directory', `${state.staff.length} staff records with role-scoped access.`, '<button class="button primary" data-action="invite-staff">＋ Invite staff</button>')}
    <section class="panel"><div class="table-toolbar"><input class="search-input" id="staffSearch" placeholder="⌕  Search staff" /><button class="button secondary" data-action="export">↓ Export</button></div><table class="data-table"><thead><tr><th>Staff member</th><th>Role</th><th>Allocation</th><th>Status</th></tr></thead><tbody id="staffRows">${state.staff.map(staff => `<tr><td><div class="person"><div class="person-avatar">${staff.initials}</div><strong>${staff.name}</strong></div></td><td>${staff.role}</td><td>${staff.subjects}</td><td><span class="badge ${staff.status === 'Active' ? 'active' : 'pending'}">${staff.status}</span></td></tr>`).join('')}</tbody></table></section>`;
}

function renderAcademics() {
  return `${pageHeading('School structure', 'Academics', 'Configure the session, terms, classes and subjects that power attendance and results.', '<button class="button primary" data-action="save-academics">Save structure</button>')}
    <div class="card-grid"><article class="feature-card"><div class="quick-action-icon">◫</div><h3>Current session</h3><p>Academic records are being collected for the active session.</p><strong class="academic-value">2026/27</strong></article><article class="feature-card"><div class="quick-action-icon">◷</div><h3>Terms</h3><p>Renewal and reporting cycles for this academic session.</p><div class="chip-list">${state.academics.terms.map(term => `<span>${term}</span>`).join('')}</div></article><article class="feature-card"><div class="quick-action-icon">▤</div><h3>Classes and arms</h3><p>Students, attendance registers and results use these groups.</p><div class="chip-list">${state.academics.classes.map(item => `<span>${item}</span>`).join('')}</div></article></div>
    <section class="panel" style="margin-top:18px"><div class="panel-header"><div><h2 class="panel-title">Subject catalogue</h2><p class="panel-subtitle">Core subjects available for registration and score entry.</p></div><button class="button secondary" data-action="add-subject">＋ Add subject</button></div><div class="subject-grid">${state.academics.subjects.map((subject, index) => `<div class="subject-item"><span>${String(index + 1).padStart(2, '0')}</span><strong>${subject}</strong><small>Core subject</small></div>`).join('')}</div></section>`;
}

function renderReportCards() {
  const student = state.students[0];
  const total = state.scores[`${student.firstName} ${student.lastName}`] || 82;
  return `${pageHeading('Academic records', 'Report cards', 'Preview a branded report card before it reaches a parent.', '<button class="button primary" data-action="print-report">⇧ Print preview</button>')}
    <div class="notice teal"><strong>Human approval required.</strong> This preview is local and not published to a parent.</div>
    <section class="report-card-preview" id="reportCard"><div class="report-header"><div class="brand-mark">S</div><div><h2></h2><p>Excellence with character</p></div><span>2026/27<br /><strong>TERM 1</strong></span></div><div class="report-student"><div><small>STUDENT</small><strong>${student.firstName} ${student.lastName}</strong></div><div><small>ADMISSION NO.</small><strong>${student.admissionNo}</strong></div><div><small>CLASS</small><strong>${student.className}</strong></div><div><small>ATTENDANCE</small><strong>${student.attendance}%</strong></div></div><h3>Academic performance</h3><table class="data-table"><thead><tr><th>Subject</th><th>Total score</th><th>Grade</th><th>Teacher's remark</th></tr></thead><tbody>${state.academics.subjects.slice(0, 4).map((subject, index) => { const score = Math.max(58, total - index * 4); return `<tr><td>${subject}</td><td><strong>${score}%</strong></td><td><span class="badge active">${score >= 75 ? 'A' : 'B'}</span></td><td>${score >= 75 ? 'Excellent progress' : 'Good effort, keep practising'}</td></tr>`; }).join('')}</tbody></table><div class="report-remark"><small>FORM TEACHER'S REMARK · <span class="badge" style="background:#ccfbf1;color:#115e59">AI DRAFT</span></small><p>${student.firstName} is making steady progress and contributes positively to class activities. Continued practice will help build confidence in problem-solving.</p></div><div class="report-footer"><span>Generated locally · Awaiting principal approval</span><span>Principal signature: __________________</span></div></section>`;
}

function renderReports() {
  return `${pageHeading('Insights', 'Reports', 'Turn everyday school activity into decisions you can act on.', '<button class="button secondary" data-action="export">↓ Export data</button>')}
    <div class="stat-grid"><article class="stat-card"><div class="stat-top"><span>Attendance rate</span><span class="stat-icon">◷</span></div><div class="stat-value">92.1%</div><div class="stat-foot"><span class="positive">↑ 2.3%</span> this term</div></article><article class="stat-card"><div class="stat-top"><span>Collection rate</span><span class="stat-icon">₦</span></div><div class="stat-value">76.4%</div><div class="stat-foot"><span class="positive">↑ 8.1%</span> this term</div></article><article class="stat-card"><div class="stat-top"><span>Average result</span><span class="stat-icon">▦</span></div><div class="stat-value">68.7%</div><div class="stat-foot"><span class="positive">↑ 4.6%</span> across classes</div></article><article class="stat-card"><div class="stat-top"><span>Active teachers</span><span class="stat-icon">♙</span></div><div class="stat-value">24/28</div><div class="stat-foot"><span class="warning">4 invites</span> still pending</div></article></div>
    <div class="card-grid"><article class="feature-card"><div class="quick-action-icon">◷</div><h3>Attendance summary</h3><p>Compare attendance by class, day and status. Find patterns before they become problems.</p><button class="button secondary" data-action="report-preview">Open report</button></article><article class="feature-card"><div class="quick-action-icon">▦</div><h3>Academic performance</h3><p>See subject averages, grade distribution and results awaiting approval.</p><button class="button secondary" data-view="results">Review results</button></article><article class="feature-card"><div class="quick-action-icon">₦</div><h3>Fee collection</h3><p>Track expected, collected and outstanding fees by class and fee head.</p><button class="button secondary" data-view="finance">Open finance</button></article></div>`;
}

function renderAdminPreview() {
  const titles = { 'admin-overview': ['Platform overview', 'Network health across every school'], 'admin-schools': ['Schools', 'Tenant directory and school health'], 'admin-billing': ['Billing', 'Plans, invoices and usage'], 'admin-support': ['Support', 'Tickets and tenant notes'], 'admin-flags': ['Feature flags', 'Control staged product rollouts'], 'admin-audit': ['Audit log', 'Review platform actions and access'] };
  const title = titles[currentView] || titles['admin-overview'];
  return `${pageHeading('Platform administration', title[0], title[1], '<span class="badge pending">Deferred preview</span>')}<div class="notice amber"><strong>Admin console deferred.</strong> This surface is intentionally a local preview. Real school data, impersonation, billing and destructive actions require a secure backend and mandatory 2FA.</div><section class="panel admin-preview"><div class="admin-lock">⌁</div><h2>Ready for Phase 4</h2><p>This route is reserved for the super-admin console described in the blueprint.</p><div class="admin-preview-grid"><div><strong>Tenant isolation</strong><span>PostgreSQL RLS required</span></div><div><strong>Admin security</strong><span>2FA and IP allow-listing</span></div><div><strong>Auditability</strong><span>Permanent action logs</span></div></div></section>`;
}

function renderStudents() {
  const paged = state.students.slice((studentsPage - 1) * STUDENTS_PAGE_SIZE, studentsPage * STUDENTS_PAGE_SIZE);
  return `${pageHeading('People', 'Students', `${state.students.length + 243} active students across 9 classes.`, '<button class="button primary" data-action="add-student">＋ Add student</button>')}
    <div class="notice">Your student directory is stored locally in this prototype. Export your data from Settings before clearing browser storage.</div>
    ${bulkBarMarkup(0)}
    <section class="panel"><div class="table-toolbar"><input class="search-input" id="studentSearch" placeholder="⌕  Search students" /><div><select class="filter-select"><option>All classes</option><option>JSS 2A</option><option>Primary 5</option><option>SS 1B</option></select> <button class="button secondary" data-action="export">↓ Export</button></div></div><table class="data-table"><thead><tr><th class="checkbox-cell"><input type="checkbox" id="selectAllStudents" /></th><th>Student</th><th>Admission no.</th><th>Class</th><th>Attendance</th><th>Status</th></tr></thead><tbody id="studentRows">${studentRows(paged)}</tbody></table>${paginationMarkup(state.students.length, studentsPage, STUDENTS_PAGE_SIZE)}</section>`;
}

function studentRows(students) {
  return students.map(student => `<tr class="student-detail-row" data-student-id="${student.id||'stu-'+Math.random().toString(36).slice(2,7)}"><td class="checkbox-cell"><input type="checkbox" data-student-check /></td><td><div class="person"><div class="person-avatar">${escapeHtml(student.initials)}</div><div><strong>${escapeHtml(student.firstName)} ${escapeHtml(student.lastName)}</strong><span>${escapeHtml(student.guardian)}</span></div></div></td><td class="admission-no mono-cell">${student.admissionNo}</td><td>${student.className}</td><td><strong>${student.attendance}%</strong></td><td><span class="badge active">${student.status}</span></td></tr>`).join('');
}

function renderAttendance() {
  const total = state.attendance.total;
  const marked = state.attendance.marked;
  return `${pageHeading('Daily register', 'Attendance', 'Mark a class in under 30 seconds. Everyone starts as present.', '<button class="button primary" data-action="mark-all">✓ Save register</button>')}
    <div class="stat-grid"><article class="stat-card"><div class="stat-top"><span>School attendance</span><span class="stat-icon">◷</span></div><div class="stat-value">92.1%</div><div class="stat-foot"><span class="positive">↑ 2.3%</span> from yesterday</div></article><article class="stat-card"><div class="stat-top"><span>Present today</span><span class="stat-icon">✓</span></div><div class="stat-value">${marked}/${total}</div><div class="stat-foot">JSS 2A register</div></article><article class="stat-card"><div class="stat-top"><span>Exceptions</span><span class="stat-icon">!</span></div><div class="stat-value">${total - marked}</div><div class="stat-foot"><span class="warning">Needs review</span> before 10:00</div></article><article class="stat-card"><div class="stat-top"><span>Saved status</span><span class="stat-icon">⌁</span></div><div class="stat-value" style="font-size:20px;color:var(--success)">Local ✓</div><div class="stat-foot">Last saved just now</div></article></div>
    <section class="panel"><div class="panel-header"><div><h2 class="panel-title">JSS 2A · Thursday, 17 September</h2><p class="panel-subtitle">Tap an exception to change their status. Changes save automatically.</p></div><select class="filter-select"><option>JSS 2A · 38 students</option><option>Primary 5 · 32 students</option><option>SS 1B · 29 students</option></select></div><table class="data-table"><thead><tr><th>Student</th><th>Admission no.</th><th>Status</th><th>Note</th></tr></thead><tbody>${state.students.slice(0, 5).map((student, index) => { const absent = state.attendance.exceptions.includes(`${student.firstName} ${student.lastName}`); return `<tr><td><div class="person"><div class="person-avatar">${student.initials}</div><strong>${student.firstName} ${student.lastName}</strong></div></td><td>${student.admissionNo}</td><td><button class="badge ${absent ? 'unpaid' : 'paid'} attendance-toggle" data-student="${student.firstName} ${student.lastName}">${absent ? 'Absent' : 'Present'}</button></td><td style="color:var(--muted)">${absent ? 'Parent notification queued' : '—'}</td></tr>`; }).join('')}</tbody></table></section>`;
}

function renderResults() {
  const names = Object.keys(state.scores);
  return `${pageHeading('Academic records', 'Results', 'Enter scores, review computed grades and move results through approval.', '<button class="button primary" data-action="save-results">✓ Submit for review</button>')}
    <div class="notice teal"><strong>JSS 2A is ready for review.</strong> Scores autosave locally as you work. Nothing is visible to parents until approved and published.</div>
    <section class="panel"><div class="panel-header"><div><h2 class="panel-title">JSS 2A · Mathematics</h2><p class="panel-subtitle">2026/27 Term 1 · CA 1 (20) + Assignment (10) + Exam (70)</p></div><div><select class="filter-select"><option>Mathematics</option><option>English Language</option><option>Basic Science</option></select> <button class="button secondary" data-action="recalculate">↻ Recalculate</button></div></div><table class="data-table"><thead><tr><th>Student</th><th>CA 1 / 20</th><th>Assignment / 10</th><th>Exam / 70</th><th>Total</th><th>Grade</th></tr></thead><tbody>${names.map(name => { const total = state.scores[name]; const grade = total >= 75 ? 'A' : total >= 65 ? 'B' : total >= 50 ? 'C' : 'D'; return `<tr><td><strong>${name}</strong></td><td><input class="score-input" data-name="${name}" value="${Math.round(total * .18)}" /></td><td><input class="score-input" data-name="${name}" value="${Math.round(total * .1)}" /></td><td><input class="score-input" data-name="${name}" value="${Math.round(total * .72)}" /></td><td><strong class="score-total">${total}</strong></td><td><span class="badge ${grade === 'D' ? 'unpaid' : 'active'}">${grade}</span></td></tr>`; }).join('')}</tbody></table></section>`;
}

function renderFinance() {
  const billed = state.invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paid = state.invoices.reduce((sum, invoice) => sum + invoice.paid, 0);
  return `${pageHeading('Money desk', 'Finance', 'Track invoices, payments and the families who need a gentle reminder.', '<button class="button primary" data-action="record-payment">＋ Record payment</button>')}
    <div class="stat-grid"><article class="stat-card"><div class="stat-top"><span>Expected this term</span><span class="stat-icon">₦</span></div><div class="stat-value">${formatMoney(billed)}</div><div class="stat-foot">Across all active invoices</div></article><article class="stat-card"><div class="stat-top"><span>Collected</span><span class="stat-icon">✓</span></div><div class="stat-value">${formatMoney(paid)}</div><div class="stat-foot"><span class="positive">${Math.round(paid / billed * 100)}%</span> collection rate</div></article><article class="stat-card"><div class="stat-top"><span>Outstanding</span><span class="stat-icon">!</span></div><div class="stat-value">${formatMoney(billed - paid)}</div><div class="stat-foot"><span class="warning">2 families</span> need follow-up</div></article><article class="stat-card"><div class="stat-top"><span>Payments today</span><span class="stat-icon">↗</span></div><div class="stat-value">16</div><div class="stat-foot">Reconciled locally</div></article></div>
    <section class="panel"><div class="panel-header"><div><h2 class="panel-title">Recent invoices</h2><p class="panel-subtitle">Fees for 2026/27 Term 1</p></div><button class="button secondary" data-action="generate-invoices">Generate bulk invoices</button></div><table class="data-table"><thead><tr><th class="invoice-no mono-cell">Invoice</th><th>Student</th><th>Amount</th><th>Balance</th><th>Status</th><th>Date</th></tr></thead><tbody>${state.invoices.map(invoice => `<tr><td class="invoice-no mono-cell">${invoice.id}</td><td><strong>${escapeHtml(invoice.student)}</strong><span style="display:block;color:var(--muted);font-size:10px;margin-top:3px">${escapeHtml(invoice.className)}</span></td><td>${formatMoney(invoice.amount)}</td><td><strong>${formatMoney(invoice.amount - invoice.paid)}</strong></td><td><span class="badge ${invoice.status === 'Paid' ? 'paid' : invoice.status === 'Unpaid' ? 'unpaid' : 'pending'}">${invoice.status}</span></td><td>${invoice.date}</td></tr>`).join('')}</tbody></table></section>`;
}

function renderCommunications() {
  return `${pageHeading('Stay connected', 'Communications', 'Keep families informed with clear, targeted updates.', '<button class="button primary" data-action="new-announcement">＋ New announcement</button>')}
    <div class="card-grid"><article class="feature-card"><div class="quick-action-icon">✦</div><h3>Whole school update</h3><p>Share a resumption date, event or important notice with everyone.</p><button class="button secondary" data-action="new-announcement">Compose message</button></article><article class="feature-card"><div class="quick-action-icon">♧</div><h3>Target a class</h3><p>Send a focused update to a year group, class or staff team.</p><button class="button secondary" data-action="new-announcement">Choose audience</button></article><article class="feature-card"><div class="quick-action-icon">₦</div><h3>Fee reminders</h3><p>Reach parents with a clear, respectful reminder about an outstanding balance.</p><button class="button secondary" data-action="new-announcement">View debtors</button></article></div>
    <section class="panel" style="margin-top:18px"><div class="panel-header"><div><h2 class="panel-title">Announcement history</h2><p class="panel-subtitle">Messages are simulated in this local prototype</p></div><span class="badge active">All systems normal</span></div>${state.announcements.map(item => `<div class="activity-item"><div class="activity-icon">✦</div><div style="flex:1"><strong>${item.title}</strong><span>${item.audience} · ${item.date}</span></div><span class="badge active">${item.status}</span></div>`).join('')}</section>`;
}

function renderAi() {
  const defaultOutput = { comment: `${state.students[0]?.firstName || 'Maya'} is a thoughtful student who contributes positively to class discussions. This term ${state.students[0]?.firstName || 'Maya'} showed particular strength in problem-solving, especially with algebraic expressions. Continued practice with timed exercises will help build confidence ahead of the end-of-term examination.`, lesson: `Lesson plan: Algebraic expressions\nDuration: 40 minutes\n\nLearning objectives:\n1. Identify constants, variables and coefficients in simple expressions.\n2. Simplify expressions by collecting like terms.\n3. Substitute positive integers into expressions to find values.\n\nMaterials:\n- Whiteboard, algebra tiles or squared paper, 20 prepared practice cards.\n\nLesson steps:\n1. Starter (5 min): Quick mental arithmetic with "I think of a number…" prompts.\n2. Introduce vocabulary (10 min): Define constant, variable, coefficient with worked examples on board.\n3. Guided practice (15 min): Pupils work in pairs to simplify five expressions; teacher circulates to address misconceptions.\n4. Independent task (7 min): Exercise A from the textbook.\n5. Plenary (3 min): Three pupils share their answers on the board; class votes on agreement.\n\nEvaluation questions:\n- What is the coefficient of x in 4x − 7?\n- Simplify 3a + 2b − a + 5b.\n- Find the value of 2m + 3 when m = 4.\n\nHomework:\nExercise B questions 1–10.` };
  const genHtml = state.aiGenerations.length ? state.aiGenerations.map((item, idx) => {
    const isComment = item.title.toLowerCase().includes('comment');
    const body = item.body || (isComment ? defaultOutput.comment : defaultOutput.lesson);
    return `<div class="ai-panel" style="margin-top:${idx>0?'14px':'0'}"><div class="ai-status"><span class="ai-badge">AI DRAFT</span><span>${item.status}</span></div><div class="ai-output" contenteditable="true" spellcheck="false">${body.split('\n').map(l => `<p>${l || '&nbsp;'}</p>`).join('')}</div><div class="ai-actions"><button class="button primary" data-ai-approve="${idx}">✓ Approve</button><button class="button secondary" data-ai-edit="${idx}">✎ Edit</button><button class="button ghost" data-ai-discard="${idx}">✕ Discard</button></div></div>`;
  }).join('') : '<div class="empty-state"><strong>No AI drafts yet</strong><p>Generate a report comment or lesson plan to see it here.</p></div>';
  return `${pageHeading('Intelligence studio', 'Make the busywork lighter', 'AI drafts the first version. A teacher always reviews and approves the final work.', '<span class="badge" style="background:#ccfbf1;color:#115e59;padding:8px 10px">AI is on for this school</span>')}
    <div class="notice teal"><strong>Human approval required.</strong> Scholara never publishes a grade, sends a parent message or makes a student decision automatically.</div>
    <div class="card-grid">
      <article class="feature-card ai-studio-subject"><div class="quick-action-icon" style="background:#ccfbf1;color:var(--teal)">✎</div><h3>Report card comments</h3><p>Generate a thoughtful draft from scores, attendance and term-over-term progress for a teacher to edit.</p><div class="form-grid compact-form" style="margin-top:10px"><label>Student<select><option>${state.students[0]?.firstName || 'Maya'} ${state.students[0]?.lastName || 'Adeyemi'}</option></select></label><label>Class<select><option>JSS 2A</option></select></label></div><button class="button teal" data-action="generate-comment">Generate a comment</button></article>
      <article class="feature-card ai-studio-subject"><div class="quick-action-icon" style="background:#ccfbf1;color:var(--teal)">✧</div><h3>Lesson plan generator</h3><p>Turn a topic and duration into objectives, materials, lesson steps, evaluation and homework.</p><div class="form-grid compact-form" style="margin-top:10px"><label>Subject<select><option>Mathematics</option><option>English Language</option></select></label><label>Duration<select><option>40 minutes</option><option>60 minutes</option></select></label></div><button class="button teal" data-action="generate-lesson">Draft a lesson plan</button></article>
    </div>
    <section class="panel" style="margin-top:18px"><div class="panel-header"><div><h2 class="panel-title">Drafts awaiting review</h2><p class="panel-subtitle">Every generated draft remains editable and auditable</p></div></div>${genHtml}</section>`;
}

function renderSettings() {
  const tabs = tabsMarkup('settings-tabs', [
    { label: 'School profile', value: 'profile' },
    { label: 'Academic rules', value: 'academic' },
    { label: 'Finance rules', value: 'finance' },
    { label: 'Enabled modules', value: 'modules' }
  ], settingsTab);
  const modules = state.tenant.modules || { finance: true, ai: true, communications: true, reports: true };
  const panels = {
    profile: `<div class="panel-header"><div><h2 class="panel-title">School identity</h2><p class="panel-subtitle">This information appears on report cards and receipts.</p></div></div><div class="form-grid"><label>School name<input data-autosave="tenant.name" value="${escapeHtml(state.tenant.name)}" /></label><label>School slug<input data-autosave="tenant.slug" value="${escapeHtml(state.tenant.slug)}" /></label><label>Country<select data-autosave="tenant.country"><option ${state.tenant.country === 'Nigeria' ? 'selected' : ''}>Nigeria</option><option ${state.tenant.country === 'Ghana' ? 'selected' : ''}>Ghana</option><option ${state.tenant.country === 'Kenya' ? 'selected' : ''}>Kenya</option></select></label><label>Currency<select data-autosave="tenant.currency"><option ${state.tenant.currency === 'NGN' ? 'selected' : ''}>NGN · Nigerian naira</option><option ${state.tenant.currency === 'GHS' ? 'selected' : ''}>GHS · Ghanaian cedi</option></select></label></div><div class="panel-header" style="margin-top:15px;margin-bottom:0"><div><h2 class="panel-title">Brand colour</h2><p class="panel-subtitle">Choose a school colour. Accessibility is checked automatically.</p></div><div style="display:flex;align-items:center;gap:10px"><input data-autosave="tenant.brandPrimary" type="color" value="${state.tenant.brandPrimary}" id="brandColor" style="width:42px;height:32px;border:0;background:transparent" /><code id="brandHex">${state.tenant.brandPrimary}</code></div></div>`,
    academic: `<div class="panel-header"><div><h2 class="panel-title">Assessment weightings</h2><p class="panel-subtitle">How term scores are computed for every subject.</p></div></div><div class="weighting-list"><label><span>CA 1</span><input class="mini-input" data-autosave="setup.assessment.ca1" type="number" min="0" max="100" value="${state.setup.assessment.ca1}" />%</label><label><span>Assignment</span><input class="mini-input" data-autosave="setup.assessment.assignment" type="number" min="0" max="100" value="${state.setup.assessment.assignment}" />%</label><label><span>Exam</span><input class="mini-input" data-autosave="setup.assessment.exam" type="number" min="0" max="100" value="${state.setup.assessment.exam}" />%</label></div><div class="form-grid compact-form" style="margin-top:20px"><label>Grade scale<select data-autosave="setup.assessment.scale"><option ${state.setup.assessment.scale === 'A-F' ? 'selected' : ''}>A-F</option><option ${state.setup.assessment.scale === 'A1-C6' ? 'selected' : ''}>A1-C6</option><option ${state.setup.assessment.scale === '1-7' ? 'selected' : ''}>1-7</option></select></label><label>Pass mark<input data-autosave="setup.assessment.passMark" type="number" min="0" max="100" value="${state.setup.assessment.passMark}" /></label></div><div class="notice teal" style="margin-top:18px;margin-bottom:0">Assessment changes save locally and will drive the score-entry and report-card views.</div>`,
    finance: `<div class="panel-header"><div><h2 class="panel-title">Finance rules</h2><p class="panel-subtitle">Terms, late fees and default payment windows.</p></div></div><div class="form-grid"><label>Default term fee (₦)<input type="number" min="0" step="500" value="90000" /></label><label>Late fee after (days)<input type="number" min="0" value="14" /></label><label>Late fee flat (₦)<input type="number" min="0" step="500" value="5000" /></label><label>Payment reminder cadence<select><option>None</option><option>Every 7 days</option><option>Every 14 days</option><option>Every 30 days</option></select></label></div><div class="notice" style="margin-top:18px;margin-bottom:0"><strong>Prototype values only.</strong> These rules are displayed locally and will drive real workflows once connected to a backend.</div>`,
    modules: `<div class="panel-header"><div><h2 class="panel-title">Enabled modules</h2><p class="panel-subtitle">Turn on the tools each role in your school needs.</p></div></div><div style="display:flex;flex-direction:column;gap:16px;margin-top:4px"><div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px dashed var(--line)"><div><strong>Finance &amp; fees</strong><p style="margin:4px 0 0;color:var(--muted);font-size:13px">Invoices, payments and receipts.</p></div>${segmentedMarkup('module-finance',[{label:'Off',value:'off'},{label:'On',value:'on'}], modules.finance?'on':'off')}</div><div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px dashed var(--line)"><div><strong>AI Studio</strong><p style="margin:4px 0 0;color:var(--muted);font-size:13px">AI-assisted comments and lesson plans.</p></div>${segmentedMarkup('module-ai',[{label:'Off',value:'off'},{label:'On',value:'on'}], modules.ai?'on':'off')}</div><div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px dashed var(--line)"><div><strong>Communications</strong><p style="margin:4px 0 0;color:var(--muted);font-size:13px">Announcements, email and SMS.</p></div>${segmentedMarkup('module-communications',[{label:'Off',value:'off'},{label:'On',value:'on'}], modules.communications?'on':'off')}</div><div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0"><div><strong>Reports &amp; insights</strong><p style="margin:4px 0 0;color:var(--muted);font-size:13px">Cross-school dashboards and exports.</p></div>${segmentedMarkup('module-reports',[{label:'Off',value:'off'},{label:'On',value:'on'}], modules.reports?'on':'off')}</div></div>`
  };
  return `${pageHeading('Workspace controls', 'Settings', 'Shape your workspace without changing the way the product works.', '<button class="button primary" data-action="save-settings">Save changes</button>')}
    ${tabs}
    <section class="panel" style="margin-top:14px">${panels[settingsTab]}</section>
    <section class="panel" style="margin-top:18px"><div class="panel-header"><div><h2 class="panel-title">Prototype data</h2><p class="panel-subtitle">Your current demo data lives in this browser only.</p></div></div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="button secondary" data-action="export">↓ Export JSON</button><button class="button secondary" data-action="reset">↻ Reset demo data</button></div></section>`;
}

function bindViewActions() {
  document.querySelectorAll('[data-view]').forEach(element => element.addEventListener('click', () => { currentView = element.dataset.view; window.history.replaceState({}, '', `#${currentView}`); closeSidebar(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }));
  document.querySelectorAll('[data-href]').forEach(element => element.addEventListener('click', () => { window.location.href = element.dataset.href; }));
  document.querySelectorAll('[data-role-login]').forEach(element => element.addEventListener('click', () => { state.currentUser.role = element.dataset.roleLogin; saveSession(state.currentUser.role); currentView = 'dashboard'; window.history.replaceState({}, '', '#dashboard'); saveState(`Signed in locally as ${state.currentUser.role}`); render(); }));
  const registerForm = document.getElementById('registerForm');
  if (registerForm) registerForm.addEventListener('submit', event => { event.preventDefault(); state.tenant.setupProgress = 0; state.setup.completed = []; state.setup.current = 'identity'; state.setup.provisioning = true; currentView = 'provisioning'; window.history.replaceState({}, '', '#provisioning'); saveState('Local school workspace created'); render(); window.setTimeout(() => { state.setup.provisioning = false; currentView = 'setup'; window.history.replaceState({}, '', '#setup'); saveState('Workspace provisioned with starter records'); render(); }, 1300); });
  document.querySelectorAll('[data-action]').forEach(element => element.addEventListener('click', () => handleAction(element.dataset.action, element.dataset.step)));
  const search = document.getElementById('studentSearch');
  if (search) search.addEventListener('input', event => { const query = event.target.value.toLowerCase(); document.getElementById('studentRows').innerHTML = studentRows(state.students.filter(student => `${student.firstName} ${student.lastName} ${student.admissionNo} ${student.className}`.toLowerCase().includes(query))); });
  document.querySelectorAll('.attendance-toggle').forEach(button => button.addEventListener('click', () => { const student = button.dataset.student; const exceptions = state.attendance.exceptions; state.attendance.exceptions = exceptions.includes(student) ? exceptions.filter(name => name !== student) : [...exceptions, student]; state.attendance.marked = state.attendance.total - state.attendance.exceptions.length; saveState('Attendance updated locally'); render(); }));
  document.querySelectorAll('.score-input').forEach(input => input.addEventListener('change', () => { const name = input.dataset.name; const row = input.closest('tr'); const values = [...row.querySelectorAll('.score-input')].map(field => Number(field.value) || 0); state.scores[name] = Math.min(100, values.reduce((sum, value) => sum + value, 0)); saveState('Score saved locally'); render(); }));
  const color = document.getElementById('brandColor');
  if (color) color.addEventListener('input', event => { state.tenant.brandPrimary = event.target.value; document.getElementById('brandHex').textContent = event.target.value; });
  document.querySelectorAll('[data-autosave]').forEach(field => field.addEventListener('input', () => autosaveField(field)));
  document.querySelectorAll('[data-autosave]').forEach(field => field.addEventListener('change', () => autosaveField(field)));
  const staffSearch = document.getElementById('staffSearch');
  if (staffSearch) staffSearch.addEventListener('input', event => { const query = event.target.value.toLowerCase(); document.getElementById('staffRows').innerHTML = state.staff.filter(staff => `${staff.name} ${staff.role} ${staff.subjects}`.toLowerCase().includes(query)).map(staff => `<tr><td><div class="person"><div class="person-avatar">${staff.initials}</div><strong>${staff.name}</strong></div></td><td>${staff.role}</td><td>${staff.subjects}</td><td><span class="badge ${staff.status === 'Active' ? 'active' : 'pending'}">${staff.status}</span></td></tr>`).join(''); });
  const roleSwitcher = document.getElementById('roleSwitcher');
  if (roleSwitcher) { roleSwitcher.value = state.currentUser.role; roleSwitcher.addEventListener('change', event => { state.currentUser.role = event.target.value; saveSession(state.currentUser.role); saveState(`Viewing Scholara as ${state.currentUser.role}`); render(); }); }
}

function autosaveField(field) {
  const path = field.dataset.autosave.split('.');
  let target = state;
  path.slice(0, -1).forEach(key => { target = target[key]; });
  target[path[path.length - 1]] = field.value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (field.dataset.autosave === 'tenant.brandPrimary' && document.getElementById('brandHex')) document.getElementById('brandHex').textContent = field.value;
  if (field.dataset.autosave.startsWith('tenant.')) document.getElementById('workspaceContext').textContent = `${state.tenant.currentSession} · ${state.tenant.currentTerm}`;
}

function applyRoleNavigation() {
  const visibleViews = (rolePolicies[state.currentUser.role] || rolePolicies['School owner']).views;
  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => { item.hidden = !visibleViews.includes(item.dataset.view); });
}

function hasPermission(permission) {
  return (rolePolicies[state.currentUser.role] || rolePolicies['School owner']).permissions.includes(permission);
}

function handleAction(action, value) {
  if (action === 'logout') {
    clearSession();
    window.location.href = 'login.html';
    return;
  }
  if (action === 'add-student') { if (hasPermission('students.create')) openModal(); else showToast('Your role cannot create student records'); }
  if (action === 'mark-all') { if (hasPermission('attendance.mark')) saveState('Attendance register saved locally'); else showToast('Your role cannot mark attendance'); }
  if (action === 'save-results') { if (hasPermission('results.enter')) saveState('Results submitted for review'); else showToast('Your role cannot submit results'); }
  if (action === 'recalculate') { saveState('Results recalculated from raw scores'); render(); }
  if (action === 'record-payment') { if (hasPermission('fees.payment.record')) openDrawer(); else showToast('Your role cannot record payments'); }
  if (action === 'generate-invoices') showToast('Bulk invoice workflow is ready for the next slice');
  if (action === 'new-announcement') showToast('Announcement composer is ready for the next slice');
  if (action === 'email-parent') showToast('Parent email workflow is ready for the next slice');
  if (action === 'edit-profile') showToast('Edit student profile form is ready for the next slice');
  if (action === 'generate-comment') { state.aiGenerations.unshift({ title: `${state.students[0].firstName} ${state.students[0].lastName} · Report card comment`, status: 'Needs teacher approval' }); saveState('AI draft created - review before publishing'); render(); }
  if (action === 'generate-lesson') { state.aiGenerations.unshift({ title: 'Lesson plan · Mathematics · Algebraic expressions', status: 'Needs teacher approval' }); saveState('AI lesson plan draft created'); render(); }
  if (action === 'save-settings') { state.tenant.setupProgress = Math.max(state.tenant.setupProgress, 80); saveState('School settings saved locally'); }
  if (action === 'setup-step') { state.setup.current = value || state.setup.current; render(); }
  if (action === 'next-setup') { advanceSetup(1); }
  if (action === 'previous-setup') { advanceSetup(-1); }
  if (action === 'complete-setup') { state.tenant.setupProgress = 100; state.setup.completed = ['identity', 'calendar', 'structure', 'assessment', 'team']; currentView = 'dashboard'; window.history.replaceState({}, '', '#dashboard'); saveState('School setup completed'); render(); }
  if (action === 'invite-staff') showToast('Staff invitation flow is ready for the next local slice');
  if (action === 'save-academics') saveState('Academic structure saved locally');
  if (action === 'add-subject') { state.academics.subjects.push('Creative Arts'); saveState('Creative Arts added to subjects'); render(); }
  if (action === 'print-report') window.print();
  if (action === 'report-preview') showToast('Report preview is ready for the next reporting slice');
  if (action === 'export') exportData();
  if (action === 'reset') {
    if (!hasPermission('data.reset')) { showToast('Your role cannot reset demo data'); return; }
    openConfirm('Reset all local demo data?', 'This will clear every local record and cannot be undone.', state.tenant.slug || 'RESET', () => {
      state = structuredClone(seedState);
      saveState('Demo data reset');
      render();
    });
  }
}

function advanceSetup(direction) {
  const steps = ['identity', 'calendar', 'structure', 'assessment', 'team'];
  const currentIndex = steps.indexOf(state.setup.current);
  const nextIndex = Math.max(0, Math.min(steps.length - 1, currentIndex + direction));
  state.setup.completed = [...new Set([...state.setup.completed, state.setup.current])];
  state.setup.current = steps[nextIndex];
  state.tenant.setupProgress = Math.min(100, Math.max(state.tenant.setupProgress, Math.round((state.setup.completed.length / steps.length) * 100)));
  saveState('Setup progress saved locally');
  render();
}

function openModal() { document.getElementById('modalBackdrop').hidden = false; document.querySelector('#studentForm input').focus(); }
function closeModal() { document.getElementById('modalBackdrop').hidden = true; document.getElementById('studentForm').reset(); }
function exportData() { const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'scholara-demo-data.json'; link.click(); URL.revokeObjectURL(url); showToast('Demo data exported'); }
function showToast(message) { const toast = document.getElementById('toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(window.toastTimeout); window.toastTimeout = setTimeout(() => toast.classList.remove('show'), 2600); }

document.getElementById('studentForm').addEventListener('submit', event => { event.preventDefault(); const form = new FormData(event.target); const firstName = form.get('firstName').trim(); const lastName = form.get('lastName').trim(); const initials = `${firstName[0]}${lastName[0]}`.toUpperCase(); state.students.unshift({ id: `stu-${Date.now()}`, firstName, lastName, admissionNo: `GFA/2026/${String(152 + state.students.length).padStart(4, '0')}`, className: form.get('className'), guardian: form.get('guardian'), status: 'Active', attendance: 100, initials }); saveState(`${firstName} ${lastName} added to Students`); closeModal(); currentView = 'students'; render(); });
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
document.getElementById('modalBackdrop').addEventListener('click', event => { if (event.target.id === 'modalBackdrop') closeModal(); });
window.addEventListener('hashchange', () => { parseHash(); render(); });
function setSidebarOpen(isOpen) {
  const sidebar = document.getElementById('sidebar');
  const menuButton = document.getElementById('mobileMenu');
  const backdrop = document.getElementById('sidebarBackdrop');
  sidebar.classList.toggle('open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
  backdrop.classList.toggle('open', isOpen);
}

function closeSidebar() {
  setSidebarOpen(false);
}

document.getElementById('mobileMenu').addEventListener('click', () => setSidebarOpen(!document.getElementById('sidebar').classList.contains('open')));
document.getElementById('sidebarBackdrop').addEventListener('click', closeSidebar);
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeSidebar(); });
document.getElementById('helpButton').addEventListener('click', () => showToast('Support centre will be connected in the next phase'));
document.getElementById('termSwitcher').addEventListener('change', event => { const [, term] = event.target.value.split(' · '); state.tenant.currentTerm = term; saveState(`Switched to ${term}`); render(); });
document.getElementById('schoolSwitcher').addEventListener('click', () => showToast('This local prototype contains one school: '));
document.getElementById('searchButton').addEventListener('click', openCommandPalette);
document.getElementById('notificationButton').addEventListener('click', () => showToast('You have 4 pending approvals'));
document.getElementById('notificationButton').addEventListener('click', () => {
  const panel = document.getElementById('notificationPanel');
  panel.hidden = !panel.hidden;
  document.getElementById('notificationItems').innerHTML = state.notifications.map(note => `<div class="notification-item ${note.unread ? 'unread' : ''}"><i></i><div><strong>${escapeHtml(note.title)}</strong><span>${escapeHtml(note.detail)}</span></div></div>`).join('');
});
document.getElementById('markNotificationsRead').addEventListener('click', () => { state.notifications.forEach(note => { note.unread = false; }); saveState('Notifications marked as read'); document.getElementById('notificationPanel').hidden = true; });
document.addEventListener('click', event => { const panel = document.getElementById('notificationPanel'); if (!panel.hidden && !panel.contains(event.target) && event.target.id !== 'notificationButton') panel.hidden = true; const confirmBd = document.getElementById('confirmBackdrop'); if (!confirmBd.hidden && (event.target.dataset && event.target.dataset.confirmClose !== undefined || event.target.id === 'confirmBackdrop')) closeConfirm(); const drawBd = document.getElementById('drawerBackdrop'); if (!drawBd.hidden && event.target.id === 'drawerBackdrop') closeDrawer(); const datePop = document.getElementById('paymentDatePop'); if (!datePop.hidden && !datePop.contains(event.target) && event.target.id !== 'paymentDatePicker' && event.target.id !== 'paymentDateInput') datePop.hidden = true; const comboSug = document.getElementById('invoiceComboboxSuggestions'); if (!comboSug.hidden && !document.getElementById('invoiceCombobox').contains(event.target)) comboSug.hidden = true; });
function openCommandPalette() {
  const backdrop = document.getElementById('commandBackdrop');
  backdrop.hidden = false;
  renderCommandResults('');
  document.getElementById('commandInput').value = '';
  document.getElementById('commandInput').focus();
}

function closeCommandPalette() { document.getElementById('commandBackdrop').hidden = true; }

function renderCommandResults(query) {
  const adminVisible = hasPermission('admin.access');
  const navigateActions = [
    ['dashboard', 'Open overview', '⌂'], ['setup', 'Open setup', '✓'], ['students', 'Open students', '♧'], ['staff', 'Open staff', '♙'], ['academics', 'Open academics', '▤'], ['attendance', 'Mark attendance', '◷'], ['results', 'Enter results', '▦'], ['report-cards', 'Open report cards', '▧'], ['finance', 'Open finance', '₦'], ['communications', 'Open communications', '✦'], ['reports', 'Open reports', '◒'], ['ai', 'Open AI studio', '✧'], ['settings', 'Open settings', '⚙'],
    ...(adminVisible ? [['admin-overview', 'Admin: overview', '⌁'], ['admin-schools', 'Admin: schools', '◫'], ['admin-billing', 'Admin: billing', '₦'], ['admin-support', 'Admin: support', '✦'], ['admin-flags', 'Admin: feature flags', '⚑'], ['admin-audit', 'Admin: audit log', '▤']] : [])
  ].map(([view, label, icon]) => ({ view, label, icon, detail: 'Navigate' }));
  const actions = [...navigateActions, ...state.students.slice(0, 5).map(student => ({ studentId: student.id, view: 'students', label: `${student.firstName} ${student.lastName}`, icon: '♧', detail: `${student.className} · ${student.admissionNo} · Open profile` }))];
  const filtered = actions.filter(action => `${action.label} ${action.detail}`.toLowerCase().includes(query.toLowerCase()));
  document.getElementById('commandResults').innerHTML = filtered.length ? filtered.map(action => `<button class="command-item" data-command-view="${action.view}" data-command-student="${action.studentId || ''}"><span>${action.icon}</span><strong>${escapeHtml(action.label)}</strong><small>${escapeHtml(action.detail)}</small><kbd>↵</kbd></button>`).join('') : '<div class="empty-state"><strong>No matches</strong><p>Try a student name or module.</p></div>';
  document.querySelectorAll('[data-command-view]').forEach(item => item.addEventListener('click', () => {
    const sid = item.dataset.commandStudent;
    if (sid) { window.location.hash = `#students/${sid}`; } else { currentView = item.dataset.commandView; window.history.replaceState({}, '', `#${currentView}`); }
    closeCommandPalette(); render();
  }));
}

document.getElementById('commandInput').addEventListener('input', event => renderCommandResults(event.target.value));
document.getElementById('commandBackdrop').addEventListener('click', event => { if (event.target.id === 'commandBackdrop') closeCommandPalette(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeCommandPalette(); closeConfirm(); closeDrawer(); document.getElementById('notificationPanel').hidden = true; } if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openCommandPalette(); } });

document.getElementById('confirmInput').addEventListener('input', event => {
  const submit = document.getElementById('confirmSubmit');
  const phrase = document.getElementById('confirmPhrase').textContent;
  submit.disabled = event.target.value.trim() !== phrase;
});
document.getElementById('confirmSubmit').addEventListener('click', () => {
  if (document.getElementById('confirmSubmit').disabled) return;
  const cb = window._confirmCallback; closeConfirm(); if (typeof cb === 'function') cb();
});
document.querySelectorAll('[data-confirm-close]').forEach(el => el.addEventListener('click', closeConfirm));

document.getElementById('drawerClose').addEventListener('click', closeDrawer);
document.getElementById('drawerCancel').addEventListener('click', closeDrawer);

const invoiceCbInput = document.getElementById('invoiceComboboxInput');
if (invoiceCbInput) {
  invoiceCbInput.addEventListener('focus', () => { const box = document.getElementById('invoiceComboboxSuggestions'); box.innerHTML = buildComboboxSuggestions(invoiceCbInput.value); box.hidden = false; });
  invoiceCbInput.addEventListener('input', () => { const box = document.getElementById('invoiceComboboxSuggestions'); box.innerHTML = buildComboboxSuggestions(invoiceCbInput.value); box.hidden = false; });
  invoiceCbInput.addEventListener('click', (e) => { e.stopPropagation(); const box = document.getElementById('invoiceComboboxSuggestions'); box.innerHTML = buildComboboxSuggestions(invoiceCbInput.value); box.hidden = false; });
}
document.addEventListener('click', (e) => {
  const item = e.target.closest('.combobox-item'); if (!item) return;
  const id = item.dataset.invoiceId; if (!id) return;
  const inv = state.invoices.find(x => x.id === id); if (!inv) return;
  document.getElementById('invoiceComboboxInput').value = `${inv.id} · ${inv.student}`;
  document.getElementById('invoiceCombobox').dataset.selectedInvoiceId = id;
  document.getElementById('paymentAmount').value = String(inv.amount - inv.paid);
  document.getElementById('invoiceComboboxSuggestions').hidden = true;
});

document.getElementById('paymentDatePicker').addEventListener('click', (e) => { e.stopPropagation(); const pop = document.getElementById('paymentDatePop'); pop.innerHTML = renderDatePicker(); pop.hidden = !pop.hidden; });
document.getElementById('paymentDateInput').addEventListener('click', (e) => { e.stopPropagation(); const pop = document.getElementById('paymentDatePop'); pop.innerHTML = renderDatePicker(); pop.hidden = false; });
document.addEventListener('click', (e) => {
  const day = e.target.closest('.day[data-day]'); if (!day) return;
  const d = Number(day.dataset.day); if (!d) return;
  paymentDateState.selected = new Date(paymentDateState.year, paymentDateState.month, d);
  const fmt = `${paymentDateState.year}-${String(paymentDateState.month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  document.getElementById('paymentDateInput').value = fmt;
  document.getElementById('paymentDatePop').hidden = true;
});
document.addEventListener('click', (e) => {
  if (e.target.id === 'datePrevMonth') {
    if (paymentDateState.month === 0) { paymentDateState.month = 11; paymentDateState.year--; } else paymentDateState.month--;
    document.getElementById('paymentDatePop').innerHTML = renderDatePicker();
  }
  if (e.target.id === 'dateNextMonth') {
    if (paymentDateState.month === 11) { paymentDateState.month = 0; paymentDateState.year++; } else paymentDateState.month++;
    document.getElementById('paymentDatePop').innerHTML = renderDatePicker();
  }
});

document.getElementById('paymentForm').addEventListener('submit', event => {
  event.preventDefault();
  const combobox = document.getElementById('invoiceCombobox');
  const invId = combobox.dataset.selectedInvoiceId;
  const inv = state.invoices.find(i => i.id === invId);
  if (!inv) { showToast('Please select an invoice'); return; }
  const amount = Number(document.getElementById('paymentAmount').value) || 0;
  if (amount <= 0) { showToast('Please enter a positive amount'); return; }
  const method = document.getElementById('paymentMethod').value;
  const notes = document.getElementById('paymentNotes').value;
  inv.paid = Math.min(inv.amount, inv.paid + amount);
  inv.status = inv.paid >= inv.amount ? 'Paid' : inv.paid > 0 ? 'Part-paid' : inv.status;
  if (!state.payments) state.payments = [];
  state.payments.unshift({ id: `PAY-${Date.now()}`, invoiceId: invId, amount, method, notes, date: new Date().toISOString().slice(0,10) });
  saveState(`Payment of ${formatMoney(amount)} applied to ${invId}`);
  closeDrawer();
  render();
});

render();
