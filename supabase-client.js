(() => {
  const SUPABASE_URL = 'https://whxoleqtcxbtdwtzxjoe.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_NtHpuS_OVcull6dCoKAYpw_DmGibQGk';

  if (!window.supabase) {
    console.error('Supabase client library was not loaded.');
    return;
  }

  window.EduSupabase = {
    url: SUPABASE_URL,
    client: window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { storage: window.sessionStorage } }),
    isConfigured: true
  };
})();
