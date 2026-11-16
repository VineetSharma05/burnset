/* BurnSet: workout logger with per-set calorie maths. No framework, no build step. */
(function () {
  'use strict';

  /* ================= HELPERS ================= */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v) => { if (v === '' || v == null) return null; const n = parseFloat(String(v).replace(',', '.')); return isFinite(n) ? n : null; };
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  const ICONS = {
    dumbbell: '<path d="M6.5 6.5l11 11"/><path d="M21 21l-1-1"/><path d="M3 3l1 1"/><path d="M18 22l4-4"/><path d="M2 6l4-4"/><path d="M3 10l7-7"/><path d="M14 21l7-7"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    more: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    repeat: '<path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    up: '<path d="M18 15l-6-6-6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    chevR: '<path d="M9 18l6-6-6-6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    scale: '<path d="M12 3v18M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  };
  const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  const avatar = (ex, size = 42) => {
    const ini = ex.n.replace(/\(.*?\)/g, '').trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
    return `<div class="ex-avatar" style="width:${size}px;height:${size}px">${esc(ini)}</div>`;
  };

  /* ================= STATE ================= */
  const LEGACY_KEY = 'burnset:v1';
  let KEY = LEGACY_KEY;
  const CLOUD = () => !!(window.Cloud && Cloud.enabled && Cloud.user);
  const DEFAULTS = () => ({
    profile: { weight: 75, unit: 'kg', tempo: 3, rest: 90, includeRest: true, mode: 'net', theme: 'dark', name: '', weeklyKcal: 2000, weeklyWorkouts: 4 },
    active: null,
    history: [],
    custom: [],
    routines: null,
    lab: { exId: 'bench-press-barbell', w: 60, r: 10, d: 30, i: 1, km: 2.5, g: 0 },
    plan: { kg: 5, diet: 400, perWeek: 4, perWorkout: null },
    onboarded: false,
  });

  const DEMO = /[?&]demo(?:[=&]|$)/.test(location.search);
  let S;
  function load() {
    if (DEMO) { S = { ...DEFAULTS(), onboarded: true, routines: seedRoutines() }; S.profile.name = 'Alex'; S.profile.weight = 78; return; }
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) { s = null; }
    const d = DEFAULTS();
    if (!s || typeof s !== 'object') s = {};
    S = { ...d, ...s, profile: { ...d.profile, ...(s.profile || {}) }, lab: { ...d.lab, ...(s.lab || {}) }, plan: { ...d.plan, ...(s.plan || {}) } };
    if (!Array.isArray(S.history)) S.history = [];
    if (!Array.isArray(S.custom)) S.custom = [];
    if (!S.profile.weightAt) S.profile.weightAt = Date.now();
    if (!Array.isArray(S.routines)) S.routines = seedRoutines();
  }
  let saveErr = false;
  function save() {
    _prev = null;
    if (DEMO) return;
    S.updatedAt = Date.now();
    if (CLOUD()) Cloud.push(S);
    try { localStorage.setItem(KEY, JSON.stringify(S)); saveErr = false; }
    catch (e) { if (!saveErr) toast('Could not save: storage is full or blocked'); saveErr = true; }
  }
  const saveSoon = debounce(save, 250);

  let EXMAP = new Map();
  function rebuildEx() {
    EXMAP = new Map();
    window.EXERCISES.forEach((e) => EXMAP.set(e.id, e));
    S.custom.forEach((e) => EXMAP.set(e.id, { ...e, custom: true }));
  }
  const allEx = () => [...EXMAP.values()];
  const getEx = (id) => EXMAP.get(id) || { id, n: 'Unknown exercise', m: 'Full Body', e: 'Other', t: 'w', r: 0.4, b: 0, k: 4 };

  function seedRoutines() {
    const R = (name, items) => ({ id: uid(), name, items: items.map(([exId, sets]) => ({ exId, sets })) });
    const sx = (n, w, r) => Array.from({ length: n }, () => ({ w, r, type: 'n' }));
    return [
      R('Push Day', [
        ['bench-press-barbell', sx(3, 60, 8)],
        ['incline-bench-press-dumbbell', sx(3, 22, 10)],
        ['shoulder-press-dumbbell', sx(3, 18, 10)],
        ['lateral-raise-dumbbell', sx(3, 8, 15)],
        ['triceps-rope-pushdown', sx(3, 25, 12)],
      ]),
      R('Pull Day', [
        ['deadlift-barbell', sx(3, 100, 5)],
        ['pull-up', sx(3, 0, 8)],
        ['bent-over-row-barbell', sx(3, 50, 10)],
        ['lat-pulldown-cable', sx(3, 50, 12)],
        ['face-pull-cable', sx(3, 20, 15)],
        ['hammer-curl-dumbbell', sx(3, 12, 12)],
      ]),
      R('Leg Day', [
        ['squat-barbell', sx(4, 80, 6)],
        ['romanian-deadlift-barbell', sx(3, 60, 10)],
        ['leg-press-machine', sx(3, 120, 12)],
        ['lying-leg-curl-machine', sx(3, 35, 12)],
        ['standing-calf-raise-machine', sx(4, 60, 15)],
      ]),
      R('Fat Burner Circuit', [
        ['kettlebell-swing', sx(4, 16, 20)],
        ['burpee', sx(3, 0, 12)],
        ['thruster-dumbbell', sx(3, 12, 12)],
        ['jump-rope', [{ d: 10, i: 2, type: 'n' }]],
        ['rowing-machine', [{ d: 15, i: 1, type: 'n' }]],
      ]),
    ];
  }

  /* ================= UNITS / FORMAT ================= */
  const LB = 2.20462;
  const U = () => S.profile.unit;
  const toDisp = (kg) => (kg == null ? null : U() === 'lb' ? kg * LB : kg);
  const fromDisp = (v) => (v == null ? null : U() === 'lb' ? v / LB : v);
  const fmtNum = (n, d = 1) => { if (n == null || !isFinite(n)) return ''; const r = Math.round(n * 10 ** d) / 10 ** d; return String(r); };
  const fmtW = (kg) => fmtNum(toDisp(kg));
  const fmtK = (k) => (k == null || !isFinite(k) || Math.abs(k) < 0.05 ? '0' : k < 10 ? (Math.round(k * 10) / 10).toFixed(1) : Math.round(k).toLocaleString());
  const fmtG = (kcal) => { const g = Calc.fatGrams(kcal); return g < 10 ? g.toFixed(1) : Math.round(g).toLocaleString(); };
  const fmtVol = (kg) => { const v = toDisp(kg); return v >= 10000 ? (v / 1000).toFixed(1) + 'k' : Math.round(v).toLocaleString(); };
  const fmtClock = (ms) => {
    const s = Math.max(0, Math.floor(ms / 1000)); const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const ss = s % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}` : `${m}:${String(ss).padStart(2, '0')}`;
  };
  const fmtDur = (ms) => { const m = Math.round(ms / 60000); return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${m}m`; };
  const fmtDate = (t, o = { weekday: 'short', day: 'numeric', month: 'short' }) => new Date(t).toLocaleDateString(undefined, o);
  const fmtTime = (t) => new Date(t).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const EFFORT = ['Light', 'Moderate', 'Hard'];

  const KM_MI = 1.609344;
  const DU = () => S.profile.dist || (S.profile.unit === 'lb' ? 'mi' : 'km');
  const distDisp = (km) => (km == null ? null : DU() === 'mi' ? km / KM_MI : km);
  const distFrom = (v) => (v == null ? null : DU() === 'mi' ? v * KM_MI : v);
  const fmtPace = (sec) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;
  const isDistCardio = (ex) => ex.t === 'c' && !!ex.cm;
  const useElev = (ex, eo) => (eo && eo.elev != null ? eo.elev : !ex.tm);
  const pickSet = (x) => ({ w: x.w, r: x.r, d: x.d, i: x.i, km: x.km, g: x.g, el: x.el, pw: x.pw, type: x.type });

  function fmtSet(ex, s) {
    if (!s) return '—';
    if (isDistCardio(ex)) {
      const parts = [`${fmtNum(s.d) || 0} min`];
      if (ex.cm === 'row') { if (s.km) parts.push(`${Math.round(s.km * 1000)} m`); }
      else if (s.km) parts.push(`${fmtNum(distDisp(s.km), 2)} ${DU()}`);
      if (ex.cm === 'walk' || ex.cm === 'run') { if (s.g != null) parts.push(`${fmtNum(s.g)}%`); else if (s.el != null) parts.push(`${fmtNum(s.el, 0)} m↑`); }
      if (ex.cm === 'bike' && s.pw) parts.push(`${fmtNum(s.pw, 0)} W`);
      return parts.join(' · ');
    }
    if (ex.t === 'c') return `${fmtNum(s.d) || 0} min · ${EFFORT[s.i ?? 1]}`;
    if (ex.t === 'h') return `${s.w ? fmtW(s.w) + U() + ' · ' : ''}${fmtNum(s.d) || 0}s`;
    if (ex.t === 'bw') return s.w ? `+${fmtW(s.w)}${U()} × ${s.r ?? 0}` : `${s.r ?? 0} reps`;
    if (ex.t === 'a') return `-${fmtW(s.w || 0)}${U()} × ${s.r ?? 0}`;
    return `${fmtW(s.w || 0)}${U()} × ${s.r ?? 0}`;
  }

  /* ================= CALC WRAPPERS ================= */
  const kcalOf = (ex, s) => Calc.setKcal(ex, s, S.profile);
  const startOfWeek = (t = Date.now()) => { const d = new Date(t); const day = (d.getDay() + 6) % 7; d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - day); return d.getTime(); };
  const totalKcal = () => S.history.reduce((a, h) => a + (h.kcal || 0), 0);

  function refWeight(ex) {
    const prev = prevMap().get(ex.id);
    const ws = prev && prev.map((s) => s.w || 0).filter(Boolean);
    if (ws && ws.length) return Math.max(...ws);
    if (ex.t !== 'w') return 0;
    const bw = S.profile.weight;
    const f = ex.b >= 0.3 ? 0.8 : ex.k >= 4.5 ? 0.5 : ex.r <= 0.12 ? 0.6 : 0.15;
    return Math.max(2.5, Math.round((bw * f) / 2.5) * 2.5);
  }
  function cardioInfo(ex, x) {
    if (!isDistCardio(ex)) return '';
    const r = Calc.cardioModel(ex, x, S.profile);
    if (!r) return ex.cm === 'bike' ? 'Enter time + distance (or watts)' : `Enter time + ${ex.cm === 'row' ? 'metres' : 'distance'} for calories`;
    const i = r.info;
    if (ex.cm === 'row') return `${fmtPace(i.split)} /500m · ${Math.round(i.watts)} W`;
    if (ex.cm === 'bike') return i.watts ? `${Math.round(i.watts)} W` : `${fmtNum(distDisp(i.kmh))} ${DU()}/h`;
    const sp = `${fmtNum(distDisp(i.kmh))} ${DU()}/h`;
    return i.src === 'elevation' ? `${sp} · avg incline ${fmtNum(i.grade)}% (elevation ÷ distance)` : `${sp} · ${fmtNum(i.grade)}% incline`;
  }
  function estimateLabel(ex) {
    if (isDistCardio(ex)) {
      const x = { d: 30, km: ex.dv * 0.5, g: ex.dg };
      return { k: kcalOf(ex, x), u: ex.cm === 'row' ? `30 min · ${fmtPace(1800 / (x.km * 2))}/500m` : `30 min · ${fmtNum(distDisp(ex.dv))} ${DU()}/h${ex.dg ? ` · ${ex.dg}%` : ''}` };
    }
    if (ex.t === 'c') return { k: kcalOf(ex, { d: 30, i: 1 }), u: '30 min' };
    if (ex.t === 'h') return { k: kcalOf(ex, { d: 60 }), u: '60 sec' };
    const w = refWeight(ex);
    return { k: kcalOf(ex, { w, r: 10 }), u: ex.t === 'w' ? `10 × ${fmtW(w)}${U()}` : '10 reps' };
  }

  // Most recent sets for each exercise (from history, newest first)
  let _prev = null, _prevLen = -1;
  function prevMap() {
    if (_prev && _prevLen === S.history.length) return _prev;
    _prev = new Map();
    for (const h of S.history) for (const e of h.exercises) if (!_prev.has(e.exId)) _prev.set(e.exId, e.sets);
    _prevLen = S.history.length;
    return _prev;
  }

  function effSet(s, p) {
    const own = s.g != null || s.el != null;
    return {
      w: s.w ?? p?.w ?? 0,
      r: s.r ?? p?.r ?? 0,
      d: s.d ?? p?.d ?? 0,
      i: s.i ?? p?.i ?? 1,
      km: s.km ?? p?.km ?? null,
      g: own ? s.g ?? null : p?.g ?? null,
      el: own ? s.el ?? null : p?.el ?? null,
      pw: s.pw ?? p?.pw ?? null,
    };
  }
  function hasValue(ex, s) {
    if (isDistCardio(ex)) {
      if (!((s.d ?? 0) > 0)) return false;
      return ex.cm === 'bike' ? (s.km ?? 0) > 0 || (s.pw ?? 0) > 0 : (s.km ?? 0) > 0;
    }
    if (ex.t === 'c' || ex.t === 'h') return (s.d ?? 0) > 0;
    return (s.r ?? 0) > 0;
  }

  function workoutTotals(w) {
    const routine = w.mode === 'routine';
    const pm = prevMap();
    let kcal = 0, vol = 0, sets = 0, est = 0;
    for (const eo of w.exercises) {
      const ex = getEx(eo.exId);
      const prev = pm.get(eo.exId);
      eo.sets.forEach((s, i) => {
        const e = effSet(s, prev?.[i]);
        const k = kcalOf(ex, e);
        est += k;
        if (routine || s.done) {
          const v = routine ? e : s;
          kcal += routine ? k : kcalOf(ex, s);
          sets++;
          if (ex.t === 'w') vol += (v.w || 0) * (v.r || 0);
          else if (ex.t === 'bw') vol += (v.w || 0) * (v.r || 0);
        }
      });
    }
    return { kcal, vol, sets, est };
  }
  function exTotal(eo, routine) {
    const ex = getEx(eo.exId);
    const prev = prevMap().get(eo.exId);
    return eo.sets.reduce((a, s, i) => a + (routine ? kcalOf(ex, effSet(s, prev?.[i])) : s.done ? kcalOf(ex, s) : 0), 0);
  }

  /* ================= THEME ================= */
  const mq = window.matchMedia('(prefers-color-scheme: light)');
  function applyTheme() {
    const t = S.profile.theme === 'auto' ? (mq.matches ? 'light' : 'dark') : S.profile.theme;
    document.documentElement.dataset.theme = t;
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = t === 'light' ? '#f2f2f7' : '#000000';
  }
  mq.addEventListener?.('change', applyTheme);

  /* ================= TOAST / MODALS ================= */
  function toast(msg, ms = 2200) {
    const el = document.createElement('div');
    el.className = 'toast'; el.textContent = msg;
    $('#toastRoot').appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, ms);
  }

  const stack = [];
  function openSheet({ title = '', body = '', foot = '', head = true, onClose } = {}) {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="backdrop"></div>
      <div class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
        <div class="sheet-grab"></div>
        ${head ? `<div class="sheet-head"><span></span><h2>${esc(title)}</h2><button class="icon-btn" data-close aria-label="Close">${icon('x')}</button></div>` : ''}
        <div class="sheet-body">${body}</div>
        ${foot ? `<div class="sheet-foot">${foot}</div>` : ''}
      </div>`;
    $('#modalRoot').appendChild(wrap);
    const api = {
      el: $('.sheet', wrap),
      body: $('.sheet-body', wrap),
      foot: $('.sheet-foot', wrap),
      close() {
        const i = stack.indexOf(api); if (i >= 0) stack.splice(i, 1);
        wrap.remove(); onClose && onClose();
      },
    };
    $('.backdrop', wrap).addEventListener('click', () => api.close());
    wrap.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) api.close(); });
    stack.push(api);
    return api;
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && stack.length) stack[stack.length - 1].close(); });

  function confirmDialog(title, msg, ok = 'Confirm', danger = false) {
    return new Promise((res) => {
      let done = false;
      const m = openSheet({
        title,
        body: `<p class="muted" style="margin:0">${esc(msg)}</p>`,
        foot: `<div class="grid-2"><button class="btn" data-no>Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" data-yes>${esc(ok)}</button></div>`,
        onClose: () => { if (!done) res(false); },
      });
      $('[data-no]', m.el).onclick = () => { done = true; m.close(); res(false); };
      $('[data-yes]', m.el).onclick = () => { done = true; m.close(); res(true); };
    });
  }
  function promptDialog(title, value = '', ok = 'Save', placeholder = '') {
    return new Promise((res) => {
      let done = false;
      const m = openSheet({
        title,
        body: `<input class="input" id="pd-in" value="${esc(value)}" placeholder="${esc(placeholder)}" maxlength="60" />`,
        foot: `<div class="grid-2"><button class="btn" data-no>Cancel</button><button class="btn primary" data-yes>${esc(ok)}</button></div>`,
        onClose: () => { if (!done) res(null); },
      });
      const inp = $('#pd-in', m.el); setTimeout(() => { inp.focus(); inp.select(); }, 50);
      const yes = () => { done = true; const v = inp.value.trim(); m.close(); res(v || null); };
      inp.addEventListener('keydown', (e) => e.key === 'Enter' && yes());
      $('[data-no]', m.el).onclick = () => { done = true; m.close(); res(null); };
      $('[data-yes]', m.el).onclick = yes;
    });
  }
  function menuSheet(title, items) {
    const m = openSheet({
      title,
      body: items.map((it, i) => `<button class="list-item" style="width:100%;text-align:left;${it.danger ? 'color:var(--bad)' : ''}" data-i="${i}">${icon(it.icon || 'chevR')}<div class="meta"><div class="n">${esc(it.label)}</div>${it.sub ? `<div class="s">${esc(it.sub)}</div>` : ''}</div></button>`).join(''),
    });
    m.body.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]'); if (!b) return;
      m.close(); items[+b.dataset.i].fn();
    });
  }

  /* ================= CHARTS ================= */
  function drawBars(el, data, { hi = -1, fmt = fmtK, labelEvery = 1, height = 170, showVals = false } = {}) {
    const W = Math.max(260, el.clientWidth || 340), H = height, pl = 4, pr = 4, pt = 22, pb = 22;
    const max = Math.max(...data.map((d) => d.v), 0.0001);
    const n = data.length, slot = (W - pl - pr) / n, gap = Math.max(2, Math.min(8, slot * 0.28)), bw = slot - gap;
    const ih = H - pt - pb;
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">`;
    for (let g = 1; g <= 3; g++) { const y = pt + ih - (ih * g) / 3; s += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}"/>`; }
    data.forEach((d, i) => {
      const h = Math.max(d.v > 0 ? 2 : 0, (d.v / max) * ih);
      const x = pl + i * slot + gap / 2, y = pt + ih - h;
      const isHi = hi === i;
      s += `<rect class="bar ${hi >= 0 && !isHi ? 'dim' : ''}" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(5, bw / 2).toFixed(1)}"><title>${esc(d.l)}: ${fmt(d.v)}</title></rect>`;
      if (isHi || (showVals && d.v > 0)) s += `<text class="val" x="${(x + bw / 2).toFixed(1)}" y="${(y - 6).toFixed(1)}" text-anchor="middle">${fmt(d.v)}</text>`;
      if (i % labelEvery === 0 || isHi) s += `<text x="${(x + bw / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle">${esc(d.l)}</text>`;
    });
    el.innerHTML = s + '</svg>';
  }
  const chartFns = {};
  function mountCharts(root = document) { $$('[data-chart]', root).forEach((el) => chartFns[el.dataset.chart] && chartFns[el.dataset.chart](el)); }
  window.addEventListener('resize', debounce(() => mountCharts(), 150));

  /* ================= ROUTER ================= */
  const TABS = [
    { id: 'workout', label: 'Workout', icon: 'dumbbell' },
    { id: 'history', label: 'History', icon: 'history' },
    { id: 'lab', label: 'Burn Lab', icon: 'flame' },
    { id: 'exercises', label: 'Exercises', icon: 'book' },
    { id: 'profile', label: 'Profile', icon: 'user' },
  ];
  const route = () => { const h = location.hash.replace('#', ''); return TABS.some((t) => t.id === h) ? h : 'workout'; };
  function renderNav() {
    const r = route();
    const html = TABS.map((t) => `<a href="#${t.id}" class="tab ${r === t.id ? 'active' : ''}">${icon(t.icon)}<span>${t.label}</span>${t.id === 'workout' && S.active && S.active.mode !== 'routine' ? '<i class="dot"></i>' : ''}</a>`).join('');
    $('#nav').innerHTML = html; $('#tabbar').innerHTML = html;
  }

  const VIEWS = {};
  let pageTitle = null, pageEyebrow = null;
  function render(keepScroll = false) {
    const y = window.scrollY;
    renderNav();
    pageTitle = null; pageEyebrow = null;
    const v = VIEWS[route()]();
    $('#topbar').innerHTML = `<div class="topbar-inner">${v.top}</div>`;
    const lt = pageTitle ? `${pageEyebrow ? `<div class="lt-eyebrow">${esc(pageEyebrow)}</div>` : ''}<h1 class="large-title">${esc(pageTitle)}</h1>` : '';
    $('#view').innerHTML = lt + v.html;
    onScroll();
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
    v.mount && v.mount();
    mountCharts($('#view'));
  }
  window.addEventListener('hashchange', () => render());
  const onScroll = () => $('#topbar').classList.toggle('scrolled', window.scrollY > (pageTitle ? 38 : 2));
  window.addEventListener('scroll', onScroll, { passive: true });
  const brandTop = (title, right = '', eyebrow = null) => {
    pageTitle = title; pageEyebrow = eyebrow;
    return `<span></span><div class="nav-title collapsible">${esc(title)}</div><div class="nav-right">${right}</div>`;
  };

  /* ================= WORKOUT: HOME ================= */
  VIEWS.workout = () => (S.active ? activeView() : homeView());

  function homeView() {
    const wk = startOfWeek();
    const weekH = S.history.filter((h) => h.start >= wk);
    const weekK = weekH.reduce((a, h) => a + h.kcal, 0);
    const all = totalKcal();
    const kgDone = Math.floor(all / Calc.KCAL_PER_KG_FAT);
    const toward = all % Calc.KCAL_PER_KG_FAT;
    const pct = (toward / Calc.KCAL_PER_KG_FAT) * 100;
    const avg = S.history.length ? all / S.history.length : 0;
    const streak = weekStreak();

    const goalK = S.profile.weeklyKcal || 2000, goalW = S.profile.weeklyWorkouts || 4;
    const html = `
      <div class="hero">
        <div class="rings-card">
          ${ringsSvg([
            { p: weekK / goalK, c: 'var(--hl)' },
            { p: weekH.length / goalW, c: 'var(--green)' },
            { p: pct / 100, c: 'var(--cyan)' },
          ])}
          <div class="ring-legend">
            <div><div class="lg-l">Burn</div><div class="lg-v rc-burn">${fmtK(weekK)}/${goalK.toLocaleString()}<small> KCAL</small></div></div>
            <div><div class="lg-l">Workouts</div><div class="lg-v rc-work">${weekH.length}/${goalW}<small> THIS WEEK</small></div></div>
            <div><div class="lg-l">Next kg of fat</div><div class="lg-v rc-fat">${Math.floor(pct)}<small>%</small></div></div>
          </div>
        </div>
        <div class="hero-foot"><span>≈ <b>${fmtG(weekK)} g</b> of fat burned this week</span><span>${kgDone ? `<b>${kgDone} kg</b> all-time` : `<b class="mono">${fmtK(Calc.KCAL_PER_KG_FAT - toward)}</b> kcal to go`}</span></div>
      </div>
      <div class="stat-row">
        <div class="stat"><div class="v mono">${S.history.length}</div><div class="l">Workouts</div></div>
        <div class="stat"><div class="v mono">${streak}<span class="dim" style="font-size:13px"> wk</span></div><div class="l">Streak</div></div>
        <div class="stat"><div class="v mono fire">${fmtK(avg)}</div><div class="l">Avg kcal</div></div>
      </div>

      ${(() => { const days = Math.floor((Date.now() - (S.profile.weightAt || Date.now())) / 864e5); return S.history.length && days >= 14 ? `<button class="bw-nudge" data-act="update-bw">${icon('scale')}<div class="grow"><b>Still ${fmtW(S.profile.weight)} ${U()}?</b><div class="dim">Every calorie number uses your bodyweight. Last updated ${days} days ago.</div></div><span class="tint">Update</span></button>` : ''; })()}
      <div class="section">
        <div class="section-title">Quick start</div>
        <button class="btn primary lg block" data-act="start-empty">${icon('plus')} Start Empty Workout</button>
      </div>

      <div class="section">
        <div class="section-title"><span>Routines</span><button class="link" data-act="new-routine">+ New routine</button></div>
        ${S.routines.length ? `<div class="routine-grid">${S.routines.map(routineCard).join('')}</div>` : `<div class="card empty"><p>No routines yet. Save any workout as a routine, or create one.</p></div>`}
      </div>

      ${S.history.length ? `<div class="section">
        <div class="section-title"><span>Recent</span><a class="link" href="#history">See all</a></div>
        <div class="card" style="padding:6px 10px">${S.history.slice(0, 3).map((h) => `
          <div class="list-item" data-act="hist-open" data-id="${h.id}">
            <div class="meta"><div class="n">${esc(h.name)}</div><div class="s">${fmtDate(h.start)} · ${fmtDur(h.end - h.start)} · ${h.sets} sets</div></div>
            <div class="r"><div class="k">${fmtK(h.kcal)} kcal</div><div class="u">${fmtG(h.kcal)} g fat</div></div>
          </div>`).join('')}</div>
      </div>` : ''}
    `;
    return {
      top: brandTop('Summary', `<a class="icon-btn" href="#profile" aria-label="Profile">${navAvatar()}</a>`, fmtDate(Date.now(), { weekday: 'long', day: 'numeric', month: 'long' })),
      html,
      mount: animateRings,
    };
  }
  /* ---------- How to log each exercise ---------- */
  function sideWord(ex) {
    if (['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Adductors', 'Abductors'].includes(ex.m)) return 'leg';
    if (['Core', 'Obliques'].includes(ex.m)) return 'side';
    return 'arm';
  }
  function weightWord(ex) {
    if (ex.lw === 2) return 'Weight of 1 dumbbell';
    return ({ Dumbbell: 'Dumbbell weight', Barbell: 'Bar + plates', 'EZ Bar': 'Bar + plates', 'Trap Bar': 'Bar + plates', 'Smith Machine': 'Plates loaded', Machine: 'Machine weight', Cable: 'Stack weight', Kettlebell: 'Kettlebell weight', Plate: 'Plate weight', Band: 'Band resistance' })[ex.e] || 'Weight used';
  }
  function logGuide(ex) {
    const u = U(), sw = sideWord(ex), per = ex.sd === 2, pair = ex.lw === 2;
    const lb = u === 'lb';
    const n = (kg, lbv) => (lb ? lbv : kg);
    let short, rows = [], example = '';
    if (isDistCardio(ex)) {
      if (ex.cm === 'row') {
        short = 'Minutes · metres from the monitor';
        rows = [['Time', 'Total minutes'], ['Distance', 'Metres shown on the monitor']];
        example = '20 min, 4,500 m → enter 20 and 4500';
      } else if (ex.cm === 'bike') {
        short = 'Minutes · distance or average watts';
        rows = [['Time', 'Total minutes'], ['Distance', `From the bike or your watch (${DU()})`], ['Watts', 'Optional. If the bike shows average watts, enter them for the most accurate number']];
        example = `45 min, 18 ${DU()} → enter 45 and 18`;
      } else {
        short = 'Minutes · distance · incline % or elevation';
        rows = [['Time', 'Total minutes'], ['Distance', `From the treadmill or your watch (${DU()})`], ['Incline', 'The treadmill incline %. Outdoors or on a watch? Tap the INCL% header and enter elevation gain (m) instead. We work out your average incline.']];
        example = ex.cm === 'walk' ? `30 min, ${n('3', '1.9')} ${DU()} at 12% → enter 30 · ${n('3', '1.9')} · 12` : `30 min, ${n('5', '3.1')} ${DU()} → enter 30 · ${n('5', '3.1')} · 0`;
      }
    } else if (ex.t === 'c') {
      short = 'Minutes · how hard it felt';
      rows = [['Time', 'Total minutes'], ['Effort', 'Light = you could chat easily · Moderate = talking is hard · Hard = you can barely talk']];
    } else if (ex.t === 'h') {
      short = pair ? 'Seconds · weight of 1 dumbbell' : 'Seconds · extra weight (optional)';
      rows = [['Time', 'Seconds held or walked'], ['Weight', pair ? 'Weight of ONE dumbbell. We count both hands.' : 'Anything you hold or wear on top of your bodyweight (optional)']];
    } else if (ex.t === 'a') {
      short = 'Assistance on the machine · reps';
      rows = [['Weight', 'The assistance (counterweight) number on the machine. More assistance = easier.'], ['Reps', per ? `Reps per ${sw}` : 'Reps per set']];
      example = `Pull-ups with ${n(20, 45)} ${u} of assistance, 8 reps → enter ${n(20, 45)} × 8`;
    } else if (ex.t === 'bw') {
      short = `Bodyweight auto-counted · reps${per ? ' per ' + sw : ''}`;
      rows = [['Weight', 'Only EXTRA weight (belt, vest, dumbbell). Leave empty for bodyweight; your bodyweight is already counted.'], ['Reps', per ? `Reps per ${sw}: 10 each ${sw} → enter 10` : 'Reps per set']];
      example = per ? `10 reps each ${sw}, no extra weight → enter 10` : `12 reps with a ${n(10, 25)} ${u} vest → enter ${n(10, 25)} × 12`;
    } else {
      short = `${weightWord(ex)} · reps${per ? ' per ' + sw : ''}`;
      let wTxt;
      if (pair) wTxt = `Weight of ONE dumbbell. Holding two ${n(15, 35)} ${u} dumbbells → enter ${n(15, 35)}.`;
      else if (ex.e === 'Dumbbell') wTxt = 'Weight of the dumbbell you are holding.';
      else if (['Barbell', 'EZ Bar', 'Trap Bar'].includes(ex.e)) wTxt = `Total weight: bar + all plates. ${n('20 kg bar + two 20 kg plates → 60', '45 lb bar + two 45 lb plates → 135')}.`;
      else if (ex.e === 'Smith Machine') wTxt = "Plates loaded. Add the bar only if your gym's Smith bar is not counterbalanced.";
      else if (ex.e === 'Machine') wTxt = 'The number on the machine. Plate-loaded with separate arms? Add both sides together.';
      else if (ex.e === 'Cable') wTxt = 'The number on the stack. Using a rope or both handles together? Still enter the stack number once.';
      else if (ex.e === 'Band') wTxt = 'Your best estimate of the band resistance.';
      else wTxt = 'The weight of what you are lifting.';
      rows = [['Weight', wTxt], ['Reps', per ? `Reps per ${sw}: 10 each ${sw} → enter 10.` : pair ? 'Reps per set. Both arms moving together = 1 rep.' : 'Reps per set.']];
      if (pair && per) example = `Two ${n(12, 25)} ${u} dumbbells, 8 reps each ${sw} → enter ${n(12, 25)} × 8`;
      else if (pair) example = `Two ${n(15, 35)} ${u} dumbbells, 10 reps → enter ${n(15, 35)} × 10`;
      else if (per) example = `${n(20, 45)} ${u}, 10 reps each ${sw} → enter ${n(20, 45)} × 10`;
      else if (['Barbell', 'EZ Bar', 'Trap Bar'].includes(ex.e)) example = `${n('20 kg bar + two 20 kg plates', '45 lb bar + two 45 lb plates')}, 8 reps → enter ${n(60, 135)} × 8`;
    }
    if (ex.id === '21s-bicep-curl-barbell') { example = `${n('20 kg bar + two 5 kg plates', '45 lb bar + two 10 lb plates')}, one round of 21s → enter ${n(30, 65)} × 21`; rows[1] = ['Reps', 'Always 21 per set']; }
    if (ex.note) short = ex.note.split('.')[0];
    // How the maths uses this exercise + your profile
    const P = S.profile, bw = P.weight;
    const counts = [];
    if (ex.t === 'w' || ex.t === 'bw' || ex.t === 'a') {
      counts.push(`Your bodyweight (${fmtW(bw)} ${u})${ex.b ? `: ${Math.round(ex.b * 100)}% of it (${fmtW(ex.b * bw)} ${u}) moves every rep` : ' sets your metabolic burn during the set'}`);
      if (pair) counts.push('Both dumbbells (2 × the weight you enter)');
      if (per) counts.push(`Both ${sw}s (reps × 2)`);
      if (ex.t === 'a') counts.push('Assistance is subtracted from your bodyweight');
      counts.push(`Range of motion ≈ ${ex.r} m per rep, rep tempo ${P.tempo}s, rest ${P.rest}s (from your settings)`);
    } else if (isDistCardio(ex)) {
      counts.push(ex.cm === 'row' ? 'Your pace → watts, then energy at ~20% efficiency' : ex.cm === 'bike' ? `Watts (ACSM cycling equation) or speed (Compendium METs) × your ${fmtW(bw)} ${u}` : `Your speed + incline → ACSM oxygen cost × your ${fmtW(bw)} ${u}`);
    } else {
      counts.push(`Activity intensity (MET) × your ${fmtW(bw)} ${u}${ex.t === 'h' && pair ? ' + both dumbbells' : ''} × time`);
    }
    const r0 = Calc.rmr(P);
    counts.push(r0 ? `Your resting metabolism: ${Math.round(r0).toLocaleString()} kcal/day (age, sex, height)` : 'Add age, sex and height in Profile for a more personal number');
    return { short, rows, example, note: ex.note || '', counts, warn: pair || per };
  }
  function openLogGuide(ex) {
    const g = logGuide(ex);
    openSheet({
      title: 'How to log',
      body: `
        <div class="row" style="margin-bottom:14px">${avatar(ex, 40)}<div class="grow"><div style="font-weight:700;font-size:17px">${esc(ex.n)}</div><div class="dim" style="font-size:13px">${esc(ex.m)} · ${esc(ex.e)}</div></div></div>
        <div class="sum-sec" style="margin-top:4px">What to enter</div>
        <div class="math-box">${g.rows.map(([k, v]) => `<div class="guide-row"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join('')}</div>
        ${g.note ? `<div class="guide-note">${icon('info')}<span>${esc(g.note)}</span></div>` : ''}
        ${g.example ? `<div class="sum-sec">Example</div><div class="math-box"><div class="guide-row"><span>${esc(g.example)}</span></div></div>` : ''}
        ${g.warn ? `<div class="guide-note good">${icon('check')}<span>Don't double the weight or reps yourself. BurnSet already does.</span></div>` : ''}
        <div class="sum-sec">How BurnSet counts it</div>
        <div class="math-box">${g.counts.map((c) => `<div class="guide-row"><span>• ${esc(c)}</span></div>`).join('')}</div>`,
      foot: '<button class="btn primary block" data-close>Got it</button>',
    });
  }

  function avatarUrl() { return CLOUD() && Cloud.profile && Cloud.profile.avatar_url; }
  function displayName() { return (CLOUD() && Cloud.profile && Cloud.profile.username) || S.profile.name || ''; }
  function navAvatar() {
    const u = avatarUrl();
    return u ? `<img class="nav-avatar" src="${esc(u)}" alt="Profile">` : icon('user');
  }
  function syncLabel(st) {
    st = st || (window.Cloud && Cloud.status) || 'synced';
    return { synced: 'Synced', pending: 'Syncing…', offline: 'Offline · will sync' }[st] || '';
  }
  function ringsSvg(rings) {
    const SZ = 150, W = 17, GAP = 2.5;
    const parts = rings.map((r, i) => {
      const rad = SZ / 2 - W / 2 - i * (W + GAP);
      const C = 2 * Math.PI * rad;
      const p = clamp(r.p || 0, 0, 1);
      const off = C * (1 - p);
      return `<circle class="trk" cx="75" cy="75" r="${rad}" stroke="${r.c}" stroke-width="${W}"/>
        <circle class="arc" cx="75" cy="75" r="${rad}" stroke="${r.c}" stroke-width="${W}" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${C.toFixed(2)}" data-off="${off.toFixed(2)}" ${p === 0 ? 'opacity="0"' : ''} transform="rotate(-90 75 75)"/>`;
    }).join('');
    return `<svg class="rings" viewBox="0 0 ${SZ} ${SZ}" role="img" aria-label="Weekly progress rings">${parts}</svg>`;
  }
  function animateRings() {
    requestAnimationFrame(() => requestAnimationFrame(() => $$('.rings .arc').forEach((c) => { c.style.strokeDashoffset = c.dataset.off; })));
  }
  function seedDemoHistory() {
    const day = 864e5, now = new Date(); now.setHours(18, 10, 0, 0);
    const plan = [1, 2, 4, 6, 8, 10, 12, 13, 15, 17, 19, 22, 24, 26];
    let n = 0;
    S.history = plan.map((ago) => {
      const r = S.routines[n++ % S.routines.length];
      const start = now.getTime() - ago * day - Math.round(Math.random() * 90) * 60e3;
      let kcal = 0, vol = 0, sets = 0;
      const exercises = r.items.map((it) => {
        const ex = getEx(it.exId);
        const ss = it.sets.map((st) => {
          const s2 = { ...st, w: st.w != null ? Math.max(0, st.w + (Math.random() < 0.5 ? 0 : 2.5)) : st.w, r: st.r != null ? st.r + Math.round(Math.random() * 2 - 1) : st.r };
          s2.k = kcalOf(ex, s2); kcal += s2.k; sets++;
          if (ex.t === 'w' || ex.t === 'bw') vol += (s2.w || 0) * (s2.r || 0);
          return s2;
        });
        return { exId: it.exId, note: '', sets: ss };
      });
      return { id: uid(), name: r.name, start, end: start + (48 + Math.round(Math.random() * 30)) * 60e3, exercises, kcal, volume: vol, sets, prs: ago < 5 ? 1 : 0, bw: S.profile.weight };
    });
  }
  function routineCard(r) {
    const est = routineEstimate(r);
    const names = r.items.map((it) => getEx(it.exId).n.replace(/\s*\(.*?\)/, '')).join(', ');
    return `<div class="routine">
      <div class="meta"><div class="name">${esc(r.name)}</div><div class="ex">${esc(names) || 'Empty routine'}</div>
        <div style="margin-top:6px"><span class="tag fire">${icon('flame')}~${fmtK(est)} kcal</span> <span class="tag">${r.items.length} exercises</span></div></div>
      <button class="icon-btn" data-act="routine-menu" data-id="${r.id}" aria-label="Routine options">${icon('more')}</button>
      <button class="btn primary sm" data-act="start-routine" data-id="${r.id}">${icon('play')} Start</button>
    </div>`;
  }
  function routineEstimate(r) {
    return r.items.reduce((a, it) => { const ex = getEx(it.exId); return a + it.sets.reduce((b, s) => b + kcalOf(ex, effSet(s)), 0); }, 0);
  }
  function weekStreak() {
    if (!S.history.length) return 0;
    const weeks = new Set(S.history.map((h) => startOfWeek(h.start)));
    let w = startOfWeek(), n = 0;
    if (!weeks.has(w)) w -= 7 * 864e5; // current week not trained yet still keeps streak
    while (weeks.has(w)) { n++; w = startOfWeek(w - 3 * 864e5); }
    return n;
  }

  /* ================= WORKOUT: ACTIVE ================= */
  function newSet(from = {}) {
    return { id: uid(), w: from.w ?? null, r: from.r ?? null, d: from.d ?? null, i: from.i ?? null, km: from.km ?? null, g: from.g ?? null, el: from.el ?? null, pw: from.pw ?? null, type: from.type || 'n', done: false };
  }
  function startWorkout({ name = 'Workout', items = [], mode = 'workout', routineId = null } = {}) {
    S.active = {
      id: uid(), name, start: Date.now(), mode, routineId,
      exercises: items.map((it) => ({ uid: uid(), exId: it.exId, note: it.note || '', ss: it.ss || null, elev: it.elev ?? null, sets: (it.sets.length ? it.sets : [{}]).map((s) => newSet(s)) })),
    };
    save();
    if (location.hash !== '#workout') location.hash = 'workout'; else render();
  }
  async function guardActive() {
    if (!S.active) return true;
    const ok = await confirmDialog(S.active.mode === 'routine' ? 'Discard routine edits?' : 'Workout in progress', S.active.mode === 'routine' ? 'You are editing a routine. Discard those changes?' : 'You already have a workout in progress. Discard it and start a new one?', 'Discard', true);
    if (ok) { S.active = null; stopRest(); save(); }
    return ok;
  }

  function activeView() {
    const w = S.active;
    const routine = w.mode === 'routine';
    const pm = prevMap();
    const t = workoutTotals(w);
    const top = routine
      ? `<button class="icon-btn" data-act="discard" aria-label="Cancel">${icon('x')}</button><h1>${w.routineId ? 'Edit Routine' : 'New Routine'}</h1><button class="btn primary sm" data-act="finish">${icon('save')} Save</button>`
      : `<button class="icon-btn" data-act="discard" aria-label="Discard workout">${icon('x')}</button><h1>Log Workout</h1><button class="btn primary sm" data-act="finish">${icon('check')} Finish</button>`;

    const html = `
      <div class="live" id="live">${liveHtml(t, routine)}</div>
      <input class="wk-name" data-wkname value="${esc(w.name)}" placeholder="${routine ? 'Routine name' : 'Workout name'}" maxlength="60" />
      <div class="dim" style="font-size:13px;margin-bottom:14px">${routine ? 'Set target weights and reps. Calories are estimated live.' : `Started ${fmtTime(w.start)} · Bodyweight ${fmtW(S.profile.weight)} ${U()}`}</div>
      <div id="exList">${(() => { const si = ssIndex(w.exercises); return w.exercises.map((eo) => exCard(eo, pm.get(eo.exId), routine, si)).join(''); })()}</div>
      ${w.exercises.length ? '' : `<div class="card empty"><div class="empty-ic">${icon('dumbbell')}</div><h3>Let's get to work</h3><p>Add an exercise and every set you log will show the calories it burned.</p></div>`}
      <div class="wk-actions">
        <button class="btn primary lg block" data-act="add-ex">${icon('plus')} Add Exercise</button>
        <button class="btn danger block" data-act="discard">${routine ? 'Cancel' : 'Discard Workout'}</button>
      </div>`;
    const mount = () => $$('.ex-note').forEach((t) => { if (t.value) { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; } });
    return { top, html, mount };
  }
  const SS_COLORS = ['#bf5af2', '#64d2ff', '#ffd60a', '#ff375f', '#5e5ce6', '#30d158'];
  function ssIndex(list) { const m = new Map(); list.forEach((e) => { if (e.ss && !m.has(e.ss)) m.set(e.ss, m.size); }); return m; }
  function normalizeSS(list) {
    const c = {}; list.forEach((e) => { if (e.ss) c[e.ss] = (c[e.ss] || 0) + 1; });
    list.forEach((e) => { if (e.ss && c[e.ss] < 2) e.ss = null; });
  }
  function pickSuperset(eo) {
    const others = S.active.exercises.filter((x) => x !== eo && (!eo.ss || x.ss !== eo.ss));
    menuSheet('Superset with', others.map((x) => ({
      label: getEx(x.exId).n, icon: 'plus',
      fn: () => {
        const list = S.active.exercises;
        const g = eo.ss || x.ss || uid();
        if (x.ss && x.ss !== g) list.forEach((y) => { if (y.ss === x.ss) y.ss = g; });
        eo.ss = g; x.ss = g;
        const first = list.findIndex((y) => y.ss === g);
        const members = list.filter((y) => y.ss === g);
        const rest = list.filter((y) => y.ss !== g);
        rest.splice(first, 0, ...members);
        S.active.exercises = rest;
        save(); render(true); toast('Superset created');
      },
    })));
  }
  function liveHtml(t, routine) {
    const k = routine ? t.kcal : t.kcal;
    return `
      <div class="kcal"><div class="v" id="live-k">${icon('flame')} ${fmtK(k)}</div><div class="l">${routine ? 'Est. kcal' : 'kcal burned'}</div></div>
      <div><div class="v" id="live-g">${fmtG(k)}g</div><div class="l">Fat</div></div>
      <div><div class="v" id="live-t">${routine ? S.active.exercises.length : fmtClock(Date.now() - S.active.start)}</div><div class="l">${routine ? 'Exercises' : 'Duration'}</div></div>
      <div><div class="v" id="live-s">${t.sets}</div><div class="l">Sets</div></div>`;
  }
  function updateLive() {
    if (!S.active) return;
    const routine = S.active.mode === 'routine';
    const t = workoutTotals(S.active);
    const kEl = $('#live-k');
    if (!kEl) return;
    const nk = `${icon('flame')} ${fmtK(t.kcal)}`;
    if (kEl.innerHTML !== nk) { kEl.innerHTML = nk; kEl.classList.remove('bump'); void kEl.offsetWidth; kEl.classList.add('bump'); }
    $('#live-g').textContent = fmtG(t.kcal) + 'g';
    $('#live-s').textContent = t.sets;
    if (routine) $('#live-t').textContent = S.active.exercises.length;
  }

  function colHeads(ex, eo) {
    if (isDistCardio(ex)) {
      if (ex.cm === 'row') return ['MIN', 'METRES'];
      if (ex.cm === 'bike') return ['MIN', DU().toUpperCase(), 'WATTS'];
      return ['MIN', DU().toUpperCase(), `<button class="col-toggle" data-act="toggle-elev" aria-label="Switch between incline percent and elevation gain">${useElev(ex, eo) ? 'ELEV m' : 'INCL%'}</button>`];
    }
    if (ex.t === 'c') return ['MIN', 'EFFORT'];
    if (ex.t === 'h') return ['+' + U().toUpperCase(), 'SEC'];
    if (ex.t === 'bw') return ['+' + U().toUpperCase(), 'REPS'];
    if (ex.t === 'a') return ['-' + U().toUpperCase(), 'REPS'];
    return [U().toUpperCase(), 'REPS'];
  }
  function exCard(eo, prev, routine, ssMap) {
    const ex = getEx(eo.exId);
    const heads = colHeads(ex, eo);
    const cols = `30px minmax(0,1.15fr) repeat(${heads.length}, minmax(0,1fr)) 44px${routine ? '' : ' 34px'}`;
    const si = eo.ss && ssMap && ssMap.has(eo.ss) ? ssMap.get(eo.ss) : -1;
    let n = 0;
    const rows = eo.sets.map((s, i) => {
      if (s.type === 'n' || s.type === 'f') n++;
      return setRow(eo, ex, s, i, prev?.[i], s.type === 'w' ? 'W' : s.type === 'd' ? 'D' : String(n), routine);
    }).join('');
    const tot = exTotal(eo, routine);
    return `<div class="ex-card${si >= 0 ? ' ss' : ''}" data-ex="${eo.uid}"${si >= 0 ? ` style="--ss:${SS_COLORS[si % SS_COLORS.length]}"` : ''}>
      ${si >= 0 ? `<div class="ss-tag">Superset ${String.fromCharCode(65 + (si % 26))}</div>` : ''}
      <div class="ex-head">
        ${avatar(ex)}
        <div class="ex-title"><div class="n">${esc(ex.n)}</div><div class="s">${esc(ex.m)} · ${esc(ex.e)}</div></div>
        <div class="ex-kcal"><div class="v" id="ext-${eo.uid}">${fmtK(tot)} kcal</div><div class="l">${routine ? 'estimated' : 'burned'}</div></div>
        <button class="icon-btn" data-act="ex-menu" aria-label="Exercise options">${icon('more')}</button>
      </div>
      <button class="log-hint" data-act="log-guide">${icon('info')}<span>${esc(logGuide(ex).short)}</span>${icon('chevR')}</button>
      <textarea class="ex-note" data-note rows="1" placeholder="Add notes here...">${esc(eo.note)}</textarea>
      <div class="sets" style="--cols:${cols}">
        <div class="sets-head"><span>SET</span><span>PREVIOUS</span>${heads.map((h) => `<span>${h}</span>`).join('')}<span>KCAL</span>${routine ? '' : `<span>${icon('check')}</span>`}</div>
        ${rows}
      </div>
      <button class="add-set" data-act="add-set">${icon('plus')} Add Set</button>
      <div class="rep-explorer ${eo.explore ? '' : 'hidden'}" id="rx-${eo.uid}">${eo.explore ? explorerHtml(eo) : ''}</div>
    </div>`;
  }
  function setRow(eo, ex, s, i, p, label, routine) {
    const e = effSet(s, p);
    const use = routine || !s.done ? e : s;
    const ok = hasValue(ex, use);
    const k = ok ? kcalOf(ex, use) : 0;
    const cls = { w: 'warm', d: 'drop', f: 'fail' }[s.type] || '';
    const ph = (v) => (v == null ? '' : fmtNum(v, 2));
    const inp = (f, val, phv, lbl, mode = 'decimal') => `<input class="cell-in" inputmode="${mode}" data-f="${f}" value="${ph(val)}" placeholder="${ph(phv) || '0'}" aria-label="${lbl}">`;
    let cells;
    if (isDistCardio(ex)) {
      cells = [inp('d', s.d, p?.d, 'Minutes')];
      if (ex.cm === 'row') cells.push(inp('m', s.km != null ? Math.round(s.km * 1000) : null, p?.km != null ? Math.round(p.km * 1000) : null, 'Metres', 'numeric'));
      else cells.push(inp('km', distDisp(s.km), distDisp(p?.km), 'Distance'));
      if (ex.cm === 'bike') cells.push(inp('pw', s.pw, p?.pw, 'Average watts', 'numeric'));
      if (ex.cm === 'walk' || ex.cm === 'run') cells.push(useElev(ex, eo) ? inp('el', s.el, p?.el, 'Elevation gain in metres', 'numeric') : inp('g', s.g, p?.g, 'Incline percent'));
    } else if (ex.t === 'c') {
      const iv = s.i ?? p?.i ?? 1;
      cells = [inp('d', s.d, p?.d, 'Minutes'), `<select class="cell-sel" data-f="i" aria-label="Effort">${EFFORT.map((x, j) => `<option value="${j}" ${j === iv ? 'selected' : ''}>${x}</option>`).join('')}</select>`];
    } else if (ex.t === 'h') {
      cells = [inp('w', toDisp(s.w), toDisp(p?.w), 'Added weight'), inp('d', s.d, p?.d, 'Seconds', 'numeric')];
    } else {
      cells = [inp('w', toDisp(s.w), toDisp(p?.w), 'Weight'), inp('r', s.r, p?.r, 'Reps', 'numeric')];
    }
    return `<div class="set-swipe" data-set="${s.id}">
      <button class="set-del" data-act="del-set" aria-label="Delete set" tabindex="-1"><span>−</span></button>
      <div class="set-row ${s.done && !routine ? 'done' : ''}">
        <span><button class="set-no ${cls}" data-act="set-menu">${label}</button></span>
        <span class="prev" data-act="fill-prev">${p ? esc(fmtSet(ex, p)) : '—'}</span>
        ${cells.map((c) => `<span>${c}</span>`).join('')}
        <span class="kc ${s.done || routine ? '' : 'pending'}" id="kc-${s.id}">${ok ? fmtK(k) : '—'}</span>
        ${routine ? '' : `<span><button class="check" data-act="toggle" aria-label="Complete set">${icon('check')}</button></span>`}
        ${isDistCardio(ex) ? `<div class="set-info" id="si-${s.id}">${esc(cardioInfo(ex, use))}</div>` : ''}
      </div>
    </div>`;
  }
  function explorerHtml(eo) {
    const ex = getEx(eo.exId);
    const prev = prevMap().get(eo.exId);
    const last = [...eo.sets].reverse().map((s, i) => effSet(s, prev?.[eo.sets.length - 1 - i])).find((s) => s.w || s.r || s.d) || {};
    let title, cells;
    if (isDistCardio(ex)) {
      const base = last.d && (last.km || last.pw) ? last : { d: 30, km: ex.dv * 0.5, g: ex.dg, el: null, pw: null };
      const kpm = base.km ? base.km / base.d : 0;
      title = `Minutes at ${cardioInfo(ex, base).split(' · (')[0]}`;
      cells = [10, 15, 20, 30, 45, 60, 75, 90].map((d) => ({ l: d + ' min', k: kcalOf(ex, { d, km: kpm * d, g: base.g, el: base.el != null && base.km ? (base.el / base.km) * kpm * d : null, pw: base.pw }) }));
    } else if (ex.t === 'c') {
      const it = last.i ?? 1;
      title = `Minutes at ${EFFORT[it].toLowerCase()} effort`;
      cells = [5, 10, 15, 20, 30, 45, 60, 90].map((d) => ({ l: d + ' min', k: kcalOf(ex, { d, i: it }) }));
    } else if (ex.t === 'h') {
      title = `Seconds${last.w ? ` with +${fmtW(last.w)}${U()}` : ''}`;
      cells = [15, 30, 45, 60, 90, 120, 180, 300].map((d) => ({ l: d + 's', k: kcalOf(ex, { d, w: last.w }) }));
    } else {
      const w = last.w || (ex.t === 'w' ? refWeight(ex) : 0);
      title = ex.t === 'w' ? `Reps at ${fmtW(w)} ${U()}` : ex.t === 'a' ? `Reps with -${fmtW(w)} ${U()} assist` : `Reps${w ? ` with +${fmtW(w)} ${U()}` : ''}`;
      cells = [1, 3, 5, 6, 8, 10, 12, 15, 20, 25, 30].map((r) => ({ l: r + ' reps', k: kcalOf(ex, { w, r }) }));
    }
    return `<div class="t"><span>${icon('flame', 'fire')} ${esc(title)}</span><span class="dim">kcal / set</span></div>
      <div class="rep-grid">${cells.map((c) => `<div><div class="r">${c.l}</div><div class="k">${fmtK(c.k)}</div><div class="r">${fmtG(c.k)}g</div></div>`).join('')}</div>`;
  }

  function findEo(uidv) { return S.active?.exercises.find((e) => e.uid === uidv); }
  function patchSet(eo, s) {
    const ex = getEx(eo.exId);
    const routine = S.active.mode === 'routine';
    const prev = prevMap().get(eo.exId);
    const i = eo.sets.indexOf(s);
    const e = effSet(s, prev?.[i]);
    const use = routine || !s.done ? e : s;
    const el = $('#kc-' + s.id);
    if (el) el.textContent = hasValue(ex, use) ? fmtK(kcalOf(ex, use)) : '—';
    const inf = $('#si-' + s.id); if (inf) inf.textContent = cardioInfo(ex, use);
    const t = $('#ext-' + eo.uid); if (t) t.textContent = fmtK(exTotal(eo, routine)) + ' kcal';
    if (eo.explore) { const rx = $('#rx-' + eo.uid); if (rx) rx.innerHTML = explorerHtml(eo); }
    updateLive();
  }

  async function finishWorkout() {
    const w = S.active;
    if (w.mode === 'routine') {
      const name = (w.name || '').trim() || 'My Routine';
      const r = { id: w.routineId || uid(), name, items: w.exercises.map((eo) => ({ exId: eo.exId, ss: eo.ss || null, elev: eo.elev ?? null, sets: eo.sets.map(pickSet) })) };
      const idx = S.routines.findIndex((x) => x.id === r.id);
      if (idx >= 0) S.routines[idx] = r; else S.routines.unshift(r);
      S.active = null; save(); render(); toast('Routine saved');
      return;
    }
    let done = w.exercises.reduce((a, eo) => a + eo.sets.filter((s) => s.done).length, 0);
    if (!done) {
      const fillable = w.exercises.some((eo) => eo.sets.some((s) => hasValue(getEx(eo.exId), s)));
      if (!fillable) { toast('Complete at least one set first'); return; }
      const ok = await confirmDialog('No sets checked', 'Mark every set that has values as completed and finish?', 'Mark & Finish');
      if (!ok) return;
      w.exercises.forEach((eo) => eo.sets.forEach((s) => { if (hasValue(getEx(eo.exId), s)) s.done = true; }));
    }
    const end = Date.now();
    // Best estimated 1RM per exercise before this workout, for PR detection
    const best = new Map();
    for (const h of S.history) for (const e of h.exercises) for (const s of e.sets) {
      const v = Calc.e1rm(s.w || 0, s.r || 0); if (v > (best.get(e.exId) || 0)) best.set(e.exId, v);
    }
    let prs = 0, kcal = 0, vol = 0, sets = 0;
    const exercises = w.exercises.map((eo) => {
      const ex = getEx(eo.exId);
      const ds = eo.sets.filter((s) => s.done).map((s) => {
        const k = kcalOf(ex, s);
        kcal += k; sets++;
        if (ex.t === 'w' || ex.t === 'bw') vol += (s.w || 0) * (s.r || 0);
        return { ...pickSet(s), k };
      });
      if (ds.length && ex.t === 'w' && best.has(eo.exId)) {
        let top = -1, topV = best.get(eo.exId);
        ds.forEach((s, i) => { const v = Calc.e1rm(s.w || 0, s.r || 0); if (v > topV) { topV = v; top = i; } });
        if (top >= 0) { ds[top].pr = true; prs++; }
      }
      return { exId: eo.exId, note: eo.note, ss: eo.ss || null, sets: ds };
    }).filter((e) => e.sets.length);

    const entry = { id: uid(), name: (w.name || '').trim() || 'Workout', start: w.start, end, exercises, kcal, volume: vol, sets, prs, bw: S.profile.weight };
    S.history.unshift(entry);
    S.history.sort((a, b) => b.start - a.start);
    S.active = null; stopRest(); save();
    render();
    showSummary(entry);
  }

  const dayKey = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  function dayLabel(t) {
    const k = dayKey(t), today = dayKey(Date.now());
    if (k === today) return 'Today';
    if (k === today - 864e5) return 'Yesterday';
    return fmtDate(t, { weekday: 'long', day: 'numeric', month: 'short' });
  }
  const exKcal = (e) => e.sets.reduce((a, x) => a + (x.k || 0), 0);
  function bestSet(ex, sets) {
    if (ex.t === 'c' || ex.t === 'h') return sets.reduce((b, x) => ((x.d || 0) > (b.d || 0) ? x : b), sets[0]);
    return sets.reduce((b, x) => (Calc.e1rm(x.w || 0, x.r || 0) > Calc.e1rm(b.w || 0, b.r || 0) || ((x.w || 0) === (b.w || 0) && (x.r || 0) > (b.r || 0)) ? x : b), sets[0]);
  }
  function summaryText(h) {
    const lines = [
      `🔥 ${h.name} · BurnSet`,
      `${fmtDate(h.start, { weekday: 'short', day: 'numeric', month: 'short' })} · ${fmtDur(h.end - h.start)}`,
      `${fmtK(h.kcal)} kcal burned (≈ ${fmtG(h.kcal)} g of fat)`,
      '',
      ...h.exercises.map((e) => { const ex = getEx(e.exId); return `• ${ex.n}: ${e.sets.length} set${e.sets.length > 1 ? 's' : ''}, best ${fmtSet(ex, bestSet(ex, e.sets))} · ${fmtK(exKcal(e))} kcal`; }),
    ];
    if (h.prs) lines.push('', `🏆 ${h.prs} personal record${h.prs > 1 ? 's' : ''}`);
    return lines.join('\n');
  }
  async function shareSummary(h) {
    const text = summaryText(h);
    try {
      if (navigator.share) { await navigator.share({ title: h.name, text }); return; }
      await navigator.clipboard.writeText(text); toast('Summary copied');
    } catch (e) { if (e && e.name !== 'AbortError') toast('Could not share'); }
  }

  function showSummary(h) {
    const toKg = h.kcal > 0 ? Math.ceil(Calc.KCAL_PER_KG_FAT / h.kcal) : 0;
    const prev = S.history.find((x) => x.id !== h.id && x.name === h.name && x.start < h.start);
    const today = S.history.filter((x) => dayKey(x.start) === dayKey(h.start));
    const todayK = today.reduce((a, x) => a + x.kcal, 0);
    const wk = startOfWeek(h.start);
    const weekK = S.history.filter((x) => x.start >= wk && x.start < wk + 7 * 864e5).reduce((a, x) => a + x.kcal, 0);
    const goalK = S.profile.weeklyKcal || 2000;
    const maxEx = Math.max(...h.exercises.map(exKcal), 0.001);
    const delta = (a, b) => { if (!b) return ''; const d = ((a - b) / b) * 100; const cls = d >= 0 ? 'up' : 'down'; return `<span class="delta ${cls}">${d >= 0 ? '▲' : '▼'} ${Math.abs(d).toFixed(0)}%</span>`; };
    const prSets = [];
    h.exercises.forEach((e) => e.sets.forEach((x) => { if (x.pr) prSets.push({ ex: getEx(e.exId), s: x }); }));

    const m = openSheet({
      title: 'Summary',
      body: `<div class="summary">
        <div class="empty-ic">${icon('check')}</div>
        <h2>${esc(h.name)}</h2>
        <div class="dim">${fmtDate(h.start, { weekday: 'long', day: 'numeric', month: 'long' })} · ${fmtTime(h.start)}–${fmtTime(h.end)}</div>
        <div class="big mono" style="margin-top:14px">${fmtK(h.kcal)}</div>
        <div class="muted" style="font-weight:600">kcal burned · ≈ ${fmtG(h.kcal)} g of fat</div>
      </div>
      <div class="stat-row" style="grid-template-columns:repeat(4,1fr)">
        <div class="stat"><div class="v mono">${fmtDur(h.end - h.start)}</div><div class="l">Time</div></div>
        <div class="stat"><div class="v mono">${fmtVol(h.volume)}</div><div class="l">Vol ${U()}</div></div>
        <div class="stat"><div class="v mono">${h.sets}</div><div class="l">Sets</div></div>
        <div class="stat"><div class="v mono">${h.prs}</div><div class="l">PRs</div></div>
      </div>

      ${prev ? `<div class="sum-sec">vs. last ${esc(h.name)} <span class="dim">· ${fmtDate(prev.start, { day: 'numeric', month: 'short' })}</span></div>
      <div class="math-box">
        <div class="math-line"><span>Calories</span><b class="mono">${fmtK(prev.kcal)} → ${fmtK(h.kcal)} ${delta(h.kcal, prev.kcal)}</b></div>
        ${prev.volume || h.volume ? `<div class="math-line"><span>Volume</span><b class="mono">${fmtVol(prev.volume)} → ${fmtVol(h.volume)} ${U()} ${delta(h.volume, prev.volume)}</b></div>` : ''}
        <div class="math-line"><span>Duration</span><b class="mono">${fmtDur(prev.end - prev.start)} → ${fmtDur(h.end - h.start)}</b></div>
      </div>` : ''}

      ${prSets.length ? `<div class="sum-sec">Personal records</div><div class="math-box">${prSets.map((p) => `<div class="math-line"><span>${esc(p.ex.n)}</span><b class="mono">${esc(fmtSet(p.ex, p.s))} <span class="pr">PR</span></b></div>`).join('')}</div>` : ''}

      <div class="sum-sec">Exercises</div>
      <div class="math-box">${h.exercises.map((e) => { const ex = getEx(e.exId); const k = exKcal(e); return `
        <div class="sum-ex">
          <div class="row between"><b>${esc(ex.n)}</b><b class="mono fire">${fmtK(k)} kcal</b></div>
          <div class="row between dim" style="font-size:13px;margin-top:2px"><span>${e.sets.length} set${e.sets.length > 1 ? 's' : ''} · best ${esc(fmtSet(ex, bestSet(ex, e.sets)))}</span><span>${fmtG(k)} g fat</span></div>
          <div class="sum-bar"><i style="width:${((k / maxEx) * 100).toFixed(1)}%"></i></div>
        </div>`; }).join('')}</div>

      <div class="sum-sec">Today &amp; this week</div>
      <div class="math-box">
        <div class="math-line"><span>Today${today.length > 1 ? ` (${today.length} workouts)` : ''}</span><b class="mono">${fmtK(todayK)} kcal · ${fmtG(todayK)} g fat</b></div>
        <div class="math-line"><span>This week</span><b class="mono">${fmtK(weekK)} / ${goalK.toLocaleString()} kcal (${Math.round((weekK / goalK) * 100)}%)</b></div>
        <div class="math-line"><span>Workouts like this for 1 kg of fat</span><b class="mono">${toKg || '—'}</b></div>
      </div>`,
      foot: `<div class="grid-3"><button class="btn" data-sh>${icon('upload')} Share</button><button class="btn" data-sr>${icon('save')} Routine</button><button class="btn primary" data-close>Done</button></div>`,
    });
    $('[data-sh]', m.el).onclick = () => shareSummary(h);
    $('[data-sr]', m.el).onclick = () => { m.close(); saveAsRoutine(h); };
  }
  async function saveAsRoutine(h) {
    const name = await promptDialog('Save as routine', h.name, 'Save', 'Routine name');
    if (!name) return;
    S.routines.unshift({ id: uid(), name, items: h.exercises.map((e) => ({ exId: e.exId, ss: e.ss || null, sets: e.sets.map((s) => ({ ...pickSet(s), type: s.type === 'f' ? 'n' : s.type })) })) });
    save(); toast('Routine saved'); if (route() === 'workout') render(true);
  }

  /* ================= REST TIMER ================= */
  let rest = null;
  let audioCtx = null;
  function startRest(sec = S.profile.rest) {
    if (!sec) return;
    rest = { end: Date.now() + sec * 1000, total: sec };
    renderRest();
  }
  function stopRest() { rest = null; $('#restPill').classList.add('hidden'); }
  function renderRest() {
    const el = $('#restPill');
    if (!rest) { el.classList.add('hidden'); return; }
    const left = rest.end - Date.now();
    if (left <= 0) {
      stopRest(); beep(); navigator.vibrate?.([200, 100, 200]); toast('Rest over. Next set!');
      return;
    }
    el.classList.remove('hidden');
    const pct = (left / (rest.total * 1000)) * 100;
    el.innerHTML = `<div class="prog" style="width:${pct}%"></div>${icon('clock', 'accent')}<div><div class="time">${fmtClock(left + 999)}</div><div class="lbl">Rest</div></div>
      <button class="btn sm" data-rest="-15">−15</button><button class="btn sm" data-rest="15">+15</button><button class="btn primary sm" data-rest="skip">Skip</button>`;
  }
  $('#restPill').addEventListener('click', (e) => {
    const b = e.target.closest('[data-rest]'); if (!b || !rest) return;
    const v = b.dataset.rest;
    if (v === 'skip') return stopRest();
    rest.end += +v * 1000; rest.total = Math.max(rest.total + +v, 1); renderRest();
  });
  function beep() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.22].forEach((t) => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.frequency.value = 880; o.type = 'sine';
        g.gain.setValueAtTime(0.0001, audioCtx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + t + 0.18);
        o.connect(g).connect(audioCtx.destination); o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + 0.2);
      });
    } catch (e) { /* audio not available */ }
  }
  setInterval(() => {
    if (S && S.active && S.active.mode !== 'routine') { const t = $('#live-t'); if (t) t.textContent = fmtClock(Date.now() - S.active.start); }
    if (rest) renderRest();
  }, 1000);

  /* ================= EXERCISE PICKER ================= */
  function filterEx({ q = '', muscle = 'All', equip = 'All' }) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return allEx()
      .filter((e) => (muscle === 'All' || e.m === muscle) && (equip === 'All' || e.e === equip))
      .map((e) => {
        if (!words.length) return { e, s: 0 };
        const name = e.n.toLowerCase(), hay = (e.n + ' ' + e.m + ' ' + e.e).toLowerCase();
        if (!words.every((w) => hay.includes(w))) return null;
        const toks = hay.split(/[^a-z0-9]+/);
        const s = name.startsWith(words.join(' ')) ? 0 : words.every((w) => toks.some((t) => t.startsWith(w))) ? 1 : 2;
        return { e, s };
      })
      .filter(Boolean)
      .sort((a, b) => a.s - b.s || a.e.n.localeCompare(b.e.n))
      .map((x) => x.e);
  }
  function filterBar(st, idp) {
    return `<div class="search">${icon('search')}<input class="input" id="${idp}-q" placeholder="Search ${allEx().length} exercises" value="${esc(st.q)}" autocomplete="off"></div>
      <div class="row" style="margin-top:10px">
        <select class="select grow" id="${idp}-m"><option value="All">All muscles</option>${MUSCLES.map((m) => `<option ${st.muscle === m ? 'selected' : ''}>${m}</option>`).join('')}</select>
        <select class="select grow" id="${idp}-e"><option value="All">All equipment</option>${EQUIPMENT.map((m) => `<option ${st.equip === m ? 'selected' : ''}>${m}</option>`).join('')}</select>
      </div>`;
  }
  function listHtml(list, { sel, est = true, letters = true } = {}) {
    if (!list.length) return `<div class="empty"><div class="empty-ic">${icon('search')}</div><h3>No exercises found</h3><p>Try a different search or create a custom exercise.</p></div>`;
    let last = '';
    return list.map((e) => {
      const L = e.n[0].toUpperCase();
      const head = letters && L !== last ? `<div class="letter">${(last = L)}</div>` : '';
      const es = est ? estimateLabel(e) : null;
      return `${head}<div class="list-item ${sel && sel.has(e.id) ? 'sel' : ''}" data-pick="${e.id}">
        ${avatar(e, 38)}
        <div class="meta"><div class="n">${esc(e.n)}${e.custom ? ' <span class="tag">Custom</span>' : ''}</div><div class="s">${esc(e.m)} · ${esc(e.e)}</div></div>
        ${es ? `<div class="r"><div class="k">${fmtK(es.k)} kcal</div><div class="u">${esc(es.u)}</div></div>` : ''}
        ${sel ? `<div class="tick">${icon('check')}</div>` : ''}
      </div>`;
    }).join('');
  }
  const pickState = { q: '', muscle: 'All', equip: 'All' };
  function openPicker({ multi = true, title = 'Add Exercise', onPick }) {
    const sel = new Set();
    const order = [];
    const m = openSheet({
      title,
      body: `${filterBar(pickState, 'pk')}<div id="pk-list" style="margin-top:8px"></div>`,
      foot: multi
        ? `<div class="grid-2"><button class="btn" data-new>${icon('plus')} Custom</button><button class="btn primary" data-add disabled style="opacity:.5">Add exercises</button></div>`
        : `<button class="btn block" data-new>${icon('plus')} Create custom exercise</button>`,
    });
    m.el.style.height = '92dvh';
    const draw = () => {
      $('#pk-list', m.el).innerHTML = listHtml(filterEx(pickState), { sel: multi ? sel : null, est: true, letters: !pickState.q.trim() });
      if (multi) {
        const b = $('[data-add]', m.el);
        b.disabled = !sel.size; b.style.opacity = sel.size ? 1 : 0.5;
        b.textContent = sel.size ? `Add ${sel.size} exercise${sel.size > 1 ? 's' : ''}` : 'Add exercises';
      }
    };
    draw();
    const q = $('#pk-q', m.el);
    if (window.innerWidth > 720) setTimeout(() => q.focus(), 60);
    q.addEventListener('input', () => { pickState.q = q.value; draw(); });
    $('#pk-m', m.el).addEventListener('change', (e) => { pickState.muscle = e.target.value; draw(); });
    $('#pk-e', m.el).addEventListener('change', (e) => { pickState.equip = e.target.value; draw(); });
    $('#pk-list', m.el).addEventListener('click', (e) => {
      const it = e.target.closest('[data-pick]'); if (!it) return;
      const id = it.dataset.pick;
      if (!multi) { m.close(); onPick([id]); return; }
      if (sel.has(id)) { sel.delete(id); order.splice(order.indexOf(id), 1); } else { sel.add(id); order.push(id); }
      it.classList.toggle('sel', sel.has(id));
      const b = $('[data-add]', m.el);
      b.disabled = !sel.size; b.style.opacity = sel.size ? 1 : 0.5;
      b.textContent = sel.size ? `Add ${sel.size} exercise${sel.size > 1 ? 's' : ''}` : 'Add exercises';
    });
    multi && ($('[data-add]', m.el).onclick = () => { if (!sel.size) return; m.close(); onPick(order); });
    $('[data-new]', m.el).onclick = () => { m.close(); openCustomForm((id) => onPick([id])); };
  }
  function addExercisesToActive(ids) {
    const pm = prevMap();
    ids.forEach((id) => {
      const prev = pm.get(id);
      const n = prev ? Math.min(prev.length, 6) : 3;
      S.active.exercises.push({ uid: uid(), exId: id, note: '', sets: Array.from({ length: n }, () => newSet()) });
    });
    save(); render(true);
    setTimeout(() => { const cards = $$('.ex-card'); cards[cards.length - ids.length]?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 30);
  }

  /* ================= CUSTOM EXERCISE ================= */
  function openCustomForm(onCreated, existing) {
    const ex = existing || { n: '', m: 'Chest', e: 'Barbell', t: 'w', r: 0.4, b: 0, k: 4.5 };
    const ROMS = [[0.1, 'Tiny (calf raise, shrug)'], [0.3, 'Short (curl, kickback)'], [0.45, 'Medium (bench, row)'], [0.55, 'Long (squat, deadlift)'], [1.0, 'Very long (clean, thruster)']];
    const m = openSheet({
      title: existing ? 'Edit custom exercise' : 'Create custom exercise',
      body: `<div style="display:flex;flex-direction:column;gap:14px">
        <div class="field"><label>Name</label><input class="input" id="cx-n" value="${esc(ex.n)}" placeholder="e.g. Cable Y Raise" maxlength="60"></div>
        <div class="grid-2">
          <div class="field"><label>Primary muscle</label><select class="select" id="cx-m">${MUSCLES.map((x) => `<option ${x === ex.m ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
          <div class="field"><label>Equipment</label><select class="select" id="cx-e">${EQUIPMENT.map((x) => `<option ${x === ex.e ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
        </div>
        <div class="field"><label>Tracking type</label><select class="select" id="cx-t">${Object.entries(TYPE_LABEL).map(([k, v]) => `<option value="${k}" ${k === ex.t ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
        <div id="cx-str">
          <div class="field"><label>Range of motion</label><select class="select" id="cx-r">${ROMS.map(([v, l]) => `<option value="${v}" ${Math.abs(v - ex.r) < 0.06 ? 'selected' : ''}>${l} · ${v} m</option>`).join('')}</select><span class="hint">How far the weight travels each rep.</span></div>
          <div class="field" style="margin-top:14px"><label>Bodyweight moved: <b id="cx-bv">${Math.round(ex.b * 100)}%</b></label><input type="range" id="cx-b" min="0" max="100" step="5" value="${Math.round(ex.b * 100)}"><span class="hint">Squats move ~85% of you, push-ups ~64%, curls ~0%.</span></div>
        </div>
        <div class="field"><label>Intensity</label><select class="select" id="cx-k">
          ${[[3, 'Light (isolation, mobility)'], [4.5, 'Moderate (machines, accessories)'], [6, 'Hard (big compounds)'], [8, 'Very hard (explosive, circuits)'], [10, 'Max (sprints, all-out)']].map(([v, l]) => `<option value="${v}" ${Math.abs((Array.isArray(ex.k) ? ex.k[1] : ex.k) - v) < 0.8 ? 'selected' : ''}>${l}</option>`).join('')}
        </select></div>
      </div>`,
      foot: `<div class="${existing ? 'grid-2' : ''}">${existing ? `<button class="btn danger" data-del>${icon('trash')} Delete</button>` : ''}<button class="btn primary ${existing ? '' : 'block'}" data-ok>${existing ? 'Save' : 'Create exercise'}</button></div>`,
    });
    const tSel = $('#cx-t', m.el), str = $('#cx-str', m.el), bR = $('#cx-b', m.el);
    const sync = () => { str.classList.toggle('hidden', tSel.value === 'c' || tSel.value === 'h'); bR.style.setProperty('--p', bR.value + '%'); $('#cx-bv', m.el).textContent = bR.value + '%'; };
    tSel.onchange = sync; bR.oninput = sync; sync();
    $('[data-ok]', m.el).onclick = () => {
      const n = $('#cx-n', m.el).value.trim();
      if (!n) { toast('Give it a name'); return; }
      const t = tSel.value, k = +$('#cx-k', m.el).value;
      const obj = {
        id: existing ? existing.id : 'custom-' + uid(), n, m: $('#cx-m', m.el).value, e: $('#cx-e', m.el).value, t,
        r: +$('#cx-r', m.el).value, b: +bR.value / 100,
        k: t === 'c' ? [Math.max(2, k * 0.75), k, k * 1.25] : k,
      };
      if (existing) S.custom = S.custom.map((x) => (x.id === obj.id ? obj : x)); else S.custom.push(obj);
      rebuildEx(); save(); m.close();
      toast(existing ? 'Exercise updated' : 'Custom exercise created');
      onCreated ? onCreated(obj.id) : render(true);
    };
    existing && ($('[data-del]', m.el).onclick = async () => {
      if (!(await confirmDialog('Delete exercise?', 'Past workouts keep their numbers, but the exercise will show as unknown.', 'Delete', true))) return;
      S.custom = S.custom.filter((x) => x.id !== existing.id); rebuildEx(); save(); m.close(); render(true);
    });
  }

  /* ================= HISTORY ================= */
  VIEWS.history = () => {
    if (!S.history.length) {
      return { top: brandTop('History'), html: `<div class="card empty" style="margin-top:8px"><div class="empty-ic">${icon('history')}</div><h3>No workouts yet</h3><p>Finish your first workout and it will show up here with every calorie counted.</p><button class="btn primary" style="margin-top:18px" data-act="start-empty">${icon('plus')} Start a workout</button></div>` };
    }
    let lastM = '', lastD = null;
    const dayTotals = new Map();
    S.history.forEach((h) => { const k = dayKey(h.start); const t = dayTotals.get(k) || { k: 0, n: 0 }; t.k += h.kcal; t.n++; dayTotals.set(k, t); });
    const html = S.history.map((h) => {
      const mk = fmtDate(h.start, { month: 'long', year: 'numeric' });
      const mh = mk !== lastM ? `<div class="month">${(lastM = mk)}</div>` : '';
      const dk = dayKey(h.start);
      let dh = '';
      if (dk !== lastD) {
        lastD = dk;
        const t = dayTotals.get(dk);
        dh = `<div class="day-head"><span>${esc(dayLabel(h.start))}</span><span class="mono">${t.n > 1 ? `${t.n} workouts · ` : ''}<b>${fmtK(t.k)} kcal</b> · ${fmtG(t.k)} g</span></div>`;
      }
      return mh + dh + `<div class="hist-card" data-act="hist-open" data-id="${h.id}">
        <div class="h"><div><div class="t">${esc(h.name)}</div><div class="d">${fmtDate(h.start, { weekday: 'long', day: 'numeric', month: 'short' })} · ${fmtTime(h.start)}</div></div>
          <span class="tag fire" style="font-size:13px;padding:5px 10px">${icon('flame')} ${fmtK(h.kcal)} kcal</span></div>
        <div class="hist-stats">
          <div><div class="l">Time</div><div class="v">${fmtDur(h.end - h.start)}</div></div>
          <div><div class="l">Volume</div><div class="v">${fmtVol(h.volume)} ${U()}</div></div>
          <div><div class="l">Fat burned</div><div class="v fire">${fmtG(h.kcal)} g</div></div>
          ${h.prs ? `<div><div class="l">Records</div><div class="v">${h.prs} PR</div></div>` : ''}
        </div>
        ${h.exercises.slice(0, 4).map((e) => { const ex = getEx(e.exId); return `<div class="hist-ex"><span>${e.sets.length} × ${esc(ex.n)}</span><span class="mono dim">${fmtK(e.sets.reduce((a, s) => a + (s.k || 0), 0))} kcal</span></div>`; }).join('')}
        ${h.exercises.length > 4 ? `<div class="dim" style="font-size:13px;margin-top:4px">+${h.exercises.length - 4} more</div>` : ''}
      </div>`;
    }).join('');
    const tk = totalKcal();
    return {
      top: brandTop('History', `<span class="tag fire">${fmtK(tk)} kcal total</span>`),
      html,
    };
  };

  function openHistory(id) {
    const h = S.history.find((x) => x.id === id); if (!h) return;
    const body = `
      <div class="dim" style="margin-bottom:12px">${fmtDate(h.start, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${fmtTime(h.start)} · ${fmtDur(h.end - h.start)}</div>
      <div class="stat-row" style="margin-top:0">
        <div class="stat"><div class="v mono fire">${fmtK(h.kcal)}</div><div class="l">kcal</div></div>
        <div class="stat"><div class="v mono">${fmtG(h.kcal)}g</div><div class="l">Fat</div></div>
        <div class="stat"><div class="v mono">${fmtVol(h.volume)}</div><div class="l">Vol ${U()}</div></div>
      </div>
      ${h.exercises.map((e) => {
        const ex = getEx(e.exId);
        let n = 0;
        return `<div class="card" style="margin-top:12px;padding:14px">
          <div class="row">${avatar(ex, 36)}<div class="grow"><div style="font-weight:600">${esc(ex.n)}${e.ss ? ' <span class="tag">Superset</span>' : ''}</div>${e.note ? `<div class="dim" style="font-size:13px">${esc(e.note)}</div>` : ''}</div>
            <b class="fire mono">${fmtK(e.sets.reduce((a, s) => a + (s.k || 0), 0))} kcal</b></div>
          <div style="margin-top:8px">${e.sets.map((s) => {
            const lbl = s.type === 'w' ? 'W' : s.type === 'd' ? 'D' : String(++n);
            return `<div class="hist-ex"><span><b class="mono" style="display:inline-block;width:24px;color:${s.type === 'f' ? 'var(--bad)' : 'var(--text-3)'}">${lbl}</b>${esc(fmtSet(ex, s))}${s.pr ? '<span class="pr">PR</span>' : ''}</span><span class="mono fire">${fmtK(s.k)} kcal</span></div>`;
          }).join('')}</div>
        </div>`;
      }).join('')}`;
    const m = openSheet({
      title: h.name,
      body,
      foot: `<div class="hist-foot"><button class="btn danger" data-hd aria-label="Delete">${icon('trash')}</button><button class="btn" data-hsum>${icon('flame')} Summary</button><button class="btn" data-hs>${icon('save')} Routine</button><button class="btn primary" data-hr>${icon('repeat')} Repeat</button></div>`,
    });
    $('[data-hd]', m.el).onclick = async () => {
      if (!(await confirmDialog('Delete workout?', 'This removes it from your history and totals.', 'Delete', true))) return;
      S.history = S.history.filter((x) => x.id !== id); save(); m.close(); render(true); toast('Workout deleted');
    };
    $('[data-hs]', m.el).onclick = () => { m.close(); saveAsRoutine(h); };
    $('[data-hsum]', m.el).onclick = () => { m.close(); showSummary(h); };
    $('[data-hr]', m.el).onclick = async () => {
      m.close();
      if (!(await guardActive())) return;
      startWorkout({ name: h.name, items: h.exercises.map((e) => ({ exId: e.exId, ss: e.ss || null, sets: e.sets.map((s) => ({ ...s, type: s.type === 'f' ? 'n' : s.type })) })) });
    };
  }

  /* ================= BURN LAB ================= */
  VIEWS.lab = () => {
    const L = S.lab;
    const ex = getEx(L.exId);
    let controls;
    if (isDistCardio(ex)) {
      const isRow = ex.cm === 'row';
      const dv = isRow ? Math.round((L.km || 0) * 1000) : +fmtNum(distDisp(L.km || 0), 1);
      controls = `
        ${sliderBlock('lab-d', 'Duration', L.d, 1, 120, 1, 'min')}
        <div style="margin-top:18px">${isRow ? sliderBlock('lab-km', 'Distance', dv, 500, 20000, 100, 'm') : sliderBlock('lab-km', 'Distance', dv, 0.5, ex.cm === 'bike' ? 100 : 30, 0.1, DU())}</div>
        ${ex.cm === 'walk' || ex.cm === 'run' ? `<div style="margin-top:18px">${sliderBlock('lab-g', 'Incline', L.g || 0, 0, 15, 0.5, '%')}</div>` : ''}
        <div class="lab-info" id="lab-info"></div>`;
    } else if (ex.t === 'c') {
      controls = `
        ${sliderBlock('lab-d', 'Duration', L.d, 1, 120, 1, 'min')}
        <div class="field" style="margin-top:16px"><label>Effort</label><div class="segmented" id="lab-i">${EFFORT.map((x, j) => `<button data-i="${j}" class="${L.i === j ? 'on' : ''}">${x}</button>`).join('')}</div></div>`;
    } else if (ex.t === 'h') {
      controls = `${sliderBlock('lab-d', 'Duration', L.d, 5, 300, 5, 'sec')}
        <div class="field" style="margin-top:16px"><label>Added load (${U()})</label><input class="input" id="lab-w" inputmode="decimal" value="${fmtW(L.w)}"></div>`;
    } else {
      const maxW = U() === 'lb' ? 660 : 300;
      const wl = ex.t === 'w' ? (ex.lw === 2 ? `Weight of one dumbbell (${U()})` : `Weight (${U()})`) : ex.t === 'a' ? `Assistance (${U()})` : `Added weight (${U()})`;
      controls = `
        <div class="field"><label>${wl}</label>
          <div class="row"><input class="input mono" id="lab-w" inputmode="decimal" value="${fmtW(L.w)}" style="width:100px;font-weight:600;font-size:16px;text-align:center">
          <input type="range" id="lab-ws" min="0" max="${maxW}" step="${U() === 'lb' ? 5 : 2.5}" value="${toDisp(L.w)}" style="--p:${(toDisp(L.w) / maxW) * 100}%"></div></div>
        <div style="margin-top:18px">${sliderBlock('lab-r', ex.sd === 2 ? `Reps per ${sideWord(ex)}` : 'Reps', L.r, 1, 30, 1, ex.sd === 2 ? `/ ${sideWord(ex)}` : 'reps')}</div>`;
    }
    const html = `
      <div class="card">
        <div class="row">${avatar(ex)}<div class="grow"><div style="font-weight:600;font-size:16px;letter-spacing:-0.01em">${esc(ex.n)}</div><div class="dim" style="font-size:13px">${esc(ex.m)} · ${esc(ex.e)} · ${TYPE_LABEL[ex.t]}</div></div>
          <button class="btn sm" data-act="lab-pick">Change</button></div>
      </div>
      <div class="card">${controls}
        <div class="row between" style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line)">
          <div><div style="font-weight:600;font-size:14px">Your bodyweight</div><div class="dim" style="font-size:12px">Used for every calculation</div></div>
          <div class="row" style="gap:6px"><input class="input mono" id="lab-bw" inputmode="decimal" value="${fmtW(S.profile.weight)}" style="width:86px;text-align:center;font-weight:700"><span class="dim">${U()}</span></div>
        </div>
      </div>
      <div class="section" id="lab-result"></div>
      <div class="section"><div class="section-title"><span id="lab-ch-t">Calories by reps</span><span class="dim" style="text-transform:none;letter-spacing:0">kcal per set</span></div>
        <div class="card" style="padding:12px 10px 6px"><div data-chart="lab"></div></div></div>
      <div class="section" id="lab-math"></div>
      ${plannerHtml()}
    `;
    return {
      top: brandTop('Burn Lab', `<span class="tag fire">${icon('flame')} 1 kg = 7,700 kcal</span>`),
      html,
      mount: mountLab,
    };
  };
  function sliderBlock(id, label, v, min, max, step, unit) {
    return `<div class="slider-val"><label style="font-weight:600;font-size:13px;color:var(--text-2)">${label}</label><div><span class="v mono" id="${id}-v">${v}</span> <span class="dim">${unit}</span></div></div>
      <input type="range" class="big-slider" id="${id}" min="${min}" max="${max}" step="${step}" value="${v}" style="--p:${((v - min) / (max - min)) * 100}%">`;
  }
  function labSet() { const L = S.lab; return { w: L.w, r: L.r, d: L.d, i: L.i, km: L.km, g: L.g }; }
  function updateLab() {
    const ex = getEx(S.lab.exId);
    const set = labSet();
    const b = Calc.breakdown(ex, set, S.profile);
    const k = b.total;
    const toKg = k > 0 ? Math.ceil(Calc.KCAL_PER_KG_FAT / k) : 0;
    const strength = ex.t !== 'c' && ex.t !== 'h';
    const perRep = strength ? Calc.perRep(ex, set.w, S.profile) : 0;
    const parts = [['Mechanical work', b.mech, 'var(--hl)'], ['Active metabolism', b.active, 'var(--hl-mid)'], ['Rest period', b.rest, 'var(--text-3)']].filter((p) => p[1] > 0.001);
    $('#lab-result').innerHTML = `
      <div class="calc-result">
        <div class="dim" style="font-weight:500;font-size:13px;margin-bottom:10px">This set burns</div>
        <div class="k mono">${fmtK(k)}</div>
        <div class="u">kcal${S.profile.mode === 'net' ? ' (net, above resting)' : ' (gross)'}</div>
        <div class="chips2">
          <span class="tag fire">≈ ${fmtG(k)} g fat</span>
          ${strength ? `<span class="tag">+${fmtK(perRep)} kcal / extra rep</span>` : ''}
          <span class="tag">${toKg ? toKg.toLocaleString() : '—'} sets = 1 kg fat</span>
        </div>
        ${parts.length ? `<div class="breakdown">${parts.map((p) => `<div style="width:${(p[1] / k) * 100}%;background:${p[2]}"></div>`).join('')}</div>
        <div class="legend">${parts.map((p) => `<span><i style="background:${p[2]}"></i>${p[0]} ${fmtK(p[1])}</span>`).join('')}</div>` : ''}
      </div>`;
    // math box
    const bw = S.profile.weight;
    let lines;
    if (strength) {
      const load = Calc.effectiveLoad(ex, set, bw);
      const totalReps = (set.r || 0) * (ex.sd || 1);
      const workJ = load * 9.81 * ex.r * totalReps;
      lines = [
        ['Load moved per rep', `${fmtW(load)} ${U()}${ex.b ? ` <span class="dim">(incl. ${Math.round(ex.b * 100)}% bodyweight)</span>` : ''}`],
        ['Distance per rep', `${ex.r} m`],
        ['Work done', `${Math.round(workJ).toLocaleString()} J`],
        ['Energy (18% efficiency, +33% eccentric)', `${fmtK(b.mech)} kcal`],
        ...(ex.lw === 2 ? [['Dumbbells', '2 × the weight entered']] : []),
        ...(ex.sd === 2 ? [['Sides', `${set.r} reps × 2 ${sideWord(ex)}s = ${totalReps} reps`]] : []),
        [`Time under tension (${totalReps} × ${S.profile.tempo}s)${Calc.metScale(S.profile) !== 1 ? ' · personal metabolism' : ''}`, `${fmtK(b.active)} kcal`],
        [S.profile.includeRest ? `Rest after set (${S.profile.rest}s)` : 'Rest period (off in settings)', `${fmtK(b.rest)} kcal`],
      ];
    } else if (isDistCardio(ex)) {
      const i = b.info || {};
      if (ex.cm === 'walk' || ex.cm === 'run') lines = [
        ['Speed (distance ÷ time)', `${fmtNum(distDisp(i.kmh || 0))} ${DU()}/h <span class="dim">(${Math.round(((set.km || 0) * 1000) / (set.d || 1))} m/min)</span>`],
        ['Grade', `${fmtNum(i.grade || 0)}%`],
        [`ACSM ${i.eq || 'walking'} equation`, `${fmtNum(i.vo2 || 0)} ml O₂/kg/min`],
        ['Oxygen → energy (≈5 kcal per litre)', `${fmtK(b.active)} kcal`],
      ];
      else if (ex.cm === 'row') lines = [
        ['Pace', `${fmtPace(i.split || 0)} /500m`],
        ['Power (2.8 ÷ pace³)', `${Math.round(i.watts || 0)} W`],
        ['Energy (~20% muscle efficiency)', `${fmtK(b.active)} kcal`],
      ];
      else lines = [
        ['Speed', `${fmtNum(distDisp(i.kmh || 0))} ${DU()}/h`],
        ['MET (Compendium)', `${i.met ?? '—'}`],
        ['MET × kg × hours', `${fmtK(b.active)} kcal`],
      ];
    } else {
      const met = ex.t === 'c' ? ex.k[set.i] : ex.k;
      lines = [
        ['MET value', `${met}${S.profile.mode === 'net' ? ` <span class="dim">(net ${fmtNum(met - 1)})</span>` : ''}`],
        ['Mass', `${fmtW(bw + (ex.t === 'h' ? set.w || 0 : 0))} ${U()}`],
        ['Time', ex.t === 'c' ? `${set.d} min` : `${set.d} s`],
        ['MET × kg × hours', `${fmtK(b.active)} kcal`],
      ];
      if (b.rest) lines.push([`Rest after (${S.profile.rest}s)`, `${fmtK(b.rest)} kcal`]);
    }
    lines.push(['Fat equivalent (÷ 7,700 × 1000)', `<b class="fire">${fmtG(k)} g</b>`]);
    const li = $('#lab-info'); if (li) li.textContent = cardioInfo(ex, set);
    $('#lab-math').innerHTML = `<div class="section-title">The math</div><div class="math-box">${lines.map(([a, v]) => `<div class="math-line"><span>${a}</span><b class="mono">${v}</b></div>`).join('')}</div>`;
    const ch = $('[data-chart="lab"]'); if (ch) chartFns.lab(ch);
  }
  chartFns.lab = (el) => {
    const ex = getEx(S.lab.exId), L = S.lab;
    let data, hi = -1, every = 1, title;
    if (isDistCardio(ex)) {
      title = 'Calories by minutes at this pace';
      const ds = [5, 10, 15, 20, 25, 30, 40, 45, 60, 75, 90, 120];
      const kpm = (L.km || 0) / (L.d || 1);
      data = ds.map((d) => ({ l: d + 'm', v: kcalOf(ex, { d, km: kpm * d, g: L.g }) }));
      hi = ds.indexOf(L.d);
    } else if (ex.t === 'c') {
      title = `Calories by minutes (${EFFORT[L.i].toLowerCase()})`;
      const ds = [5, 10, 15, 20, 25, 30, 40, 45, 60, 75, 90, 120];
      data = ds.map((d) => ({ l: d + 'm', v: kcalOf(ex, { d, i: L.i }) }));
      hi = ds.indexOf(L.d);
    } else if (ex.t === 'h') {
      title = 'Calories by duration';
      const ds = [15, 30, 45, 60, 90, 120, 150, 180, 240, 300];
      data = ds.map((d) => ({ l: d + 's', v: kcalOf(ex, { d, w: L.w }) }));
      hi = ds.indexOf(L.d);
    } else {
      title = `Calories by reps at ${fmtW(L.w)} ${U()}`;
      data = Array.from({ length: 30 }, (_, i) => ({ l: String(i + 1), v: kcalOf(ex, { w: L.w, r: i + 1 }) }));
      hi = L.r - 1; every = el.clientWidth < 480 ? 5 : 2;
    }
    const t = $('#lab-ch-t'); if (t) t.textContent = title;
    drawBars(el, data, { hi, labelEvery: every, height: 180 });
  };
  function mountLab() {
    const L = S.lab;
    const bind = (id, fn, ev = 'input') => { const el = $('#' + id); if (el) el.addEventListener(ev, fn); };
    const setP = (el) => el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min)) * 100 + '%');
    bind('lab-r', (e) => { L.r = +e.target.value; setP(e.target); $('#lab-r-v').textContent = L.r; updateLab(); saveSoon(); });
    bind('lab-d', (e) => { L.d = +e.target.value; setP(e.target); $('#lab-d-v').textContent = L.d; updateLab(); saveSoon(); });
    bind('lab-km', (e) => { const v = +e.target.value; const ex = getEx(L.exId); L.km = ex.cm === 'row' ? v / 1000 : distFrom(v); setP(e.target); $('#lab-km-v').textContent = v; updateLab(); saveSoon(); });
    bind('lab-g', (e) => { L.g = +e.target.value; setP(e.target); $('#lab-g-v').textContent = L.g; updateLab(); saveSoon(); });
    bind('lab-ws', (e) => { L.w = fromDisp(+e.target.value); setP(e.target); $('#lab-w').value = e.target.value; updateLab(); saveSoon(); });
    bind('lab-w', (e) => { const v = num(e.target.value); L.w = fromDisp(v ?? 0); const s = $('#lab-ws'); if (s) { s.value = v ?? 0; setP(s); } updateLab(); saveSoon(); });
    bind('lab-bw', (e) => { const v = num(e.target.value); if (v && v > 20) { S.profile.weight = fromDisp(v); S.profile.weightAt = Date.now(); updateLab(); updatePlanner(); saveSoon(); } });
    const seg = $('#lab-i');
    seg && seg.addEventListener('click', (e) => { const b = e.target.closest('[data-i]'); if (!b) return; L.i = +b.dataset.i; $$('button', seg).forEach((x) => x.classList.toggle('on', x === b)); updateLab(); saveSoon(); });
    mountPlanner();
    updateLab();
  }

  function avgWorkoutKcal() {
    const h = S.history.slice(0, 10);
    return h.length ? h.reduce((a, x) => a + x.kcal, 0) / h.length : 300;
  }
  function plannerHtml() {
    const P = S.plan;
    const per = P.perWorkout ?? Math.round(avgWorkoutKcal());
    return `<div class="section"><div class="section-title"><span>${icon('target')} Fat-loss planner</span></div>
      <div class="card">
        <div class="grid-2">
          <div class="field"><label>Fat to lose (kg)</label><input class="input mono" id="pl-kg" inputmode="decimal" value="${P.kg}"></div>
          <div class="field"><label>Diet deficit / day</label><input class="input mono" id="pl-diet" inputmode="numeric" value="${P.diet}"><span class="hint">kcal below maintenance</span></div>
          <div class="field"><label>Workouts / week</label><input class="input mono" id="pl-wk" inputmode="numeric" value="${P.perWeek}"></div>
          <div class="field"><label>kcal / workout</label><input class="input mono" id="pl-per" inputmode="numeric" value="${per}"><span class="hint">${S.history.length ? 'Your recent average' : 'Typical lifting session'}</span></div>
        </div>
        <div id="pl-out" style="margin-top:14px"></div>
      </div></div>`;
  }
  function updatePlanner() {
    const out = $('#pl-out'); if (!out) return;
    const P = S.plan;
    const per = P.perWorkout ?? avgWorkoutKcal();
    const need = (P.kg || 0) * Calc.KCAL_PER_KG_FAT;
    const weekly = (P.diet || 0) * 7 + (P.perWeek || 0) * per;
    const weeks = weekly > 0 ? need / weekly : Infinity;
    const date = isFinite(weeks) ? new Date(Date.now() + weeks * 7 * 864e5) : null;
    const gymShare = weekly > 0 ? ((P.perWeek || 0) * per) / weekly : 0;
    out.innerHTML = `<div class="math-box">
      <div class="math-line"><span>Energy to burn (${P.kg || 0} kg × 7,700)</span><b class="mono">${Math.round(need).toLocaleString()} kcal</b></div>
      <div class="math-line"><span>Weekly deficit (diet + gym)</span><b class="mono">${Math.round(weekly).toLocaleString()} kcal</b></div>
      <div class="math-line"><span>From your workouts</span><b class="mono fire">${Math.round(gymShare * 100)}%</b></div>
      <div class="math-line"><span>Time to goal</span><b class="mono accent">${isFinite(weeks) ? (weeks < 1 ? `${Math.ceil(weeks * 7)} days` : `${weeks.toFixed(1)} weeks`) : '—'}</b></div>
      ${date ? `<div class="math-line"><span>Target date</span><b>${fmtDate(date, { day: 'numeric', month: 'long', year: 'numeric' })}</b></div>` : ''}
    </div>
    ${weekly > 7700 * 1.1 ? `<p class="dim" style="font-size:12px;margin:10px 2px 0">${icon('info')} Over ~1 kg/week is aggressive. Keep protein high to protect muscle.</p>` : ''}`;
  }
  function mountPlanner() {
    const P = S.plan;
    const b = (id, k, f = num) => { const el = $('#' + id); el && el.addEventListener('input', () => { P[k] = f(el.value) ?? 0; updatePlanner(); saveSoon(); }); };
    b('pl-kg', 'kg'); b('pl-diet', 'diet'); b('pl-wk', 'perWeek');
    const per = $('#pl-per'); per && per.addEventListener('input', () => { P.perWorkout = num(per.value); updatePlanner(); saveSoon(); });
    updatePlanner();
  }

  /* ================= EXERCISE LIBRARY ================= */
  const libState = { q: '', muscle: 'All', equip: 'All' };
  VIEWS.exercises = () => {
    const html = `
      ${filterBar(libState, 'lib')}
      <div class="chips" style="margin-top:12px" id="lib-chips">${['All', ...MUSCLES].map((m) => `<button class="chip ${libState.muscle === m ? 'on' : ''}" data-m="${m}">${m}</button>`).join('')}</div>
      <div class="row between" style="margin:14px 2px 6px"><span class="dim" style="font-size:13px" id="lib-count"></span><button class="btn ghost sm" data-act="create-ex">${icon('plus')} Custom exercise</button></div>
      <div class="card" style="padding:4px 10px" id="lib-list"></div>`;
    return { top: brandTop('Exercises', `<span class="tag">${allEx().length}</span>`), html, mount: mountLib };
  };
  function mountLib() {
    const draw = () => {
      const list = filterEx(libState);
      $('#lib-list').innerHTML = listHtml(list, { est: true, letters: !libState.q.trim() });
      $('#lib-count').textContent = `${list.length} exercise${list.length === 1 ? '' : 's'} · est. per set`;
      $$('#lib-chips .chip').forEach((c) => c.classList.toggle('on', c.dataset.m === libState.muscle));
      $('#lib-m').value = libState.muscle;
    };
    $('#lib-q').addEventListener('input', (e) => { libState.q = e.target.value; draw(); });
    $('#lib-m').addEventListener('change', (e) => { libState.muscle = e.target.value; draw(); });
    $('#lib-e').addEventListener('change', (e) => { libState.equip = e.target.value; draw(); });
    $('#lib-chips').addEventListener('click', (e) => { const c = e.target.closest('[data-m]'); if (!c) return; libState.muscle = c.dataset.m; draw(); });
    $('#lib-list').addEventListener('click', (e) => { const it = e.target.closest('[data-pick]'); if (it) openExerciseDetail(it.dataset.pick); });
    draw();
  }
  function exerciseHistory(id) {
    const out = [];
    for (const h of S.history) { const e = h.exercises.filter((x) => x.exId === id); if (e.length) out.push({ h, sets: e.flatMap((x) => x.sets) }); }
    return out; // newest first
  }
  function openExerciseDetail(id) {
    const ex = getEx(id);
    const hist = exerciseHistory(id);
    const strength = ex.t !== 'c' && ex.t !== 'h';
    let w = refWeight(ex);
    const totalK = hist.reduce((a, x) => a + x.sets.reduce((b, s) => b + (s.k || 0), 0), 0);
    const best = strength ? hist.flatMap((x) => x.sets).reduce((b, s) => { const v = Calc.e1rm(s.w || 0, s.r || 0); return v > b.v ? { v, s } : b; }, { v: 0, s: null }) : null;
    const m = openSheet({
      title: ex.n,
      body: `
        <div class="row wrap" style="gap:6px;margin-bottom:14px"><span class="tag">${esc(ex.m)}</span><span class="tag">${esc(ex.e)}</span><span class="tag">${TYPE_LABEL[ex.t]}</span>${ex.custom ? '<span class="tag">Custom</span>' : ''}</div>
        <div class="stat-row" style="margin-top:0">
          <div class="stat"><div class="v mono">${hist.length}</div><div class="l">Sessions</div></div>
          <div class="stat"><div class="v mono fire">${fmtK(totalK)}</div><div class="l">kcal total</div></div>
          <div class="stat"><div class="v mono">${best && best.v ? fmtW(best.v) : '—'}</div><div class="l">${strength ? 'Est. 1RM ' + U() : 'Best'}</div></div>
        </div>
        <button class="log-hint" data-xg style="margin:14px 0 0">${icon('info')}<span>How to log: ${esc(logGuide(ex).short)}</span>${icon('chevR')}</button>
        ${strength ? `<div class="field" style="margin-top:16px"><label>${ex.t === 'w' ? (ex.lw === 2 ? 'Weight of one dumbbell' : 'Weight') : ex.t === 'a' ? 'Assistance' : 'Added weight'} (${U()})</label><input class="input mono" id="xd-w" inputmode="decimal" value="${fmtW(w)}"></div>` : ''}
        <div class="rep-explorer" style="margin-top:14px;border-style:solid" id="xd-rx"></div>
        <div class="math-box" style="margin-top:14px;font-size:13px">
          ${strength ? `<div class="math-line"><span>Range of motion</span><b class="mono">${ex.r} m</b></div><div class="math-line"><span>Bodyweight moved</span><b class="mono">${Math.round(ex.b * 100)}%</b></div>` : ''}
          <div class="math-line"><span>MET</span><b class="mono">${Array.isArray(ex.k) ? ex.k.join(' / ') : ex.k}</b></div>
        </div>
        ${hist.length ? `<div class="section-title" style="margin-top:18px">Calories per session</div><div class="card" style="padding:10px 8px 4px"><div data-chart="exhist"></div></div>
          <div class="section-title" style="margin-top:18px">Recent sets</div>
          ${hist.slice(0, 5).map((x) => `<div class="hist-ex"><span class="dim">${fmtDate(x.h.start)}</span><span>${x.sets.map((s) => esc(fmtSet(ex, s))).join(', ')}</span></div>`).join('')}` : ''}
      `,
      foot: `<div class="${ex.custom ? 'grid-3' : 'grid-2'}">${ex.custom ? `<button class="btn" data-xe>${icon('edit')} Edit</button>` : ''}<button class="btn" data-xl>${icon('flame')} Burn Lab</button><button class="btn primary" data-xa>${icon('plus')} ${S.active ? 'Add' : 'Start'}</button></div>`,
    });
    const drawRx = () => {
      let cells;
      if (isDistCardio(ex)) cells = [10, 15, 20, 30, 45, 60, 75, 90].map((d) => ({ l: `${d} min`, k: kcalOf(ex, { d, km: (ex.dv / 60) * d, g: ex.dg }) }));
      else if (ex.t === 'c') cells = [10, 20, 30, 45, 60].flatMap((d) => [{ l: `${d}m light`, k: kcalOf(ex, { d, i: 0 }) }, { l: `${d}m hard`, k: kcalOf(ex, { d, i: 2 }) }]);
      else if (ex.t === 'h') cells = [15, 30, 45, 60, 90, 120, 180, 300].map((d) => ({ l: d + 's', k: kcalOf(ex, { d }) }));
      else cells = [1, 3, 5, 8, 10, 12, 15, 20, 25, 30].map((r) => ({ l: r + (ex.sd === 2 ? `/${sideWord(ex)}` : ' reps'), k: kcalOf(ex, { w, r }) }));
      $('#xd-rx', m.el).innerHTML = `<div class="t"><span>${icon('flame', 'fire')} Calories per set</span><span class="dim">${fmtW(S.profile.weight)} ${U()} bodyweight</span></div>
        <div class="rep-grid">${cells.map((c) => `<div><div class="r">${c.l}</div><div class="k">${fmtK(c.k)}</div><div class="r">${fmtG(c.k)}g</div></div>`).join('')}</div>`;
    };
    drawRx();
    const wi = $('#xd-w', m.el); wi && wi.addEventListener('input', () => { w = fromDisp(num(wi.value) ?? 0); drawRx(); });
    chartFns.exhist = (el) => {
      const pts = hist.slice(0, 12).reverse().map((x) => ({ l: fmtDate(x.h.start, { day: 'numeric', month: 'numeric' }), v: x.sets.reduce((a, s) => a + (s.k || 0), 0) }));
      drawBars(el, pts, { height: 140, showVals: true, labelEvery: pts.length > 8 ? 2 : 1 });
    };
    mountCharts(m.el);
    $('[data-xl]', m.el).onclick = () => { S.lab.exId = id; if (strength) S.lab.w = w; save(); m.close(); if (location.hash === '#lab') render(); else location.hash = 'lab'; };
    $('[data-xa]', m.el).onclick = () => {
      m.close();
      if (S.active) { addExercisesToActive([id]); if (location.hash !== '#workout') location.hash = 'workout'; toast('Added to workout'); }
      else startWorkout({ name: ex.n.replace(/\s*\(.*?\)/, '') + ' Session', items: [{ exId: id, sets: [{}, {}, {}] }] });
    };
    $('[data-xg]', m.el).onclick = () => openLogGuide(ex);
    ex.custom && ($('[data-xe]', m.el).onclick = () => { m.close(); openCustomForm(null, S.custom.find((c) => c.id === id)); });
  }

  /* ================= PROFILE ================= */
  VIEWS.profile = () => {
    const P = S.profile;
    const tk = totalKcal();
    const time = S.history.reduce((a, h) => a + (h.end - h.start), 0);
    const vol = S.history.reduce((a, h) => a + (h.volume || 0), 0);
    const html = `
      <div class="hero">
        <div class="row">
          ${CLOUD()
            ? `<label class="pf-avatar" title="Change profile picture">${avatarUrl() ? `<img src="${esc(avatarUrl())}" alt="">` : `<span>${esc((displayName() || 'U')[0].toUpperCase())}</span>`}<input type="file" accept="image/*" class="pf-avatar-in" hidden><i>${icon('edit')}</i></label>`
            : `<div class="ex-avatar" style="width:52px;height:52px;border-radius:50%;font-size:19px">${esc((P.name || 'U')[0].toUpperCase())}</div>`}
          <div class="grow">${CLOUD()
            ? `<div class="pf-name">${esc(displayName())}</div><div class="dim" style="font-size:13px;margin-bottom:2px">${esc(Cloud.user.email)}</div>`
            : `<input class="wk-name" id="pf-name" value="${esc(P.name)}" placeholder="Your name" maxlength="30" style="font-size:20px;margin:0">`}
            <div class="dim" style="font-size:13px">${S.history.length} workouts · since ${S.history.length ? fmtDate(S.history[S.history.length - 1].start, { month: 'short', year: 'numeric' }) : 'today'}</div></div>
        </div>
        <div class="grid-2" style="margin-top:18px">
          <div><div class="dim" style="font-size:12.5px;font-weight:500">Total burned</div><div style="font-size:28px;font-weight:650;letter-spacing:-0.03em;color:var(--hl)" class="mono">${fmtK(tk)} <small style="font-size:13px" class="dim">kcal</small></div></div>
          <div><div class="dim" style="font-size:12.5px;font-weight:500">Fat equivalent</div><div style="font-size:28px;font-weight:650;letter-spacing:-0.03em" class="mono">${(tk / 7700).toFixed(2)} <small style="font-size:13px" class="dim">kg</small></div></div>
        </div>
      </div>
      <div class="stat-row">
        <div class="stat"><div class="v mono">${fmtDur(time)}</div><div class="l">Time trained</div></div>
        <div class="stat"><div class="v mono">${fmtVol(vol)}</div><div class="l">Volume ${U()}</div></div>
        <div class="stat"><div class="v mono">${S.history.reduce((a, h) => a + h.sets, 0)}</div><div class="l">Sets</div></div>
      </div>

      <div class="section"><div class="section-title">Calories per week</div>
        <div class="card" style="padding:12px 10px 6px">${S.history.length ? '<div data-chart="weekly"></div>' : '<div class="empty" style="padding:20px"><p>Your weekly burn chart appears after your first workout.</p></div>'}</div></div>

      ${CLOUD() ? `<div class="section"><div class="section-title"><span>Account</span><span class="dim" id="syncStatus">${syncLabel()}</span></div>
        <div class="card settings">
          <div class="s-row" data-act="edit-username" style="cursor:pointer"><div class="t">Username</div><div class="muted">@${esc(displayName())} ›</div></div>
          <div class="s-row"><div class="t">Email</div><div class="muted" style="max-width:62%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(Cloud.user.email)}</div></div>
          <label class="s-row" style="cursor:pointer"><div class="t">Profile picture</div><span class="tint">Change</span><input type="file" accept="image/*" class="pf-avatar-in" hidden></label>
          <div class="s-row" data-act="sign-out" style="cursor:pointer;justify-content:center"><div class="t" style="color:var(--bad);font-weight:500">Sign Out</div></div>
        </div></div>` : ''}

      <div class="section"><div class="section-title">Body & calculation</div>
        <div class="card settings" style="padding:2px 16px">
          <div class="s-row"><div><div class="t">Bodyweight</div><div class="d">Drives every calorie number</div></div><div class="ctl row" style="gap:6px"><input class="input mono" id="pf-bw" inputmode="decimal" value="${fmtW(P.weight)}" style="text-align:center"><span class="dim">${U()}</span></div></div>
          <div class="s-row"><div><div class="t">Sex</div><div class="d">Personalises your resting metabolism</div></div><div class="ctl"><div class="segmented" id="pf-sex"><button data-v="m" class="${P.sex === 'm' ? 'on' : ''}">Male</button><button data-v="f" class="${P.sex === 'f' ? 'on' : ''}">Female</button></div></div></div>
          <div class="s-row"><div><div class="t">Age</div></div><div class="ctl row" style="gap:6px"><input class="input mono" id="pf-age" inputmode="numeric" value="${P.age ?? ''}" placeholder="—" style="text-align:center"><span class="dim">yrs</span></div></div>
          <div class="s-row"><div><div class="t">Height</div></div><div class="ctl row" style="gap:6px"><input class="input mono" id="pf-height" inputmode="decimal" value="${P.height ? fmtNum(U() === 'lb' ? P.height / 2.54 : P.height, 0) : ''}" placeholder="—" style="text-align:center"><span class="dim">${U() === 'lb' ? 'in' : 'cm'}</span></div></div>
          <div class="s-row"><div><div class="t">Resting metabolism</div><div class="d">Mifflin-St Jeor · used in every calorie number</div></div><div class="muted" style="text-align:right">${Calc.rmr(P) ? `${Math.round(Calc.rmr(P)).toLocaleString()} kcal/day` : 'Add sex, age & height'}</div></div>
          <div class="s-row"><div><div class="t">Weekly burn goal</div><div class="d">Fills the orange ring</div></div><div class="ctl"><select class="select" id="pf-gk">${[1000, 1500, 2000, 2500, 3000, 3500, 4000, 5000].map((v) => `<option value="${v}" ${P.weeklyKcal === v ? 'selected' : ''}>${v.toLocaleString()} kcal</option>`).join('')}</select></div></div>
          <div class="s-row"><div><div class="t">Weekly workouts goal</div><div class="d">Fills the green ring</div></div><div class="ctl"><select class="select" id="pf-gw">${[2, 3, 4, 5, 6, 7].map((v) => `<option value="${v}" ${P.weeklyWorkouts === v ? 'selected' : ''}>${v} workouts</option>`).join('')}</select></div></div>
          <div class="s-row"><div><div class="t">Units</div></div><div class="ctl"><div class="segmented" id="pf-unit"><button data-v="kg" class="${P.unit === 'kg' ? 'on' : ''}">kg</button><button data-v="lb" class="${P.unit === 'lb' ? 'on' : ''}">lb</button></div></div></div>
          <div class="s-row"><div><div class="t">Distance</div><div class="d">For walking, running and cycling</div></div><div class="ctl"><div class="segmented" id="pf-dist"><button data-v="km" class="${DU() === 'km' ? 'on' : ''}">km</button><button data-v="mi" class="${DU() === 'mi' ? 'on' : ''}">mi</button></div></div></div>
          <div class="s-row"><div><div class="t">Rep tempo</div><div class="d">Seconds per rep (up + down)</div></div><div class="ctl"><select class="select" id="pf-tempo">${[2, 3, 4, 5, 6].map((v) => `<option value="${v}" ${P.tempo === v ? 'selected' : ''}>${v} sec</option>`).join('')}</select></div></div>
          <div class="s-row"><div><div class="t">Rest timer</div><div class="d">Starts when you tick a set</div></div><div class="ctl"><select class="select" id="pf-rest">${[0, 30, 45, 60, 90, 120, 150, 180, 240, 300].map((v) => `<option value="${v}" ${P.rest === v ? 'selected' : ''}>${v ? (v >= 60 ? `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')} min` : v + ' sec') : 'Off'}</option>`).join('')}</select></div></div>
          <div class="s-row"><div><div class="t">Count rest-period burn</div><div class="d">Your heart rate stays up between sets</div></div><label class="switch"><input type="checkbox" id="pf-incr" ${P.includeRest ? 'checked' : ''}><span></span></label></div>
          <div class="s-row"><div><div class="t">Calorie mode</div><div class="d">Net = only extra calories from training (best for fat-loss maths)</div></div><div class="ctl"><div class="segmented" id="pf-mode"><button data-v="net" class="${P.mode === 'net' ? 'on' : ''}">Net</button><button data-v="gross" class="${P.mode === 'gross' ? 'on' : ''}">Gross</button></div></div></div>
        </div></div>

      <div class="section"><div class="section-title">Appearance</div>
        <div class="card settings" style="padding:2px 16px">
          <div class="s-row"><div><div class="t">Theme</div></div><div class="ctl wide"><div class="segmented" id="pf-theme">${['dark', 'light', 'auto'].map((v) => `<button data-v="${v}" class="${P.theme === v ? 'on' : ''}">${v[0].toUpperCase() + v.slice(1)}</button>`).join('')}</div></div></div>
        </div></div>

      <div class="section"><div class="section-title">Your data</div>
        <div class="card">
          <p class="dim" style="margin:0 0 12px;font-size:13px">${CLOUD() ? 'Your data is saved to your account and synced across your devices. You can also export a backup file.' : 'Everything is stored privately on this device. Export a backup to move it to another phone or browser.'}</p>
          <div class="grid-2"><button class="btn" data-act="export">${icon('download')} Export</button><button class="btn" data-act="import">${icon('upload')} Import</button></div>
          <button class="btn block" style="margin-top:10px" data-act="recalc">${icon('repeat')} Recalculate past workouts</button>
          <button class="btn danger block" style="margin-top:10px" data-act="reset">${icon('trash')} Reset all data</button>
        </div></div>

      <div class="section"><div class="section-title">How calories are calculated</div>
        <div class="card" style="font-size:14px;color:var(--text-2)">
          <p style="margin-top:0"><b style="color:var(--text)">Strength sets</b> = mechanical work (load × gravity × distance × reps, divided by ~18% muscle efficiency, +33% for the lowering phase) + metabolism during the set (MET × bodyweight × time under tension) + elevated burn during rest.</p>
          <p><b style="color:var(--text)">Cardio & holds</b> use MET values from the Compendium of Physical Activities: kcal = MET × kg × hours.</p>
          <p style="margin-bottom:0"><b style="color:var(--text)">Fat:</b> 1 kg of body fat ≈ 7,700 kcal, so grams of fat = kcal ÷ 7.7. These are estimates (±20%). Use them to compare sets and stay consistent, not as lab measurements.</p>
        </div></div>
      <p class="dim" style="text-align:center;font-size:12px;margin-top:22px">BurnSet v1.0 · Built for people who do the math</p>
    `;
    return { top: brandTop('Profile'), html, mount: mountProfile };
  };
  chartFns.weekly = (el) => {
    const wk = startOfWeek();
    const n = 12;
    const data = Array.from({ length: n }, (_, i) => {
      const s = startOfWeek(wk - (n - 1 - i) * 7 * 864e5 + 3600e3 * 12);
      const e = s + 7 * 864e5;
      return { l: fmtDate(s, { day: 'numeric', month: 'short' }), v: S.history.filter((h) => h.start >= s && h.start < e).reduce((a, h) => a + h.kcal, 0) };
    });
    drawBars(el, data, { hi: n - 1, labelEvery: el.clientWidth < 500 ? 3 : 2, height: 170 });
  };
  function mountProfile() {
    const P = S.profile;
    const nm = $('#pf-name'); nm && nm.addEventListener('input', (e) => { P.name = e.target.value.trim(); saveSoon(); });
    $$('.pf-avatar-in').forEach((inp) => inp.addEventListener('change', async () => {
      const f = inp.files[0]; if (!f) return;
      toast('Uploading photo…');
      try { await Cloud.uploadAvatar(f); toast('Profile picture updated'); render(true); }
      catch (e) { toast('Upload failed: ' + (e.message || 'try again')); }
    }));
    $('#pf-bw').addEventListener('change', (e) => { const v = num(e.target.value); if (v && v > 20 && v < 700) { P.weight = fromDisp(v); P.weightAt = Date.now(); save(); render(true); toast('Bodyweight updated'); } else { e.target.value = fmtW(P.weight); toast('Enter a valid bodyweight'); } });
    const seg = (id, key, after) => $('#' + id).addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (!b) return; P[key] = b.dataset.v; save(); after ? after() : render(true); });
    seg('pf-unit', 'unit');
    seg('pf-mode', 'mode');
    seg('pf-dist', 'dist');
    seg('pf-sex', 'sex');
    $('#pf-age').addEventListener('change', (e) => { const v = num(e.target.value); if (v == null) { delete P.age; } else if (v >= 10 && v <= 100) P.age = Math.round(v); else { toast('Enter an age between 10 and 100'); return; } save(); render(true); });
    $('#pf-height').addEventListener('change', (e) => { let v = num(e.target.value); if (v == null) { delete P.height; } else { if (U() === 'lb') v *= 2.54; if (v >= 100 && v <= 250) P.height = Math.round(v); else { toast('Enter a valid height'); return; } } save(); render(true); });
    seg('pf-theme', 'theme', () => { applyTheme(); render(true); });
    $('#pf-gk').addEventListener('change', (e) => { P.weeklyKcal = +e.target.value; save(); });
    $('#pf-gw').addEventListener('change', (e) => { P.weeklyWorkouts = +e.target.value; save(); });
    $('#pf-tempo').addEventListener('change', (e) => { P.tempo = +e.target.value; save(); });
    $('#pf-rest').addEventListener('change', (e) => { P.rest = +e.target.value; save(); });
    $('#pf-incr').addEventListener('change', (e) => { P.includeRest = e.target.checked; save(); });
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({ app: 'burnset', version: 1, exported: new Date().toISOString(), data: S }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `burnset-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Backup downloaded');
  }
  function importData() {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'application/json,.json';
    inp.onchange = async () => {
      const f = inp.files[0]; if (!f) return;
      try {
        const j = JSON.parse(await f.text());
        const d = j.data || j;
        if (!d || !Array.isArray(d.history)) throw new Error('bad');
        if (!(await confirmDialog('Replace your data?', `This backup has ${d.history.length} workouts. It will replace what is on this device.`, 'Import', true))) return;
        localStorage.setItem(KEY, JSON.stringify(d));
        load(); save(); rebuildEx(); applyTheme(); render(); toast('Backup imported');
      } catch (e) { toast('That file is not a valid BurnSet backup'); }
    };
    inp.click();
  }

  /* ================= ONBOARDING ================= */
  function onboarding() {
    const m = openSheet({
      head: false,
      body: `<div style="text-align:center;padding:10px 4px 0">
          <img src="icons/icon.svg" alt="" style="width:56px;height:56px;border-radius:14px">
          <h2 style="font-size:24px;font-weight:650;letter-spacing:-0.03em;margin:18px 0 8px">Weight loss is maths.</h2>
          <p class="muted" style="margin:0 auto 6px;max-width:380px">1 kg of fat ≈ <b style="color:var(--text)">7,700 kcal</b>. BurnSet shows you exactly how many calories every set, rep and cardio minute burns, so you can see your progress add up.</p>
        </div>
        <div style="margin-top:20px;display:flex;flex-direction:column;gap:14px">
          ${CLOUD() ? '' : '<div class="field"><label>Your name (optional)</label><input class="input" id="ob-name" placeholder="e.g. Alex" maxlength="30"></div>'}
          <div class="grid-2">
            <div class="field"><label>Bodyweight</label><input class="input mono" id="ob-bw" inputmode="decimal" placeholder="75"></div>
            <div class="field"><label>Units</label><div class="segmented" id="ob-u"><button class="on" data-v="kg">kg</button><button data-v="lb">lb</button></div></div>
          </div>
          <div class="grid-2">
            <div class="field"><label>Age</label><input class="input mono" id="ob-age" inputmode="numeric" placeholder="25"></div>
            <div class="field"><label id="ob-h-l">Height (cm)</label><input class="input mono" id="ob-h" inputmode="decimal" placeholder="175"></div>
          </div>
          <div class="field"><label>Sex</label><div class="segmented" id="ob-sex"><button data-v="m">Male</button><button data-v="f">Female</button></div><span class="hint">Optional. Age, height and sex personalise your resting metabolism for more accurate calories.</span></div>
        </div>`,
      foot: `<button class="btn primary lg block" data-go>Get started</button>`,
      onClose: () => { S.onboarded = true; save(); },
    });
    let unit = 'kg';
    $('#ob-u', m.el).addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (!b) return; unit = b.dataset.v; $$('#ob-u button', m.el).forEach((x) => x.classList.toggle('on', x === b)); $('#ob-bw', m.el).placeholder = unit === 'kg' ? '75' : '165'; $('#ob-h-l', m.el).textContent = unit === 'kg' ? 'Height (cm)' : 'Height (in)'; $('#ob-h', m.el).placeholder = unit === 'kg' ? '175' : '69'; });
    let sex = null;
    $('#ob-sex', m.el).addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (!b) return; sex = b.dataset.v; $$('#ob-sex button', m.el).forEach((x) => x.classList.toggle('on', x === b)); });
    $('[data-go]', m.el).onclick = () => {
      const v = num($('#ob-bw', m.el).value);
      S.profile.unit = unit;
      if (v && v > 20) { S.profile.weight = unit === 'lb' ? v / LB : v; S.profile.weightAt = Date.now(); }
      const age = num($('#ob-age', m.el).value); if (age && age >= 10 && age <= 100) S.profile.age = Math.round(age);
      let ht = num($('#ob-h', m.el).value); if (ht) { if (unit === 'lb') ht *= 2.54; if (ht >= 100 && ht <= 250) S.profile.height = Math.round(ht); }
      if (sex) S.profile.sex = sex;
      const obn = $('#ob-name', m.el); S.profile.name = obn ? obn.value.trim() : displayName();
      S.onboarded = true; save(); m.close(); render(true);
    };
  }

  /* ================= GLOBAL EVENTS ================= */
  const view = $('#view');
  document.addEventListener('click', async (e) => {
    const a = e.target.closest('[data-act]');
    if (!a) return;
    const act = a.dataset.act;
    const card = a.closest('[data-ex]');
    const eo = card && findEo(card.dataset.ex);
    const row = a.closest('[data-set]');
    const set = eo && row && eo.sets.find((s) => s.id === row.dataset.set);

    switch (act) {
      case 'start-empty':
        if (await guardActive()) startWorkout({ name: defaultName() });
        break;
      case 'start-routine': {
        const r = S.routines.find((x) => x.id === a.dataset.id);
        if (r && (await guardActive())) startWorkout({ name: r.name, items: r.items });
        break;
      }
      case 'new-routine':
        if (await guardActive()) startWorkout({ name: '', mode: 'routine' });
        break;
      case 'routine-menu': {
        const r = S.routines.find((x) => x.id === a.dataset.id); if (!r) break;
        menuSheet(r.name, [
          { label: 'Start workout', icon: 'play', fn: async () => { if (await guardActive()) startWorkout({ name: r.name, items: r.items }); } },
          { label: 'Edit routine', icon: 'edit', fn: async () => { if (await guardActive()) startWorkout({ name: r.name, items: r.items, mode: 'routine', routineId: r.id }); } },
          { label: 'Duplicate', icon: 'copy', fn: () => { S.routines.unshift({ ...JSON.parse(JSON.stringify(r)), id: uid(), name: r.name + ' (copy)' }); save(); render(true); } },
          { label: 'Delete routine', icon: 'trash', danger: true, fn: async () => { if (await confirmDialog('Delete routine?', `"${r.name}" will be removed.`, 'Delete', true)) { S.routines = S.routines.filter((x) => x.id !== r.id); save(); render(true); } } },
        ]);
        break;
      }
      case 'add-ex':
        openPicker({ onPick: addExercisesToActive });
        break;
      case 'finish':
        finishWorkout();
        break;
      case 'discard': {
        const routine = S.active?.mode === 'routine';
        if (await confirmDialog(routine ? 'Discard changes?' : 'Discard workout?', routine ? 'Your routine edits will be lost.' : 'All sets logged in this session will be lost.', 'Discard', true)) { S.active = null; stopRest(); save(); render(); }
        break;
      }
      case 'add-set': {
        const last = eo.sets[eo.sets.length - 1];
        eo.sets.push(newSet(last ? { ...pickSet(last), type: 'n' } : {}));
        save(); render(true);
        break;
      }
      case 'toggle': {
        const ex = getEx(eo.exId);
        const prev = prevMap().get(eo.exId)?.[eo.sets.indexOf(set)];
        if (!set.done) {
          // Adopt placeholder values (previous performance) for empty fields, like Hevy
          const e = effSet(set, prev);
          if (set.w == null && e.w) set.w = e.w;
          if (set.r == null && e.r) set.r = e.r;
          if (set.d == null && e.d) set.d = e.d;
          if (set.i == null && ex.t === 'c') set.i = e.i;
          if (set.km == null && e.km != null) set.km = e.km;
          if (set.g == null && set.el == null) { if (e.g != null) set.g = e.g; else if (e.el != null) set.el = e.el; }
          if (set.pw == null && e.pw != null) set.pw = e.pw;
          if (!hasValue(ex, set)) {
            toast(isDistCardio(ex) ? `Enter time and ${ex.cm === 'row' ? 'metres' : ex.cm === 'bike' ? 'distance or watts' : 'distance'} first` : ex.t === 'c' ? 'Enter minutes first' : ex.t === 'h' ? 'Enter seconds first' : 'Enter reps first');
            break;
          }
          set.done = true;
          navigator.vibrate?.(15);
          // Superset: go to the next exercise in the round; rest only after the last one
          const grp = eo.ss ? S.active.exercises.filter((x) => x.ss === eo.ss) : [];
          const next = grp.length > 1 && grp.indexOf(eo) < grp.length - 1 ? grp[grp.indexOf(eo) + 1] : null;
          if (next) {
            save(); render(true);
            setTimeout(() => $(`[data-ex="${next.uid}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 40);
            break;
          }
          startRest();
        } else set.done = false;
        save(); render(true);
        break;
      }
      case 'fill-prev': {
        const prev = prevMap().get(eo.exId)?.[eo.sets.indexOf(set)];
        if (!prev) break;
        Object.assign(set, { w: prev.w ?? null, r: prev.r ?? null, d: prev.d ?? null, i: prev.i ?? null, km: prev.km ?? null, g: prev.g ?? null, el: prev.el ?? null, pw: prev.pw ?? null });
        save(); render(true);
        break;
      }
      case 'log-guide':
        openLogGuide(getEx(eo.exId));
        break;
      case 'update-bw': {
        const v = num(await promptDialog(`Bodyweight (${U()})`, fmtW(S.profile.weight), 'Save', U()));
        if (v && v > 20 && v < 700) { S.profile.weight = fromDisp(v); S.profile.weightAt = Date.now(); save(); render(true); toast('Bodyweight updated'); }
        else if (v != null) toast('Enter a valid bodyweight');
        break;
      }
      case 'del-set':
        deleteSetRow(a.closest('.set-swipe'));
        break;
      case 'toggle-elev': {
        const ex = getEx(eo.exId);
        eo.elev = !useElev(ex, eo);
        eo.sets.forEach((x) => { if (!x.done) { x.g = null; x.el = null; } });
        save(); render(true);
        toast(eo.elev ? 'Enter elevation gain (m). Incline is worked out for you' : 'Enter the treadmill incline %');
        break;
      }
      case 'set-menu': {
        const types = [['n', 'Normal set'], ['w', 'Warm-up set'], ['d', 'Drop set'], ['f', 'Failure set']];
        menuSheet('Set type', [
          ...types.map(([t, l]) => ({ label: l + (set.type === t ? '  ✓' : ''), icon: t === 'w' ? 'bolt' : t === 'd' ? 'down' : t === 'f' ? 'flame' : 'check', fn: () => { set.type = t; save(); render(true); } })),
          { label: 'Delete set', icon: 'trash', danger: true, fn: () => { eo.sets = eo.sets.filter((s) => s !== set); save(); render(true); } },
        ]);
        break;
      }
      case 'ex-menu': {
        const i = S.active.exercises.indexOf(eo);
        menuSheet(getEx(eo.exId).n, [
          { label: eo.explore ? 'Hide calorie explorer' : 'Calorie explorer', sub: 'See kcal for any reps or minutes', icon: 'flame', fn: () => { eo.explore = !eo.explore; save(); render(true); } },
          ...(S.active.exercises.some((x) => x !== eo && (!eo.ss || x.ss !== eo.ss)) ? [{ label: eo.ss ? 'Add to superset' : 'Superset with…', sub: 'Back-to-back sets, rest after each round', icon: 'repeat', fn: () => pickSuperset(eo) }] : []),
          ...(eo.ss ? [{ label: 'Remove from superset', icon: 'x', fn: () => { eo.ss = null; normalizeSS(S.active.exercises); save(); render(true); } }] : []),
          { label: 'Replace exercise', icon: 'repeat', fn: () => openPicker({ multi: false, title: 'Replace exercise', onPick: ([id]) => { eo.exId = id; save(); render(true); } }) },
          ...(i > 0 ? [{ label: 'Move up', icon: 'up', fn: () => { const a = S.active.exercises; [a[i - 1], a[i]] = [a[i], a[i - 1]]; save(); render(true); } }] : []),
          ...(i < S.active.exercises.length - 1 ? [{ label: 'Move down', icon: 'down', fn: () => { const a = S.active.exercises; [a[i + 1], a[i]] = [a[i], a[i + 1]]; save(); render(true); } }] : []),
          { label: 'Remove exercise', icon: 'trash', danger: true, fn: () => { S.active.exercises = S.active.exercises.filter((x) => x !== eo); normalizeSS(S.active.exercises); save(); render(true); } },
        ]);
        break;
      }
      case 'hist-open':
        openHistory(a.dataset.id);
        break;
      case 'lab-pick':
        openPicker({ multi: false, title: 'Pick an exercise', onPick: ([id]) => { const ex = getEx(id); S.lab.exId = id; if (isDistCardio(ex)) { S.lab.d = 30; S.lab.km = ex.dv * 0.5; S.lab.g = ex.dg || 0; } else if (ex.t === 'c') { S.lab.d = 30; S.lab.i = 1; } else if (ex.t === 'h') { S.lab.d = 60; S.lab.w = 0; } else S.lab.w = refWeight(ex); save(); render(); } });
        break;
      case 'create-ex':
        openCustomForm();
        break;
      case 'edit-username': {
        const name = await promptDialog('Username', displayName(), 'Save', 'username');
        if (!name || name === displayName()) break;
        try { await Cloud.updateUsername(name); S.profile.name = name; save(); render(true); toast('Username updated'); }
        catch (err) { toast(err.message || 'Could not update username'); }
        break;
      }
      case 'sign-out':
        if (S.active && S.active.mode !== 'routine' && !(await confirmDialog('Workout in progress', 'It will be saved to your account and waiting for you when you sign back in.', 'Sign Out'))) break;
        if (!S.active && !(await confirmDialog('Sign out?', 'Your data is saved to your account. Sign in again on any device to get it back.', 'Sign Out', true))) break;
        save();
        await Cloud.signOut();
        location.replace(location.pathname);
        break;
      case 'recalc': {
        if (!S.history.length) { toast('No workouts to recalculate yet'); break; }
        if (!(await confirmDialog('Recalculate past workouts?', 'Updates every logged workout with the latest calorie maths and your current age, sex and height, using the bodyweight you had on each day.', 'Recalculate'))) break;
        let before = 0, after = 0;
        S.history.forEach((h) => {
          const P = { ...S.profile, weight: h.bw || S.profile.weight };
          before += h.kcal || 0; h.kcal = 0;
          h.exercises.forEach((e) => { const ex = getEx(e.exId); e.sets.forEach((x) => { x.k = Calc.setKcal(ex, x, P); h.kcal += x.k; }); });
          after += h.kcal;
        });
        save(); render(true);
        toast(`Updated ${S.history.length} workouts: ${fmtK(before)} → ${fmtK(after)} kcal`);
        break;
      }
      case 'export': exportData(); break;
      case 'import': importData(); break;
      case 'reset':
        if (await confirmDialog('Reset everything?', 'This deletes all workouts, routines and settings on this device. Export a backup first if you want to keep them.', 'Delete everything', true)) {
          localStorage.removeItem(KEY); load(); save(); rebuildEx(); applyTheme(); render(); toast('All data cleared'); onboarding();
        }
        break;
    }
  });
  function defaultName() {
    const h = new Date().getHours();
    return h < 5 ? 'Night Workout' : h < 12 ? 'Morning Workout' : h < 17 ? 'Afternoon Workout' : 'Evening Workout';
  }

  view.addEventListener('input', (e) => {
    const el = e.target;
    if (!S.active) return;
    if (el.matches('[data-wkname]')) { S.active.name = el.value; saveSoon(); return; }
    const card = el.closest('[data-ex]'); if (!card) return;
    const eo = findEo(card.dataset.ex); if (!eo) return;
    if (el.matches('[data-note]')) { eo.note = el.value; el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; saveSoon(); return; }
    const f = el.dataset.f; if (!f) return;
    const row = el.closest('[data-set]');
    const set = eo.sets.find((s) => s.id === row.dataset.set); if (!set) return;
    let v = num(el.value);
    if (v != null && v < 0) v = 0;
    if (f === 'w') set.w = fromDisp(v);
    else if (f === 'r') set.r = v == null ? null : Math.round(v);
    else if (f === 'd') set.d = v;
    else if (f === 'i') set.i = v;
    else if (f === 'km') set.km = distFrom(v);
    else if (f === 'm') set.km = v == null ? null : v / 1000;
    else if (f === 'g') { set.g = v; set.el = null; }
    else if (f === 'el') { set.el = v; set.g = null; }
    else if (f === 'pw') set.pw = v;
    patchSet(eo, set);
    saveSoon();
  });
  // Swipe a set left to reveal delete; swipe all the way to delete it
  const SWIPE_OPEN = 76;
  let sw = null, suppressClick = false;
  function closeRow(row) {
    row.classList.remove('open'); row.style.transform = '';
    const w = row.parentElement; if (!w) return;
    w.classList.remove('arm');
    setTimeout(() => { if (!row.classList.contains('open') && !row.classList.contains('dragging')) w.classList.remove('swiping'); }, 260);
  }
  function deleteSetRow(wrap) {
    if (!wrap) return;
    const card = wrap.closest('[data-ex]');
    const eo = card && findEo(card.dataset.ex);
    if (!eo) return;
    const id = wrap.dataset.set;
    const row = wrap.querySelector('.set-row');
    navigator.vibrate?.(12);
    wrap.style.height = wrap.offsetHeight + 'px';
    row.style.transition = 'transform .2s ease';
    row.style.transform = 'translateX(-105%)';
    requestAnimationFrame(() => { wrap.classList.add('removing'); wrap.style.height = '0px'; });
    setTimeout(() => { eo.sets = eo.sets.filter((x) => x.id !== id); save(); render(true); }, 230);
  }
  view.addEventListener('pointerdown', (e) => {
    const row = e.target.closest('.set-row');
    $$('.set-row.open', view).forEach((r) => { if (r !== row) closeRow(r); });
    if (!row || (e.pointerType === 'mouse' && e.button !== 0)) return;
    sw = { row, pid: e.pointerId, x0: e.clientX, y0: e.clientY, base: row.classList.contains('open') ? -SWIPE_OPEN : 0, x: 0, active: false };
  });
  view.addEventListener('pointermove', (e) => {
    if (!sw || e.pointerId !== sw.pid) return;
    const dx = e.clientX - sw.x0, dy = e.clientY - sw.y0;
    if (!sw.active) {
      if (Math.abs(dx) < 10) return;
      if (Math.abs(dy) > Math.abs(dx) * 0.8) { sw = null; return; }
      sw.active = true;
      sw.row.classList.add('dragging');
      sw.row.parentElement.classList.add('swiping');
      try { sw.row.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      if (document.activeElement && sw.row.contains(document.activeElement)) document.activeElement.blur();
    }
    sw.x = Math.min(0, sw.base + dx);
    sw.row.style.transform = `translateX(${sw.x}px)`;
    sw.row.parentElement.classList.toggle('arm', -sw.x > sw.row.offsetWidth * 0.5);
  });
  function endSwipe(e) {
    if (!sw || e.pointerId !== sw.pid) return;
    const t = sw; sw = null;
    if (!t.active) return;
    t.row.classList.remove('dragging');
    suppressClick = true; setTimeout(() => { suppressClick = false; }, 80);
    if (-t.x > t.row.offsetWidth * 0.5) deleteSetRow(t.row.parentElement);
    else if (-t.x > 36) { t.row.classList.add('open'); t.row.style.transform = `translateX(-${SWIPE_OPEN}px)`; t.row.parentElement.classList.remove('arm'); }
    else closeRow(t.row);
  }
  view.addEventListener('pointerup', endSwipe);
  view.addEventListener('pointercancel', endSwipe);
  view.addEventListener('click', (e) => { if (suppressClick) { e.preventDefault(); e.stopPropagation(); } }, true);

  // Enter key jumps to next input, like a spreadsheet
  view.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !e.target.matches('.cell-in')) return;
    e.preventDefault();
    const ins = $$('.cell-in', view); const i = ins.indexOf(e.target);
    (ins[i + 1] || e.target).focus();
  });
  view.addEventListener('focusin', (e) => { if (e.target.matches('.cell-in')) setTimeout(() => e.target.select(), 0); });

  // Keep state consistent across tabs
  window.addEventListener('storage', (e) => { if (!DEMO && e.key === KEY) { load(); rebuildEx(); render(true); } });
  let lastPull = 0;
  document.addEventListener('visibilitychange', async () => {
    if (document.hidden) { if (S) save(); if (CLOUD()) Cloud.flush(); return; }
    if (!CLOUD() || Cloud.dirty || Date.now() - lastPull < 20000) return;
    lastPull = Date.now();
    try {
      const remote = await Cloud.pull();
      const rd = remote && remote.data;
      if (rd && Array.isArray(rd.history) && (rd.updatedAt || 0) > (S.updatedAt || 0) && !stack.length) {
        localStorage.setItem(KEY, JSON.stringify(rd)); load(); rebuildEx(); applyTheme(); render(true);
      }
    } catch (e) { /* offline */ }
  });

  /* ================= BOOT ================= */
  function startLocal() {
    load();
    rebuildEx();
    if (DEMO) { seedDemoHistory(); document.documentElement.classList.add('demo-frame'); }
    applyTheme();
    render();
    if (!S.onboarded && !DEMO) setTimeout(onboarding, 250);
  }

  async function maybeImportLegacy() {
    let legacy = null;
    try { legacy = JSON.parse(localStorage.getItem(LEGACY_KEY)); } catch (e) { legacy = null; }
    const askedKey = 'burnset:legacyAsked:' + Cloud.user.id;
    if (!legacy || !Array.isArray(legacy.history) || !legacy.history.length || localStorage.getItem(askedKey)) return false;
    localStorage.setItem(askedKey, '1');
    const ok = await confirmDialog('Bring your workouts?', `Found ${legacy.history.length} workout${legacy.history.length === 1 ? '' : 's'} saved on this device before you had an account. Add them to @${displayName()}?`, 'Import');
    if (!ok) return false;
    localStorage.setItem(KEY, JSON.stringify(legacy));
    localStorage.setItem(LEGACY_KEY + ':imported', JSON.stringify(legacy));
    localStorage.removeItem(LEGACY_KEY);
    load(); S.onboarded = true; save(); rebuildEx(); applyTheme(); render(true);
    toast('Workouts imported to your account');
    return true;
  }

  async function afterAuth() {
    KEY = 'burnset:u:' + Cloud.user.id;
    Cloud.onStatus = (st) => { const el = $('#syncStatus'); if (el) el.textContent = syncLabel(st); };
    load();                       // instant paint from this user's local cache
    rebuildEx(); applyTheme(); render();
    try {
      const remote = await Cloud.pull();
      lastPull = Date.now();
      const rd = remote && remote.data;
      const hasRemote = rd && Array.isArray(rd.history);
      if (hasRemote && (rd.updatedAt || 0) > (S.updatedAt || 0)) {
        localStorage.setItem(KEY, JSON.stringify(rd));
        load(); rebuildEx(); applyTheme(); render(true);
      } else if (!hasRemote) {
        const imported = await maybeImportLegacy();
        if (!imported && S.updatedAt) Cloud.push(S);
      } else if ((S.updatedAt || 0) > (rd.updatedAt || 0)) {
        Cloud.push(S);            // this device has newer offline changes
      }
    } catch (e) {
      toast('Offline: your changes will sync when you reconnect');
    }
    if (!S.profile.name && displayName()) { S.profile.name = displayName(); }
    if (Cloud.recovery) { Cloud.showAuth(() => toast('Password updated'), 'newpass'); return; }
    if (!S.onboarded) setTimeout(onboarding, 300);
  }

  async function start() {
    if (!DEMO && window.Cloud && Cloud.libMissing) {
      const box = document.createElement('div');
      box.className = 'auth';
      box.innerHTML = `<div class="auth-card"><img src="icons/icon.svg" alt="" class="auth-logo"><h1 class="auth-title">Can't connect</h1><p class="auth-sub">BurnSet needs an internet connection the first time you sign in.</p><button class="btn primary lg block" onclick="location.reload()">Try Again</button></div>`;
      document.body.appendChild(box);
      return;
    }
    if (DEMO || !window.Cloud || !Cloud.enabled) return startLocal();
    let session = null;
    try { session = await Cloud.init(); } catch (e) { session = null; }
    if (session) return afterAuth();
    Cloud.showAuth(afterAuth);
  }
  start();
})();
