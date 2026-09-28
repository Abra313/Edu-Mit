(async () => {
if (!await EduTenant.protectRoute('school_admin', '#admin-login')) return;

document.body.classList.add('auth-ready');

const toast = document.querySelector('.toast');
let toastTimer;
const brand = document.querySelector('.brand');
const registeredSchoolName = EduTenant.currentSchoolName(EduTenant.currentSession()?.schoolId) || 'EDU-MIT';
if (brand) { brand.querySelector('strong').textContent = registeredSchoolName; const mark = brand.querySelector('span'); if (mark) mark.outerHTML = '<img src="logo.svg" alt="School logo">'; }
function updateTimeContext() {
	const current = EduTenant.timeContext();
	const heading = document.querySelector('header h1');
	const eyebrow = document.querySelector('header .eyebrow');
	if (heading) heading.textContent = `${current.greeting}, ${EduTenant.currentUser()?.name?.split(/\s+/)[0] || 'there'}`;
	if (eyebrow) eyebrow.textContent = `${current.date} · ${current.time}`;
}
updateTimeContext();
window.setInterval(updateTimeContext, 60000);
function showToast(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2200); }
let page = new URLSearchParams(window.location.search).get('page') || 'overview';
const navGroups = [
	{ label: 'Dashboard', items: [['overview', '⌂', 'Dashboard Overview']] },
	{ label: 'Student Management', items: [['students', '♧', 'Students'], ['admissions', '＋', 'Admissions'], ['student-documents', '▤', 'Documents'], ['student-id-cards', '▣', 'ID Cards'], ['student-history', '◌', 'Academic History']] },
	{ label: 'Teacher Management', items: [['teachers', '♙', 'Teachers'], ['subject-assignment', '↔', 'Subject Assignment'], ['class-assignment', '⌘', 'Class Assignment'], ['teacher-performance', '↗', 'Performance Tracking']] },
	{ label: 'Academic Management', items: [['academics', '▤', 'Classes & Arms'], ['subjects', '▥', 'Subjects'], ['timetables', '▦', 'Timetables']] },
	{ label: 'Attendance', items: [['attendance', '◷', 'Student Attendance'], ['staff-attendance', '◴', 'Staff Attendance'], ['attendance-reports', '◒', 'Attendance Reports']] },
	{ label: 'Examinations', items: [['examinations', '✎', 'Exam Creation'], ['cbt', '▦', 'CBT Examination'], ['question-bank', '☷', 'Question Bank'], ['results', '✓', 'Results & Approval'], ['report-cards', '▧', 'Report Cards'], ['performance', '↗', 'Performance Analysis']] },
	{ label: 'Reports & AI', items: [['reports', '◒', 'Reports & Analytics'], ['ai', '✧', 'AI Features']] },
	{ label: 'Platform', items: [['settings', '⚙', 'School Settings'], ['subscription', '◇', 'Subscription Plan']] }
];

function renderAdminNavigation() {
	const nav = document.querySelector('.sidebar nav');
	if (!nav) return;
	nav.innerHTML = navGroups.map(group => `<div class="nav-group"><small>${group.label}</small>${group.items.map(([key, icon, label]) => `<a class="${page === key ? 'active' : ''}" href="admin.html?page=${key}"><span class="nav-symbol">${icon}</span><span>${label}</span>${key === 'students' ? `<b>${getStudents().length}</b>` : ''}${key === 'finance' ? '<b class="dot"></b>' : ''}</a>`).join('')}</div>`).join('');
	document.querySelectorAll('a[href^="#"]').forEach(link => {
		const target = link.getAttribute('href').slice(1);
		link.href = `admin.html?page=${target === 'overview' ? 'overview' : target}`;
	});
}

function getStudents() {
	const session = EduTenant.currentSession();
	return session?.schoolId ? EduTenant.schoolStudents(session.schoolId) : [];
}
async function saveStudents(students, message) {
	const schoolId = EduTenant.currentSession()?.schoolId;
	try { if (schoolId) await EduTenant.saveSchoolStudents(schoolId, students); if (message) showToast(message); return true; }
	catch (error) { showToast(`Database save failed: ${error.message}`); return false; }
}
function safeText(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char])); }
function studentNameInitials(name) { return name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase(); }
function studentCardMarkup(student, schoolName, logoUrl) { return `<article class="id-card school-id-card"><div class="id-card-head"><div class="id-school-mark">${logoUrl ? `<img class="id-school-logo" src="${safeText(logoUrl)}" alt="${safeText(schoolName)} logo">` : '◆'}</div><div><strong>${safeText(schoolName)}</strong><small>Student identity card</small></div></div><div class="id-card-body"><div class="id-photo">${student.passport ? `<img src="${student.passport}" alt="${safeText(student.name)} passport">` : `<span>${studentNameInitials(student.name)}</span>`}</div><div class="id-details"><h3>${safeText(student.name)}</h3><p><b>Admission No:</b> ${safeText(student.admissionNo)}</p><p><b>Class:</b> ${safeText(student.className)}</p><p><b>Parent:</b> ${safeText(student.parentName || student.guardian)}</p><p><b>Phone:</b> ${safeText(student.phone || 'Not provided')}</p><p><b>Address:</b> ${safeText(student.address || 'Not provided')}</p></div></div><div class="id-card-footer"><span>Valid for 2026/27</span><span class="signature">Admin signature</span></div></article>`; }

