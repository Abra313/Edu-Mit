if (!window.EduTenant) document.write('<script src="tenant-store.js"><\\/script>');
const toast = document.querySelector('.toast');
let toastTimer;
const brand = document.querySelector('.brand');
if (brand) { brand.querySelector('strong').textContent = 'Edu-mit'; const mark = brand.querySelector('span'); if (mark) mark.outerHTML = '<img src="logo.svg" alt="Edu-mit logo">'; }
function showToast(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2200); }
const page = new URLSearchParams(window.location.search).get('page') || 'overview';
const navGroups = [
	{ label: 'Dashboard', items: [['overview', '⌂', 'Dashboard Overview']] },
	{ label: 'Student Management', items: [['students', '♧', 'Students'], ['admissions', '＋', 'Admissions'], ['student-documents', '▤', 'Documents'], ['student-id-cards', '▣', 'ID Cards'], ['student-history', '◌', 'Academic History']] },
	{ label: 'Teacher Management', items: [['teachers', '♙', 'Teachers'], ['subject-assignment', '↔', 'Subject Assignment'], ['class-assignment', '⌘', 'Class Assignment'], ['teacher-performance', '↗', 'Performance Tracking']] },
	{ label: 'Academic Management', items: [['academics', '▤', 'Classes & Arms'], ['subjects', '▥', 'Subjects'], ['timetables', '▦', 'Timetables']] },
	{ label: 'Attendance', items: [['attendance', '◷', 'Student Attendance'], ['staff-attendance', '◴', 'Staff Attendance'], ['attendance-reports', '◒', 'Attendance Reports']] },
	{ label: 'Examinations', items: [['examinations', '✎', 'Exam Creation'], ['cbt', '▦', 'CBT Examination'], ['question-bank', '☷', 'Question Bank'], ['results', '✓', 'Results & Approval'], ['report-cards', '▧', 'Report Cards'], ['performance', '↗', 'Performance Analysis']] },
	{ label: 'Finance', items: [['finance', '₦', 'School Fees'], ['payments', '₦', 'Payment Collection'], ['invoices', '▤', 'Invoices & Receipts'], ['debtors', '!', 'Debtors List'], ['financial-reports', '◒', 'Financial Reports']] },
	{ label: 'School Services', items: [['library', '▥', 'Library Management'], ['hostel', '⌂', 'Hostel Management'], ['communications', '✦', 'Communication Center'], ['payroll', '₦', 'Staff Payroll']] },
	{ label: 'Reports & AI', items: [['reports', '◒', 'Reports & Analytics'], ['ai', '✧', 'AI Features']] },
	{ label: 'Platform', items: [['settings', '⚙', 'School Settings'], ['subscription', '◇', 'Subscription Plan']] }
];

function renderAdminNavigation() {
	const nav = document.querySelector('.sidebar nav');
	nav.innerHTML = navGroups.map(group => `<div class="nav-group"><small>${group.label}</small>${group.items.map(([key, icon, label]) => `<a class="${page === key ? 'active' : ''}" href="admin.html?page=${key}"><span class="nav-symbol">${icon}</span><span>${label}</span>${key === 'students' ? `<b>${getStudents().length}</b>` : ''}${key === 'finance' ? '<b class="dot"></b>' : ''}</a>`).join('')}</div>`).join('');
	document.querySelectorAll('a[href^="#"]').forEach(link => {
		const target = link.getAttribute('href').slice(1);
		link.href = `admin.html?page=${target === 'overview' ? 'overview' : target}`;
	});
}

const STUDENTS_KEY = 'scholara:students:v1';
const SETTINGS_KEY = 'edumit:school-settings:v1';
const SUBSCRIPTION_KEY = 'edumit:subscription:v1';
const seededStudents = [
	{ id: 'stu-1', name: 'Maya Adeyemi', admissionNo: 'GFA/2026/0147', className: 'JSS 2A', guardian: 'Tunde Adeyemi', status: 'Active', documents: ['Birth certificate', 'Passport photo'], scores: { Mathematics: 82, English: 78, 'Basic Science': 91 } },
	{ id: 'stu-2', name: 'Daniel Okoro', admissionNo: 'GFA/2026/0148', className: 'JSS 2A', guardian: 'Chioma Okoro', status: 'Active', documents: ['Birth certificate'], scores: { Mathematics: 74, English: 81, 'Basic Science': 76 } },
	{ id: 'stu-3', name: 'Zainab Bello', admissionNo: 'GFA/2026/0149', className: 'Primary 5', guardian: 'Amina Bello', status: 'Active', documents: ['Birth certificate', 'Passport photo', 'Medical form'], scores: { Mathematics: 91, English: 88, 'Basic Science': 94 } }
];

function getStudents() {
	const session = EduTenant.currentSession();
	if (session?.schoolId) {
		const students = EduTenant.schoolStudents(session.schoolId);
		if (students.length) return students;
		if (!localStorage.getItem(EduTenant.KEYS.students)) { EduTenant.saveSchoolStudents(session.schoolId, seededStudents); return EduTenant.schoolStudents(session.schoolId); }
		return students;
	}
	return structuredClone(seededStudents);
}
function saveStudents(students, message) {
	const schoolId = EduTenant.currentSession()?.schoolId;
	if (schoolId) EduTenant.saveSchoolStudents(schoolId, students);
	if (message) showToast(message);
}
function safeText(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char])); }
function studentNameInitials(name) { return name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase(); }
function studentCardMarkup(student, schoolName) { return `<article class="id-card school-id-card"><div class="id-card-head"><div class="id-school-mark">◆</div><div><strong>${safeText(schoolName)}</strong><small>Student identity card</small></div></div><div class="id-card-body"><div class="id-photo">${student.passport ? `<img src="${student.passport}" alt="${safeText(student.name)} passport">` : `<span>${studentNameInitials(student.name)}</span>`}</div><div class="id-details"><h3>${safeText(student.name)}</h3><p><b>Admission No:</b> ${safeText(student.admissionNo)}</p><p><b>Class:</b> ${safeText(student.className)}</p><p><b>Parent:</b> ${safeText(student.parentName || student.guardian)}</p><p><b>Phone:</b> ${safeText(student.phone || 'Not provided')}</p><p><b>Address:</b> ${safeText(student.address || 'Not provided')}</p></div></div><div class="id-card-footer"><span>Valid for 2026/27</span><span class="signature">Admin signature</span></div></article>`; }

