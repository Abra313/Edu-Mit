const session = EduTenant.currentSession();
const user = EduTenant.currentUser();
const authorized = Boolean(session && user && user.role === 'super_admin');
if (!authorized) {
  document.querySelector('.super-shell').innerHTML = `<section class="platform-login"><a class="brand" href="login.html"><img src="logo.svg" alt="Edu-mit logo"><strong>Edu-mit</strong></a><p>Platform control</p><h1>Super Admin sign in</h1><form id="superLogin"><label>Email<input name="email" type="email" placeholder="superadmin@edumit.local" required></label><label>Password<input name="password" type="password" placeholder="Password" required></label><p id="superError"></p><button>Open platform dashboard</button></form><small>Demo credentials: superadmin@edumit.local · superadmin123</small></section>`;
  document.getElementById('superLogin').addEventListener('submit', event => { event.preventDefault(); const data = new FormData(event.currentTarget); const result = EduTenant.authenticate(data.get('email'), data.get('password')); if (!result || result.user.role !== 'super_admin') { document.getElementById('superError').textContent = 'Incorrect Super Admin credentials.'; return; } window.location.reload(); });
}
const toast = document.querySelector('.toast'); let timer;
function showToast(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(timer); timer = setTimeout(() => toast.classList.remove('show'), 2200); }
function render() {
  if (!authorized) return;
  const schools = EduTenant.schools();
  const users = EduTenant.users();
  document.getElementById('stats').innerHTML = [['Schools', schools.length, 'Tenant workspaces'], ['Students', EduTenant.allStudents().length, 'Across all schools'], ['Active', schools.filter(school => school.status === 'active').length, 'Accepting users'], ['Suspended', schools.filter(school => school.status === 'suspended').length, 'Access blocked']].map(stat => `<article><small>${stat[0]}</small><strong>${stat[1]}</strong><em>${stat[2]}</em></article>`).join('');
  document.getElementById('schoolRows').innerHTML = schools.map(school => { const admin = users.find(userRecord => userRecord.schoolId === school.id && userRecord.role === 'school_admin'); return `<tr><td><strong>${school.name}</strong><small>${school.createdAt.slice(0, 10)}</small></td><td>${school.id}</td><td>${admin?.name || 'No admin'}<small>${admin?.email || ''}</small></td><td>${EduTenant.schoolStudents(school.id).length}</td><td><span class="status ${school.status}">${school.status}</span></td><td>${school.status === 'active' ? `<button class="action" data-status="suspended" data-school="${school.id}">Suspend</button>` : `<button class="action" data-status="active" data-school="${school.id}">Activate</button>`}<button class="action danger" data-delete="${school.id}">Delete</button></td></tr>`; }).join('') || '<tr><td colspan="6">No school workspaces registered.</td></tr>';
  document.querySelectorAll('[data-status]').forEach(button => button.addEventListener('click', () => { EduTenant.updateSchoolStatus(button.dataset.school, button.dataset.status); showToast(`School ${button.dataset.status}`); render(); }));
  document.querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', () => { if (window.confirm('Delete this school and all its local records?')) { EduTenant.deleteSchool(button.dataset.delete); showToast('School deleted'); render(); } }));
}
render();
document.querySelector('[data-logout]')?.addEventListener('click', () => { EduTenant.signOut(); window.location.href = 'login.html'; });
