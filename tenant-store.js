(() => {
  const client = window.EduSupabase?.client;
  const state = { session: null, profile: null, schools: [], profiles: [], students: [], teachers: [], settings: [], subscriptions: [], academics: [], attendance: [], exams: [], results: [], myAttendance: [], mySchedule: [], myResults: [] };
  const now = () => new Date().toISOString();
  const timeContext = () => {
    const date = new Date();
    const hour = date.getHours();
    return {
      greeting: hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening',
      date: new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date),
      time: new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
    };
  };
  const uuid = () => crypto.randomUUID();
  const titleStatus = value => ({ active: 'Active', inactive: 'Inactive', suspended: 'Suspended', draft: 'Draft', approved: 'Approved' })[String(value || 'active').toLowerCase()] || value;
  const dbStatus = value => ({ Active: 'active', Inactive: 'inactive', Suspended: 'suspended', Pending: 'draft', Draft: 'draft', Approved: 'approved' })[value] || String(value || 'active').toLowerCase();
  const throwError = (error) => { if (error) throw error; };
  const assertReady = () => { if (!client) throw new Error('Supabase is not configured. Check supabase-client.js and the network connection.'); };
  const authErrorMessage = error => {
    const message = String(error?.message || 'Supabase could not complete this action. Check your connection and try again.');
    const waitMatch = message.match(/(?:after|in)\s+(\d+)\s+seconds?/i);
    if (/email rate limit exceeded/i.test(message)) {
      return waitMatch ? `Please wait ${waitMatch[1]} seconds before requesting another email.` : 'Please wait a moment before requesting another email.';
    }
    return message;
  };
  const authRedirectUrl = () => window.location.protocol === 'http:' || window.location.protocol === 'https:' ? `${window.location.origin}/login.html` : undefined;
  const profileUser = profile => profile ? ({ id: profile.id, name: profile.full_name, email: profile.email, role: profile.role, schoolId: profile.school_id, status: titleStatus(profile.status), createdAt: profile.created_at }) : null;
  const studentRecord = row => ({ id: row.id, userId: row.user_id, schoolId: row.school_id, name: `${row.first_name} ${row.last_name}`.trim(), email: row.email || '', admissionNo: row.admission_no, className: row.class_name || '', guardian: row.guardian_name || '', guardianPhone: row.guardian_phone || '', parentName: row.parent_name || '', address: row.address || '', passport: row.passport_url || '', documents: row.documents || [], status: titleStatus(row.status), scores: row.scores || {}, createdAt: row.created_at });
  const teacherRecord = row => ({ id: row.id, userId: row.user_id, schoolId: row.school_id, name: row.full_name, email: row.email, phone: row.phone || '', subjects: row.subjects || [], classes: row.classes || [], performance: Number(row.performance || 0), notes: row.notes || '', status: titleStatus(row.status), createdAt: row.created_at });
  const examRecord = row => ({ id: row.id, title: row.title, className: row.class_name || '', subject: row.subject || '', date: row.exam_date || '', duration: row.duration_minutes || 0, status: titleStatus(row.status), questions: row.questions || [], schoolId: row.school_id });
  const resultRecord = row => ({ id: row.id, examId: row.exam_id, studentId: row.student_id, score: Number(row.score), status: titleStatus(row.status), updatedAt: row.approved_at || row.created_at });

  function clearState() { Object.keys(state).forEach(key => { state[key] = key === 'session' || key === 'profile' ? null : []; }); }

  async function initialize() {
    assertReady();
    clearState();
    const { data, error } = await client.auth.getSession();
    throwError(error);
    state.session = data.session;
    if (!state.session) return null;
    const profileResult = await client.from('profiles').select('*').eq('id', state.session.user.id).maybeSingle();
    throwError(profileResult.error);
    if (!profileResult.data) {
      await client.auth.signOut();
      clearState();
      throw new Error('Your sign-in has no EDU-MIT profile. Ask a school administrator to check your account setup.');
    }
    state.profile = profileResult.data;
    const schoolId = state.profile.school_id;
    const queryBuilders = {
      schools: () => client.from('schools').select('*'),
      profiles: () => client.from('profiles').select('*'),
      students: () => client.from('students').select('*'),
      teachers: () => client.from('teachers').select('*'),
      settings: () => client.from('school_settings').select('*'),
      subscriptions: () => client.from('school_subscriptions').select('*'),
      academics: () => client.from('academic_data').select('*'),
      attendance: () => client.from('attendance_records').select('*'),
      exams: () => client.from('exams').select('*'),
      results: () => client.from('exam_results').select('*')
    };
    const roleQueries = {
      student: ['schools', 'students', 'settings'],
      teacher: ['schools', 'students', 'teachers', 'settings', 'academics', 'attendance', 'exams', 'results']
    };
    const queryKeys = roleQueries[state.profile.role] || Object.keys(queryBuilders);
    const queries = await Promise.all(queryKeys.map(key => queryBuilders[key]()));
    queries.forEach(result => throwError(result.error));
    queryKeys.forEach((key, index) => { state[key] = queries[index].data || []; });
    if (state.profile.role === 'student') {
      const [attendanceResult, scheduleResult, resultsResult] = await Promise.all([client.rpc('student_attendance'), client.rpc('student_schedule'), client.rpc('student_results')]);
      throwError(attendanceResult.error);
      throwError(scheduleResult.error);
      throwError(resultsResult.error);
      state.myAttendance = attendanceResult.data || [];
      state.mySchedule = scheduleResult.data || [];
      state.myResults = resultsResult.data || [];
    }
    if (schoolId && state.profile.status !== 'active') {
      await client.auth.signOut();
      clearState();
      throw new Error('This account is inactive. Contact your school administrator.');
    }
    return currentSession();
  }

  async function protectRoute(role, loginHash) {
    try {
      const session = await initialize();
      if (!session || session.role !== role) throw new Error('This account is not authorized for this route.');
      return session;
    } catch (error) {
      window.location.replace(`login.html${loginHash || ''}`);
      return null;
    }
  }

  function currentSession() {
    if (!state.session || !state.profile) return null;
    const student = state.students.find(item => item.user_id === state.profile.id);
    return { userId: state.profile.id, role: state.profile.role, schoolId: state.profile.school_id, email: state.profile.email, name: state.profile.full_name, admissionNo: student?.admission_no, className: student?.class_name, signedInAt: state.session.user.last_sign_in_at || now() };
  }
  function currentUser() { return profileUser(state.profile); }
  function schools() { return state.schools.map(school => ({ id: school.id, name: school.name, schoolCode: school.school_code || '', status: titleStatus(school.status), logoUrl: school.logo_url || '', createdAt: school.created_at })); }
  function users() { return state.profiles.map(profileUser); }
  function currentSchoolName(schoolId) { return schoolSettings(schoolId).schoolName || schools().find(school => school.id === schoolId)?.name || ''; }

  async function createSchoolAdmin({ name, school, email, password }) {
    assertReady();
    const { data, error } = await client.auth.signUp({ email: email.trim().toLowerCase(), password, options: { emailRedirectTo: authRedirectUrl(), data: { role: 'school_admin', full_name: name.trim(), school_name: school.trim() } } });
    throwError(error);
    if (!data.session) return { needsEmailConfirmation: true };
    await initialize();
    return currentUser();
  }
  async function registerLinkedUser({ name, email, password, role, admissionNo }) {
    assertReady();
    const options = { emailRedirectTo: authRedirectUrl(), data: { role, ...(name?.trim() ? { full_name: name.trim() } : {}), ...(admissionNo ? { admission_no: admissionNo.trim().toUpperCase() } : {}) } };
    const { data, error } = await client.auth.signUp({ email: email.trim().toLowerCase(), password, options });
    throwError(error);
    if (!data.session) return { needsEmailConfirmation: true };
    await initialize();
    return currentUser();
  }
  async function authenticate(email, password) {
    assertReady();
    const { data, error } = await client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error?.code === 'invalid_credentials' || error?.code === 'user_not_found') return null;
    throwError(error);
    await initialize();
    const user = currentUser();
    const school = user?.schoolId ? schools().find(item => item.id === user.schoolId) : null;
    if (!user || user.status !== 'Active' || (school && school.status !== 'Active')) {
      await signOut();
      return { suspended: true, user };
    }
    return { user, school, session: currentSession(), authUser: data.user };
  }
  async function signOut() { if (client) await client.auth.signOut(); clearState(); }

  function schoolStudents(schoolId) { return state.students.filter(student => student.school_id === schoolId).map(studentRecord); }
  async function saveSchoolStudents(schoolId, students) {
    assertReady();
    const existingIds = state.students.filter(row => row.school_id === schoolId).map(row => row.id);
    const rows = students.map(student => {
      const [firstName, ...rest] = String(student.name || '').trim().split(/\s+/);
      return { id: student.id || uuid(), school_id: schoolId, user_id: student.userId || null, email: student.email?.trim().toLowerCase() || null, admission_no: student.admissionNo.trim().toUpperCase(), first_name: firstName || '', last_name: rest.join(' '), class_name: student.className || null, guardian_name: student.guardian || null, guardian_phone: student.guardianPhone || student.phone || null, parent_name: student.parentName || null, address: student.address || null, passport_url: student.passport || null, documents: student.documents || [], status: dbStatus(student.status), scores: student.scores || {} };
    });
    if (rows.length) { const { error } = await client.from('students').upsert(rows, { onConflict: 'id' }); throwError(error); }
    const keepIds = rows.map(row => row.id);
    const removeIds = existingIds.filter(id => !keepIds.includes(id));
    if (removeIds.length) { const { error } = await client.from('students').delete().in('id', removeIds); throwError(error); }
    state.students = [...state.students.filter(row => row.school_id !== schoolId), ...rows];
    return schoolStudents(schoolId);
  }

  function schoolSettings(schoolId) {
    const row = state.settings.find(item => item.school_id === schoolId);
    const school = schools().find(item => item.id === schoolId);
    return row ? { schoolId, schoolName: school?.name || '', schoolCode: school?.schoolCode || '', logoUrl: school?.logoUrl || '', country: row.country, currency: row.currency, session: row.academic_session, term: row.current_term, passMark: row.pass_mark, gradingScale: row.grading_scale, modules: row.modules || {} } : { schoolId, schoolName: school?.name || '', schoolCode: school?.schoolCode || '', logoUrl: school?.logoUrl || '' };
  }
  async function saveSchoolSettings(schoolId, settings) {
    const schoolChanges = { name: settings.schoolName, school_code: settings.schoolCode || null, logo_url: settings.logoUrl || null };
    const schoolResult = await client.from('schools').update(schoolChanges).eq('id', schoolId).select('*').single();
    throwError(schoolResult.error);
    const row = { school_id: schoolId, country: settings.country || 'Nigeria', currency: settings.currency || 'NGN', academic_session: settings.session || '2026/27', current_term: settings.term || 'Term 1', pass_mark: settings.passMark ?? 50, grading_scale: settings.gradingScale || 'A-F', modules: settings.modules || {} };
    const result = await client.from('school_settings').upsert(row, { onConflict: 'school_id' });
    throwError(result.error);
    state.schools = state.schools.map(item => item.id === schoolId ? schoolResult.data : item);
    state.settings = [...state.settings.filter(item => item.school_id !== schoolId), row];
  }
  function schoolSubscription(schoolId) {
    const row = state.subscriptions.find(item => item.school_id === schoolId);
    return row ? { schoolId, plan: row.plan, status: row.status, renewalDate: row.renewal_date || '' } : { schoolId, plan: 'Standard', status: 'Active', renewalDate: '' };
  }
  async function saveSchoolSubscription(schoolId, subscription) {
    const row = { school_id: schoolId, plan: subscription.plan, status: subscription.status || 'Active', renewal_date: subscription.renewalDate || null };
    const { error } = await client.from('school_subscriptions').upsert(row, { onConflict: 'school_id' });
    throwError(error);
    state.subscriptions = [...state.subscriptions.filter(item => item.school_id !== schoolId), row];
  }
  function allStudents() { return state.students.map(studentRecord); }
  function currentStudent() { return state.students.find(student => student.user_id === state.profile?.id) ? studentRecord(state.students.find(student => student.user_id === state.profile.id)) : null; }
  function studentAttendance() { return state.myAttendance; }
  function studentSchedule() { return state.mySchedule; }
  function studentResults() { return state.myResults; }
  async function saveAttendanceRecord(date, studentRecords, staffRecords = {}) {
    const schoolId = state.profile?.school_id;
    if (!schoolId) throw new Error('An active school account is required to save attendance.');
    const { data, error } = await client.from('attendance_records').upsert({ school_id: schoolId, attendance_date: date, student_records: studentRecords, staff_records: staffRecords }, { onConflict: 'school_id,attendance_date' }).select('*').single();
    throwError(error);
    state.attendance = [...state.attendance.filter(row => row.attendance_date !== date), data];
    return data;
  }
  async function saveExamResult({ studentId, examId, score, status }) {
    const schoolId = state.profile?.school_id;
    if (!schoolId) throw new Error('An active school account is required to save results.');
    const row = { id: uuid(), school_id: schoolId, student_id: studentId, exam_id: examId, score: Number(score), status: dbStatus(status), approved_by: status === 'Approved' ? state.profile.id : null, approved_at: status === 'Approved' ? now() : null };
    const { data, error } = await client.from('exam_results').upsert(row, { onConflict: 'exam_id,student_id' }).select('*').single();
    throwError(error);
    state.results = [...state.results.filter(item => !(item.exam_id === examId && item.student_id === studentId)), data];
    return resultRecord(data);
  }

  function schoolData(schoolId) {
    const academic = state.academics.find(item => item.school_id === schoolId);
    const data = { ...(academic?.dashboard_data || {}) };
    data.teachers = state.teachers.filter(item => item.school_id === schoolId).map(teacherRecord);
    data.classes = academic?.classes || [];
    data.subjects = academic?.subjects || [];
    data.subjectCodes = academic?.subject_codes || {};
    data.timetable = academic?.timetable || [];
    data.exams = state.exams.filter(item => item.school_id === schoolId).map(examRecord);
    data.questions = data.exams.flatMap(exam => exam.questions.map(question => ({ ...question, examId: exam.id })));
    data.results = state.results.filter(item => item.school_id === schoolId).map(resultRecord);
    data.studentAttendance = {};
    data.staffAttendance = {};
    state.attendance.filter(item => item.school_id === schoolId).forEach(row => {
      data.studentAttendance[row.attendance_date] = row.student_records || {};
      data.staffAttendance[row.attendance_date] = row.staff_records || {};
    });
    return data;
  }
  async function syncRows(table, schoolId, rows, existingRows) {
    if (rows.length) { const { error } = await client.from(table).upsert(rows, { onConflict: 'id' }); throwError(error); }
    const keep = new Set(rows.map(row => row.id));
    const remove = existingRows.filter(row => row.school_id === schoolId && !keep.has(row.id)).map(row => row.id);
    if (remove.length) { const { error } = await client.from(table).delete().in('id', remove); throwError(error); }
  }
  async function saveSchoolData(schoolId, data) {
    assertReady();
    const teachers = (data.teachers || []).map(teacher => ({ id: teacher.id || uuid(), school_id: schoolId, user_id: teacher.userId || null, full_name: teacher.name, email: teacher.email.trim().toLowerCase(), phone: teacher.phone || null, subjects: teacher.subjects || [], classes: teacher.classes || [], performance: Number(teacher.performance || 0), notes: teacher.notes || null, status: dbStatus(teacher.status) }));
    await syncRows('teachers', schoolId, teachers, state.teachers);
    const dashboardData = { ...data };
    ['teachers', 'classes', 'subjects', 'subjectCodes', 'timetable', 'exams', 'questions', 'results', 'studentAttendance', 'staffAttendance'].forEach(key => delete dashboardData[key]);
    const academic = { school_id: schoolId, classes: data.classes || [], subjects: data.subjects || [], subject_codes: data.subjectCodes || {}, timetable: data.timetable || [], dashboard_data: dashboardData, updated_at: now() };
    const academicResult = await client.from('academic_data').upsert(academic, { onConflict: 'school_id' });
    throwError(academicResult.error);
    const questions = data.questions || [];
    const exams = (data.exams || []).map(exam => ({ id: exam.id || uuid(), school_id: schoolId, title: exam.title, class_name: exam.className || null, subject: exam.subject || null, exam_date: exam.date || null, duration_minutes: Number(exam.duration || 0) || null, status: dbStatus(exam.status), questions: questions.filter(question => question.examId === exam.id).map(({ examId, ...question }) => question) }));
    await syncRows('exams', schoolId, exams, state.exams);
    const results = (data.results || []).map(result => ({ id: result.id || uuid(), school_id: schoolId, exam_id: result.examId, student_id: result.studentId, score: Number(result.score), status: dbStatus(result.status), approved_at: dbStatus(result.status) === 'approved' ? result.updatedAt || now() : null }));
    if (results.length) { const { error } = await client.from('exam_results').upsert(results, { onConflict: 'exam_id,student_id' }); throwError(error); }
    for (const [date, records] of Object.entries(data.studentAttendance || {})) {
      const current = data.staffAttendance?.[date] || {};
      const { error } = await client.from('attendance_records').upsert({ school_id: schoolId, attendance_date: date, student_records: records, staff_records: current }, { onConflict: 'school_id,attendance_date' });
      throwError(error);
    }
    for (const [date, records] of Object.entries(data.staffAttendance || {})) {
      if (data.studentAttendance?.[date]) continue;
      const { error } = await client.from('attendance_records').upsert({ school_id: schoolId, attendance_date: date, student_records: {}, staff_records: records }, { onConflict: 'school_id,attendance_date' });
      throwError(error);
    }
    state.teachers = [...state.teachers.filter(row => row.school_id !== schoolId), ...teachers];
    state.academics = [...state.academics.filter(row => row.school_id !== schoolId), { ...academic, ...(academicResult.data || {}) }];
    state.exams = [...state.exams.filter(row => row.school_id !== schoolId), ...exams];
    state.results = [...state.results.filter(row => row.school_id !== schoolId), ...results];
    state.attendance = [...state.attendance.filter(row => row.school_id !== schoolId), ...Object.entries({ ...data.studentAttendance, ...data.staffAttendance }).map(([date]) => ({ school_id: schoolId, attendance_date: date, student_records: data.studentAttendance?.[date] || {}, staff_records: data.staffAttendance?.[date] || {} }))];
  }
  async function createTeacher({ name, email, password, schoolId }) {
    assertReady();
    if (!password || password.length < 8) throw new Error('Teacher password must be at least 8 characters.');
    const normalizedEmail = email.trim().toLowerCase();
    const row = { id: uuid(), school_id: schoolId, full_name: name.trim(), email: normalizedEmail, subjects: [], classes: [], status: 'active' };
    const { error: teacherError } = await client.from('teachers').insert(row);
    throwError(teacherError);
    const { data: adminSession, error: sessionError } = await client.auth.getSession();
    throwError(sessionError);
    try {
      const { data: signup, error: signupError } = await client.auth.signUp({ email: normalizedEmail, password, options: { emailRedirectTo: authRedirectUrl(), data: { role: 'teacher', full_name: name.trim() } } });
      throwError(signupError);
      if (!signup.user) throw new Error('Supabase did not create the teacher account.');
      row.user_id = signup.user.id;
      const { error: linkError } = await client.from('teachers').update({ user_id: row.user_id }).eq('id', row.id);
      throwError(linkError);
      if (adminSession.session) {
        const { error: restoreError } = await client.auth.setSession({ access_token: adminSession.session.access_token, refresh_token: adminSession.session.refresh_token });
        throwError(restoreError);
      }
    } catch (error) {
      await client.from('teachers').delete().eq('id', row.id);
      if (adminSession.session) await client.auth.setSession({ access_token: adminSession.session.access_token, refresh_token: adminSession.session.refresh_token });
      throw error;
    }
    state.teachers.push(row);
    return teacherRecord(row);
  }
  async function deleteTeacher(teacherId, schoolId) {
    const data = schoolData(schoolId);
    const removed = data.teachers.find(item => item.id === teacherId || item.userId === teacherId);
    const teachers = data.teachers.filter(item => item.id !== teacherId && item.userId !== teacherId);
    if (removed?.userId) {
      const { error } = await client.from('profiles').update({ status: 'inactive' }).eq('id', removed.userId);
      throwError(error);
      state.profiles = state.profiles.map(profile => profile.id === removed.userId ? { ...profile, status: 'inactive' } : profile);
    }
    await saveSchoolData(schoolId, { ...data, teachers, timetable: data.timetable.filter(item => item.teacher !== removed?.name) });
  }
  async function updateSchoolStatus(schoolId, status) { return updateSchool(schoolId, { status }); }
  async function updateSchool(schoolId, changes) {
    const fields = { ...(changes.name ? { name: changes.name } : {}), ...(changes.status ? { status: dbStatus(changes.status) } : {}) };
    const { data, error } = await client.from('schools').update(fields).eq('id', schoolId).select('*').single();
    throwError(error);
    state.schools = state.schools.map(school => school.id === schoolId ? data : school);
    return schools().find(school => school.id === schoolId);
  }
  async function deleteSchool(schoolId) {
    const { error } = await client.from('schools').delete().eq('id', schoolId);
    throwError(error);
    state.schools = state.schools.filter(item => item.id !== schoolId);
    state.profiles = state.profiles.filter(item => item.school_id !== schoolId);
    state.students = state.students.filter(item => item.school_id !== schoolId);
  }
  window.EduTenant = { initialize, protectRoute, timeContext, schools, users, currentSession, currentUser, currentStudent, currentSchoolName, authErrorMessage, createSchoolAdmin, registerLinkedUser, createTeacher, authenticate, signOut, schoolStudents, saveSchoolStudents, schoolSettings, saveSchoolSettings, schoolSubscription, saveSchoolSubscription, allStudents, schoolData, studentAttendance, studentSchedule, studentResults, saveAttendanceRecord, saveExamResult, saveSchoolData, deleteTeacher, updateSchool, updateSchoolStatus, deleteSchool };
  const mobileNavigation = {
    'student-app': [['#overview', '⌂', 'Overview'], ['#timetable', '▦', 'Timetable'], ['#results', '✦', 'Results'], ['#attendance', '◷', 'Attend'], ['#announcements', '♧', 'News']],
    'teacher-app': [['#today', '▦', 'My day'], ['#today', '♧', 'Classes'], ['#attendance', '◷', 'Attend'], ['#results', '✓', 'Results'], ['#messages', '✦', 'Messages']],
    app: [['#overview', '⌂', 'Overview'], ['#students', '♧', 'Students'], ['#attendance', '◷', 'Attend'], ['#overview', '◒', 'Reports'], ['#overview', '⚙', 'Settings']]
  };
  const shell = Object.keys(mobileNavigation).find(className => document.querySelector(`.${className}`));
  if (shell && !document.querySelector('.mobile-page-nav')) {
    const navigation = document.createElement('nav');
    navigation.className = 'mobile-page-nav';
    navigation.setAttribute('aria-label', 'Mobile navigation');
    navigation.innerHTML = mobileNavigation[shell].map(([href, icon, label], index) => `<a class="${index === 0 ? 'active' : ''}" href="${href}"><span>${icon}</span>${label}</a>`).join('');
    document.body.append(navigation);
  }
})();