const defaultSettings = { schoolName: '', schoolCode: '', logoUrl: '', country: 'Nigeria', session: '2026/27', term: 'Term 1', currency: 'NGN', passMark: 50, gradingScale: 'A-F', modules: { finance: true, ai: true, communications: true, library: true, hostel: false } };
const defaultSubscription = { plan: 'Standard', renewalDate: '30 Sep 2026', status: 'Active' };
function getSettings() { try { const saved = EduTenant.schoolSettings(EduTenant.currentSession()?.schoolId) || {}; return { ...defaultSettings, ...saved, modules: { ...defaultSettings.modules, ...(saved.modules || {}) } }; } catch (error) { return structuredClone(defaultSettings); } }
function getSubscription() { try { return { ...defaultSubscription, ...(EduTenant.schoolSubscription(EduTenant.currentSession()?.schoolId) || {}) }; } catch (error) { return structuredClone(defaultSubscription); } }
function saveSettings(settings, message = 'School settings saved locally') { EduTenant.saveSchoolSettings(EduTenant.currentSession()?.schoolId, settings); showToast(message); }
function readLogoFile(file) { return new Promise((resolve, reject) => { if (!file || !file.size) return resolve(''); if (!file.type.startsWith('image/')) return reject(new Error('Choose a PNG, JPG, or WebP logo.')); if (file.size > 2 * 1024 * 1024) return reject(new Error('School logo must be smaller than 2 MB.')); const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('The logo could not be read.')); reader.readAsDataURL(file); }); }
function saveSubscription(subscription) { EduTenant.saveSchoolSubscription(EduTenant.currentSession()?.schoolId, subscription); showToast(`${subscription.plan} plan selected`); }
function getSchoolData() { const defaults = { teachers: [], classes: [], subjects: [], attendance: { today: 0 }, fees: { collected: 0, outstanding: 0 }, events: [] }; return { ...defaults, ...EduTenant.schoolData(EduTenant.currentSession()?.schoolId), attendance: { ...defaults.attendance, ...(EduTenant.schoolData(EduTenant.currentSession()?.schoolId).attendance || {}) }, fees: { ...defaults.fees, ...(EduTenant.schoolData(EduTenant.currentSession()?.schoolId).fees || {}) } }; }
function formatNaira(value) { return `₦${Number(value || 0).toLocaleString('en-NG')}`; }

function renderStudentPage() {
	const students = getStudents();
	const content = document.querySelector('.content');
	const active = students.filter(student => student.status === 'Active').length;
		const schoolData = getSchoolData();
	if (page === 'students') {
		content.innerHTML = `<div class="page-heading-row"><div><strong>Students</strong><span>Search, update and manage every student record.</span></div><button class="primary" data-action="open-student-form">＋ Add student</button></div><section class="stats"><article><small>Active students</small><strong>${active}</strong><em>Live local records</em></article><article><small>Classes</small><strong>${new Set(students.map(student => student.className)).size}</strong><em>Current classes</em></article><article><small>Documents uploaded</small><strong>${students.reduce((total, student) => total + student.documents.length, 0)}</strong><em>Across all records</em></article><article><small>Pending review</small><strong>${students.filter(student => student.status === 'Pending').length}</strong><em>Needs attention</em></article></section><section class="panel table-panel student-table-panel"><div class="panel-head"><div><h2>Student directory</h2><p>Changes save instantly in this browser.</p></div><input class="table-search" id="studentSearch" placeholder="Search name or admission no."></div><div id="studentTable">${studentTableMarkup(students)}</div></section><section class="panel student-form-panel" id="studentFormPanel" hidden>${studentFormMarkup()}</section>`;
	} else if (page === 'admissions') {
		content.innerHTML = `<div class="page-heading-row"><div><strong>Student Admission</strong><span>Create a new admission record and keep its review status visible.</span></div></div><section class="panel student-form-panel">${studentFormMarkup(true)}</section><section class="panel table-panel"><div class="panel-head"><div><h2>Admission pipeline</h2><p>Pending records are ready for review.</p></div></div>${studentTableMarkup(students.filter(student => student.status === 'Pending'))}</section>`;
	} else if (page === 'student-documents') {
		content.innerHTML = `<div class="page-heading-row"><div><strong>Student Documents</strong><span>Track required documents for every student.</span></div><button class="primary" data-action="mark-document">＋ Mark uploaded</button></div><section class="panel table-panel"><table><thead><tr><th>Student</th><th>Documents</th><th>Progress</th><th>Action</th></tr></thead><tbody>${students.map(student => { const progress = Math.min(100, Math.round(student.documents.length / 3 * 100)); return `<tr><td><strong>${safeText(student.name)}</strong><small>${safeText(student.admissionNo)}</small></td><td>${student.documents.map(document => `<mark>${safeText(document)}</mark>`).join(' ') || '<span class="muted-cell">None uploaded</span>'}</td><td><div class="mini-progress"><span style="width:${progress}%"></span></div><small>${student.documents.length}/3 required</small></td><td><button class="table-action" data-document-student="${student.id}">Update</button></td></tr>`; }).join('')}</tbody></table></section>`;
	} else if (page === 'student-id-cards') {
		const schoolName = getSettings().schoolName;
		content.innerHTML = `<div class="page-heading-row"><div><strong>Student ID Cards</strong><span>Create cards like the supplied school ID sample and save passport photos locally.</span></div><button class="primary" data-action="print-cards">Print cards</button></div><section class="panel id-card-form-panel"><form id="idCardForm" class="student-form"><div class="form-grid"><label>Student<select name="studentId" required>${students.map(student => `<option value="${student.id}">${safeText(student.name)} · ${safeText(student.admissionNo)}</option>`).join('')}</select></label><label>Parent / guardian phone<input name="phone" placeholder="+234 800 000 0000"></label><label>Parent / guardian name<input name="parentName" placeholder="Guardian name"></label><label>Student address<input name="address" placeholder="School or home address"></label><label class="full-field">Passport photograph<input name="passport" type="file" accept="image/png,image/jpeg,image/webp" required></label></div><p class="form-error" id="idCardError"></p><button class="primary" type="submit">Save student ID card</button></form></section><section class="id-card-grid">${students.map(student => studentCardMarkup(student, schoolName)).join('')}</section>`;
	} else if (page === 'student-history') {
		content.innerHTML = `<div class="page-heading-row"><div><strong>Academic History</strong><span>Review classes, results and progression for each student.</span></div></div><section class="panel table-panel"><table><thead><tr><th>Student</th><th>Current class</th><th>Average</th><th>History</th></tr></thead><tbody>${students.map(student => { const values = Object.values(student.scores); const average = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length); return `<tr><td><strong>${safeText(student.name)}</strong><small>${safeText(student.admissionNo)}</small></td><td>${safeText(student.className)}</td><td><strong class="score-value">${average}%</strong></td><td><button class="table-action" data-history-student="${student.id}">View history</button></td></tr>`; }).join('')}</tbody></table></section>`;
	}
}

