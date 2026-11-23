/* ==========================================================================
   Live band, version 2. Everything is synthesised in her browser:
   music box, Rhodes-style electric piano, strings, bass, drums, shaker.
   Tracks are registered from tracks.js with Music.define().
   ========================================================================== */
const Music = (() => {
  let ctx, master, musicBus, sfxBus, reverbIn, noiseBuf;
  let on = false, mood = null, timer = null, auto = true, zoneMood = null, paused = false, switchTimer = null;
  let events = [], cursor = 0, loopStart = 0, loopBeats = 0, spb = .5, track = null;
  const TRACKS = {}, listeners = new Set();
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  /* ---------- chord names → notes ("Cmaj7", "Am9", "F#m7b5", "G/B") ---------- */
  const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const Q = {
    '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], m9: [0, 3, 7, 10, 14],
    maj9: [0, 4, 7, 11, 14], 9: [0, 4, 7, 10, 14], 6: [0, 4, 7, 9], m6: [0, 3, 7, 9], 69: [0, 4, 7, 9, 14], dim: [0, 3, 6],
    dim7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10], sus4: [0, 5, 7], sus2: [0, 2, 7], add9: [0, 4, 7, 14], aug: [0, 4, 8],
    '7sus4': [0, 5, 7, 10], mmaj7: [0, 3, 7, 11], 13: [0, 4, 10, 14, 21], '7b9': [0, 4, 7, 10, 13],
  };
  const pcOf = s => (PC[s[0]] + (s[1] === '#' ? 1 : s[1] === 'b' ? -1 : 0) + 12) % 12;
  const cache = {};
  function chord(name) {
    if (cache[name]) return cache[name];
    const mm = /^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/.exec(name);
    const root = pcOf(mm[1]), iv = Q[mm[2]] || Q[''];
    const bassPc = mm[3] ? pcOf(mm[3]) : root;
    const b = 43 + ((bassPc - 7) % 12 + 12) % 12;                 // bass between G2 and F#3
    const r0 = 57 + ((root - 9) % 12 + 12) % 12;                  // voicing root between A3 and G#4
    let v = iv.map(i => r0 + i).map(n => (n > 77 ? n - 12 : n));
    if (v.length > 3) v = v.filter((n, i) => i !== 0);            // rootless, jazzier voicing (bass has the root)
    v = [...new Set(v)].sort((x, y) => x - y);
    return (cache[name] = { b, v, u: v.slice(-2), a: [b + 12, ...v].slice(0, 4), fifth: b + 7, third: b + (iv[1] || 4) });
  }

  /* ---------- compile a track into timed events ---------- */
  function compile(t) {
    const ev = [], meter = t.meter || 4, sw = t.swing || 0;
    const swing = s => (s % 4 === 2 ? sw * .25 : 0) + (s % 2 === 1 ? sw * .1 : 0);
    let beat = 0;
    for (const [m, d] of t.mel) { if (m) ev.push({ beat, k: 'mel', m, d }); beat += d; }
    loopBeats = beat; beat = 0;
    for (const [name, d] of t.chords) {
      const c = chord(name);
      if (t.style === 'waltz') {
        ev.push({ beat, k: 'tine', m: c.b, vel: .45, len: 1.6 });
        for (let i = 1; i < d; i++) ev.push({ beat: beat + i, k: 'tines', ms: c.u, vel: .2, len: .9 });
      } else if (t.style === 'arp') {
        ev.push({ beat, k: 'tine', m: c.b, vel: .45, len: 1.6 });
        const pat = [0, 1, 2, 3, 2, 1];
        for (let i = 0; i < d * 2; i++) ev.push({ beat: beat + i / 2, k: 'tine', m: c.a[pat[i % 6]] + 12, vel: .2, len: 1.6 });
      } else if (t.style === 'groove') {
        const steps = Math.round(d * 4);
        for (const s of t.comp.steps) if (s < steps) ev.push({ beat: beat + s / 4 + swing(s), k: 'comp', ms: c.v, len: t.comp.len || .5, vel: t.comp.vel || .5 });
        for (const [s, deg] of t.bass) if (s < steps) ev.push({ beat: beat + s / 4 + swing(s), k: 'bass', m: deg === '5' ? c.fifth : deg === '8' ? c.b + 12 : deg === '3' ? c.third : c.b, len: (t.bassLen || .45) });
      }
      if (t.strings) ev.push({ beat, k: 'strings', ms: [c.b + 12, ...c.v.slice(-2)], d });
      if (t.style !== 'groove') ev.push({ beat, k: 'warmbass', m: c.b, d });
      beat += d;
    }
    if (t.drums) {
      const bars = Math.round(loopBeats / meter);
      for (let bar = 0; bar < bars; bar++) for (const [kind, steps] of Object.entries(t.drums))
        for (const s of steps) ev.push({ beat: bar * meter + s / 4 + swing(s), k: 'drum', kind, vel: s % 4 === 0 ? 1 : .75 });
    }
    return ev.sort((a, b) => a.beat - b.beat);
  }

  /* ---------- graph ---------- */
  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3;
    master = ctx.createGain(); master.gain.value = .0001;
    const felt = ctx.createBiquadFilter(); felt.type = 'lowpass'; felt.frequency.value = 5200; felt.Q.value = .5;
    musicBus = ctx.createGain(); sfxBus = ctx.createGain(); sfxBus.gain.value = .8;
    const verb = ctx.createConvolver(); verb.buffer = impulse(2.8, 2.6);
    reverbIn = ctx.createGain(); reverbIn.gain.value = .3;
    musicBus.connect(felt); felt.connect(master); felt.connect(reverbIn);
    sfxBus.connect(master); sfxBus.connect(reverbIn);
    reverbIn.connect(verb); verb.connect(master);
    master.connect(comp); comp.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else if (on) ctx.resume(); });
    return true;
  }
  function impulse(sec, decay) {
    const rate = ctx.sampleRate, len = Math.floor(rate * sec), buf = ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c); let y = 0;
      for (let i = 0; i < len; i++) { const k = i / len; y += (.55 - .45 * k) * ((Math.random() * 2 - 1) - y); d[i] = y * 1.7 * Math.pow(1 - k, decay); }
    }
    return buf;
  }

  /* ---------- instruments ---------- */
  function env(g, t, peak, attack, len) {
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(.0001, t + len);
  }
  function tine(t, m, vel = 1, len = 1.8, dest = musicBus) {
    const f = hz(m), g = ctx.createGain(); env(g, t, .2 * vel, .004, len); g.connect(dest);
    const o1 = ctx.createOscillator(); o1.frequency.value = f;
    const o2 = ctx.createOscillator(); o2.type = 'triangle'; o2.frequency.value = f * 2;
    const g2 = ctx.createGain(); g2.gain.value = .07;
    const o3 = ctx.createOscillator(); o3.frequency.value = f * 4.07;
    const g3 = ctx.createGain(); env(g3, t, .05 * vel, .003, .22);
    o1.connect(g); o2.connect(g2); g2.connect(g); o3.connect(g3); g3.connect(dest);
    for (const o of [o1, o2, o3]) { o.start(t); o.stop(t + len + .05); }
  }
  // Rhodes-ish electric piano: 1:1 FM with a decaying index + a tiny bell "tine" at the attack.
  function ep(t, m, vel = .5, len = 1.4, dest = musicBus) {
    const f = hz(m), car = ctx.createOscillator(), mod = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain();
    car.frequency.value = f; mod.frequency.value = f;
    mg.gain.setValueAtTime(f * 1.5 * vel + 20, t); mg.gain.exponentialRampToValueAtTime(f * .05 + 1, t + .6);
    mod.connect(mg); mg.connect(car.frequency);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.15 * vel, t + .006);
    g.gain.exponentialRampToValueAtTime(.055 * vel, t + .4); g.gain.exponentialRampToValueAtTime(.0001, t + len);
    car.connect(g); g.connect(dest);
    const bell = ctx.createOscillator(), bg = ctx.createGain(); bell.frequency.value = f * 7.02; env(bg, t, .018 * vel, .002, .09);
    bell.connect(bg); bg.connect(dest);
    for (const o of [car, mod, bell]) { o.start(t); o.stop(t + len + .05); }
  }
  function strings(t, ms, dur, cut = 1500, gain = .009) {
    const rel = 1.2, end = t + dur + rel + .05;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = .6;
    lp.frequency.setValueAtTime(cut * .5, t); lp.frequency.linearRampToValueAtTime(cut, t + Math.min(1.2, dur * .6)); lp.connect(musicBus);
    const lfo = ctx.createOscillator(), depth = ctx.createGain(); lfo.frequency.value = 4.6; depth.gain.value = 6; lfo.connect(depth);
    ms.forEach((m, i) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(gain, t + Math.min(.7, dur * .45));
      g.gain.setValueAtTime(gain, t + dur); g.gain.linearRampToValueAtTime(.0001, t + dur + rel);
      const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (p) { p.pan.value = [-.45, .45, 0][i % 3]; g.connect(p); p.connect(lp); } else g.connect(lp);
      for (const det of [-9, 8]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = det; depth.connect(o.detune); o.connect(g); o.start(t); o.stop(end); }
    });
    lfo.start(t); lfo.stop(end);
  }
  function warmBass(t, m, dur) {
    const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 480; lp.connect(musicBus); g.connect(lp);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.07, t + .05); g.gain.exponentialRampToValueAtTime(.03, t + dur); g.gain.linearRampToValueAtTime(.0001, t + dur + .6);
    const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = hz(m);
    const o2 = ctx.createOscillator(); o2.frequency.value = hz(m - 12);
    for (const o of [o1, o2]) { o.connect(g); o.start(t); o.stop(t + dur + .7); }
  }
  function pbass(t, m, len = .45) {     // round plucked bass for grooves
    const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(320, t + len);
    lp.connect(musicBus); g.connect(lp); env(g, t, .16, .008, len + .15);
    const o1 = ctx.createOscillator(); o1.type = 'triangle'; o1.frequency.value = hz(m);
    const o2 = ctx.createOscillator(); o2.frequency.value = hz(m - 12);
    const g2 = ctx.createGain(); g2.gain.value = .9; o2.connect(g2); g2.connect(g);
    o1.connect(g); for (const o of [o1, o2]) { o.start(t); o.stop(t + len + .2); }
  }
  function voice(t, m, dur, gain, oct = -12) {
    const g = ctx.createGain(), lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1900; lp.connect(musicBus); g.connect(lp);
    const len = Math.max(.25, dur);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(gain, t + .08); g.gain.setValueAtTime(gain, t + len * .7); g.gain.linearRampToValueAtTime(.0001, t + len + .35);
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = hz(m + oct);
    const vib = ctx.createOscillator(), vd = ctx.createGain(); vib.frequency.value = 5.2; vd.gain.value = 7; vib.connect(vd); vd.connect(o.detune);
    o.connect(g); for (const x of [o, vib]) { x.start(t); x.stop(t + len + .4); }
  }
  function noise(t, dur, type, f0, f1, gain, q = 1, dest = musicBus) {
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter(); bp.type = type; bp.Q.value = q;
    bp.frequency.setValueAtTime(f0, t); bp.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(bp); bp.connect(g); g.connect(dest); s.start(t, Math.random() * .5); s.stop(t + dur + .02);
  }
  function blip(t, f0, f1, dur, gain, type = 'sine', dest = musicBus) {
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + .02);
  }
  function drum(t, kind, vel = 1) {
    if (kind === 'kick') { blip(t, 140, 46, .32, .55 * vel); noise(t, .012, 'highpass', 3000, 3000, .08 * vel); }
    else if (kind === 'snare') { noise(t, .17, 'bandpass', 2000, 1500, .26 * vel, .8); blip(t, 210, 160, .09, .1 * vel, 'triangle'); }
    else if (kind === 'clap') { [0, .012, .026].forEach(d => noise(t + d, .11, 'bandpass', 1400, 1100, .16 * vel, 1.2)); }
    else if (kind === 'rim') { blip(t, 1750, 1650, .045, .09 * vel); blip(t, 820, 800, .04, .05 * vel, 'triangle'); }
    else if (kind === 'hat') noise(t, .045, 'highpass', 7800, 7800, .07 * vel);
    else if (kind === 'ohat') noise(t, .22, 'highpass', 7200, 7200, .05 * vel);
    else if (kind === 'shaker') noise(t, .07, 'bandpass', 5600, 5600, .05 * vel, 1.4);
  }

  /* ---------- scheduler ---------- */
  const timeOf = e => loopStart + e.beat * spb;
  function tick() {
    if (!on || paused || !events.length) return;
    if (track.crackle && Math.random() < .09) noise(ctx.currentTime + .05 + Math.random() * .1, .012, 'highpass', 4200, 4200, .02 + Math.random() * .04);
    const horizon = ctx.currentTime + .2;
    while (timeOf(events[cursor]) < horizon) {
      const e = events[cursor], t = Math.max(timeOf(e), ctx.currentTime + .01), T = track;
      if (e.k === 'mel') {
        const inst = T.lead || 'tine';
        if (inst === 'ep') ep(t, e.m, .75, Math.max(.8, e.d * spb + .6));
        else if (inst === 'flute') voice(t, e.m, e.d * spb, T.leadGain || .045, 0);
        else tine(t, e.m, .9, 2.4);
        if (T.voice) voice(t, e.m, e.d * spb, T.voice, T.voiceOct ?? -12);
      }
      else if (e.k === 'tine') tine(t, e.m, e.vel, e.len);
      else if (e.k === 'tines') e.ms.forEach(m => tine(t, m, e.vel, e.len));
      else if (e.k === 'comp') e.ms.forEach(m => (T.comp.inst === 'tine' ? tine : ep)(t, m, e.vel * .8, e.len + .3));
      else if (e.k === 'bass') pbass(t, e.m, e.len);
      else if (e.k === 'strings') strings(t, e.ms, e.d * spb, T.stringsCut, T.strings);
      else if (e.k === 'warmbass') warmBass(t, e.m, e.d * spb);
      else if (e.k === 'drum') drum(t, e.kind, e.vel * (T.drumVel || 1));
      cursor++;
      if (cursor >= events.length) { cursor = 0; loopStart += loopBeats * spb; }
    }
  }
  function load(name) { track = TRACKS[name]; spb = 60 / track.bpm; events = compile(track); cursor = 0; loopStart = ctx.currentTime + .25; }
  function emit() { listeners.forEach(fn => fn({ on, mood, auto, track: TRACKS[mood] })); }

  /* ---------- public ---------- */
  function start(m) {                         // call from a tap
    if (!ctx && !build()) return;
    ctx.resume(); on = true;
    if (m) mood = zoneMood = m;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(Math.max(master.gain.value, .0001), ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(.9, ctx.currentTime + 1.4);
    musicBus.gain.value = 1; load(mood);
    clearInterval(timer); timer = setInterval(tick, 40); emit();
  }
  function stop() {
    if (!ctx) return; on = false; clearInterval(timer);
    master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .4);
    setTimeout(() => { if (!on) ctx.suspend(); }, 450); emit();
  }
  function setMood(m, opts = {}) {
    if (!TRACKS[m]) return;
    if (!opts.auto) auto = false;
    if (m === mood) { emit(); return; }
    mood = m;
    if (on) {
      const t = ctx.currentTime;
      musicBus.gain.cancelScheduledValues(t); musicBus.gain.setValueAtTime(Math.max(musicBus.gain.value, .0001), t);
      musicBus.gain.exponentialRampToValueAtTime(.0001, t + .6);
      paused = true; clearTimeout(switchTimer);
      switchTimer = setTimeout(() => {
        load(mood); paused = false;
        const t2 = ctx.currentTime; musicBus.gain.cancelScheduledValues(t2); musicBus.gain.setValueAtTime(.0001, t2);
        musicBus.gain.exponentialRampToValueAtTime(1, t2 + 1.2);
      }, 650);
    }
    emit();
  }
  const ready = () => ctx && on, now = () => ctx.currentTime;
  const sfx = {
    chime() { if (!ready()) return; const t = now(); [84, 88, 91, 96].forEach((m, i) => tine(t + i * .06, m, .5, 1.2, sfxBus)); },
    win() { if (!ready()) return; const t = now(); [72, 76, 79, 84, 88, 91].forEach((m, i) => tine(t + i * .07, m, .6, 1.6, sfxBus)); },
    pop() { if (!ready()) return; blip(now(), 900, 260, .12, .25, 'sine', sfxBus); },
    tap() { if (!ready()) return; blip(now(), 1400, 900, .05, .08, 'triangle', sfxBus); },
    whoosh() { if (!ready()) return; noise(now(), .35, 'bandpass', 500, 2400, .22, .8, sfxBus); },
    rip() { if (!ready()) return; const t = now(); for (let i = 0; i < 5; i++) noise(t + i * .035, .06, 'bandpass', 2500 + i * 300, 1800, .25, 1.4, sfxBus); },
    shutter() { if (!ready()) return; const t = now(); noise(t, .04, 'highpass', 5000, 5000, .5, .7, sfxBus); noise(t + .06, .05, 'highpass', 4000, 4000, .35, .7, sfxBus); },
    paper() { if (!ready()) return; noise(now(), .25, 'highpass', 3000, 6000, .12, .7, sfxBus); },
    thud() { if (!ready()) return; blip(now(), 150, 50, .3, .4, 'sine', sfxBus); },
    clink() { if (!ready()) return; const t = now(); [2637, 3520, 4186].forEach((f, i) => blip(t + i * .004, f, f * .99, .9, .05, 'sine', sfxBus)); },
    pour() { if (!ready()) return; noise(now(), .6, 'bandpass', 900, 500, .12, 2, sfxBus); },
    stack() { if (!ready()) return; const t = now(); blip(t, 220, 120, .12, .3, 'sine', sfxBus); noise(t, .04, 'lowpass', 1200, 400, .15, .7, sfxBus); },
    fail() { if (!ready()) return; const t = now(); blip(t, 400, 180, .4, .14, 'triangle', sfxBus); },
    blow() { if (!ready()) return; noise(now(), .7, 'lowpass', 1600, 200, .35, .5, sfxBus); },
    pageturn() { if (!ready()) return; noise(now(), .18, 'highpass', 3000, 6000, .12, .7, sfxBus); },
  };

  return {
    define(name, t) { TRACKS[name] = t; if (!mood) mood = zoneMood = name; },
    start, stop, setMood, sfx, chord,
    zone(m) { zoneMood = m; if (auto) setMood(m, { auto: true }); },
    setAuto(v) { auto = v; if (v) setMood(zoneMood, { auto: true }); emit(); },
    toggle() { on ? stop() : start(); },
    get on() { return on; }, get mood() { return mood; }, get auto() { return auto; }, get tracks() { return TRACKS; },
    subscribe(fn) { listeners.add(fn); fn({ on, mood, auto, track: TRACKS[mood] }); },
  };
})();
