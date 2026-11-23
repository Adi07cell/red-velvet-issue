/* ==========================================================================
   Core: helpers, particles, toast, modal, reveal, dock, bat hunt
   ========================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const haptic = p => { try { if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
const store = {
  get(k, d) { try { const v = localStorage.getItem('bd22:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('bd22:' + k, JSON.stringify(v)); } catch (e) {} },
};
const waLink = text => `https://wa.me/${CONFIG.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
const centerOf = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

/* ---------- inject art ---------- */
function paintArt(root = document) {
  $$('[data-art]', root).forEach(el => {
    if (el.dataset.painted) return;
    const k = el.dataset.art;
    el.innerHTML = k === 'crown' ? Art.crown() : k === 'seal' ? Art.seal() : k === 'bat' ? Art.cuteBat() :
      k === 'flourish' ? Art.flourish() : Art.icon[k] ? Art.icon[k]() : '';
    el.dataset.painted = 1;
  });
  $$('[data-plush]', root).forEach(el => { if (!el.dataset.painted) { el.innerHTML = Art.plush[el.dataset.plush](); el.dataset.painted = 1; } });
}

/* ---------- grain (drawn once) ---------- */
(function grain() {
  try {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), d = g.createImageData(128, 128);
    for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
    g.putImageData(d, 0, 0);
    $('.grain').style.backgroundImage = `url(${c.toDataURL()})`;
  } catch (e) {}
})();

/* ---------- particles: gold dust, drifting petals, sparkle bursts ---------- */
const FX = (() => {
  const c = $('#fx'), g = c.getContext('2d');
  const COLORS = ['#9E1B32', '#F2C6CC', '#FBF6EE', '#E3C9A0', '#F6D365'];
  let w = 0, h = 0, parts = [], raf = 0, petalClock = 0, ambientOn = false, petalsOn = true;

  function resize() {
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    w = innerWidth; h = innerHeight;
    c.width = w * dpr; c.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const dust = () => ({ k: 'dust', x: rand(0, w), y: rand(0, h), vx: rand(-.08, .08), vy: rand(-.22, -.04), r: rand(.6, 1.7), a: rand(.25, .75), t: rand(0, 6.28), c: pick(COLORS) });
  const petal = () => ({ k: 'petal', x: rand(-20, w), y: -16, vx: rand(.15, .55), vy: rand(.35, .8), r: rand(5, 9), rot: rand(0, 6.28), vr: rand(-.03, .03), sw: rand(0, 6.28), c: pick(['#F4B6C8', '#E05A7A', '#F8D3DE', '#6B1E3A']), life: 1 });

  function star(x, y, r, rot) {
    g.save(); g.translate(x, y); g.rotate(rot); g.beginPath();
    for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * .32 : r; const a = i * Math.PI / 4; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    g.closePath(); g.fill(); g.restore();
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    g.clearRect(0, 0, w, h);
    if (ambientOn && petalsOn && !REDUCED && t - petalClock > 2600 && parts.filter(p => p.k === 'petal').length < 6) { parts.push(petal()); petalClock = t; }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (p.k === 'dust') {
        p.x += p.vx; p.y += p.vy; p.t += .02;
        if (p.y < -5) { p.y = h + 5; p.x = rand(0, w); }
        g.globalAlpha = p.a * (.55 + .45 * Math.sin(p.t)); g.fillStyle = p.c;
        g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fill();
      } else if (p.k === 'petal') {
        p.sw += .02; p.x += p.vx + Math.sin(p.sw) * .4; p.y += p.vy; p.rot += p.vr;
        if (p.y > h + 20) { parts.splice(i, 1); continue; }
        g.globalAlpha = .75; g.fillStyle = p.c;
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.scale(1, .55 + .45 * Math.abs(Math.sin(p.sw * 1.6)));
        g.beginPath(); g.moveTo(0, -p.r); g.bezierCurveTo(p.r, -p.r, p.r * .8, p.r * .6, 0, p.r); g.bezierCurveTo(-p.r * .8, p.r * .6, -p.r, -p.r, 0, -p.r); g.fill(); g.restore();
      } else {
        p.vx *= .985; p.vy = p.vy * .985 + p.grav; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= p.decay;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        g.globalAlpha = Math.min(1, p.life * 1.4); g.fillStyle = p.c;
        if (p.k === 'paper') {
          p.fl += p.fv; g.save(); g.translate(p.x, p.y); g.rotate(p.rot); g.scale(1, Math.cos(p.fl)); g.fillRect(-p.r * .9, -p.r * .4, p.r * 1.8, p.r * .8); g.restore();
        } else if (p.k === 'heart') {
          g.save(); g.translate(p.x, p.y); g.rotate(p.rot); const s = p.r / 8;
          g.beginPath(); g.moveTo(0, 3 * s); g.bezierCurveTo(-8 * s, -3 * s, -4 * s, -9 * s, 0, -4 * s); g.bezierCurveTo(4 * s, -9 * s, 8 * s, -3 * s, 0, 3 * s); g.fill(); g.restore();
        } else star(p.x, p.y, p.r, p.rot);
      }
    }
    g.globalAlpha = 1;
    if (!parts.length && !ambientOn) { cancelAnimationFrame(raf); raf = 0; }
  }
  const run = () => { if (!raf && !document.hidden) raf = requestAnimationFrame(frame); };

  function burst(x, y, n = 36, o = {}) {
    if (REDUCED) n = Math.min(n, 8);
    n = Math.min(n, 80);
    for (let i = 0; i < n; i++) {
      const a = o.up ? rand(-Math.PI * .95, -Math.PI * .05) : rand(0, Math.PI * 2), sp = rand(1.5, o.power || 6);
      parts.push({ k: o.paper ? 'paper' : Math.random() < (o.hearts || 0) ? 'heart' : 'spark', fl: rand(0, 6.28), fv: rand(.08, .2), x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.lift || 1.2),
        grav: o.grav ?? (o.paper ? .045 : .07), r: rand(3, 7.5), rot: rand(0, 6.28), vr: rand(-.15, .15), life: 1, decay: o.paper ? rand(.006, .011) : rand(.012, .022), c: pick(o.colors || COLORS) });
    }
    run();
  }
  function burstAt(el, n, o) { const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; burst(r.left + r.width / 2, r.top + r.height / 2, n, o); }
  function startAmbient() {
    if (REDUCED) return;
    ambientOn = true;
    const n = innerWidth < 600 ? 22 : 36;
    for (let i = 0; i < n; i++) parts.push(dust());
    run();
  }
  addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else run(); });
  resize();
  function ambient(on) {
    if (REDUCED || on === ambientOn) return;
    ambientOn = on;
    if (on) { const n = innerWidth < 600 ? 22 : 36; for (let i = 0; i < n; i++) parts.push(dust()); run(); }
    else parts = parts.filter(p => p.k !== 'dust' && p.k !== 'petal');
  }
  return { burst, burstAt, startAmbient, ambient, petals(on) { petalsOn = on; } };
})();