function studentTableMarkup(students) {
	if (!students.length) return '<div class="empty-module"><strong>No student records yet</strong><p>Create an admission record to see it here.</p></div>';
	return `<table><thead><tr><th>Student</th><th>Class</th><th>Guardian</th><th>Status</th><th>Action</th></tr></thead><tbody>${students.map(student => `<tr><td><strong>${safeText(student.name)}</strong><small>${safeText(student.admissionNo)}</small></td><td>${safeText(student.className)}</td><td>${safeText(student.guardian)}</td><td><mark class="${student.status.toLowerCase()}">${safeText(student.status)}</mark></td><td><button class="table-action" data-student-id="${student.id}">View</button></td></tr>`).join('')}</tbody></table>`;
}

function studentFormMarkup(admission = false) {
	return `<form id="studentForm" class="student-form"><div class="form-grid"><label>Full name<input name="name" required placeholder="e.g. Amara Okafor"></label><label>Admission number<input name="admissionNo" required placeholder="GFA/2026/0152"></label><label>Class<select name="className"><option>JSS 2A</option><option>Primary 5</option><option>SS 1B</option><option>Primary 3</option></select></label><label>Guardian name<input name="guardian" required placeholder="Guardian name"></label></div><label class="document-check"><input name="birthCertificate" type="checkbox"> Birth certificate received</label><label class="document-check"><input name="passportPhoto" type="checkbox"> Passport photo received</label><p class="form-error" id="studentFormError"></p><button class="primary" type="submit">${admission ? 'Create admission' : 'Save student'}</button></form>`;
}

function renderOverviewPage() {
	if (page !== 'overview') return;
	const students = getStudents();
	const active = students.filter(student => student.status === 'Active');
	const pending = students.filter(student => student.status === 'Pending');
	const classes = new Set(students.map(student => student.className));
	const documents = students.reduce((total, student) => total + student.documents.length, 0);
	const average = students.length ? Math.round(students.reduce((total, student) => total + Object.values(student.scores).reduce((sum, score) => sum + score, 0) / Object.values(student.scores).length, 0) / students.length) : 0;
	const content = document.querySelector('.content');
	content.innerHTML = `<div class="page-heading-row"><div><strong>Dashboard Overview</strong><span>Live school activity from your local workspace.</span></div><button class="primary" data-action="overview-add-student">＋ Add student</button></div><section class="stats"><article><span class="stat-icon green">♧</span><small>Total students</small><strong>${active.length}</strong><em>${pending.length} pending admission${pending.length === 1 ? '' : 's'}</em></article><article><span class="stat-icon blue">♙</span><small>Total teachers</small><strong>28</strong><em>School staff records</em></article><article><span class="stat-icon gold">▤</span><small>Total classes</small><strong>${classes.size}</strong><em>Based on student records</em></article><article><span class="stat-icon rose">▥</span><small>Total subjects</small><strong>4</strong><em>Active subjects</em></article></section><div class="grid-two"><section class="panel live-panel"><div class="panel-head"><div><h2>School pulse</h2><p>Updated from local records</p></div><span class="live-indicator"><i></i> Live</span></div><div class="pulse-grid"><div><small>Attendance today</small><strong>92.1%</strong><span>↑ 2.3% vs yesterday</span></div><div><small>Fee collection</small><strong>₦4.2m</strong><span>₦680k outstanding</span></div><div><small>Documents uploaded</small><strong>${documents}</strong><span>${students.length * 3 - documents} still needed</span></div><div><small>Average result</small><strong>${average}%</strong><span>Across saved scores</span></div></div></section><section class="panel"><div class="panel-head"><div><h2>Upcoming events</h2><p>Keep the school day moving</p></div><button class="panel-link" data-toast="Event manager opened">Manage</button></div><div class="event-row"><time>20<br><small>SEP</small></time><div><strong>Mid-term assessment week</strong><span>All classes · 08:00</span></div></div><div class="event-row"><time>24<br><small>SEP</small></time><div><strong>PTA welcome meeting</strong><span>School hall · 14:00</span></div></div><div class="event-row"><time>30<br><small>SEP</small></time><div><strong>Fee payment deadline</strong><span>All families · End of day</span></div></div></section></div><div class="grid-two"><section class="panel"><div class="panel-head"><div><h2>Recent activities</h2><p>Latest changes in this workspace</p></div><span class="live-time">Just now</span></div><div class="activity">${pending.length ? `<div><i class="gold">＋</i><p><strong>${pending.length} admission${pending.length === 1 ? '' : 's'} awaiting review</strong><small>Student Management · Just now</small></p><b>›</b></div>` : ''}<div><i class="green">♧</i><p><strong>${active.length} active student records</strong><small>Directory synced from local storage</small></p><b>›</b></div><div><i class="blue">▤</i><p><strong>${documents} student documents uploaded</strong><small>Document tracker · Live count</small></p><b>›</b></div><div><i class="rose">✓</i><p><strong>Results average is ${average}%</strong><small>Academic History · Current term</small></p><b>›</b></div></div></section><section class="panel table-panel"><div class="panel-head"><div><h2>Recent students</h2><p>Latest records added</p></div><a href="admin.html?page=students">View all →</a></div><table><thead><tr><th>Student</th><th>Class</th><th>Status</th></tr></thead><tbody>${students.slice(0, 5).map(student => `<tr><td><strong>${safeText(student.name)}</strong><small>${safeText(student.admissionNo)}</small></td><td>${safeText(student.className)}</td><td><mark class="${student.status.toLowerCase()}">${safeText(student.status)}</mark></td></tr>`).join('') || '<tr><td colspan="3">No students saved yet.</td></tr>'}</tbody></table></section></div>`;
}

