const adminLoginForm = document.getElementById('adminLoginForm');
const teacherLoginForm = document.getElementById('teacherLoginForm');
const studentLoginForm = document.getElementById('studentLoginForm');

function openRoleLogin(role) {
	const form = document.getElementById(`${role}LoginForm`);
	if (!form) return;
	document.querySelectorAll('.role-login-form').forEach(loginForm => { loginForm.hidden = loginForm !== form; });
	form.hidden = false;
	form.scrollIntoView({ behavior: 'smooth', block: 'center' });
	form.querySelector('input').focus();
}

function showLoginError(form, message) {
	form.querySelector('.login-error').textContent = message;
}

document.querySelectorAll('.role-card').forEach(card => card.addEventListener('click', event => {
	const role = card.classList.contains('admin') ? 'admin' : card.classList.contains('teacher') ? 'teacher' : 'student';
	localStorage.setItem('scholara:lastRole', role.charAt(0).toUpperCase() + role.slice(1));
	if (role === 'admin' || role === 'teacher' || role === 'student') {
		event.preventDefault();
		openRoleLogin(role);
	}
}));

const initialRole = window.location.hash.replace('#', '').replace('-login', '');
if (['admin', 'teacher', 'student'].includes(initialRole)) openRoleLogin(initialRole);

document.querySelectorAll('[data-close-login]').forEach(button => button.addEventListener('click', () => {
		const form = document.getElementById(`${button.dataset.closeLogin}LoginForm`);
		if (form) form.hidden = true;
		window.history.replaceState({}, '', 'login.html');
	}));

if (adminLoginForm) adminLoginForm.addEventListener('submit', event => {
	event.preventDefault();
	const data = new FormData(adminLoginForm);
	const email = String(data.get('email') || '').trim().toLowerCase();
	const password = String(data.get('password') || '');
		const result = EduTenant.authenticate(email, password);
		if (!result) return showLoginError(adminLoginForm, 'The email or password is incorrect.');
		if (result.suspended) return showLoginError(adminLoginForm, 'This school account is suspended. Contact the platform administrator.');
		localStorage.setItem('scholara:admin-account:v1', JSON.stringify({ ...result.user, school: result.school.name }));
		sessionStorage.setItem('edumit:session:v1', JSON.stringify({ ...result.session, email: result.user.email }));
	window.location.href = 'admin.html';
});

if (teacherLoginForm) teacherLoginForm.addEventListener('submit', event => {
	event.preventDefault();
	const data = new FormData(teacherLoginForm);
	const email = String(data.get('email') || '').trim().toLowerCase();
	const password = String(data.get('password') || '');
	const result = EduTenant.authenticate(email, password);
	if (!result || result.user.role !== 'teacher') return showLoginError(teacherLoginForm, 'The teacher email or password is incorrect.');
	sessionStorage.setItem('edumit:session:v1', JSON.stringify({ ...result.session, email, name: result.user.name }));
	window.location.href = 'teacher.html';
});

if (studentLoginForm) studentLoginForm.addEventListener('submit', event => {
	event.preventDefault();
	const admissionNo = String(new FormData(studentLoginForm).get('admissionNo') || '').trim().toUpperCase();
	const student = EduTenant.allStudents().find(record => record.admissionNo === admissionNo);
	if (!student) return showLoginError(studentLoginForm, 'Admission number not found. Check it and try again.');
	sessionStorage.setItem('edumit:session:v1', JSON.stringify({ userId: `student_${student.id}`, role: 'student', schoolId: student.schoolId, admissionNo, name: student.name, className: student.className, signedInAt: new Date().toISOString() }));
	window.location.href = 'student.html';
});