/* ---------- a little sparkle wherever she taps ---------- */
document.addEventListener('pointerdown', e => {
  if (!document.body.classList.contains('is-open') || e.target.closest('button, a, textarea, input, .game, .cakestage, .bingo, .modal, .lock, .gala__stage')) return;
  FX.burst(e.clientX, e.clientY, 7, { power: 2.6, lift: .6, grav: .03, colors: ['#9E1B32', '#F2C6CC', '#E3C9A0'] });
}, { passive: true });

/* ---------- toast ---------- */
const toast = (() => {
  let t;
  return (msg, ms = 3400) => {
    const el = $('#toast'); el.textContent = msg; el.classList.add('is-on');
    clearTimeout(t); t = setTimeout(() => el.classList.remove('is-on'), ms);
  };
})();

/* ---------- modal ---------- */
const Modal = (() => {
  const m = $('#modal'); let resolve, lastFocus;
  function close() { if (m.hidden) return; m.hidden = true; lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true }); resolve && resolve(); }
  $('#modalClose').addEventListener('click', close);
  m.addEventListener('click', e => { if (e.target === m) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  return {
    open({ art = '', kicker = '', title = '', body = '', button = 'Keep' }) {
      lastFocus = document.activeElement;
      $('#modalArt').innerHTML = art; $('#modalKicker').textContent = kicker; $('#modalTitle').textContent = title;
      $('#modalBody').textContent = body; $('#modalClose').textContent = button;
      m.hidden = false;
      // restart entrance animation
      const card = $('.modal__card', m); card.style.animation = 'none'; card.offsetHeight; card.style.animation = '';
      setTimeout(() => $('#modalClose').focus({ preventScroll: true }), 50);
      return new Promise(r => (resolve = r));
    },
    close,
  };
})();

/* ---------- reveal on scroll + lazy chapter init ---------- */
const Reveal = (() => {
  const hooks = new Map();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      const fn = hooks.get(e.target); if (fn) { fn(); hooks.delete(e.target); }
      io.unobserve(e.target);
    });
  }, { threshold: .18, rootMargin: '0px 0px -8% 0px' });
  return {
    watch(root = document) { $$('.reveal', root).forEach(el => io.observe(el)); },
    when(el, fn) { hooks.set(el, fn); io.observe(el); },
  };
})();

