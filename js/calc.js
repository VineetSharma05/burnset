/*
 * Calorie engine.
 *
 * Strength set  = mechanical work + active metabolism during the set + rest-period metabolism
 *   mechanical  = load(kg) * g * ROM(m) * reps * 1.33 (eccentric cost) / 0.18 (muscle efficiency) / 4184
 *   active      = (MET - 1) * bodyweight * set-time(h)          [net, i.e. above resting]
 *   rest        = 1.0 net MET * bodyweight * rest-time(h)        [elevated HR between sets]
 * Hold / carry  = (MET - 1) * (bodyweight + load) * time(h)
 * Cardio        = (MET - 1) * bodyweight * time(h)
 *
 * "Gross" mode adds the 1 MET you would have burned anyway (resting metabolism).
 * 7700 kcal ≈ 1 kg of body fat.
 */
(function () {
  const G = 9.81;
  const ECC = 1.33;
  const EFF = 0.18;
  const J_PER_KCAL = 4184;
  const KCAL_PER_KG_FAT = 7700;

  function effectiveLoad(ex, set, bw) {
    const w = +set.w || 0;
    if (ex.t === 'w') return w + ex.b * bw;
    if (ex.t === 'bw') return ex.b * bw + w;
    if (ex.t === 'a') return Math.max(0, ex.b * bw - w);
    return 0;
  }

  /** Returns { total, mech, active, rest } in kcal */
  function breakdown(ex, set, p) {
    const bw = +p.weight || 75;
    const net = p.mode !== 'gross';
    const off = net ? 1 : 0;
    const z = { total: 0, mech: 0, active: 0, rest: 0 };
    if (!ex || !set) return z;

    if (ex.t === 'c') {
      const met = ex.k[set.i ?? 1] ?? ex.k[1];
      const h = (+set.d || 0) / 60;
      z.active = Math.max(0, met - off) * bw * h;
    } else if (ex.t === 'h') {
      const h = (+set.d || 0) / 3600;
      z.active = Math.max(0, ex.k - off) * (bw + (+set.w || 0)) * h;
      if (p.includeRest && set.d > 0) z.rest = (2 - off) * bw * (p.rest / 3600);
    } else {
      const reps = +set.r || 0;
      if (reps <= 0) return z;
      const load = effectiveLoad(ex, set, bw);
      z.mech = (load * G * ex.r * reps * ECC) / EFF / J_PER_KCAL;
      z.active = Math.max(0, ex.k - off) * bw * ((reps * p.tempo) / 3600);
      if (p.includeRest) z.rest = (2 - off) * bw * (p.rest / 3600);
    }
    z.total = z.mech + z.active + z.rest;
    return z;
  }

  const setKcal = (ex, set, p) => breakdown(ex, set, p).total;

  /** kcal for one more rep (marginal cost) */
  function perRep(ex, w, p) {
    if (ex.t === 'c' || ex.t === 'h') return 0;
    return setKcal(ex, { w, r: 11 }, p) - setKcal(ex, { w, r: 10 }, p);
  }

  const fatGrams = (kcal) => (kcal / KCAL_PER_KG_FAT) * 1000;

  /** Estimated 1RM (Epley) */
  const e1rm = (w, r) => (r > 0 && w > 0 ? (r === 1 ? w : w * (1 + r / 30)) : 0);

  window.Calc = { breakdown, setKcal, perRep, fatGrams, e1rm, effectiveLoad, KCAL_PER_KG_FAT };
})();
