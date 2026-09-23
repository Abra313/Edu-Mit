if (!window.EduTenant) document.write('<script src="tenant-store.js"><\\/script>');
const studentSession = EduTenant.currentSession() || JSON.parse(localStorage.getItem('scholara:student-session:v1') || 'null');
if (!studentSession || studentSession.role !== 'student' || !studentSession.schoolId) window.location.replace('login.html#student-login');
const studentBrand = document.querySelector('.brand');
if (studentBrand) { studentBrand.querySelector('strong').textContent = 'Edu-mit'; const mark = studentBrand.querySelector('span'); if (mark) mark.outerHTML = '<img src="logo.svg" alt="Edu-mit logo">'; }
if (studentSession) {
	document.querySelector('.student-profile strong').textContent = studentSession.name;
	document.querySelector('.student-profile small').textContent = `${studentSession.className} · 2026/27`;
	document.querySelector('header h1').textContent = `Welcome back, ${studentSession.name.split(/\s+/)[0]}.`;
	document.querySelector('header .avatar').textContent = studentSession.name.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
}
document.querySelector('[data-logout]').addEventListener('click', () => { EduTenant.signOut(); localStorage.removeItem('scholara:student-session:v1'); window.location.href = 'login.html'; });
