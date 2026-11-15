/*
 * BurnSet configuration.
 *
 * Paste your Supabase project values here (Supabase dashboard → Project Settings → API).
 * The anon/publishable key is designed to be public: your data is protected by the
 * Row Level Security policies in supabase/schema.sql, not by hiding this key.
 *
 * Leave both empty to run BurnSet in local-only mode (no accounts, data stays on the device).
 */
window.BURNSET_CONFIG = window.BURNSET_CONFIG || {
  supabaseUrl: '',      // e.g. 'https://abcdefghijkl.supabase.co'
  supabaseAnonKey: '',  // e.g. 'eyJhbGciOi...' or 'sb_publishable_...'
};
