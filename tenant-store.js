(() => {
  const KEYS = {
    schools: 'edumit:schools:v1',
    users: 'edumit:users:v1',
    students: 'edumit:students:v1',
    settings: 'edumit:school-settings:v1',
    subscriptions: 'edumit:subscriptions:v1'
    ,data: 'edumit:school-data:v1'
  };
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch (error) { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const id = value => `school_${String(value).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || Date.now()}`;
  const now = () => new Date().toISOString();

  function seed() {
    let schools = read(KEYS.schools, []);
    let users = read(KEYS.users, []);
    const legacyAccount = read('scholara:admin-account:v1', null);
    if (!schools.length && legacyAccount) {
      const schoolId = legacyAccount.schoolId || id(legacyAccount.school || legacyAccount.email);
      schools = [{ id: schoolId, name: legacyAccount.school || '', status: 'active', createdAt: legacyAccount.createdAt || now() }];
      users = [{ id: `user_${schoolId}`, name: legacyAccount.name, email: legacyAccount.email, password: legacyAccount.password, role: 'school_admin', schoolId, createdAt: legacyAccount.createdAt || now() }];
      const oldStudents = read('scholara:students:v1', []);
      write(KEYS.students, { [schoolId]: oldStudents.map(student => ({ ...student, schoolId })) });
      const oldSettings = read('edumit:school-settings:v1', null);
      if (oldSettings) write(KEYS.settings, { [schoolId]: oldSettings });
      const oldSubscription = read('edumit:subscription:v1', null);
      if (oldSubscription) write(KEYS.subscriptions, { [schoolId]: oldSubscription });
      write(KEYS.schools, schools); write(KEYS.users, users);
    }
    if (!users.some(user => user.role === 'super_admin')) {
      users.push({ id: 'user_super_admin', name: 'Platform Super Admin', email: 'superadmin@edumit.local', password: 'superadmin123', role: 'super_admin', schoolId: null, createdAt: now() });
      write(KEYS.users, users);
    }
    schools.forEach(school => {
      if (!users.some(user => user.role === 'teacher' && user.schoolId === school.id)) users.push({ id: `teacher_${school.id}`, name: 'David Eze', email: 'david.eze@greenfield.edu', password: 'teacher123', role: 'teacher', schoolId: school.id, createdAt: now() });
    });
    const data = read(KEYS.data, {});
    schools.forEach(school => { if (!data[school.id]) data[school.id] = { teachers: [], classes: ['JSS 2A', 'Primary 5'], subjects: ['Mathematics', 'English Language', 'Basic Science', 'Social Studies'], attendance: { today: 92.1 }, fees: { collected: 4200000, outstanding: 680000 }, events: [{ date: '20', month: 'SEP', title: 'Mid-term assessment week', detail: 'All classes · 08:00' }, { date: '24', month: 'SEP', title: 'PTA welcome meeting', detail: 'School hall · 14:00' }] }; });
    write(KEYS.data, data);
    write(KEYS.users, users);
  }

  function schools() { seed(); return read(KEYS.schools, []); }
  function users() { seed(); return read(KEYS.users, []); }
  function currentSession() { try { return JSON.parse(sessionStorage.getItem('edumit:session:v1') || 'null') || read('edumit:session:v1', null) || read('scholara:admin-session:v1', null); } catch (error) { return read('edumit:session:v1', null) || read('scholara:admin-session:v1', null); } }
  function currentUser() { const session = currentSession(); return session ? users().find(user => user.id === session.userId) || null : null; }
  function createSchoolAdmin({ name, school, email, password }) {
    seed();
    const normalizedEmail = email.trim().toLowerCase();
    if (users().some(user => user.email === normalizedEmail)) throw new Error('An account with this email already exists.');
    const schoolId = `${id(school)}_${Date.now().toString(36)}`;
    const schoolRecord = { id: schoolId, name: school.trim(), status: 'active', createdAt: now() };
    const user = { id: `user_${schoolId}`, name: name.trim(), email: normalizedEmail, password, role: 'school_admin', schoolId, createdAt: now() };
    write(KEYS.schools, [...schools(), schoolRecord]); write(KEYS.users, [...users().filter(item => item.role !== 'super_admin'), user, users().find(item => item.role === 'super_admin')]);
    write(KEYS.students, { ...read(KEYS.students, {}), [schoolId]: [] });
    return user;
  }
  function authenticate(email, password) {
    seed();
    const user = users().find(item => item.email === email.trim().toLowerCase() && item.password === password);
    if (!user) return null;
    const school = user.schoolId ? schools().find(item => item.id === user.schoolId) : null;
    if (school && school.status !== 'active') return { suspended: true, user };
    const session = { userId: user.id, role: user.role, schoolId: user.schoolId, signedInAt: now() };
    sessionStorage.setItem('edumit:session:v1', JSON.stringify(session));
    return { user, school, session };
  }
  function signOut() { sessionStorage.removeItem('edumit:session:v1'); localStorage.removeItem('edumit:session:v1'); }
  function schoolStudents(schoolId) { const all = read(KEYS.students, {}); return Array.isArray(all) ? all.filter(student => !student.schoolId || student.schoolId === schoolId) : (all[schoolId] || []); }
  function saveSchoolStudents(schoolId, students) { const all = read(KEYS.students, {}); all[schoolId] = students.map(student => ({ ...student, schoolId })); write(KEYS.students, all); }
  function schoolSettings(schoolId) { return { ...read(KEYS.settings, {})[schoolId] }; }
  function saveSchoolSettings(schoolId, settings) { const all = read(KEYS.settings, {}); all[schoolId] = { ...settings, schoolId }; write(KEYS.settings, all); }
  function schoolSubscription(schoolId) { return { ...read(KEYS.subscriptions, {})[schoolId] }; }
  function saveSchoolSubscription(schoolId, subscription) { const all = read(KEYS.subscriptions, {}); all[schoolId] = { ...subscription, schoolId }; write(KEYS.subscriptions, all); }
  function allStudents() { const all = read(KEYS.students, {}); return Array.isArray(all) ? all : Object.values(all).flat(); }
  function schoolData(schoolId) { return read(KEYS.data, {})[schoolId] || {}; }
  function saveSchoolData(schoolId, data) { const all = read(KEYS.data, {}); all[schoolId] = data; write(KEYS.data, all); }
  function updateSchoolStatus(schoolId, status) { const updated = schools().map(school => school.id === schoolId ? { ...school, status } : school); write(KEYS.schools, updated); return updated; }
  function updateSchool(schoolId, changes) { const updated = schools().map(school => school.id === schoolId ? { ...school, ...changes } : school); write(KEYS.schools, updated); return updated.find(school => school.id === schoolId); }
  function deleteSchool(schoolId) { write(KEYS.schools, schools().filter(school => school.id !== schoolId)); write(KEYS.users, users().filter(user => user.schoolId !== schoolId)); const students = read(KEYS.students, {}); delete students[schoolId]; write(KEYS.students, students); }
  window.EduTenant = { KEYS, seed, schools, users, currentSession, currentUser, createSchoolAdmin, authenticate, signOut, schoolStudents, saveSchoolStudents, schoolSettings, saveSchoolSettings, schoolSubscription, saveSchoolSubscription, allStudents, schoolData, saveSchoolData, updateSchool, updateSchoolStatus, deleteSchool };
  seed();
})();