function renderLiveOverviewPage() {
	if (page !== 'overview') return;
	const students = getStudents();
	const schoolData = getSchoolData();
	const active = students.filter(student => student.status === 'Active');
	const pending = students.filter(student => student.status === 'Pending');
	const documents = students.reduce((total, student) => total + student.documents.length, 0);
	const averages = students.flatMap(student => Object.values(student.scores || {}));
	const average = averages.length ? Math.round(averages.reduce((sum, score) => sum + score, 0) / averages.length) : 0;
	const settings = getSettings();
	const content = document.querySelector('.content');
	content.innerHTML = `<div class="page-heading-row"><div><strong>Dashboard Overview</strong><span>Live school activity for ${safeText(settings.schoolName)}.</span></div><button class="primary" data-action="overview-add-student">＋ Add student</button></div><section class="stats"><article><small>Total students</small><strong>${active.length}</strong><em>${pending.length} pending admissions</em></article><article><small>Total teachers</small><strong>${schoolData.teachers.length}</strong><em>Stored school records</em></article><article><small>Total classes</small><strong>${schoolData.classes.length}</strong><em>Stored school records</em></article><article><small>Total subjects</small><strong>${schoolData.subjects.length}</strong><em>Stored school records</em></article></section><div class="grid-two"><section class="panel live-panel"><div class="panel-head"><div><h2>School pulse</h2><p>Read from this school&apos;s local data</p></div><span class="live-indicator"><i></i> Live</span></div><div class="pulse-grid"><div><small>Attendance today</small><strong>${schoolData.attendance.today}%</strong><span>School-local metric</span></div><div><small>Fee collection</small><strong>${formatNaira(schoolData.fees.collected)}</strong><span>${formatNaira(schoolData.fees.outstanding)} outstanding</span></div><div><small>Documents uploaded</small><strong>${documents}</strong><span>${Math.max(0, students.length * 3 - documents)} still needed</span></div><div><small>Average result</small><strong>${average}%</strong><span>Saved student scores</span></div></div></section><section class="panel"><div class="panel-head"><div><h2>Upcoming events</h2><p>Saved for this school</p></div></div>${schoolData.events.map(event => `<div class="event-row"><time>${safeText(event.date)}<br><small>${safeText(event.month)}</small></time><div><strong>${safeText(event.title)}</strong><span>${safeText(event.detail)}</span></div></div>`).join('') || '<p class="muted-cell">No upcoming events.</p>'}</section></div><section class="panel table-panel"><div class="panel-head"><div><h2>Recent students</h2><p>Records belonging to this school</p></div><a href="admin.html?page=students">View all →</a></div><table><thead><tr><th>Student</th><th>Class</th><th>Status</th></tr></thead><tbody>${students.slice(0, 5).map(student => `<tr><td><strong>${safeText(student.name)}</strong><small>${safeText(student.admissionNo)}</small></td><td>${safeText(student.className)}</td><td><mark class="${student.status.toLowerCase()}">${safeText(student.status)}</mark></td></tr>`).join('') || '<tr><td colspan="3">No students saved yet.</td></tr>'}</tbody></table></section>`;
}