const defaultSettings = { schoolName: '', schoolCode: '', logoUrl: '', country: 'Nigeria', session: '2026/27', term: 'Term 1', currency: 'NGN', passMark: 50, gradingScale: 'A-F', modules: { ai: true } };
const defaultSubscription = { plan: 'Standard', renewalDate: '30 Sep 2026', status: 'Active' };
function getSettings() { try { const saved = EduTenant.schoolSettings(EduTenant.currentSession()?.schoolId) || {}; return { ...defaultSettings, ...saved, modules: { ...defaultSettings.modules, ...(saved.modules || {}) } }; } catch (error) { return structuredClone(defaultSettings); } }
function getSubscription() { try { return { ...defaultSubscription, ...(EduTenant.schoolSubscription(EduTenant.currentSession()?.schoolId) || {}) }; } catch (error) { return structuredClone(defaultSubscription); } }
async function saveSettings(settings, message = 'School settings saved to Supabase') { try { await EduTenant.saveSchoolSettings(EduTenant.currentSession()?.schoolId, settings); showToast(message); return true; } catch (error) { showToast(`Database save failed: ${error.message}`); return false; } }
function readLogoFile(file) { return new Promise((resolve, reject) => { if (!file || !file.size) return resolve(''); if (!file.type.startsWith('image/')) return reject(new Error('Choose a PNG, JPG, or WebP logo.')); if (file.size > 2 * 1024 * 1024) return reject(new Error('School logo must be smaller than 2 MB.')); const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('The logo could not be read.')); reader.readAsDataURL(file); }); }
async function saveSubscription(subscription) { try { await EduTenant.saveSchoolSubscription(EduTenant.currentSession()?.schoolId, subscription); showToast(`${subscription.plan} plan saved to Supabase`); } catch (error) { showToast(`Database save failed: ${error.message}`); } }
function getSchoolData() { const defaults = { teachers: [], classes: [], subjects: [], subjectCodes: {}, timetable: [], attendance: { today: 0 }, fees: { collected: 0, outstanding: 0 }, events: [], exams: [], questions: [], results: [], studentAttendance: {}, staffAttendance: {} }; const saved = EduTenant.schoolData(EduTenant.currentSession()?.schoolId); return { ...defaults, ...saved, teachers: Array.isArray(saved.teachers) ? saved.teachers : defaults.teachers, classes: Array.isArray(saved.classes) ? saved.classes : defaults.classes, subjects: Array.isArray(saved.subjects) ? saved.subjects : defaults.subjects, subjectCodes: saved.subjectCodes && typeof saved.subjectCodes === 'object' ? saved.subjectCodes : {}, timetable: Array.isArray(saved.timetable) ? saved.timetable : [], attendance: { ...defaults.attendance, ...(saved.attendance || {}) }, fees: { ...defaults.fees, ...(saved.fees || {}) } }; }
function getTeachers() { const data = getSchoolData(); const teachers = data.teachers.length ? data.teachers : EduTenant.users().filter(user => user.role === 'teacher' && user.status === 'Active' && user.schoolId === EduTenant.currentSession()?.schoolId).map(user => ({ id: user.id, name: user.name, email: user.email, phone: '', subjects: [], classes: [], status: 'Active', performance: 0, notes: '' })); return teachers.map(teacher => ({ ...teacher, subjects: Array.isArray(teacher.subjects) ? teacher.subjects : [], classes: Array.isArray(teacher.classes) ? teacher.classes : [], status: teacher.status || 'Active', performance: Number(teacher.performance || 0), notes: teacher.notes || '' })); }
async function saveTeachers(teachers, message) { const data = getSchoolData(); data.teachers = teachers; try { await EduTenant.saveSchoolData(EduTenant.currentSession()?.schoolId, data); if (message) showToast(message); return true; } catch (error) { showToast(`Database save failed: ${error.message}`); return false; } }
function teacherRowMarkup(teacher, includeAction = true) { const loginReady = EduTenant.users().some(user => user.id === (teacher.userId || teacher.id) && user.role === 'teacher' && user.schoolId === EduTenant.currentSession()?.schoolId); return `<tr><td><strong>${safeText(teacher.name)}</strong><small>${safeText(teacher.email)}</small></td><td>${safeText(teacher.phone || 'Not provided')}</td><td>${teacher.subjects.map(subject => `<mark>${safeText(subject)}</mark>`).join(' ') || '<span class="muted-cell">Unassigned</span>'}</td><td>${teacher.classes.map(className => `<mark>${safeText(className)}</mark>`).join(' ') || '<span class="muted-cell">Unassigned</span>'}</td><td><mark class="${teacher.status.toLowerCase()}">${safeText(teacher.status)}</mark><small>${loginReady ? 'Login ready' : 'No login'}</small></td>${includeAction ? `<td><button class="table-action" data-teacher-delete="${teacher.id}">Remove</button></td>` : ''}</tr>`; }
function renderTeacherManagement() {
	const content = document.querySelector('.content');
	const data = getSchoolData();
	const teachers = getTeachers();
	if (page === 'teachers') {
		document.querySelector('header h1').textContent = 'Teachers';
		document.querySelector('header p').textContent = 'Manage staff profiles and keep teaching assignments current.';
			content.innerHTML = `<div class="page-heading-row"><div><strong>Teacher directory</strong><span>Changes save instantly to this school workspace.</span></div></div><section class="panel student-form-panel"><form id="teacherForm" class="student-form"><div class="form-grid"><label>Full name<input name="name" required placeholder="e.g. David Eze"></label><label>Work email<input name="email" type="email" required placeholder="teacher@school.edu"></label><label>Password<input name="password" type="password" minlength="8" autocomplete="new-password" required placeholder="At least 8 characters"></label><label>Phone<input name="phone" placeholder="+234 800 000 0000"></label><label>First subject<input name="subject" required placeholder="Mathematics"></label><label>First class<input name="className" required placeholder="JSS 2A"></label></div><p class="form-error" id="teacherFormError"></p><button class="primary" type="submit">Add teacher</button></form></section><section class="panel table-panel"><div class="panel-head"><div><h2>${teachers.length} teacher${teachers.length === 1 ? '' : 's'}</h2><p>Active staff records for this school.</p></div></div><table><thead><tr><th>Teacher</th><th>Phone</th><th>Subjects</th><th>Classes</th><th>Status</th><th>Action</th></tr></thead><tbody>${teachers.map(teacher => teacherRowMarkup(teacher)).join('') || '<tr><td colspan="6">No teachers added yet.</td></tr>'}</tbody></table></section>`;
			content.innerHTML = `<div class="page-heading-row"><div><strong>Teacher directory</strong><span>Changes save instantly to Supabase.</span></div></div><section class="panel student-form-panel"><form id="teacherForm" class="student-form"><div class="form-grid"><label>Full name<input name="name" required placeholder="e.g. David Eze"></label><label>Work email<input name="email" type="email" required placeholder="teacher@school.edu"></label><label>Password<input name="password" type="password" minlength="8" autocomplete="new-password" required placeholder="At least 8 characters"></label><label>Phone<input name="phone" placeholder="+234 800 000 0000"></label><label>First subject<input name="subject" required placeholder="Mathematics"></label><label>First class<input name="className" required placeholder="JSS 2A"></label></div><p class="form-error" id="teacherFormError"></p><button class="primary" type="submit">Add teacher</button></form></section><section class="panel table-panel"><div class="panel-head"><div><h2>${teachers.length} teacher${teachers.length === 1 ? '' : 's'}</h2><p>Active staff records for this school.</p></div></div><table><thead><tr><th>Teacher</th><th>Phone</th><th>Subjects</th><th>Classes</th><th>Status</th><th>Action</th></tr></thead><tbody>${teachers.map(teacher => teacherRowMarkup(teacher)).join('') || '<tr><td colspan="6">No teachers added yet.</td></tr>'}</tbody></table></section>`;
	} else if (page === 'subject-assignment' || page === 'class-assignment') {
		const isSubject = page === 'subject-assignment';
		const options = isSubject ? data.subjects : data.classes;
		document.querySelector('header h1').textContent = isSubject ? 'Subject Assignment' : 'Class Assignment';
		document.querySelector('header p').textContent = isSubject ? 'Assign subjects to teachers and keep workload data current.' : 'Assign classes to teachers and keep teaching coverage current.';
		content.innerHTML = `<div class="page-heading-row"><div><strong>${isSubject ? 'Assign subjects' : 'Assign classes'}</strong><span>Select a teacher and add an assignment. It is saved immediately.</span></div></div><section class="panel student-form-panel"><form id="assignmentForm" class="student-form"><div class="form-grid"><label>Teacher<select name="teacherId" required>${teachers.map(teacher => `<option value="${teacher.id}">${safeText(teacher.name)}</option>`).join('')}</select></label><label>${isSubject ? 'Subject' : 'Class'}<select name="assignment" required>${options.map(option => `<option>${safeText(option)}</option>`).join('')}</select></label></div><p class="form-error" id="assignmentError"></p><button class="primary" type="submit">Assign ${isSubject ? 'subject' : 'class'}</button></form></section><section class="panel table-panel"><table><thead><tr><th>Teacher</th><th>${isSubject ? 'Subjects' : 'Classes'}</th><th>Email</th></tr></thead><tbody>${teachers.map(teacher => `<tr><td><strong>${safeText(teacher.name)}</strong></td><td>${(isSubject ? teacher.subjects : teacher.classes).map(item => `<mark>${safeText(item)}</mark>`).join(' ') || '<span class="muted-cell">None assigned</span>'}</td><td>${safeText(teacher.email)}</td></tr>`).join('') || '<tr><td colspan="3">Add a teacher before assigning work.</td></tr>'}</tbody></table></section>`;
	} else {
		document.querySelector('header h1').textContent = 'Performance Tracking';
		document.querySelector('header p').textContent = 'Record teacher performance notes and review progress over time.';
		content.innerHTML = `<div class="page-heading-row"><div><strong>Teacher performance</strong><span>Scores and notes are stored with each teacher record.</span></div></div><section class="panel table-panel"><table><thead><tr><th>Teacher</th><th>Subjects</th><th>Performance score</th><th>Notes</th><th>Action</th></tr></thead><tbody>${teachers.map(teacher => `<tr><td><strong>${safeText(teacher.name)}</strong><small>${safeText(teacher.email)}</small></td><td>${teacher.subjects.map(subject => safeText(subject)).join(', ') || 'Unassigned'}</td><td><input class="mini-input" type="number" min="0" max="100" value="${Number(teacher.performance || 0)}" data-performance-score="${teacher.id}"></td><td><input class="table-search" value="${safeText(teacher.notes || '')}" placeholder="Add note" data-performance-note="${teacher.id}"></td><td><button class="table-action" data-performance-save="${teacher.id}">Save</button></td></tr>`).join('') || '<tr><td colspan="5">Add a teacher before tracking performance.</td></tr>'}</tbody></table></section>`;
	}
}
async function saveAcademicData(data, message) { try { await EduTenant.saveSchoolData(EduTenant.currentSession()?.schoolId, { ...getSchoolData(), ...data }); if (message) showToast(message); return true; } catch (error) { showToast(`Database save failed: ${error.message}`); return false; } }
function renderAcademicManagement() {
	const content = document.querySelector('.content');
	const data = getSchoolData();
	const teachers = getTeachers();
	const timetable = Array.isArray(data.timetable) ? data.timetable : [];
	if (page === 'academics') {
		document.querySelector('header h1').textContent = 'Classes & Arms';
		document.querySelector('header p').textContent = 'Build the class structure used across your school workspace.';
		content.innerHTML = `<div class="page-heading-row"><div><strong>Classes & Arms</strong><span>Add classes and arms once, then reuse them in assignments and timetables.</span></div></div><section class="panel student-form-panel"><form id="academicClassForm" class="student-form"><div class="form-grid"><label>Class name<input name="className" required placeholder="e.g. JSS 2"></label><label>Arm / stream<input name="arm" required placeholder="e.g. A"></label></div><p class="form-error" id="academicClassError"></p><button class="primary" type="submit">Add class</button></form></section><section class="panel table-panel"><div class="panel-head"><div><h2>${data.classes.length} class${data.classes.length === 1 ? '' : 'es'}</h2><p>Saved in your school's Supabase workspace.</p></div></div><table><thead><tr><th>Class</th><th>Action</th></tr></thead><tbody>${data.classes.map(className => `<tr><td><strong>${safeText(className)}</strong></td><td><button class="table-action" data-academic-delete="${safeText(className)}" data-academic-type="classes">Remove</button></td></tr>`).join('') || '<tr><td colspan="2">No classes added yet.</td></tr>'}</tbody></table></section>`;
	} else if (page === 'subjects') {
		document.querySelector('header h1').textContent = 'Subjects';
		document.querySelector('header p').textContent = 'Manage the subjects available for teaching and timetables.';
		content.innerHTML = `<div class="page-heading-row"><div><strong>Subject catalogue</strong><span>Subjects are saved to Supabase and available for assignments.</span></div></div><section class="panel student-form-panel"><form id="academicSubjectForm" class="student-form"><div class="form-grid"><label>Subject name<input name="subject" required placeholder="e.g. Mathematics"></label><label>Subject code<input name="code" placeholder="e.g. MTH"></label></div><p class="form-error" id="academicSubjectError"></p><button class="primary" type="submit">Add subject</button></form></section><section class="panel table-panel"><table><thead><tr><th>Subject</th><th>Code</th><th>Action</th></tr></thead><tbody>${data.subjects.map(subject => `<tr><td><strong>${safeText(subject)}</strong></td><td>${safeText(data.subjectCodes[subject] || subject.slice(0, 3).toUpperCase())}</td><td><button class="table-action" data-academic-delete="${safeText(subject)}" data-academic-type="subjects">Remove</button></td></tr>`).join('') || '<tr><td colspan="3">No subjects added yet.</td></tr>'}</tbody></table></section>`;
	} else {
		document.querySelector('header h1').textContent = 'Timetables';
		document.querySelector('header p').textContent = 'Schedule subjects, teachers and classes in one live timetable.';
		content.innerHTML = `<div class="page-heading-row"><div><strong>School timetable</strong><span>Schedule changes are saved to Supabase.</span></div></div><section class="panel student-form-panel"><form id="academicTimetableForm" class="student-form"><div class="form-grid"><label>Day<select name="day"><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option></select></label><label>Time<input name="time" required placeholder="08:00 - 08:45"></label><label>Class<select name="className" required>${data.classes.map(className => `<option>${safeText(className)}</option>`).join('')}</select></label><label>Subject<select name="subject" required>${data.subjects.map(subject => `<option>${safeText(subject)}</option>`).join('')}</select></label><label>Teacher<select name="teacher" required>${teachers.map(teacher => `<option>${safeText(teacher.name)}</option>`).join('')}</select></label></div><p class="form-error" id="academicTimetableError"></p><button class="primary" type="submit">Add timetable entry</button></form></section><section class="panel table-panel"><table><thead><tr><th>Day</th><th>Time</th><th>Class</th><th>Subject</th><th>Teacher</th><th>Action</th></tr></thead><tbody>${timetable.map((entry, index) => `<tr><td><strong>${safeText(entry.day)}</strong></td><td>${safeText(entry.time)}</td><td>${safeText(entry.className)}</td><td>${safeText(entry.subject)}</td><td>${safeText(entry.teacher)}</td><td><button class="table-action" data-academic-delete="${index}" data-academic-type="timetable">Remove</button></td></tr>`).join('') || '<tr><td colspan="6">No timetable entries added yet.</td></tr>'}</tbody></table></section>`;
	}
}
function attendanceDate() { return new Date().toISOString().slice(0, 10); }
async function saveAttendanceData(changes, message) { try { await EduTenant.saveSchoolData(EduTenant.currentSession()?.schoolId, { ...getSchoolData(), ...changes }); if (message) showToast(message); return true; } catch (error) { showToast(`Database save failed: ${error.message}`); return false; } }
function attendanceStatusMarkup(status) { return `<mark class="${status.toLowerCase()}">${safeText(status)}</mark>`; }
function renderAttendanceManagement() {
	const content = document.querySelector('.content');
	const data = getSchoolData();
	const date = attendanceDate();
	const students = getStudents().filter(student => student.status === 'Active');
	const teachers = getTeachers();
	const studentRecords = data.studentAttendance?.[date] || {};
	const staffRecords = data.staffAttendance?.[date] || {};
	const statuses = ['Present', 'Absent', 'Late'];
	if (page === 'attendance') {
		document.querySelector('header h1').textContent = 'Student Attendance';
		document.querySelector('header p').textContent = `Mark attendance for ${date}. Changes save immediately.`;
		content.innerHTML = `<div class="page-heading-row"><div><strong>Student attendance</strong><span>Attendance is stored by date in this school workspace.</span></div></div><section class="panel table-panel"><form id="studentAttendanceForm"><table><thead><tr><th>Student</th><th>Class</th><th>Status</th></tr></thead><tbody>${students.map(student => `<tr><td><strong>${safeText(student.name)}</strong><small>${safeText(student.admissionNo)}</small></td><td>${safeText(student.className)}</td><td><select name="${student.id}">${statuses.map(status => `<option ${((studentRecords[student.id] || 'Present') === status) ? 'selected' : ''}>${status}</option>`).join('')}</select></td></tr>`).join('') || '<tr><td colspan="3">No active students found.</td></tr>'}</tbody></table><button class="primary" type="submit">Save student attendance</button></form></section>`;
	} else if (page === 'staff-attendance') {
		document.querySelector('header h1').textContent = 'Staff Attendance';
		document.querySelector('header p').textContent = `Mark staff attendance for ${date}. Changes save immediately.`;
		content.innerHTML = `<div class="page-heading-row"><div><strong>Staff attendance</strong><span>Track teacher presence and late arrivals by date.</span></div></div><section class="panel table-panel"><form id="staffAttendanceForm"><table><thead><tr><th>Staff member</th><th>Email</th><th>Status</th></tr></thead><tbody>${teachers.map(teacher => `<tr><td><strong>${safeText(teacher.name)}</strong></td><td>${safeText(teacher.email)}</td><td><select name="${teacher.id}">${statuses.map(status => `<option ${((staffRecords[teacher.id] || 'Present') === status) ? 'selected' : ''}>${status}</option>`).join('')}</select></td></tr>`).join('') || '<tr><td colspan="3">No staff records found.</td></tr>'}</tbody></table><button class="primary" type="submit">Save staff attendance</button></form></section>`;
	} else {
		const dates = Object.keys(data.studentAttendance || {}).sort().reverse();
		const reportRows = dates.map(reportDate => { const records = data.studentAttendance[reportDate] || {}; const values = Object.values(records); return { date: reportDate, present: values.filter(status => status === 'Present').length, absent: values.filter(status => status === 'Absent').length, late: values.filter(status => status === 'Late').length, total: values.length }; });
		document.querySelector('header h1').textContent = 'Attendance Reports';
		document.querySelector('header p').textContent = 'Review saved student and staff attendance summaries.';
		content.innerHTML = `<div class="page-heading-row"><div><strong>Attendance reports</strong><span>Reports update whenever attendance is saved.</span></div></div><section class="stats"><article><small>Today present</small><strong>${Object.values(studentRecords).filter(status => status === 'Present').length}</strong><em>${date}</em></article><article><small>Today absent</small><strong>${Object.values(studentRecords).filter(status => status === 'Absent').length}</strong><em>Student records</em></article><article><small>Today late</small><strong>${Object.values(studentRecords).filter(status => status === 'Late').length}</strong><em>Student records</em></article><article><small>Staff present</small><strong>${Object.values(staffRecords).filter(status => status === 'Present').length}</strong><em>Staff records</em></article></section><section class="panel table-panel"><table><thead><tr><th>Date</th><th>Present</th><th>Absent</th><th>Late</th><th>Recorded</th></tr></thead><tbody>${reportRows.map(row => `<tr><td><strong>${safeText(row.date)}</strong></td><td>${row.present}</td><td>${row.absent}</td><td>${row.late}</td><td>${row.total}</td></tr>`).join('') || '<tr><td colspan="5">No attendance has been recorded yet.</td></tr>'}</tbody></table></section>`;
	}
}
async function saveExamData(changes, message) { try { await EduTenant.saveSchoolData(EduTenant.currentSession()?.schoolId, { ...getSchoolData(), ...changes }); if (message) showToast(message); return true; } catch (error) { showToast(`Database save failed: ${error.message}`); return false; } }
function renderExamManagement() {
	const content = document.querySelector('.content');
	const data = getSchoolData();
	const exams = Array.isArray(data.exams) ? data.exams : [];
	const questions = Array.isArray(data.questions) ? data.questions : [];
	const results = Array.isArray(data.results) ? data.results : [];
	const students = getStudents().filter(student => student.status === 'Active');
	if (page === 'examinations') {
		document.querySelector('header h1').textContent = 'Exam Creation'; document.querySelector('header p').textContent = 'Create and manage school examinations saved to Supabase.';
		content.innerHTML = `<div class="page-heading-row"><div><strong>Examination setup</strong><span>Create exams that become available in CBT, results, and report cards.</span></div></div><section class="panel student-form-panel"><form id="examForm" class="student-form"><div class="form-grid"><label>Exam title<input name="title" required placeholder="First Term Mathematics"></label><label>Class<select name="className" required>${data.classes.map(item => `<option>${safeText(item)}</option>`).join('')}</select></label><label>Subject<select name="subject" required>${data.subjects.map(item => `<option>${safeText(item)}</option>`).join('')}</select></label><label>Exam date<input name="date" type="date" required></label><label>Duration (minutes)<input name="duration" type="number" min="1" value="60" required></label></div><p class="form-error" id="examError"></p><button class="primary" type="submit">Create exam</button></form></section><section class="panel table-panel"><table><thead><tr><th>Exam</th><th>Class</th><th>Subject</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>${exams.map(exam => `<tr><td><strong>${safeText(exam.title)}</strong><small>${exam.duration} minutes</small></td><td>${safeText(exam.className)}</td><td>${safeText(exam.subject)}</td><td>${safeText(exam.date)}</td><td>${attendanceStatusMarkup(exam.status)}</td><td><button class="table-action" data-exam-delete="${exam.id}">Remove</button></td></tr>`).join('') || '<tr><td colspan="6">No exams created yet.</td></tr>'}</tbody></table></section>`;
	} else if (page === 'cbt' || page === 'question-bank') {
		const isCbt = page === 'cbt';
		document.querySelector('header h1').textContent = isCbt ? 'CBT Examination' : 'Question Bank'; document.querySelector('header p').textContent = isCbt ? 'Open exams and track question counts.' : 'Create reusable questions for your examinations.';
		content.innerHTML = `<div class="page-heading-row"><div><strong>${isCbt ? 'CBT exams' : 'Question bank'}</strong><span>Records are saved in this school workspace.</span></div></div>${isCbt ? `<section class="panel table-panel"><table><thead><tr><th>Exam</th><th>Subject</th><th>Class</th><th>Questions</th><th>Status</th></tr></thead><tbody>${exams.map(exam => `<tr><td><strong>${safeText(exam.title)}</strong></td><td>${safeText(exam.subject)}</td><td>${safeText(exam.className)}</td><td>${questions.filter(question => question.examId === exam.id).length}</td><td>${attendanceStatusMarkup(exam.status)}</td></tr>`).join('') || '<tr><td colspan="5">Create an exam first.</td></tr>'}</tbody></table></section>` : `<section class="panel student-form-panel"><form id="questionForm" class="student-form"><div class="form-grid"><label>Exam<select name="examId" required>${exams.map(exam => `<option value="${exam.id}">${safeText(exam.title)}</option>`).join('')}</select></label><label>Question type<select name="type"><option>Multiple choice</option><option>True or false</option><option>Short answer</option></select></label><label class="full-field">Question<textarea name="text" rows="3" required placeholder="Enter the question"></textarea></label><label>Correct answer<input name="answer" required></label></div><p class="form-error" id="questionError"></p><button class="primary" type="submit">Save question</button></form></section><section class="panel table-panel"><table><thead><tr><th>Question</th><th>Exam</th><th>Type</th><th>Action</th></tr></thead><tbody>${questions.map(question => `<tr><td><strong>${safeText(question.text)}</strong></td><td>${safeText(exams.find(exam => exam.id === question.examId)?.title || 'Unknown exam')}</td><td>${safeText(question.type)}</td><td><button class="table-action" data-question-delete="${question.id}">Remove</button></td></tr>`).join('') || '<tr><td colspan="4">No questions saved yet.</td></tr>'}</tbody></table></section>`}</section>`;
	} else if (page === 'results') {
		document.querySelector('header h1').textContent = 'Results & Approval'; document.querySelector('header p').textContent = 'Enter scores and approve student results.';
		content.innerHTML = `<div class="page-heading-row"><div><strong>Results approval</strong><span>Approved results appear in report cards and analysis.</span></div></div><section class="panel student-form-panel"><form id="resultForm" class="student-form"><div class="form-grid"><label>Student<select name="studentId" required>${students.map(student => `<option value="${student.id}">${safeText(student.name)}</option>`).join('')}</select></label><label>Exam<select name="examId" required>${exams.map(exam => `<option value="${exam.id}">${safeText(exam.title)}</option>`).join('')}</select></label><label>Score<input name="score" type="number" min="0" max="100" required></label><label>Status<select name="status"><option>Approved</option><option>Draft</option></select></label></div><p class="form-error" id="resultError"></p><button class="primary" type="submit">Save result</button></form></section><section class="panel table-panel"><table><thead><tr><th>Student</th><th>Exam</th><th>Score</th><th>Status</th><th>Action</th></tr></thead><tbody>${results.map(result => `<tr><td>${safeText(students.find(student => student.id === result.studentId)?.name || result.studentId)}</td><td>${safeText(exams.find(exam => exam.id === result.examId)?.title || 'Unknown exam')}</td><td>${result.score}%</td><td>${attendanceStatusMarkup(result.status)}</td><td><button class="table-action" data-result-approve="${result.id}">${result.status === 'Approved' ? 'Approved' : 'Approve'}</button></td></tr>`).join('') || '<tr><td colspan="5">No results saved yet.</td></tr>'}</tbody></table></section>`;
	} else if (page === 'report-cards') {
		document.querySelector('header h1').textContent = 'Report Cards'; document.querySelector('header p').textContent = 'View approved student results by learner.';
		const approved = results.filter(result => result.status === 'Approved');
		content.innerHTML = `<div class="page-heading-row"><div><strong>Student report cards</strong><span>Only approved results are included.</span></div></div><section class="panel table-panel"><table><thead><tr><th>Student</th><th>Class</th><th>Approved results</th><th>Average</th></tr></thead><tbody>${students.map(student => { const rows = approved.filter(result => result.studentId === student.id); const average = rows.length ? Math.round(rows.reduce((sum, result) => sum + Number(result.score), 0) / rows.length) : 0; return `<tr><td><strong>${safeText(student.name)}</strong><small>${safeText(student.admissionNo)}</small></td><td>${safeText(student.className)}</td><td>${rows.length}</td><td>${average}%</td></tr>`; }).join('') || '<tr><td colspan="4">No students found.</td></tr>'}</tbody></table></section>`;
	} else {
		document.querySelector('header h1').textContent = 'Performance Analysis'; document.querySelector('header p').textContent = 'Analyze approved results by subject and class.';
		const approved = results.filter(result => result.status === 'Approved');
		const rows = exams.map(exam => { const scores = approved.filter(result => result.examId === exam.id).map(result => Number(result.score)); return { exam, count: scores.length, average: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0 }; });
		content.innerHTML = `<div class="page-heading-row"><div><strong>Performance analysis</strong><span>Analysis is calculated from approved local results.</span></div></div><section class="panel table-panel"><table><thead><tr><th>Exam</th><th>Subject</th><th>Results</th><th>Average</th></tr></thead><tbody>${rows.map(row => `<tr><td><strong>${safeText(row.exam.title)}</strong></td><td>${safeText(row.exam.subject)}</td><td>${row.count}</td><td>${row.average}%</td></tr>`).join('') || '<tr><td colspan="4">Create exams and approve results first.</td></tr>'}</tbody></table></section>`;
	}
}
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
		content.innerHTML = `<div class="page-heading-row"><div><strong>Student ID Cards</strong><span>Create cards like the supplied school ID sample and save passport photos locally.</span></div><button class="primary" data-action="print-cards">Print cards</button></div><section class="panel id-card-form-panel"><form id="idCardForm" class="student-form"><div class="form-grid"><label>Student<select name="studentId" required>${students.map(student => `<option value="${student.id}">${safeText(student.name)} · ${safeText(student.admissionNo)}</option>`).join('')}</select></label><label>Parent / guardian phone<input name="phone" placeholder="+234 800 000 0000"></label><label>Parent / guardian name<input name="parentName" placeholder="Guardian name"></label><label>Student address<input name="address" placeholder="School or home address"></label><label class="full-field">Passport photograph<input name="passport" type="file" accept="image/png,image/jpeg,image/webp" required></label></div><p class="form-error" id="idCardError"></p><button class="primary" type="submit">Save student ID card</button></form></section><section class="id-card-grid">${students.map(student => studentCardMarkup(student, schoolName, getSettings().logoUrl)).join('')}</section>`;
	} else if (page === 'student-history') {
		content.innerHTML = `<div class="page-heading-row"><div><strong>Academic History</strong><span>Review classes, results and progression for each student.</span></div></div><section class="panel table-panel"><table><thead><tr><th>Student</th><th>Current class</th><th>Average</th><th>History</th></tr></thead><tbody>${students.map(student => { const values = Object.values(student.scores); const average = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length); return `<tr><td><strong>${safeText(student.name)}</strong><small>${safeText(student.admissionNo)}</small></td><td>${safeText(student.className)}</td><td><strong class="score-value">${average}%</strong></td><td><button class="table-action" data-history-student="${student.id}">View history</button></td></tr>`; }).join('')}</tbody></table></section>`;
	}
}

