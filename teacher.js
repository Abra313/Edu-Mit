(async () => {
  const toast = document.querySelector('.toast');
  const content = document.querySelector('.content');
  const showToast = message => { toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2600); };
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);

  if (!await EduTenant.protectRoute('teacher', '#teacher-login')) return;
  const session = EduTenant.currentSession();
  const user = EduTenant.currentUser();
  if (!session || !session.schoolId) { window.location.replace('login.html#teacher-login'); return; }
  document.body.classList.add('auth-ready');

  const data = EduTenant.schoolData(session.schoolId);
  const teacher = data.teachers.find(item => item.userId === session.userId) || data.teachers[0];
  const assignedClasses = teacher?.classes || [];
  const students = EduTenant.schoolStudents(session.schoolId).filter(student => !assignedClasses.length || assignedClasses.includes(student.className));
  const exams = data.exams || [];
  const today = new Date().toISOString().slice(0, 10);
  function updateTimeContext() {
    const current = EduTenant.timeContext();
    const eyebrow = document.querySelector('header .eyebrow');
    const heading = document.querySelector('header h1');
    if (eyebrow) eyebrow.textContent = `Teacher workspace · ${current.date} · ${current.time}`;
    if (heading) heading.textContent = `${current.greeting}, ${user.name.split(/\s+/)[0]}.`;
  }
  updateTimeContext();
  window.setInterval(updateTimeContext, 60000);
  const brand = document.querySelector('.brand strong');
  if (brand) brand.textContent = EduTenant.currentSchoolName(session.schoolId) || 'EDU-MIT';
  document.querySelector('.profile strong').textContent = user.name;
  document.querySelector('.profile small').textContent = assignedClasses.join(', ') || 'Teacher';
  document.querySelector('.sub').textContent = `${students.length} students in your assigned classes.`;

  const schedule = (data.timetable || []).filter(item => !assignedClasses.length || assignedClasses.includes(item.className));
  const scheduleElement = document.querySelector('.schedule');
  if (scheduleElement) scheduleElement.innerHTML = schedule.map(item => `<article><time>${escapeHtml(item.time)}</time><div class="line green"></div><div><span class="tag blue-tag">${escapeHtml(item.day)}</span><h3>${escapeHtml(item.subject)} · ${escapeHtml(item.className)}</h3><p>${escapeHtml(item.teacher || user.name)}</p></div></article>`).join('') || '<p class="muted-cell">No timetable entries have been published for your classes.</p>';

  function renderAttendance() {
    const current = data.studentAttendance?.[today] || {};
    content.innerHTML = `<div class="section-title"><div><h2>Class attendance</h2><p>${today}</p></div></div><form id="teacherAttendanceForm"><section class="panel table-panel"><table><thead><tr><th>Student</th><th>Class</th><th>Status</th></tr></thead><tbody>${students.map(student => `<tr><td><strong>${escapeHtml(student.name)}</strong><small>${escapeHtml(student.admissionNo)}</small></td><td>${escapeHtml(student.className)}</td><td><select name="${student.id}"><option ${current[student.id] === 'Present' ? 'selected' : ''}>Present</option><option ${current[student.id] === 'Absent' ? 'selected' : ''}>Absent</option><option ${current[student.id] === 'Late' ? 'selected' : ''}>Late</option></select></td></tr>`).join('') || '<tr><td colspan="3">No students are assigned to your classes.</td></tr>'}</tbody></table></section><button class="primary" type="submit">Save attendance</button></form>`;
    document.getElementById('teacherAttendanceForm').addEventListener('submit', async event => {
      event.preventDefault();
      const records = Object.fromEntries(new FormData(event.currentTarget).entries());
      try { await EduTenant.saveAttendanceRecord(today, records, data.staffAttendance?.[today] || {}); showToast('Attendance saved to Supabase'); }
      catch (error) { showToast(`Attendance save failed: ${error.message}`); }
    });
  }

  function renderResults() {
    content.innerHTML = `<div class="section-title"><div><h2>Enter student results</h2><p>Scores are recorded directly in the school database.</p></div></div><form id="teacherResultForm" class="student-form"><div class="form-grid"><label>Student<select name="studentId" required>${students.map(student => `<option value="${student.id}">${escapeHtml(student.name)} · ${escapeHtml(student.className)}</option>`).join('')}</select></label><label>Exam<select name="examId" required>${exams.map(exam => `<option value="${exam.id}">${escapeHtml(exam.title)}</option>`).join('')}</select></label><label>Score<input name="score" type="number" min="0" max="100" required></label><label>Status<select name="status"><option>Draft</option><option>Approved</option></select></label></div><p class="form-error" id="teacherResultError"></p><button class="primary" type="submit">Save result</button></form>`;
    document.getElementById('teacherResultForm').addEventListener('submit', async event => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const score = Number(formData.get('score'));
      if (score < 0 || score > 100) { document.getElementById('teacherResultError').textContent = 'Score must be from 0 to 100.'; return; }
      try { await EduTenant.saveExamResult({ studentId: formData.get('studentId'), examId: formData.get('examId'), score, status: formData.get('status') }); showToast('Result saved to Supabase'); }
      catch (error) { showToast(`Result save failed: ${error.message}`); }
    });
  }

  document.querySelectorAll('.teacher-app nav a').forEach(link => link.addEventListener('click', event => {
    const view = link.getAttribute('href').slice(1);
    if (!['attendance', 'results'].includes(view)) return;
    event.preventDefault();
    if (view === 'attendance') renderAttendance();
    else renderResults();
  }));
  document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.action === 'attendance') renderAttendance();
    else renderResults();
  }));
  document.querySelectorAll('[data-toast]').forEach(button => button.addEventListener('click', () => showToast(button.dataset.toast)));
  document.querySelector('[data-logout]').addEventListener('click', async () => { await EduTenant.signOut(); window.location.href = 'login.html'; });
})();