function renderSettingsPage() {
	if (page !== 'settings') return;
	const settings = getSettings();
	const students = getStudents();
	document.querySelector('header h1').textContent = 'School Settings';
	document.querySelector('header p').textContent = 'Shape how Edu-mit works for your school.';
	document.querySelector('.content').innerHTML = `<div class="page-heading-row"><div><strong>School Settings</strong><span>Changes save to this browser and update your workspace immediately.</span></div><span class="module-status">Auto-save ready</span></div><section class="settings-layout"><form class="panel settings-form" id="schoolSettingsForm"><div class="panel-head"><div><h2>School profile</h2><p>These details appear across your school workspace.</p></div></div><div class="form-grid"><label>School name<input name="schoolName" value="${safeText(settings.schoolName)}" required></label><label>School code<input name="schoolCode" value="${safeText(settings.schoolCode)}" maxlength="8" required></label><label class="full-field">School logo<input name="schoolLogo" type="file" accept="image/png,image/jpeg,image/webp"><small>PNG, JPG or WebP, max 2 MB.</small></label>${settings.logoUrl ? `<div style="display:flex;align-items:center;gap:12px;margin-top:12px"><img src="${safeText(settings.logoUrl)}" alt="School logo" style="width:64px;height:64px;object-fit:contain;border:1px solid var(--line);border-radius:8px;padding:6px"><span>Current school logo</span></div>` : ''}<label>Country<select name="country"><option ${settings.country === 'Nigeria' ? 'selected' : ''}>Nigeria</option><option ${settings.country === 'Ghana' ? 'selected' : ''}>Ghana</option><option ${settings.country === 'Kenya' ? 'selected' : ''}>Kenya</option></select></label><label>Currency<select name="currency"><option ${settings.currency === 'NGN' ? 'selected' : ''}>NGN</option><option ${settings.currency === 'GHS' ? 'selected' : ''}>GHS</option><option ${settings.currency === 'KES' ? 'selected' : ''}>KES</option></select></label><label>Academic session<select name="session"><option ${settings.session === '2026/27' ? 'selected' : ''}>2026/27</option><option ${settings.session === '2027/28' ? 'selected' : ''}>2027/28</option></select></label><label>Current term<select name="term"><option ${settings.term === 'Term 1' ? 'selected' : ''}>Term 1</option><option ${settings.term === 'Term 2' ? 'selected' : ''}>Term 2</option><option ${settings.term === 'Term 3' ? 'selected' : ''}>Term 3</option></select></label></div><div class="settings-section"><h2>Academic rules</h2><p>These rules guide result entry and report cards.</p><div class="form-grid"><label>Pass mark (%)<input name="passMark" type="number" min="0" max="100" value="${settings.passMark}" required></label><label>Grading scale<select name="gradingScale"><option ${settings.gradingScale === 'A-F' ? 'selected' : ''}>A-F</option><option ${settings.gradingScale === 'A1-C6' ? 'selected' : ''}>A1-C6</option><option ${settings.gradingScale === '1-7' ? 'selected' : ''}>1-7</option></select></label></div></div><div class="settings-section"><h2>School modules</h2><p>Choose which tools are active for this workspace.</p><div class="module-toggles">${Object.entries({ finance: 'Finance & fees', ai: 'AI features', communications: 'Communications', library: 'Library management', hostel: 'Hostel management' }).map(([key, label]) => `<label><span><strong>${label}</strong><small>${key === 'finance' ? 'Fees, payments and receipts' : key === 'ai' ? 'Assistant tools and insights' : key === 'communications' ? 'Announcements and messages' : key === 'library' ? 'Books, borrowing and returns' : 'Rooms and bed allocation'}</small></span><input type="checkbox" name="module-${key}" ${settings.modules[key] ? 'checked' : ''}></label>`).join('')}</div></div><p class="form-error" id="settingsError"></p><button class="primary" type="submit">Save settings</button></form><aside class="settings-summary"><section class="panel"><div class="panel-head"><div><h2>Workspace preview</h2><p>Current school identity</p></div></div><div class="preview-brand"><img src="logo.svg" alt="Edu-mit logo"><div><strong>${safeText(settings.schoolName)}</strong><span>${safeText(settings.schoolCode)} · ${safeText(settings.session)}</span></div></div><div class="summary-row"><span>Current term</span><strong>${safeText(settings.term)}</strong></div><div class="summary-row"><span>Students</span><strong>${students.length}</strong></div><div class="summary-row"><span>Enabled modules</span><strong>${Object.values(settings.modules).filter(Boolean).length}/5</strong></div></section><section class="panel danger-panel"><h2>Local data</h2><p>Export a copy of this browser workspace before clearing it.</p><button class="outline" data-action="export-settings">Export workspace JSON</button><button class="danger-outline" data-action="reset-settings">Reset settings only</button></section></aside></section>`;
}

function renderSubscriptionPage() {
	if (page !== 'subscription') return;
	const subscription = getSubscription();
	const plans = { Basic: { price: 'Free', limit: 500, features: ['Student management', 'Teacher management', 'Attendance', 'Result management'] }, Standard: { price: '₦450 / student / term', limit: 2000, features: ['Everything in Basic', 'CBT examinations', 'Payroll', 'Library management', 'Limited AI features'] }, Premium: { price: 'Custom', limit: Infinity, features: ['Everything in Standard', 'Full AI suite', 'White-label branding', 'Custom domain'] } };
	const students = getStudents().length;
	document.querySelector('header h1').textContent = 'Subscription Plan';
	document.querySelector('header p').textContent = 'Choose the plan that matches your school growth.';
	document.querySelector('.content').innerHTML = `<div class="page-heading-row"><div><strong>Subscription Plan</strong><span>Plan selection is saved locally for this prototype.</span></div><span class="module-status">${subscription.status}</span></div><section class="subscription-current panel"><div><p class="eyebrow">Current plan</p><h2>${subscription.plan}</h2><p>Renewal date: ${subscription.renewalDate}</p></div><div class="usage"><strong>${students}</strong><span>students used</span><div><i style="width:${subscription.plan === 'Premium' ? 12 : Math.min(100, students / plans[subscription.plan].limit * 100)}%"></i></div><small>${subscription.plan === 'Premium' ? 'Unlimited capacity' : `${plans[subscription.plan].limit - students} student places remaining`}</small></div></section><section class="plan-grid">${Object.entries(plans).map(([name, plan]) => `<article class="plan-card ${name === subscription.plan ? 'selected' : ''}"><div class="plan-card-top"><span>${name === subscription.plan ? 'Active plan' : 'Plan'}</span>${name === subscription.plan ? '<b>✓</b>' : ''}</div><h2>${name}</h2><strong class="plan-price">${plan.price}</strong><p>Up to ${plan.limit === Infinity ? 'unlimited' : plan.limit.toLocaleString()} students</p><ul>${plan.features.map(feature => `<li>✓ ${feature}</li>`).join('')}</ul><button class="${name === subscription.plan ? 'outline' : 'primary'}" data-plan="${name}">${name === subscription.plan ? 'Current plan' : `Choose ${name}`}</button></article>`).join('')}</section><section class="panel isolation-note"><strong>Multi-tenant workspace</strong><p>Your school data, users, branding and settings remain isolated to this local workspace. A production subscription service will replace this local selection later.</p></section>`;
}