function studentTableMarkup(students) {
	if (!students.length) return '<div class="empty-module"><strong>No student records yet</strong><p>Create an admission record to see it here.</p></div>';
	return `<table><thead><tr><th>Student</th><th>Class</th><th>Guardian</th><th>Status</th><th>Action</th></tr></thead><tbody>${students.map(student => `<tr><td><strong>${safeText(student.name)}</strong><small>${safeText(student.admissionNo)}</small></td><td>${safeText(student.className)}</td><td>${safeText(student.guardian)}</td><td><mark class="${student.status.toLowerCase()}">${safeText(student.status)}</mark></td><td><button class="table-action" data-student-id="${student.id}">View</button></td></tr>`).join('')}</tbody></table>`;
}

function studentFormMarkup(admission = false) {
	return `<form id="studentForm" class="student-form"><div class="form-grid"><label>Full name<input name="name" required placeholder="e.g. Amara Okafor"></label><label>Admission number<input name="admissionNo" required placeholder="GFA/2026/0152"></label><label>Student email<input name="email" type="email" required placeholder="student@school.edu"></label><label>Class<select name="className"><option>JSS 2A</option><option>Primary 5</option><option>SS 1B</option><option>Primary 3</option></select></label><label>Guardian name<input name="guardian" required placeholder="Guardian name"></label></div><label class="document-check"><input name="birthCertificate" type="checkbox"> Birth certificate received</label><label class="document-check"><input name="passportPhoto" type="checkbox"> Passport photo received</label><p class="form-error" id="studentFormError"></p><button class="primary" type="submit">${admission ? 'Create admission' : 'Save student'}</button></form>`;
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
	reports: ['Reports & Analytics', 'Reports & Analytics', 'Turn school activity into clear decisions and timely reports.', [['Academic reports', '12'], ['Fee collection', '₦4.2m'], ['Attendance reports', '9'], ['Exports ready', '24']], ['Academic Reports', 'Student Performance', 'Class Performance', 'Subject Performance', 'Financial Reports', 'Fee Collection Reports', 'Revenue Reports', 'Outstanding Fees', 'Attendance Reports', 'Staff Reports', 'Teacher Performance Reports', 'Payroll Reports']],
	ai: ['AI Features', 'AI School Assistant', 'Use guided AI tools to support teaching, students and school decisions.', [['Teacher drafts', '18'], ['At-risk students', '7'], ['Insights ready', '12'], ['Assistants active', '3']], ['AI Teacher Assistant', 'Generate Lesson Notes', 'Generate Scheme of Work', 'Generate Assignments', 'Generate CBT Questions', 'Generate Marking Guides', 'AI Student Assistant', 'Homework Assistance', 'Learning Recommendations', 'AI School Analytics', 'Predict At-Risk Students', 'Attendance Trend Analysis', 'Fee Payment Predictions', 'AI Chatbot']],
	subscription: ['Platform', 'Subscription Plan', 'Choose the plan that matches your school growth.', [['Current plan', 'Standard'], ['Students', '248 / 2,000'], ['AI features', 'Limited'], ['Renewal', '30 Sep 2026']], ['Basic · Up to 500 Students', 'Standard · Up to 2,000 Students', 'Premium · Unlimited Students', 'School Logo & Branding', 'School Data Isolation', 'Custom Domain']]
};

