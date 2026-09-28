(async () => {
  const shell = document.querySelector('.super-shell');
  const toast = document.querySelector('.toast');
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  try { await EduTenant.initialize(); }
  catch (error) { console.error(error); }

  document.body.classList.add('auth-ready');

  let user = EduTenant.currentUser();
  function renderLogin(message = '') {
    shell.innerHTML = `<section class="platform-login"><a class="brand" href="login.html"><img src="logo.svg" alt="Edu-mit logo"><strong>Edu-mit</strong></a><p>Platform control</p><h1>Super Admin sign in</h1><form id="superLogin"><label>Email<input name="email" type="email" autocomplete="email" required></label><label>Password<input name="password" type="password" autocomplete="current-password" required></label><p id="superError" role="alert">${message}</p><button>Open platform dashboard</button></form><small>Super Admin access must be provisioned by the platform owner.</small></section>`;
    document.getElementById('superLogin').addEventListener('submit', async event => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      try {
        const result = await EduTenant.authenticate(data.get('email'), data.get('password'));
        if (!result || result.user.role !== 'super_admin') {
          await EduTenant.signOut();
          document.getElementById('superError').textContent = 'These credentials do not have Super Admin access.';
          return;
        }
        window.location.reload();
      } catch (error) { document.getElementById('superError').textContent = error.message; }
    });
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
  }

  function csvCell(value) {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
  }

  function render() {
    const schools = EduTenant.schools();
    const users = EduTenant.users();
    const students = EduTenant.allStudents();
    const panel = document.querySelector('.super-shell .panel');
    if (!document.getElementById('platformToolbar')) {
      const toolbar = document.createElement('div');
      toolbar.id = 'platformToolbar';
      toolbar.className = 'platform-toolbar';
      toolbar.innerHTML = '<input id="schoolSearch" type="search" placeholder="Search schools or admins" aria-label="Search schools or admins"><select id="schoolStatusFilter" aria-label="Filter schools by status"><option value="all">All statuses</option><option value="Active">Active</option><option value="Suspended">Suspended</option><option value="Inactive">Inactive</option></select><button type="button" id="exportSchools">Export CSV</button>';
      panel?.querySelector('.table-wrap')?.before(toolbar);
      document.getElementById('schoolSearch')?.addEventListener('input', render);
      document.getElementById('schoolStatusFilter')?.addEventListener('change', render);
      document.getElementById('exportSchools')?.addEventListener('click', () => {
        const rows = getVisibleSchools(EduTenant.schools(), EduTenant.users());
        const csv = [['School', 'School ID', 'Admin', 'Admin email', 'Students', 'Status', 'Created'], ...rows.map(row => [row.school.name, row.school.id, row.admin?.name || 'No admin', row.admin?.email || '', row.studentCount, row.school.status, row.school.createdAt?.slice(0, 10) || ''])].map(row => row.map(csvCell).join(',')).join('\n');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        link.download = `edumit-schools-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
      });
    }
    const visibleRows = getVisibleSchools(schools, users);
    document.getElementById('stats').innerHTML = [['Schools', schools.length, 'Tenant workspaces'], ['Students', students.length, 'Across all schools'], ['Active', schools.filter(school => school.status === 'Active').length, 'Accepting users'], ['Suspended', schools.filter(school => school.status === 'Suspended').length, 'Access blocked']].map(stat => `<article><small>${stat[0]}</small><strong>${stat[1]}</strong><em>${stat[2]}</em></article>`).join('');
    document.getElementById('schoolRows').innerHTML = visibleRows.map(({ school, admin, studentCount }) => `<tr><td><strong>${escapeHtml(school.name)}</strong><small>${school.createdAt?.slice(0, 10) || ''}</small></td><td>${school.id}</td><td>${escapeHtml(admin?.name || 'No admin')}<small>${escapeHtml(admin?.email || '')}</small></td><td>${studentCount}</td><td><span class="status ${school.status.toLowerCase()}">${school.status}</span></td><td>${school.status === 'Active' ? `<button class="action" data-status="Suspended" data-school="${school.id}">Suspend</button>` : `<button class="action" data-status="Active" data-school="${school.id}">Activate</button>`}<button class="action danger" data-delete="${school.id}">Delete</button></td></tr>`).join('') || '<tr><td colspan="6">No matching school workspaces.</td></tr>';
    document.querySelectorAll('[data-status]').forEach(button => button.addEventListener('click', async () => {
      try { await EduTenant.updateSchoolStatus(button.dataset.school, button.dataset.status); showToast(`School ${button.dataset.status.toLowerCase()}`); render(); }
      catch (error) { showToast(`Database update failed: ${error.message}`); }
    }));
    document.querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', async () => {
      if (!window.confirm('Permanently delete this school and its Supabase records?')) return;
      try { await EduTenant.deleteSchool(button.dataset.delete); showToast('School and related records deleted'); render(); }
      catch (error) { showToast(`Database delete failed: ${error.message}`); }
    }));
  }

  function getVisibleSchools(schools, users) {
    const search = String(document.getElementById('schoolSearch')?.value || '').trim().toLowerCase();
    const status = document.getElementById('schoolStatusFilter')?.value || 'all';
    const students = EduTenant.allStudents();
    return schools.map(school => ({ school, admin: users.find(profile => profile.schoolId === school.id && profile.role === 'school_admin'), studentCount: students.filter(student => student.schoolId === school.id).length })).filter(({ school, admin }) => (status === 'all' || school.status === status) && (!search || `${school.name} ${school.id} ${admin?.name || ''} ${admin?.email || ''}`.toLowerCase().includes(search)));
  }

  if (!user || user.role !== 'super_admin') {
    renderLogin();
    return;
  }
  render();
  document.querySelector('[data-logout]')?.addEventListener('click', async () => {
    await EduTenant.signOut();
    window.location.href = 'login.html';
  });
})();