const pageContent = {
	students: ['Student Management', 'Students', 'Manage admissions, profiles, documents and academic history.', [['Active students', '248'], ['New admissions', '18'], ['Transfers pending', '4'], ['Graduating this term', '32']], ['Student Admission', 'Student Registration', 'Student Promotion', 'Student Transfer', 'Student Graduation', 'Student Profiles', 'Student Documents Upload', 'Student ID Cards', 'Student Academic History']],
	admissions: ['Student Management', 'Student Admission', 'Create and review new student admission records.', [['Applications', '24'], ['Awaiting review', '8'], ['Admitted this term', '18'], ['Documents pending', '5']], ['New admission', 'Application review', 'Guardian details', 'Required documents']],
	teachers: ['Teacher Management', 'Teachers', 'Manage teacher profiles, assignments and performance.', [['Active teachers', '28'], ['New teachers', '3'], ['Subjects covered', '42'], ['Reviews due', '6']], ['Add Teachers', 'Teacher Profiles', 'Subject Assignment', 'Class Assignment', 'Teacher Attendance', 'Teacher Performance Tracking']],
	academics: ['Academic Management', 'Classes & Arms', 'Build the structure that powers classes, subjects and timetables.', [['Classes', '12'], ['Arms / Streams', '24'], ['Subjects', '42'], ['Timetables ready', '86%']], ['Classes', 'Create Classes', 'Create Arms / Streams', 'Assign Teachers', 'Subjects', 'Create Subjects', 'Assign Subjects to Classes', 'Timetable', 'Class Timetable', 'Teacher Timetable', 'Exam Timetable']],
	attendance: ['Attendance Management', 'Student Attendance', 'Monitor daily attendance and follow up exceptions.', [['Today present', '92.1%'], ['Absent today', '19'], ['Late arrivals', '7'], ['Reports ready', '12']], ['Student Attendance', 'Daily Attendance', 'Monthly Reports', 'Attendance Analytics']],
	'staff-attendance': ['Attendance Management', 'Staff Attendance', 'Track staff attendance, leave and monthly reports.', [['Staff present', '96%'], ['Late today', '2'], ['On leave', '3'], ['Reports ready', '4']], ['Staff Attendance', 'Teacher Attendance', 'Staff Attendance Reports']],
	examinations: ['Examination Management', 'Exam Creation', 'Plan assessments, CBT exams and result approval.', [['Active exams', '3'], ['Questions banked', '428'], ['Results pending', '12'], ['Report cards ready', '86%']], ['Exam Creation', 'CBT Examination', 'Question Bank', 'Continuous Assessment', 'Result Computation', 'Result Approval', 'Report Cards', 'Transcript Generation', 'Performance Analysis']],
	finance: ['Fee Management', 'School Fees', 'Track fees, payments, invoices and outstanding balances.', [['Collected this term', '₦4.2m'], ['Outstanding', '₦680k'], ['Paid invoices', '186'], ['Debtors', '22']], ['School Fees', 'Payment Collection', 'Online Payments', 'Fee Categories', 'Invoices', 'Receipts', 'Debtors List', 'Financial Reports']],
	library: ['School Services', 'Library Management', 'Manage books, borrowing, returns and fines.', [['Books', '1,248'], ['Borrowed', '86'], ['Overdue', '12'], ['Fines due', '₦18,500']], ['Book Management', 'Borrowing System', 'Returns', 'Fine Management']],
	communications: ['School Services', 'Communication Center', 'Reach families and staff through every school channel.', [['Announcements', '8'], ['SMS credits', '4,280'], ['Email campaigns', '3'], ['Events', '5']], ['Bulk SMS', 'Bulk Email', 'WhatsApp Notifications', 'School Announcements', 'Event Notifications']],
	payroll: ['School Services', 'Staff Payroll', 'Prepare salary structures, deductions, payslips and tax records.', [['Payroll this month', '₦2.8m'], ['Staff paid', '28'], ['Deductions', '₦240k'], ['Payslips ready', '100%']], ['Salary Structure', 'Payroll Processing', 'Payslip Generation', 'Deductions', 'Tax Records']],
	reports: ['Reports & Analytics', 'Reports & Analytics', 'Turn school activity into clear decisions and timely reports.', [['Academic reports', '12'], ['Fee collection', '₦4.2m'], ['Attendance reports', '9'], ['Exports ready', '24']], ['Academic Reports', 'Student Performance', 'Class Performance', 'Subject Performance', 'Financial Reports', 'Fee Collection Reports', 'Revenue Reports', 'Outstanding Fees', 'Attendance Reports', 'Staff Reports', 'Teacher Performance Reports', 'Payroll Reports']],
	ai: ['AI Features', 'AI School Assistant', 'Use guided AI tools to support teaching, students and school decisions.', [['Teacher drafts', '18'], ['At-risk students', '7'], ['Insights ready', '12'], ['Assistants active', '3']], ['AI Teacher Assistant', 'Generate Lesson Notes', 'Generate Scheme of Work', 'Generate Assignments', 'Generate CBT Questions', 'Generate Marking Guides', 'AI Student Assistant', 'Homework Assistance', 'Learning Recommendations', 'AI School Analytics', 'Predict At-Risk Students', 'Attendance Trend Analysis', 'Fee Payment Predictions', 'AI Chatbot']],
	subscription: ['Platform', 'Subscription Plan', 'Choose the plan that matches your school growth.', [['Current plan', 'Standard'], ['Students', '248 / 2,000'], ['AI features', 'Limited'], ['Renewal', '30 Sep 2026']], ['Basic · Up to 500 Students', 'Standard · Up to 2,000 Students', 'Premium · Unlimited Students', 'School Logo & Branding', 'School Data Isolation', 'Custom Domain']]
};