function renderAdminPage() {
	if (page === 'overview') return;
	if (['examinations', 'cbt', 'question-bank', 'results', 'report-cards', 'performance'].includes(page)) { renderExamManagement(); return; }
	if (['finance', 'payments', 'invoices', 'debtors', 'financial-reports', 'library', 'hostel', 'communications', 'payroll'].includes(page)) { window.location.replace('admin.html?page=overview'); return; }
	if (page === 'settings') { renderSettingsPage(); return; }
	if (page === 'subscription') { renderSubscriptionPage(); return; }
	if (['teachers', 'subject-assignment', 'class-assignment', 'teacher-performance'].includes(page)) { renderTeacherManagement(); return; }
	if (['academics', 'subjects', 'timetables'].includes(page)) { renderAcademicManagement(); return; }
	if (['attendance', 'staff-attendance', 'attendance-reports'].includes(page)) { renderAttendanceManagement(); return; }
	if (['examinations', 'cbt', 'question-bank', 'results', 'report-cards', 'performance'].includes(page)) { renderExamManagement(); return; }
	if (['students', 'admissions', 'student-documents', 'student-id-cards', 'student-history'].includes(page)) { renderStudentPage(); return; }
	const data = pageContent[page] || ['Admin Workspace', 'Coming soon', 'This workspace is ready for the next implementation slice.', [['Status', 'Ready'], ['Records', 'Local'], ['Access', 'Admin'], ['Mode', 'Prototype']], ['This module is included in the Admin information architecture.']];
	const [eyebrow, title, description, stats, features] = data;
	document.querySelector('header h1').textContent = title;
	document.querySelector('header p').textContent = description;
	const content = document.querySelector('.content');
	content.innerHTML = `<div class="page-heading-row"><div><strong>${title}</strong><span>${description}</span></div><button class="primary" data-toast="${title} action opened">＋ New record</button></div><section class="stats">${stats.map((stat, index) => `<article><span class="stat-icon ${['green','blue','gold','rose'][index]}">${['◆','◷','₦','⌁'][index]}</span><small>${stat[0]}</small><strong>${stat[1]}</strong><em>${index === 0 ? 'Updated today' : 'Local workspace data'}</em></article>`).join('')}</section><section class="panel module-panel"><div class="panel-head"><div><h2>${title} tools</h2><p>Choose a workflow to continue.</p></div><span class="module-status">Admin access</span></div><div class="module-grid">${features.map((feature, index) => `<button class="module-card" data-toast="${feature} opened"><span>${String(index + 1).padStart(2, '0')}</span><strong>${feature}</strong><small>Open workspace <i>→</i></small></button>`).join('')}</div></section><section class="panel empty-module"><strong>${title} activity</strong><p>Records and activity for this module will appear here as your school uses the workspace.</p></section>`;
}

