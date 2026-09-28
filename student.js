(async () => {
  const content = document.querySelector('.content');
  const toast = document.querySelector('.toast');
  const showToast = message => { toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2400); };
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);

  if (!await EduTenant.protectRoute('student', '#student-login')) return;
  const session = EduTenant.currentSession();
  const student = EduTenant.currentStudent();
  if (!session || !student) { window.location.replace('login.html#student-login'); return; }
  document.body.classList.add('auth-ready');

  const brand = document.querySelector('.brand strong');
  function updateTimeContext() {
    const current = EduTenant.timeContext();
    const eyebrow = document.querySelector('header .eyebrow');
    if (eyebrow) eyebrow.textContent = `Student workspace · ${current.date} · ${current.time}`;
  }
  updateTimeContext();
  window.setInterval(updateTimeContext, 60000);
  const schoolName = EduTenant.currentSchoolName(session.schoolId) || 'EDU-MIT';
  if (brand) brand.textContent = schoolName;
  document.querySelector('.student-profile strong').textContent = student.name;
  document.querySelector('.student-profile small').textContent = `${student.className} · ${new Date().getFullYear()}`;
  document.querySelector('header h1').textContent = `Welcome back, ${student.name.split(/\s+/)[0]}.`;
  document.querySelector('header .avatar').textContent = student.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();

  const timetable = EduTenant.studentSchedule();
  const results = EduTenant.studentResults().filter(result => result.status === 'approved');
  const attendance = EduTenant.studentAttendance();
  const scores = results.map(result => Number(result.score));
  const average = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
  const presentCount = attendance.filter(item => item.status === 'Present' || item.status === 'Late').length;
  const attendanceRate = attendance.length ? Math.round(presentCount / attendance.length * 100) : 0;
  const grade = average >= 80 ? 'A' : average >= 70 ? 'B' : average >= 60 ? 'C' : average >= 50 ? 'D' : 'E';

  function render(view = 'overview') {
    document.querySelectorAll('.student-app nav a').forEach(link => link.classList.toggle('active', link.hash.slice(1) === view || (view === 'overview' && link.hash === '#overview')));
    if (view === 'timetable') {
      content.innerHTML = `<div class="section-head"><div><h2>My timetable</h2><p>${escapeHtml(student.className)}</p></div></div><section class="day-list">${timetable.map(item => `<article><time>${escapeHtml(item.start_time)}</time><div class="subject-dot green"></div><div><span class="now">${escapeHtml(item.day)}</span><h3>${escapeHtml(item.subject)}</h3><p>${escapeHtml(item.teacher || '')}</p></div><b>${escapeHtml(item.class_name || student.className)}</b></article>`).join('') || '<p class="muted-cell">Your school has not published a timetable for this class yet.</p>'}</section>`;
    } else if (view === 'results') {
      content.innerHTML = `<div class="section-head"><div><h2>My results</h2><p>Approved exam results</p></div></div><section class="day-list">${results.map(result => `<article><div><h3>${escapeHtml(result.exam_title)}</h3><p>${escapeHtml(result.subject || '')}</p></div><strong>${Number(result.score)}%</strong></article>`).join('') || '<p class="muted-cell">No approved results are available yet.</p>'}</section>`;
    } else if (view === 'attendance') {
      content.innerHTML = `<div class="section-head"><div><h2>My attendance</h2><p>${attendanceRate}% attendance rate</p></div></div><section class="day-list">${attendance.map(item => `<article><time>${escapeHtml(item.attendance_date)}</time><div><h3>${escapeHtml(item.status)}</h3></div></article>`).join('') || '<p class="muted-cell">No attendance has been recorded yet.</p>'}</section>`;
    } else if (view === 'announcements') {
      content.innerHTML = '<div class="section-head"><div><h2>Announcements</h2><p>School updates</p></div></div><p class="muted-cell">There are no announcements yet.</p>';
    } else {
      content.innerHTML = `<section class="summary"><div><p class="eyebrow">${escapeHtml(schoolName)} · ${new Date().getFullYear()}</p><h2>Your school progress</h2><p>Review your published timetable, approved results, and attendance.</p><div class="summary-stats"><span><strong>${average}%</strong><small>Average score</small></span><span><strong>${attendanceRate}%</strong><small>Attendance</small></span><span><strong>${student.documents.length}</strong><small>Documents</small></span></div></div><div class="grade-mark"><span>Current grade</span><strong>${grade}</strong><small>${average} out of 100</small></div></section><div class="section-head"><div><h2>My timetable</h2><p>${escapeHtml(student.className)}</p></div><a href="#timetable">View all</a></div><section class="day-list">${timetable.slice(0, 4).map(item => `<article><time>${escapeHtml(item.start_time)}</time><div class="subject-dot green"></div><div><span class="now">${escapeHtml(item.day)}</span><h3>${escapeHtml(item.subject)}</h3><p>${escapeHtml(item.teacher || '')}</p></div><b>${escapeHtml(item.class_name || student.className)}</b></article>`).join('') || '<p class="muted-cell">Your timetable will appear here once published.</p>'}</section>`;
    }
  }

  document.querySelectorAll('.student-app nav a').forEach(link => link.addEventListener('click', event => {
    const view = link.hash.slice(1);
    if (!['overview', 'timetable', 'results', 'attendance', 'announcements'].includes(view)) return;
    event.preventDefault();
    history.replaceState(null, '', `#${view}`);
    render(view);
  }));
  document.querySelector('[data-logout]').addEventListener('click', async () => { await EduTenant.signOut(); window.location.href = 'login.html'; });
  render(window.location.hash.slice(1) || 'overview');
})();