const form = document.getElementById('adminSignupForm');
const error = document.getElementById('formError');
const signupBrand = document.querySelector('.brand');
if (signupBrand) { signupBrand.querySelector('strong').textContent = 'EDU-MIT'; const mark = signupBrand.querySelector('span'); if (mark) mark.outerHTML = '<img src="logo.svg" alt="EDU-MIT logo">'; }

function showError(message, fields = []) {
  error.textContent = message;
  form.querySelectorAll('input').forEach(input => input.classList.toggle('invalid', fields.includes(input.name)));
}

function setSignupLoading(loading) {
  const button = form.querySelector('.submit-button');
  if (!button) return;
  if (loading) {
    button.disabled = true;
    button.dataset.defaultLabel = button.innerHTML;
    button.innerHTML = '<span class="button-spinner" aria-hidden="true"></span>Creating account...';
  } else {
    button.disabled = false;
    if (button.dataset.defaultLabel) button.innerHTML = button.dataset.defaultLabel;
  }
}

form.addEventListener('submit', async event => {
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
    showError('Please accept the school workspace terms.', []);
    return;
  }

  setSignupLoading(true);
  try {
    const account = await EduTenant.createSchoolAdmin({ name: data.get('name'), school: data.get('school'), email: data.get('email'), password });
    if (account.needsEmailConfirmation) {
      setSignupLoading(false);
      showError('We sent a confirmation link to your email. Open it, then return here to sign in. Check spam if you do not see it.');
      return;
    }
    window.location.href = 'admin.html';
  } catch (signupError) { setSignupLoading(false); showError(EduTenant.authErrorMessage(signupError)); }
});

form.querySelectorAll('input').forEach(input => input.addEventListener('input', () => {
  input.classList.remove('invalid');
  if (error.textContent) error.textContent = '';
}));