function renderAdminPage() {
	if (page === 'overview') return;
	if (page === 'settings') { renderSettingsPage(); return; }
	if (page === 'subscription') { renderSubscriptionPage(); return; }
	if (['students', 'admissions', 'student-documents', 'student-id-cards', 'student-history'].includes(page)) { renderStudentPage(); return; }
	const data = pageContent[page] || ['Admin Workspace', 'Coming soon', 'This workspace is ready for the next implementation slice.', [['Status', 'Ready'], ['Records', 'Local'], ['Access', 'Admin'], ['Mode', 'Prototype']], ['This module is included in the Admin information architecture.']];
	const [eyebrow, title, description, stats, features] = data;
	document.querySelector('header h1').textContent = title;
	document.querySelector('header p').textContent = description;
	const content = document.querySelector('.content');
	content.innerHTML = `<div class="page-heading-row"><div><strong>${title}</strong><span>${description}</span></div><button class="primary" data-toast="${title} action opened">＋ New record</button></div><section class="stats">${stats.map((stat, index) => `<article><span class="stat-icon ${['green','blue','gold','rose'][index]}">${['◆','◷','₦','⌁'][index]}</span><small>${stat[0]}</small><strong>${stat[1]}</strong><em>${index === 0 ? 'Updated today' : 'Local workspace data'}</em></article>`).join('')}</section><section class="panel module-panel"><div class="panel-head"><div><h2>${title} tools</h2><p>Choose a workflow to continue.</p></div><span class="module-status">Admin access</span></div><div class="module-grid">${features.map((feature, index) => `<button class="module-card" data-toast="${feature} opened"><span>${String(index + 1).padStart(2, '0')}</span><strong>${feature}</strong><small>Open workspace <i>→</i></small></button>`).join('')}</div></section><section class="panel empty-module"><strong>${title} activity</strong><p>Records and activity for this module will appear here as your school uses the workspace.</p></section>`;
}

function refreshAdminShell(profile, account) {
	const settings = getSettings();
	const school = EduTenant.schools().find(item => item.id === EduTenant.currentSession()?.schoolId);
	const schoolName = settings.schoolName || school?.name || profile.school || account?.school || '';
	const schoolElement = document.querySelector('.school strong');
	const headerMessage = document.querySelector('header p');
	const logo = document.querySelector('.brand img');
	if (schoolElement) schoolElement.textContent = schoolName;
	if (headerMessage) headerMessage.textContent = schoolName ? `Here is what needs attention across ${schoolName} today.` : 'Here is what needs attention today.';
	if (logo) { logo.src = settings.logoUrl || 'logo.svg'; logo.alt = schoolName ? `${schoolName} logo` : 'School logo'; }
}

renderAdminNavigation();
const tenantUser = EduTenant.currentUser();
const account = JSON.parse(localStorage.getItem('scholara:admin-account:v1') || 'null');
const adminSession = EduTenant.currentSession() || JSON.parse(localStorage.getItem('scholara:admin-session:v1') || 'null');

if (!tenantUser || !adminSession || !adminSession.schoolId || !['school_admin', 'super_admin'].includes(adminSession.role)) {
	window.location.replace('login.html#admin-login');
} else {
	const profile = tenantUser;
	const initials = profile.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
	const firstName = profile.name.split(/\s+/)[0];
	refreshAdminShell(profile, account);
	document.querySelector('.side-foot strong').textContent = profile.name;
	document.querySelector('header h1').textContent = `Good morning, ${firstName}`;
	document.querySelector('.avatar').textContent = initials;
	if (page === 'overview') renderLiveOverviewPage();
	else renderAdminPage();
}