function refreshAdminShell(profile) {
	const settings = getSettings();
	const school = EduTenant.schools().find(item => item.id === EduTenant.currentSession()?.schoolId);
	const schoolName = settings.schoolName || school?.name || '';
	const schoolElement = document.querySelector('.school strong');
	const headerMessage = document.querySelector('header p');
	const logo = document.querySelector('.brand img');
	if (schoolElement) schoolElement.textContent = schoolName;
	if (headerMessage) headerMessage.textContent = schoolName ? `Here is what needs attention across ${schoolName} today.` : 'Here is what needs attention today.';
	if (logo) { logo.src = settings.logoUrl || 'logo.svg'; logo.alt = schoolName ? `${schoolName} logo` : 'School logo'; }
}

function renderCurrentAdminPage() {
	renderAdminNavigation();
	refreshAdminShell(tenantUser);
	if (page === 'overview') renderLiveOverviewPage();
	else renderAdminPage();
	document.querySelectorAll('[data-toast]').forEach(button => button.onclick = () => showToast(button.dataset.toast));
}

function navigateAdminPage(nextPage, replace = false) {
	page = nextPage || 'overview';
	window.history[replace ? 'replaceState' : 'pushState']({}, '', `admin.html?page=${encodeURIComponent(page)}`);
	renderCurrentAdminPage();
}