/* ---------- music dock ---------- */
const Dock = (() => {
  function init() {
    const dock = $('#dock'), panel = $('#dockPanel'), info = $('#dockInfo');
    dock.hidden = false;
    $('#dockPlay').addEventListener('click', () => { Music.toggle(); });
    info.addEventListener('click', () => {
      const open = panel.hidden; panel.hidden = !open; info.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', e => { if (!dock.contains(e.target)) { panel.hidden = true; info.setAttribute('aria-expanded', false); } });
    const mini = () => dock.classList.toggle('is-mini', panel.hidden && scrollY > innerHeight * .6 && scrollY + innerHeight < document.documentElement.scrollHeight - 300);
    addEventListener('scroll', mini, { passive: true });
    const moods = $('#dockMoods');
    const autoBtn = document.createElement('button'); autoBtn.textContent = 'Auto'; autoBtn.dataset.mood = 'auto'; autoBtn.className = 'is-auto';
    autoBtn.addEventListener('click', () => { if (!Music.on) Music.start(); Music.setAuto(true); });
    moods.appendChild(autoBtn);
    Object.entries(Music.tracks).forEach(([k, t]) => {
      const b = document.createElement('button'); b.textContent = t.sub; b.dataset.mood = k;
      b.addEventListener('click', () => { if (!Music.on) Music.start(); Music.setMood(k); });
      moods.appendChild(b);
    });
    let last = Music.mood; const heard = new Set([last]);
    Music.subscribe(({ on, mood, auto, track }) => {
      dock.classList.toggle('is-on', on);
      $('#dockPlay').setAttribute('aria-label', on ? 'Pause music' : 'Play music');
      $('#dockTitle').textContent = track.title;
      $('#dockMood').textContent = on ? `${track.sub} · ${auto ? 'follows the story' : 'your pick'}` : `${track.sub} · paused`;
      $$('button', moods).forEach(b => b.setAttribute('aria-pressed', b.dataset.mood === 'auto' ? auto : b.dataset.mood === mood));
      if (on && auto && mood !== last && !heard.has(mood)) { heard.add(mood); toast(`♪ The music changes here — now playing “${track.title}”`, 3000); }
      last = mood;
      $('#dockSongs').innerHTML = ((typeof SONGS !== 'undefined' && SONGS[mood]) || []).map(([s, a]) =>
        `<a href="https://www.youtube.com/results?search_query=${encodeURIComponent(s + ' ' + a)}" target="_blank" rel="noopener">${s} <span>${a} ↗</span></a>`).join('');
    });
  }
  return { init };
})();

/* ---------- blow detector: she literally blows into her phone ---------- */
const Blow = (() => {
  let stream, actx, raf = 0;
  async function start(onBlow, onLevel) {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    actx = new (window.AudioContext || window.webkitAudioContext)();
    const src = actx.createMediaStreamSource(stream), lp = actx.createBiquadFilter(), an = actx.createAnalyser();
    lp.type = 'lowpass'; lp.frequency.value = 600; an.fftSize = 1024;
    src.connect(lp); lp.connect(an);
    const buf = new Float32Array(an.fftSize), t0 = performance.now();
    let floor = .01, held = 0, last = t0;
    (function loop(t) {
      raf = requestAnimationFrame(loop);
      an.getFloatTimeDomainData(buf);
      let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
      const rms = Math.sqrt(s / buf.length), dt = Math.min(64, (t || performance.now()) - last); last = t || performance.now();
      if (performance.now() - t0 < 700) { floor = Math.max(floor, rms); return; }          // learn the room first
      const blowing = rms > Math.max(.045, floor * 3.2);
      held = blowing ? held + dt : Math.max(0, held - dt * 2);
      onLevel && onLevel(Math.min(1, rms / .25), blowing);
      if (held > 140) { onBlow(held); }
    })();
  }
  function stop() { cancelAnimationFrame(raf); try { stream && stream.getTracks().forEach(t => t.stop()); actx && actx.close(); } catch (e) {} stream = actx = null; }
  return { start, stop, supported: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) };
})();

/* ---------- her numbers ---------- */
const Life = (() => {
  const born = new Date(2004, 10, 24);              // 24 Nov 2004
  function stats(now = new Date()) {
    const ms = now - born, days = Math.floor(ms / 864e5);
    return { days, hours: Math.floor(ms / 36e5), heartbeats: Math.round(ms / 6e4 * 75), weekday: born.toLocaleDateString('en-GB', { weekday: 'long' }) };
  }
  return { born, stats };
})();
