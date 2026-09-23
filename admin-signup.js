const form = document.getElementById('adminSignupForm');
const error = document.getElementById('formError');
const signupBrand = document.querySelector('.brand');
if (signupBrand) { signupBrand.querySelector('strong').textContent = 'Edu-mit'; const mark = signupBrand.querySelector('span'); if (mark) mark.outerHTML = '<img src="logo.svg" alt="Edu-mit logo">'; }

function showError(message, fields = []) {
  error.textContent = message;
  form.querySelectorAll('input').forEach(input => input.classList.toggle('invalid', fields.includes(input.name)));
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const password = data.get('password');
  const confirmPassword = data.get('confirmPassword');
  const requiredFields = ['name', 'school', 'email', 'password', 'confirmPassword'];
  const missing = requiredFields.filter(field => !String(data.get(field) || '').trim());

  if (missing.length) {
    showError('Complete all fields to create your Admin account.', missing);
    return;
  }
  if (password.length < 8) {
    showError('Your password must be at least 8 characters.', ['password']);
    return;
  }
  if (password !== confirmPassword) {
    showError('Your passwords do not match.', ['password', 'confirmPassword']);
    return;
  }
  if (!data.get('terms')) {
    showError('Please accept the local demo workspace terms.', []);
    return;
  }

  let account;
  try { account = EduTenant.createSchoolAdmin({ name: data.get('name'), school: data.get('school'), email: data.get('email'), password }); } catch (signupError) { showError(signupError.message); return; }
  localStorage.setItem('scholara:admin-account:v1', JSON.stringify({ ...account, school: data.get('school').trim() }));
  localStorage.setItem('scholara:admin-profile:v1', JSON.stringify({ name: account.name, school: data.get('school').trim(), email: account.email, schoolId: account.schoolId }));
  localStorage.setItem('scholara:lastRole', 'Admin');
  window.location.href = 'login.html#admin-login';
});

form.querySelectorAll('input').forEach(input => input.addEventListener('input', () => {
  input.classList.remove('invalid');
  if (error.textContent) error.textContent = '';
}));
