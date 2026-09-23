if (!window.EduTenant) document.write('<script src="tenant-store.js"><\\/script>');
const teacherSession = EduTenant.currentSession() || JSON.parse(localStorage.getItem('scholara:teacher-session:v1') || 'null');
if (!teacherSession || teacherSession.role !== 'teacher' || !teacherSession.schoolId) window.location.replace('login.html#teacher-login');
const teacherBrand = document.querySelector('.brand');
if (teacherBrand) { teacherBrand.querySelector('strong').textContent = 'Edu-mit'; const mark = teacherBrand.querySelector('span'); if (mark) mark.outerHTML = '<img src="logo.svg" alt="Edu-mit logo">'; }
const toast = document.querySelector('.toast'); let timer;
function showToast(message){ toast.textContent = message; toast.classList.add('show'); clearTimeout(timer); timer = setTimeout(() => toast.classList.remove('show'), 2200); }
document.querySelectorAll('[data-toast]').forEach(button => button.addEventListener('click', () => showToast(button.dataset.toast)));
document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => showToast(button.dataset.action === 'attendance' ? 'Attendance register opened' : 'Score entry opened')));
document.querySelector('[data-logout]').addEventListener('click', () => { EduTenant.signOut(); localStorage.removeItem('scholara:teacher-session:v1'); window.location.href = 'login.html'; });
