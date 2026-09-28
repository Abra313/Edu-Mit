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

function setLoginLoading(form, loading) {
	const button = form.querySelector('.login-submit');
	if (!button) return;
	if (loading) {
		button.disabled = true;
		button.dataset.defaultLabel = button.innerHTML;
		button.innerHTML = '<span class="button-spinner" aria-hidden="true"></span>Working...';
	} else {
		button.disabled = false;
		if (button.dataset.defaultLabel) button.innerHTML = button.dataset.defaultLabel;
	}
}

function destinationFor(role) {
	return { school_admin: 'admin.html', teacher: 'teacher.html', student: 'student.html', super_admin: 'super-admin.html' }[role];
}

document.querySelectorAll('.role-card').forEach(card => card.addEventListener('click', event => {
	const role = card.classList.contains('admin') ? 'admin' : card.classList.contains('teacher') ? 'teacher' : 'student';
	event.preventDefault();
	openRoleLogin(role);
}));

document.querySelectorAll('[data-auth-mode]').forEach(button => button.addEventListener('click', () => {
	const form = button.closest('form');
	const signup = form.dataset.mode !== 'signup';
	form.dataset.mode = signup ? 'signup' : 'login';
	button.textContent = signup ? 'Back to sign in' : `Create ${form.id === 'teacherLoginForm' ? 'teacher' : 'student'} account`;
	form.querySelector('.login-submit').innerHTML = signup ? 'Create account <span>→</span>' : `Open ${form.id === 'teacherLoginForm' ? 'Teacher' : 'Student'} dashboard <span>→</span>`;
	const admissionField = form.querySelector('[data-admission-field]');
	if (admissionField) {
		admissionField.hidden = !signup;
		admissionField.querySelector('input').required = signup;
	}
	showLoginError(form, '');
}));

const initialRole = window.location.hash.replace('#', '').replace('-login', '');
if (['admin', 'teacher', 'student'].includes(initialRole)) openRoleLogin(initialRole);

document.querySelectorAll('[data-close-login]').forEach(button => button.addEventListener('click', () => {
	const form = document.getElementById(`${button.dataset.closeLogin}LoginForm`);
	if (form) form.hidden = true;
	window.history.replaceState({}, '', 'login.html');
}));

async function submitCredentialForm(form, role) {
	const data = new FormData(form);
	const email = String(data.get('email') || '').trim().toLowerCase();
	const password = String(data.get('password') || '');
	setLoginLoading(form, true);
	try {
		if (form.dataset.mode === 'signup') {
			const result = await EduTenant.registerLinkedUser({ role, email, password, admissionNo: data.get('admissionNo') });
			if (result.needsEmailConfirmation) { setLoginLoading(form, false); return showLoginError(form, 'We sent a confirmation link to your email. Open it, then return here to sign in. Check spam if needed.'); }
			if (result.role !== role) { await EduTenant.signOut(); setLoginLoading(form, false); return showLoginError(form, 'This school account is not set up for that role.'); }
			window.location.href = destinationFor(role);
			return;
		}
		const result = await EduTenant.authenticate(email, password);
		if (!result) { setLoginLoading(form, false); return showLoginError(form, 'The email or password is incorrect.'); }
		if (result.suspended) { setLoginLoading(form, false); return showLoginError(form, 'This account is inactive or its school is suspended. Contact your school administrator.'); }
		if (result.user.role !== role) { await EduTenant.signOut(); setLoginLoading(form, false); return showLoginError(form, 'This email is registered for a different role.'); }
		window.location.href = destinationFor(role);
	} catch (error) { setLoginLoading(form, false); showLoginError(form, EduTenant.authErrorMessage(error)); }
}

adminLoginForm?.addEventListener('submit', async event => {
	event.preventDefault();
	setLoginLoading(adminLoginForm, true);
	try {
		const data = new FormData(adminLoginForm);
		const result = await EduTenant.authenticate(data.get('email'), data.get('password'));
		if (!result) { setLoginLoading(adminLoginForm, false); return showLoginError(adminLoginForm, 'The email or password is incorrect.'); }
		if (result.suspended) { setLoginLoading(adminLoginForm, false); return showLoginError(adminLoginForm, 'This school account is suspended. Contact the platform administrator.'); }
		if (result.user.role !== 'school_admin') { await EduTenant.signOut(); setLoginLoading(adminLoginForm, false); return showLoginError(adminLoginForm, 'This account is not a School Admin account.'); }
		window.location.href = 'admin.html';
	} catch (error) { setLoginLoading(adminLoginForm, false); showLoginError(adminLoginForm, error.message); }
});

teacherLoginForm?.addEventListener('submit', event => { event.preventDefault(); submitCredentialForm(teacherLoginForm, 'teacher'); });
studentLoginForm?.addEventListener('submit', event => { event.preventDefault(); submitCredentialForm(studentLoginForm, 'student'); });

EduTenant.initialize().then(session => {
	const destination = session && destinationFor(session.role);
	if (destination) window.location.replace(destination);
}).catch(error => {
	const activeForm = document.querySelector('.role-login-form:not([hidden])') || adminLoginForm;
	if (activeForm) showLoginError(activeForm, error.message);
});
