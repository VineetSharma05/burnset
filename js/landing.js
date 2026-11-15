/* BurnSet landing page interactions */
(function () {
  'use strict';
  const $ = (s) => document.querySelector(s);

  // Nav hairline on scroll
  const nav = $('#gnav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Scroll reveal
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        if (e.target.dataset.count) countUp(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  function countUp(el) {
    const end = +el.dataset.count;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t0 = performance.now(), dur = 1600;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(end * e).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Live demo iframe: load when near the viewport
  const frame = $('#demoFrame');
  if (frame) {
    const load = () => { if (!frame.src) frame.src = frame.dataset.src; };
    frame.addEventListener('load', () => { const l = frame.parentElement.querySelector('.loading'); if (l) l.remove(); });
    if ('IntersectionObserver' in window) {
      const fo = new IntersectionObserver((es) => { if (es[0].isIntersecting) { load(); fo.disconnect(); } }, { rootMargin: '300px' });
      fo.observe(frame);
    } else load();
  }

  // Mini chart in the Burn Lab tile
  const mc = $('#miniChart');
  if (mc) {
    let h = '';
    for (let i = 1; i <= 20; i++) h += `<i class="${i === 10 ? 'on' : ''}" style="height:${Math.round(12 + i * 4.3)}%"></i>`;
    mc.innerHTML = h;
  }

  // Calculator
  if (!window.Calc || !window.EXERCISES) return;
  const PICKS = [
    'bench-press-barbell', 'squat-barbell', 'deadlift-barbell', 'overhead-press-barbell', 'bent-over-row-barbell',
    'hip-thrust-barbell', 'leg-press-machine', 'lat-pulldown-cable', 'bicep-curl-dumbbell', 'lateral-raise-dumbbell',
    'kettlebell-swing', 'thruster-dumbbell', 'pull-up', 'push-up', 'chest-dip', 'burpee', 'air-squat',
  ];
  const exById = new Map(EXERCISES.map((e) => [e.id, e]));
  const list = PICKS.map((id) => exById.get(id)).filter(Boolean);
  const sel = $('#cx');
  sel.innerHTML = list.map((e) => `<option value="${e.id}">${e.n}</option>`).join('');

  const els = { bw: $('#cbw'), w: $('#cw'), r: $('#cr') };
  const prof = { weight: 80, tempo: 3, rest: 90, includeRest: true, mode: 'net' };
  els.bw.value = 80;
  const fill = (el) => el.style.setProperty('--p', ((el.value - el.min) / (el.max - el.min)) * 100 + '%');
  const fmt = (k) => (k < 10 ? k.toFixed(1) : Math.round(k).toLocaleString('en-US'));
  const DEFAULT_W = { 'bench-press-barbell': 60, 'squat-barbell': 80, 'deadlift-barbell': 100, 'overhead-press-barbell': 40, 'bent-over-row-barbell': 50, 'hip-thrust-barbell': 80, 'leg-press-machine': 120, 'lat-pulldown-cable': 50, 'bicep-curl-dumbbell': 12, 'lateral-raise-dumbbell': 8, 'kettlebell-swing': 16, 'thruster-dumbbell': 12 };

  function update() {
    const ex = exById.get(sel.value);
    prof.weight = +els.bw.value;
    const set = { w: +els.w.value, r: +els.r.value };
    const k = Calc.setKcal(ex, set, prof);
    const extra = Calc.perRep(ex, set.w, prof);
    $('#cbw-v').textContent = els.bw.value;
    $('#cw-v').textContent = els.w.value;
    $('#cr-v').textContent = els.r.value;
    $('#co-k').textContent = fmt(k);
    $('#co-g').textContent = (Calc.fatGrams(k)).toFixed(1) + ' g';
    $('#co-r').textContent = '+' + extra.toFixed(1);
    $('#co-s').textContent = k > 0 ? Math.ceil(7700 / k).toLocaleString('en-US') : '—';
    Object.values(els).forEach(fill);
  }
  sel.addEventListener('change', () => {
    const ex = exById.get(sel.value);
    const bodyweight = ex.t !== 'w';
    $('#cw-l').textContent = bodyweight ? 'Added weight' : 'Weight';
    els.w.value = bodyweight ? 0 : (DEFAULT_W[ex.id] ?? 20);
    update();
  });
  Object.values(els).forEach((el) => el.addEventListener('input', update));
  update();
})();
