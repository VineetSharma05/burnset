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

  /*
   * Distance-based cardio (ex.cm):
   *   walk / run : ACSM metabolic equations, from speed (distance / time) and grade.
   *                Grade is the incline % entered, or elevation gain / distance.
   *                walking VO2 = 0.1·S + 1.8·S·G     running VO2 = 0.2·S + 0.9·S·G   (S in m/min)
   *                6.4–8 km/h blends walking → running. kcal = VO2 (ml/kg/min) × kg × 5 kcal/L.
   *   bike       : ACSM leg-cycling equation from watts, or Compendium METs from speed.
   *   row        : Concept2 power from pace (W = 2.8 / pace³), ~20% gross efficiency.
   * Returns null when the inputs needed (time + distance, or watts) are missing.
   */
  function cardioModel(ex, set, p) {
    const bw = +p.weight || 75;
    const min = +set.d || 0;
    const km = +set.km || 0;
    if (min <= 0) return null;
    const restPerMin = (3.5 * bw / 1000) * 5;   // 1 MET in kcal/min
    let netPerMin = 0;
    const info = {};
    if (ex.cm === 'walk' || ex.cm === 'run') {
      if (km <= 0) return null;
      const S = (km * 1000) / min;
      const kmh = S * 0.06;
      let G = 0;
      if (set.g != null && set.g !== '') { G = +set.g / 100; info.src = 'incline'; }
      else if (set.el != null && set.el !== '') { G = +set.el / (km * 1000); info.src = 'elevation'; }
      G = Math.max(0, Math.min(G, 0.4));
      const walk = 0.1 * S + 1.8 * S * G;
      const run = 0.2 * S + 0.9 * S * G;
      const t = Math.min(1, Math.max(0, (kmh - 6.4) / 1.6));
      const vo2 = walk * (1 - t) + run * t;
      netPerMin = (vo2 * bw / 1000) * 5;
      Object.assign(info, { kmh, grade: G * 100, vo2, eq: t === 0 ? 'walking' : t === 1 ? 'running' : 'walk→run' });
    } else if (ex.cm === 'bike') {
      if (+set.pw > 0) {
        const vo2 = (1.8 * +set.pw * 6.12) / bw + 7;
        netPerMin = (Math.max(0, vo2 - 3.5) * bw / 1000) * 5;
        Object.assign(info, { watts: +set.pw, vo2 });
      } else if (km > 0) {
        const kmh = km / (min / 60);
        const met = kmh < 16 ? 4 : kmh < 19 ? 6.8 : kmh < 22.5 ? 8 : kmh < 25.7 ? 10 : kmh < 30.6 ? 12 : 15.8;
        netPerMin = (met - 1) * restPerMin;
        Object.assign(info, { kmh, met });
      } else return null;
    } else if (ex.cm === 'row') {
      if (km <= 0) return null;
      const pace = (min * 60) / (km * 1000);    // seconds per metre
      const watts = 2.8 / Math.pow(pace, 3);
      netPerMin = (watts * 60) / 0.2 / J_PER_KCAL;
      Object.assign(info, { watts, split: pace * 500 });
    } else return null;
    return { kcal: (netPerMin + (p.mode === 'gross' ? restPerMin : 0)) * min, info };
  }

  /** Returns { total, mech, active, rest, info? } in kcal */
  function breakdown(ex, set, p) {
    const bw = +p.weight || 75;
    const net = p.mode !== 'gross';
    const off = net ? 1 : 0;
    const z = { total: 0, mech: 0, active: 0, rest: 0 };
    if (!ex || !set) return z;

    if (ex.t === 'c' && ex.cm) {
      const r = cardioModel(ex, set, p);
      if (r) { z.active = r.kcal; z.info = r.info; }
    } else if (ex.t === 'c') {
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

  window.Calc = { cardioModel, breakdown, setKcal, perRep, fatGrams, e1rm, effectiveLoad, KCAL_PER_KG_FAT };
})();
