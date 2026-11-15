/*
 * BurnSet cloud layer: Supabase auth, per-user data sync, profile pictures.
 * If js/config.js has no Supabase keys, Cloud.enabled is false and the app
 * runs in local-only mode (data stays in this browser).
 */
(function () {
  'use strict';
  const cfg = window.BURNSET_CONFIG || {};
  const C = { enabled: false, client: null, user: null, profile: null, dirty: false, recovery: false, onStatus: null };
  window.Cloud = C;
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || /[?&]demo(?:[=&]|$)/.test(location.search)) return;
  if (!window.supabase) { C.libMissing = true; return; }

  const sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  C.enabled = true;
  C.client = sb;

  const USERNAME_RE = /^[a-zA-Z0-9_.]{3,20}$/;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const redirectUrl = () => location.origin + location.pathname;

  sb.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY') C.recovery = true; });

  /* ---------------- Session / profile ---------------- */
  C.init = async () => {
    const { data } = await sb.auth.getSession();
    const session = data && data.session;
    if (session) { C.user = session.user; await C.loadProfile(); }
    return session;
  };
  C.loadProfile = async () => {
    const fallback = { username: (C.user.user_metadata && C.user.user_metadata.username) || C.user.email.split('@')[0], avatar_url: null };
    try {
      const { data, error } = await sb.from('profiles').select('username, avatar_url').eq('id', C.user.id).maybeSingle();
      C.profile = !error && data ? data : fallback;
    } catch (e) { C.profile = fallback; }
    return C.profile;
  };

  /* ---------------- Data sync ---------------- */
  C.pull = async () => {
    const { data, error } = await sb.from('user_data').select('data, updated_at').eq('user_id', C.user.id).maybeSingle();
    if (error) throw error;
    return data;
  };
  let timer = null, pending = null, inflight = null;
  const status = (s) => { C.status = s; C.onStatus && C.onStatus(s); };
  C.push = (state) => {
    if (!C.user) return;
    pending = state; C.dirty = true; status('pending');
    clearTimeout(timer); timer = setTimeout(C.flush, 1200);
  };
  C.flush = async () => {
    clearTimeout(timer);
    if (inflight) await inflight;
    if (!pending || !C.user) return;
    const body = pending; pending = null;
    inflight = sb.from('user_data')
      .upsert({ user_id: C.user.id, data: body, updated_at: new Date().toISOString() })
      .then(({ error }) => {
        inflight = null;
        if (error) { if (!pending) pending = body; C.dirty = true; status('offline'); }
        else if (!pending) { C.dirty = false; status('synced'); }
      }, () => { inflight = null; if (!pending) pending = body; C.dirty = true; status('offline'); });
    return inflight;
  };
  window.addEventListener('online', () => C.flush());

  /* ---------------- Profile picture ---------------- */
  C.resizeImage = (file, size = 320) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas'); c.width = c.height = size;
      const s = Math.min(img.naturalWidth, img.naturalHeight);
      c.getContext('2d').drawImage(img, (img.naturalWidth - s) / 2, (img.naturalHeight - s) / 2, s, s, 0, 0, size, size);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process that image'))), 'image/jpeg', 0.86);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That image format is not supported')); };
    img.src = url;
  });
  const blobToDataUrl = (b) => new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); });
  const dataUrlToBlob = async (d) => (await fetch(d)).blob();

  C.uploadAvatar = async (fileOrBlob) => {
    const blob = fileOrBlob instanceof File ? await C.resizeImage(fileOrBlob) : fileOrBlob;
    const path = `${C.user.id}/avatar.jpg`;
    const { error } = await sb.storage.from('avatars').upload(path, blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '3600' });
    if (error) throw error;
    const url = sb.storage.from('avatars').getPublicUrl(path).data.publicUrl + '?v=' + Date.now();
    const { error: e2 } = await sb.from('profiles').update({ avatar_url: url }).eq('id', C.user.id);
    if (e2) throw e2;
    C.profile.avatar_url = url;
    return url;
  };
  async function uploadPendingAvatar() {
    const key = 'burnset:pendingAvatar:' + (C.user.email || '').toLowerCase();
    const d = localStorage.getItem(key);
    if (!d) return;
    try { await C.uploadAvatar(await dataUrlToBlob(d)); localStorage.removeItem(key); } catch (e) { /* retry next sign-in */ }
  }

  C.updateUsername = async (name) => {
    name = name.trim();
    if (!USERNAME_RE.test(name)) throw new Error('3–20 characters: letters, numbers, _ or .');
    if (name.toLowerCase() !== (C.profile.username || '').toLowerCase()) {
      const { data: ok, error } = await sb.rpc('username_available', { name });
      if (error) throw error;
      if (!ok) throw new Error('That username is taken');
    }
    const { error } = await sb.from('profiles').update({ username: name }).eq('id', C.user.id);
    if (error) throw new Error(error.code === '23505' ? 'That username is taken' : error.message);
    C.profile.username = name;
  };

  C.signOut = async () => {
    try { await C.flush(); } catch (e) { /* ignore */ }
    await sb.auth.signOut();
    C.user = null; C.profile = null;
  };

  /* ---------------- Auth screen ---------------- */
  function friendly(err) {
    const m = (err && (err.message || err.error_description)) || String(err);
    if (/invalid login credentials/i.test(m)) return 'Incorrect email or password.';
    if (/email not confirmed/i.test(m)) return 'Please confirm your email first. Check your inbox for the link.';
    if (/already registered|already exists/i.test(m)) return 'An account with this email already exists. Try signing in.';
    if (/rate limit|too many/i.test(m)) return 'Too many attempts. Please wait a minute and try again.';
    if (/password.*(6|8|characters|weak)/i.test(m)) return 'Choose a stronger password (at least 8 characters).';
    if (/failed to fetch|network/i.test(m)) return 'No connection. Check your internet and try again.';
    if (/database error saving new user/i.test(m)) return 'That username is taken or invalid. Try another.';
    return m;
  }

  C.showAuth = (onSignedIn, startMode) => {
    let mode = startMode || 'signin';
    let avatarBlob = null, avatarPreview = null;
    const root = document.createElement('div');
    root.className = 'auth';
    root.id = 'auth';
    document.body.appendChild(root);

    const titles = {
      signin: ['Welcome back', 'Sign in to pick up where you left off.'],
      signup: ['Create your account', 'Every rep counted, on every device.'],
      reset: ['Reset password', "Enter your email and we'll send you a reset link."],
      newpass: ['Choose a new password', 'Make it at least 8 characters.'],
    };

    function draw(msg = '', ok = false) {
      const [t, sub] = titles[mode];
      root.innerHTML = `
        <div class="auth-card">
          <img src="icons/icon.svg" alt="" class="auth-logo" />
          <h1 class="auth-title">${t}</h1>
          <p class="auth-sub">${sub}</p>
          ${mode === 'signin' || mode === 'signup' ? `<div class="segmented auth-seg"><button type="button" data-m="signin" class="${mode === 'signin' ? 'on' : ''}">Sign In</button><button type="button" data-m="signup" class="${mode === 'signup' ? 'on' : ''}">Create Account</button></div>` : ''}
          <form id="authForm" novalidate>
            ${mode === 'signup' ? `
              <label class="avatar-pick">
                <input type="file" accept="image/*" id="authAvatar" hidden />
                <span class="ap-circle">${avatarPreview ? `<img src="${avatarPreview}" alt="Profile picture" />` : `<svg viewBox="0 0 24 24" class="ap-ic"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`}</span>
                <span class="ap-lbl">${avatarPreview ? 'Change Photo' : 'Add Photo'}</span>
              </label>` : ''}
            <div class="auth-group">
              ${mode === 'signup' ? `<input name="username" placeholder="Username" autocomplete="nickname" autocapitalize="none" autocorrect="off" spellcheck="false" maxlength="20" required />` : ''}
              ${mode !== 'newpass' ? `<input name="email" type="email" placeholder="Email" autocomplete="email" autocapitalize="none" inputmode="email" required />` : ''}
              ${mode !== 'reset' ? `<input name="password" type="password" placeholder="${mode === 'newpass' ? 'New password' : 'Password'}" autocomplete="${mode === 'signin' ? 'current-password' : 'new-password'}" minlength="8" required />` : ''}
            </div>
            ${mode === 'signup' ? '<p class="auth-hint">Username: 3–20 letters, numbers, _ or . · Password: 8+ characters</p>' : ''}
            <div class="auth-msg ${ok ? 'ok' : ''}" role="alert">${esc(msg)}</div>
            <button class="btn primary lg block" type="submit" id="authSubmit">${{ signin: 'Sign In', signup: 'Create Account', reset: 'Send Reset Link', newpass: 'Save Password' }[mode]}</button>
            ${mode === 'signin' ? '<button type="button" class="auth-link" data-m="reset">Forgot password?</button>' : ''}
            ${mode === 'reset' ? '<button type="button" class="auth-link" data-m="signin">Back to sign in</button>' : ''}
          </form>
          <p class="auth-foot">Your workouts are private to your account and sync securely across your devices.</p>
        </div>`;
      const first = root.querySelector('input:not([type=file])');
      if (first && window.innerWidth > 720) first.focus();
    }

    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-m]');
      if (!b) return;
      const keep = collect();
      mode = b.dataset.m; draw();
      restore(keep);
    });
    root.addEventListener('change', async (e) => {
      if (e.target.id !== 'authAvatar' || !e.target.files[0]) return;
      const keep = collect();
      try {
        avatarBlob = await C.resizeImage(e.target.files[0]);
        avatarPreview = await blobToDataUrl(avatarBlob);
        draw();
      } catch (err) { draw(err.message); }
      restore(keep);
    });
    const collect = () => { const f = root.querySelector('#authForm'); return f ? Object.fromEntries(new FormData(f)) : {}; };
    const restore = (v) => { Object.entries(v).forEach(([k, val]) => { const el = root.querySelector(`[name="${k}"]`); if (el && typeof val === 'string') el.value = val; }); };

    root.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = collect();
      const btn = root.querySelector('#authSubmit');
      const msgEl = root.querySelector('.auth-msg');
      const say = (m, ok = false) => { msgEl.textContent = m; msgEl.classList.toggle('ok', ok); };
      const email = (v.email || '').trim().toLowerCase();
      const password = v.password || '';
      if (mode !== 'newpass' && !EMAIL_RE.test(email)) return say('Enter a valid email address.');
      if ((mode === 'signup' || mode === 'newpass') && password.length < 8) return say('Password must be at least 8 characters.');
      if (mode === 'signin' && !password) return say('Enter your password.');
      const label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Please wait…'; say('');
      try {
        if (mode === 'signin') {
          const { data, error } = await sb.auth.signInWithPassword({ email, password });
          if (error) throw error;
          C.user = data.user;
          await C.loadProfile();
          await uploadPendingAvatar();
          finish();
        } else if (mode === 'signup') {
          const username = (v.username || '').trim();
          if (!USERNAME_RE.test(username)) throw new Error('Username must be 3–20 characters: letters, numbers, _ or .');
          const { data: free, error: rpcErr } = await sb.rpc('username_available', { name: username });
          if (rpcErr) throw rpcErr;
          if (!free) throw new Error('That username is taken. Try another.');
          const { data, error } = await sb.auth.signUp({ email, password, options: { data: { username }, emailRedirectTo: redirectUrl() } });
          if (error) throw error;
          if (data.user && data.user.identities && data.user.identities.length === 0) throw new Error('An account with this email already exists. Try signing in.');
          if (avatarPreview) localStorage.setItem('burnset:pendingAvatar:' + email, avatarPreview);
          if (data.session) {
            C.user = data.user;
            await C.loadProfile();
            await uploadPendingAvatar();
            finish();
          } else {
            mode = 'signin'; draw('Account created! Check your email for a confirmation link, then sign in.', true);
            restore({ email });
            return;
          }
        } else if (mode === 'reset') {
          const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl() });
          if (error) throw error;
          say('If an account exists for that email, a reset link is on its way.', true);
        } else if (mode === 'newpass') {
          const { error } = await sb.auth.updateUser({ password });
          if (error) throw error;
          C.recovery = false;
          finish();
        }
      } catch (err) {
        say(friendly(err));
      }
      if (document.body.contains(btn)) { btn.disabled = false; btn.textContent = label; }
    });

    function finish() {
      root.classList.add('leaving');
      setTimeout(() => root.remove(), 280);
      onSignedIn && onSignedIn();
    }
    draw();
  };
})();