document.querySelectorAll('[data-toast]').forEach(button => button.addEventListener('click', () => showToast(button.dataset.toast)));
document.querySelector('[data-action="overview-add-student"]')?.addEventListener('click', () => { window.location.href = 'admin.html?page=admissions'; });
const studentForm = document.getElementById('studentForm');
const openStudentForm = document.querySelector('[data-action="open-student-form"]');
if (openStudentForm) openStudentForm.addEventListener('click', () => { const panel = document.getElementById('studentFormPanel'); if (panel) { panel.hidden = false; panel.scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
if (studentForm) studentForm.addEventListener('submit', event => {
	event.preventDefault();
	const data = new FormData(studentForm);
	const students = getStudents();
	const admissionNo = String(data.get('admissionNo')).trim().toUpperCase();
	if (students.some(student => student.admissionNo === admissionNo)) { document.getElementById('studentFormError').textContent = 'That admission number is already in use.'; return; }
	const documents = [];
	if (data.get('birthCertificate')) documents.push('Birth certificate');
	if (data.get('passportPhoto')) documents.push('Passport photo');
	students.unshift({ id: `stu-${Date.now()}`, name: String(data.get('name')).trim(), admissionNo, className: data.get('className'), guardian: String(data.get('guardian')).trim(), status: page === 'admissions' ? 'Pending' : 'Active', documents, scores: { Mathematics: 0, English: 0, 'Basic Science': 0 } });
	saveStudents(students, 'Student record saved locally');
	window.location.href = `admin.html?page=${page === 'admissions' ? 'admissions' : 'students'}`;
});
const settingsForm = document.getElementById('schoolSettingsForm');
if (settingsForm) settingsForm.addEventListener('submit', async event => {
	event.preventDefault();
	const data = new FormData(settingsForm);
	const settings = { schoolName: String(data.get('schoolName')).trim(), schoolCode: String(data.get('schoolCode')).trim().toUpperCase(), country: data.get('country'), session: data.get('session'), term: data.get('term'), currency: data.get('currency'), passMark: Number(data.get('passMark')), gradingScale: data.get('gradingScale'), logoUrl: getSettings().logoUrl || '', modules: { finance: data.get('module-finance') === 'on', ai: data.get('module-ai') === 'on', communications: data.get('module-communications') === 'on', library: data.get('module-library') === 'on', hostel: data.get('module-hostel') === 'on' } };
	if (!settings.schoolName || !settings.schoolCode || Number.isNaN(settings.passMark)) { document.getElementById('settingsError').textContent = 'Complete the required school settings first.'; return; }
	try { settings.logoUrl = await readLogoFile(data.get('schoolLogo')) || settings.logoUrl; } catch (error) { document.getElementById('settingsError').textContent = error.message; return; }
	saveSettings(settings);
	const account = JSON.parse(localStorage.getItem('scholara:admin-account:v1') || 'null');
	if (account) { account.school = settings.schoolName; localStorage.setItem('scholara:admin-account:v1', JSON.stringify(account)); }
	EduTenant.updateSchool(EduTenant.currentSession()?.schoolId, { name: settings.schoolName });
	document.querySelector('.school strong').textContent = settings.schoolName;
	document.querySelector('.school span').textContent = `${settings.session} · ${settings.term}`;
	window.setTimeout(() => window.location.reload(), 350);
});
document.querySelectorAll('[data-plan]').forEach(button => button.addEventListener('click', () => { const subscription = getSubscription(); subscription.plan = button.dataset.plan; subscription.status = 'Active'; saveSubscription(subscription); window.setTimeout(() => window.location.reload(), 350); }));
document.querySelector('[data-action="export-settings"]')?.addEventListener('click', () => { const data = { settings: getSettings(), subscription: getSubscription(), students: getStudents() }; const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); link.download = 'edumit-workspace.json'; link.click(); URL.revokeObjectURL(link.href); showToast('Workspace exported'); });
document.querySelector('[data-action="reset-settings"]')?.addEventListener('click', () => { localStorage.removeItem(SETTINGS_KEY); window.location.reload(); });
document.querySelectorAll('[data-student-id]').forEach(button => button.addEventListener('click', () => { const student = getStudents().find(record => record.id === button.dataset.studentId); if (student) showToast(`${student.name} · ${student.admissionNo}`); }));
document.querySelectorAll('[data-document-student]').forEach(button => button.addEventListener('click', () => { const students = getStudents(); const student = students.find(record => record.id === button.dataset.documentStudent); if (!student) return; student.documents = student.documents.includes('Medical form') ? student.documents.filter(document => document !== 'Medical form') : [...student.documents, 'Medical form']; saveStudents(students, 'Document status updated'); window.location.reload(); }));
document.querySelectorAll('[data-history-student]').forEach(button => button.addEventListener('click', () => { const student = getStudents().find(record => record.id === button.dataset.historyStudent); if (student) showToast(`${student.name}: ${Object.entries(student.scores).map(([subject, score]) => `${subject} ${score}%`).join(' · ')}`); }));
document.querySelector('[data-action="mark-document"]')?.addEventListener('click', () => showToast('Choose a student row to update documents'));
document.querySelector('[data-action="print-cards"]')?.addEventListener('click', () => window.print());
const idCardForm = document.getElementById('idCardForm');
if (idCardForm) idCardForm.addEventListener('submit', event => {
	event.preventDefault();
	const data = new FormData(idCardForm);
	const file = data.get('passport');
	if (!file || !file.type.startsWith('image/')) { document.getElementById('idCardError').textContent = 'Choose a JPG, PNG, or WebP passport photograph.'; return; }
	if (file.size > 2 * 1024 * 1024) { document.getElementById('idCardError').textContent = 'Passport photograph must be smaller than 2 MB.'; return; }
	const reader = new FileReader();
	reader.onload = () => { const students = getStudents(); const student = students.find(record => record.id === data.get('studentId')); if (!student) return; student.passport = reader.result; student.parentName = String(data.get('parentName') || '').trim(); student.phone = String(data.get('phone') || '').trim(); student.address = String(data.get('address') || '').trim(); saveStudents(students, 'Student ID card saved locally'); window.location.reload(); };
	reader.readAsDataURL(file);
});
const studentSearch = document.getElementById('studentSearch');
if (studentSearch) studentSearch.addEventListener('input', event => { const query = event.target.value.toLowerCase(); document.getElementById('studentTable').innerHTML = studentTableMarkup(getStudents().filter(student => `${student.name} ${student.admissionNo} ${student.className}`.toLowerCase().includes(query))); });
document.querySelector('[data-logout]').addEventListener('click', () => { EduTenant.signOut(); localStorage.removeItem('scholara:admin-session:v1'); window.location.href = 'login.html'; });
window.addEventListener('storage', event => { if ([STUDENTS_KEY, EduTenant.KEYS.data, EduTenant.KEYS.settings, EduTenant.KEYS.subscriptions].includes(event.key) && page === 'overview') { renderLiveOverviewPage(); refreshAdminShell(tenantUser, account); document.querySelector('[data-action="overview-add-student"]')?.addEventListener('click', () => { window.location.href = 'admin.html?page=admissions'; }); } });
window.addEventListener('storage', event => { if ([SETTINGS_KEY, SUBSCRIPTION_KEY].includes(event.key)) window.location.reload(); });
if (page === 'overview') window.setInterval(() => { renderLiveOverviewPage(); refreshAdminShell(tenantUser, account); document.querySelector('[data-action="overview-add-student"]')?.addEventListener('click', () => { window.location.href = 'admin.html?page=admissions'; }); }, 2000);