renderAdminNavigation();
const tenantUser = EduTenant.currentUser();
const adminSession = EduTenant.currentSession();

if (!tenantUser || !adminSession || !adminSession.schoolId || adminSession.role !== 'school_admin') {
	window.location.replace('login.html#admin-login');
} else {
	const profile = tenantUser;
	const initials = profile.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
	const firstName = profile.name.split(/\s+/)[0];
	refreshAdminShell(profile);
	document.querySelector('.side-foot strong').textContent = profile.name;
		document.querySelector('header h1').textContent = `${EduTenant.timeContext().greeting}, ${firstName}`;
	document.querySelector('.avatar').textContent = initials;
	if (page === 'overview') renderLiveOverviewPage();
	else renderAdminPage();
}

document.addEventListener('click', event => {
	const navigationLink = event.target.closest('a[href^="admin.html?page="]');
	if (!navigationLink || event.defaultPrevented) return;
	event.preventDefault();
	navigateAdminPage(new URL(navigationLink.href).searchParams.get('page'));
});
window.addEventListener('popstate', () => navigateAdminPage(new URLSearchParams(window.location.search).get('page'), true));
document.querySelectorAll('[data-toast]').forEach(button => button.onclick = () => showToast(button.dataset.toast));
document.querySelector('[data-action="overview-add-student"]')?.addEventListener('click', () => { window.location.href = 'admin.html?page=admissions'; });
const studentForm = document.getElementById('studentForm');
const openStudentForm = document.querySelector('[data-action="open-student-form"]');
if (openStudentForm) openStudentForm.addEventListener('click', () => { const panel = document.getElementById('studentFormPanel'); if (panel) { panel.hidden = false; panel.scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
if (studentForm) studentForm.addEventListener('submit', async event => {
	event.preventDefault();
	const data = new FormData(studentForm);
	const students = getStudents();
	const admissionNo = String(data.get('admissionNo')).trim().toUpperCase();
	if (students.some(student => student.admissionNo === admissionNo)) { document.getElementById('studentFormError').textContent = 'That admission number is already in use.'; return; }
	const documents = [];
	if (data.get('birthCertificate')) documents.push('Birth certificate');
	if (data.get('passportPhoto')) documents.push('Passport photo');
	students.unshift({ id: crypto.randomUUID(), name: String(data.get('name')).trim(), email: String(data.get('email')).trim().toLowerCase(), admissionNo, className: data.get('className'), guardian: String(data.get('guardian')).trim(), status: 'Active', documents, scores: {} });
	if (!await saveStudents(students, 'Student record saved to Supabase')) return;
	window.location.href = `admin.html?page=${page === 'admissions' ? 'admissions' : 'students'}`;
});
document.addEventListener('submit', async event => {
	if (!['teacherForm', 'assignmentForm', 'academicClassForm', 'academicSubjectForm', 'academicTimetableForm', 'studentAttendanceForm', 'staffAttendanceForm', 'examForm', 'questionForm', 'resultForm'].includes(event.target.id)) return;
	event.preventDefault();
	const data = new FormData(event.target);
	const teachers = getTeachers();
	if (event.target.id === 'examForm') {
		const exam = { id: crypto.randomUUID(), title: String(data.get('title')).trim(), className: data.get('className'), subject: data.get('subject'), date: data.get('date'), duration: Number(data.get('duration')), status: 'Draft' };
		await saveExamData({ exams: [...(getSchoolData().exams || []), exam] }, 'Exam saved to Supabase');
	} else if (event.target.id === 'questionForm') {
		if (!getSchoolData().exams?.length) { document.getElementById('questionError').textContent = 'Create an exam first.'; return; }
		const question = { id: `question-${Date.now()}`, examId: data.get('examId'), type: data.get('type'), text: String(data.get('text')).trim(), answer: String(data.get('answer')).trim() };
		await saveExamData({ questions: [...(getSchoolData().questions || []), question] }, 'Question saved to Supabase');
	} else if (event.target.id === 'resultForm') {
		const score = Number(data.get('score'));
		if (score < 0 || score > 100) { document.getElementById('resultError').textContent = 'Score must be between 0 and 100.'; return; }
		const result = { id: crypto.randomUUID(), studentId: data.get('studentId'), examId: data.get('examId'), score, status: data.get('status'), updatedAt: new Date().toISOString() };
		await saveExamData({ results: [...(getSchoolData().results || []).filter(item => !(item.studentId === result.studentId && item.examId === result.examId)), result] }, 'Result saved to Supabase');
	} else if (event.target.id === 'studentAttendanceForm') {
		const records = Object.fromEntries(data.entries());
		await saveAttendanceData({ studentAttendance: { ...(getSchoolData().studentAttendance || {}), [attendanceDate()]: records } }, 'Student attendance saved to Supabase');
	} else if (event.target.id === 'staffAttendanceForm') {
		const records = Object.fromEntries(data.entries());
		await saveAttendanceData({ staffAttendance: { ...(getSchoolData().staffAttendance || {}), [attendanceDate()]: records } }, 'Staff attendance saved to Supabase');
	} else if (event.target.id === 'academicClassForm') {
		const className = `${String(data.get('className')).trim()} ${String(data.get('arm')).trim()}`;
		if (getSchoolData().classes.includes(className)) { document.getElementById('academicClassError').textContent = 'That class already exists.'; return; }
		await saveAcademicData({ classes: [...getSchoolData().classes, className] }, 'Class saved to Supabase');
	} else if (event.target.id === 'academicSubjectForm') {
		const subject = String(data.get('subject')).trim();
		if (getSchoolData().subjects.some(item => item.toLowerCase() === subject.toLowerCase())) { document.getElementById('academicSubjectError').textContent = 'That subject already exists.'; return; }
		const currentData = getSchoolData();
		await saveAcademicData({ subjects: [...currentData.subjects, subject], subjectCodes: { ...currentData.subjectCodes, [subject]: String(data.get('code') || '').trim().toUpperCase() } }, 'Subject saved to Supabase');
	} else if (event.target.id === 'academicTimetableForm') {
		const entry = { id: `slot-${Date.now()}`, day: data.get('day'), time: String(data.get('time')).trim(), className: data.get('className'), subject: data.get('subject'), teacher: data.get('teacher') };
		await saveAcademicData({ timetable: [...(getSchoolData().timetable || []), entry] }, 'Timetable entry saved to Supabase');
	} else if (event.target.id === 'teacherForm') {
		const email = String(data.get('email')).trim().toLowerCase();
		if (teachers.some(teacher => teacher.email.toLowerCase() === email)) { document.getElementById('teacherFormError').textContent = 'A teacher with that email already exists.'; return; }
		let teacherUser;
		try { teacherUser = await EduTenant.createTeacher({ name: String(data.get('name')).trim(), email, password: String(data.get('password') || ''), schoolId: EduTenant.currentSession()?.schoolId }); } catch (error) { document.getElementById('teacherFormError').textContent = error.message; return; }
		teachers.unshift({ id: teacherUser.id, userId: teacherUser.id, name: String(data.get('name')).trim(), email, phone: String(data.get('phone') || '').trim(), subjects: [String(data.get('subject')).trim()], classes: [String(data.get('className')).trim()], status: 'Active', performance: 0, notes: '' });
		await saveTeachers(teachers, 'Teacher account created. They can now sign in with the provided email and password.');
	} else {
		const teacher = teachers.find(record => record.id === data.get('teacherId'));
		if (!teacher) { document.getElementById('assignmentError').textContent = 'Add a teacher before creating an assignment.'; return; }
		const field = page === 'subject-assignment' ? 'subjects' : 'classes';
		const value = String(data.get('assignment')).trim();
		if (!teacher[field].includes(value)) teacher[field].push(value);
		await saveTeachers(teachers, `${page === 'subject-assignment' ? 'Subject' : 'Class'} assignment saved to Supabase`);
	}
	renderTeacherManagement();
});
document.addEventListener('click', async event => {
	const academicRemoveButton = event.target.closest('[data-academic-delete]');
	if (academicRemoveButton) {
		const data = getSchoolData();
		const type = academicRemoveButton.dataset.academicType;
		const values = type === 'timetable' ? (data.timetable || []).filter((entry, index) => String(index) !== academicRemoveButton.dataset.academicDelete) : data[type].filter(value => value !== academicRemoveButton.dataset.academicDelete);
		const changes = { [type]: values };
		if (type === 'subjects') { const subjectCodes = { ...data.subjectCodes }; delete subjectCodes[academicRemoveButton.dataset.academicDelete]; changes.subjectCodes = subjectCodes; }
		if (!await saveAcademicData(changes, 'Academic record removed from Supabase')) return;
		renderAcademicManagement();
		return;
	}
	const examDeleteButton = event.target.closest('[data-exam-delete]');
	if (examDeleteButton) { const data = getSchoolData(); if (await saveExamData({ exams: (data.exams || []).filter(exam => exam.id !== examDeleteButton.dataset.examDelete), questions: (data.questions || []).filter(question => question.examId !== examDeleteButton.dataset.examDelete), results: (data.results || []).filter(result => result.examId !== examDeleteButton.dataset.examDelete) }, 'Exam removed from Supabase')) renderExamManagement(); return; }
	const questionDeleteButton = event.target.closest('[data-question-delete]');
	if (questionDeleteButton) { const data = getSchoolData(); if (await saveExamData({ questions: (data.questions || []).filter(question => question.id !== questionDeleteButton.dataset.questionDelete) }, 'Question removed from Supabase')) renderExamManagement(); return; }
	const approveButton = event.target.closest('[data-result-approve]');
	if (approveButton) { const data = getSchoolData(); if (await saveExamData({ results: (data.results || []).map(result => result.id === approveButton.dataset.resultApprove ? { ...result, status: 'Approved', updatedAt: new Date().toISOString() } : result) }, 'Result approved in Supabase')) renderExamManagement(); return; }
	const removeButton = event.target.closest('[data-teacher-delete]');
	if (removeButton) { try { await EduTenant.deleteTeacher(removeButton.dataset.teacherDelete, EduTenant.currentSession()?.schoolId); showToast('Teacher removed from Supabase'); renderTeacherManagement(); } catch (error) { showToast(`Database update failed: ${error.message}`); } return; }
	const performanceButton = event.target.closest('[data-performance-save]');
	if (!performanceButton) return;
	const teachers = getTeachers();
	const teacher = teachers.find(record => record.id === performanceButton.dataset.performanceSave);
	if (!teacher) return;
	teacher.performance = Math.max(0, Math.min(100, Number(document.querySelector(`[data-performance-score="${teacher.id}"]`).value || 0)));
	teacher.notes = document.querySelector(`[data-performance-note="${teacher.id}"]`).value.trim();
	if (await saveTeachers(teachers, 'Teacher performance saved to Supabase')) renderTeacherManagement();
});
const settingsForm = document.getElementById('schoolSettingsForm');
if (settingsForm) settingsForm.addEventListener('submit', async event => {
	event.preventDefault();
	const data = new FormData(settingsForm);
	const settings = { schoolName: String(data.get('schoolName')).trim(), schoolCode: String(data.get('schoolCode')).trim().toUpperCase(), country: data.get('country'), session: data.get('session'), term: data.get('term'), currency: data.get('currency'), passMark: Number(data.get('passMark')), gradingScale: data.get('gradingScale'), logoUrl: getSettings().logoUrl || '', modules: { finance: data.get('module-finance') === 'on', ai: data.get('module-ai') === 'on', communications: data.get('module-communications') === 'on', library: data.get('module-library') === 'on', hostel: data.get('module-hostel') === 'on' } };
	if (!settings.schoolName || !settings.schoolCode || Number.isNaN(settings.passMark)) { document.getElementById('settingsError').textContent = 'Complete the required school settings first.'; return; }
	try { settings.logoUrl = await readLogoFile(data.get('schoolLogo')) || settings.logoUrl; } catch (error) { document.getElementById('settingsError').textContent = error.message; return; }
	if (!await saveSettings(settings)) return;
	document.querySelector('.school strong').textContent = settings.schoolName;
	document.querySelector('.school span').textContent = `${settings.session} · ${settings.term}`;
	window.setTimeout(() => window.location.reload(), 350);
});
document.querySelectorAll('[data-plan]').forEach(button => button.addEventListener('click', async () => { const subscription = getSubscription(); subscription.plan = button.dataset.plan; subscription.status = 'Active'; await saveSubscription(subscription); window.setTimeout(() => window.location.reload(), 350); }));
document.querySelector('[data-action="export-settings"]')?.addEventListener('click', () => { const data = { settings: getSettings(), subscription: getSubscription(), students: getStudents() }; const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); link.download = 'edumit-workspace.json'; link.click(); URL.revokeObjectURL(link.href); showToast('Workspace exported'); });
document.querySelector('[data-action="reset-settings"]')?.addEventListener('click', async () => { const settings = { ...getSettings(), country: 'Nigeria', currency: 'NGN', session: '2026/27', term: 'Term 1', passMark: 50, gradingScale: 'A-F', modules: { ai: true } }; if (await saveSettings(settings, 'Settings reset in Supabase')) window.location.reload(); });
document.querySelectorAll('[data-student-id]').forEach(button => button.addEventListener('click', () => { const student = getStudents().find(record => record.id === button.dataset.studentId); if (student) showToast(`${student.name} · ${student.admissionNo}`); }));
document.querySelectorAll('[data-document-student]').forEach(button => button.addEventListener('click', async () => { const students = getStudents(); const student = students.find(record => record.id === button.dataset.documentStudent); if (!student) return; student.documents = student.documents.includes('Medical form') ? student.documents.filter(document => document !== 'Medical form') : [...student.documents, 'Medical form']; if (await saveStudents(students, 'Document status saved to Supabase')) window.location.reload(); }));
document.querySelectorAll('[data-history-student]').forEach(button => button.addEventListener('click', () => { const student = getStudents().find(record => record.id === button.dataset.historyStudent); if (student) showToast(`${student.name}: ${Object.entries(student.scores).map(([subject, score]) => `${subject} ${score}%`).join(' · ')}`); }));
document.querySelector('[data-action="mark-document"]')?.addEventListener('click', () => showToast('Choose a student row to update documents'));
document.querySelector('[data-action="print-cards"]')?.addEventListener('click', () => window.print());
const idCardForm = document.getElementById('idCardForm');
if (idCardForm) idCardForm.addEventListener('submit', async event => {
	event.preventDefault();
	const data = new FormData(idCardForm);
	const file = data.get('passport');
	if (!file || !file.type.startsWith('image/')) { document.getElementById('idCardError').textContent = 'Choose a JPG, PNG, or WebP passport photograph.'; return; }
	if (file.size > 2 * 1024 * 1024) { document.getElementById('idCardError').textContent = 'Passport photograph must be smaller than 2 MB.'; return; }
	try {
		const passport = await readLogoFile(file);
		const students = getStudents();
		const student = students.find(record => record.id === data.get('studentId'));
		if (!student) return;
		student.passport = passport;
		student.parentName = String(data.get('parentName') || '').trim();
		student.phone = String(data.get('phone') || '').trim();
		student.address = String(data.get('address') || '').trim();
		if (await saveStudents(students, 'Student ID card saved to Supabase')) window.location.reload();
	} catch (error) { document.getElementById('idCardError').textContent = error.message; }
});
const studentSearch = document.getElementById('studentSearch');
if (studentSearch) studentSearch.addEventListener('input', event => { const query = event.target.value.toLowerCase(); document.getElementById('studentTable').innerHTML = studentTableMarkup(getStudents().filter(student => `${student.name} ${student.admissionNo} ${student.className}`.toLowerCase().includes(query))); });
document.querySelector('[data-logout]').addEventListener('click', async () => { await EduTenant.signOut(); window.location.href = 'login.html'; });
})();
