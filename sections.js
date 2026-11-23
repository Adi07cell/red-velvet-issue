/* ==========================================================================
   Sections: lock screen, cover, feed, gala, bingo, receipt, cake, letter
   ========================================================================== */

/* ---------------- LOCK SCREEN ---------------- */
const Lock = (() => {
  let opened = false;
  const pad = v => String(v).padStart(2, '0');
  function clock() { const d = new Date(); $('#lockTime').textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
  function init(onOpen) {
    clock(); const tick = setInterval(() => { if (!$('#lockTime')) return clearInterval(tick); clock(); }, 15000);
    $('#notifs').innerHTML = NOTIFS.map((n, i) => `
      <button class="notif" role="listitem" style="animation-delay:${(.9 + i * .55).toFixed(2)}s">
        <span class="notif__icon${n.icon === 'xo' ? ' notif__icon--xo' : ''}">${n.icon === 'xo' ? 'XO' : Art.icon[n.icon]()}</span>
        <span class="notif__meta"><span>${n.app}</span><span>${n.time}</span></span>
        <span class="notif__title">${n.title}</span>
        <span class="notif__body">${n.body}</span>
      </button>`).join('');
    requestAnimationFrame(() => $$('.notif').forEach(n => n.classList.add('in')));
    const open = () => { if (opened) return; opened = true; onOpen(); };
    $$('.notif').forEach(b => b.addEventListener('click', open));
    $('#unlock').addEventListener('click', open);
    const lock = $('#lock'); let y0 = null;
    lock.addEventListener('pointerdown', e => (y0 = e.clientY));
    lock.addEventListener('pointerup', e => { if (y0 != null && y0 - e.clientY > 60) open(); y0 = null; });
  }
  return { init };
})();

/* ---------------- COVER ---------------- */
const Cover = (() => {
  function init() {
    const m = $('#masthead');
    m.innerHTML = CONFIG.name.toUpperCase().split('').map((c, i) => `<span style="--i:${i}">${c}</span>`).join('');
  }
  return { init };
})();

/* ---------------- FEED ---------------- */
const Feed = (() => {
  const BLASTS = [
    ['00:00', 'Spotted: <em>R.</em>, arriving on a Wednesday in 2004. On Wednesdays we wear pink — she’s been on brand since day one.'],
    ['00:01', 'Spotted: <em>8,035 days</em> of R. on this planet, and not a single boring one. We checked. Thoroughly.'],
    ['00:02', 'Spotted: the <em>piña colada</em> celebrating its 50th birthday the year R. was born. Some pairings are written in the stars.'],
    ['00:04', 'Spotted: <em>Darwin</em> publishing Origin of Species on 24 November. The biotech department calls it a coincidence. We call it foreshadowing.'],
    ['00:06', 'Spotted: a <em>Sagittarius</em> — funny, curious, honest to the point of blunt. Sources confirm: accurate.'],
    ['00:07', 'Spotted: a <em>topaz</em> birthstone. Golden, rare, a little dangerous in the right light. Suits her.'],
    ['00:09', 'Spotted: R. halfway through <em>Gossip Girl</em>, already picking sides. We’ll never tell whose.'],
    ['00:12', `Spotted: someone in <em>${CONFIG.from}</em> acting very casual about whether she’s opened this yet. Nobody’s buying it.`],
  ];
  function init() {
    $('#blasts').innerHTML = BLASTS.map(([t, html], i) => `<article class="blast${i === BLASTS.length - 1 ? ' blast--last' : ''}">
      <p class="blast__meta mono"><b>Gossip</b><span>${t}</span></p><p>${html}</p></article>`).join('');
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in'); io.unobserve(e.target);
      if (e.target.classList.contains('blast--last')) Music.sfx.chime(); else Music.sfx.tap();
    }), { threshold: .4 });
    $$('.blast').forEach(b => io.observe(b));
  }
  return { init };
})();

/* ---------------- PEARL DNA DIVIDERS ---------------- */
const Pearls = (() => {
  const sets = [];
  function init() {
    $$('[data-pearls]').forEach(el => {
      const pearls = [];
      for (let i = 0; i < 18; i++) { const p = document.createElement('i'); el.appendChild(p); pearls.push(p); }
      sets.push({ el, pearls });
    });
    let ticking = false;
    const draw = () => {
      ticking = false;
      sets.forEach(({ el, pearls }) => {
        const ph = el.getBoundingClientRect().top / 90;
        pearls.forEach((p, i) => {
          const k = i >> 1, a = k * .78 + ph + (i % 2) * Math.PI, z = Math.cos(a);
          p.style.left = (k / 8 * 100).toFixed(2) + '%';
          p.style.transform = `translateY(${(Math.sin(a) * 22).toFixed(1)}px) scale(${(.7 + .35 * (z + 1) / 2).toFixed(2)})`;
          p.style.zIndex = z > 0 ? 2 : 1; p.style.opacity = (.55 + .45 * (z + 1) / 2).toFixed(2);
        });
      });
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }, { passive: true });
    draw();
  }
  return { init };
})();

/* ---------------- GALA ---------------- */
const Gala = (() => {
  const st = { silhouette: 'mermaid', color: 'ivory', shoes: 'both', band: false };
  let firstShoe = true, looks = store.get('looks', []);
  const col = id => GALA.color.find(c => c[0] === id);
  const sil = id => GALA.silhouette.find(s => s[0] === id);
  const pos = { stilettos: '16.6%', both: '50%', sneakers: '83.3%' };
  function caption() {
    const c = col(st.color)[1].toLowerCase();
    return `Spotted: <b>R.</b> on the Met steps in ${/^[aeiou]/.test(c) ? 'an' : 'a'} ${c} ${sil(st.silhouette)[1].toLowerCase()} ${GALA.shoeLine[st.shoes]}${st.band ? ' — and a headband, naturally' : ''}.`;
  }
  function render() {
    $('#galaSketch').innerHTML = Art.look({ silhouette: st.silhouette, color: col(st.color)[2], shoes: st.shoes, band: st.band, n: looks.length + 1 });
    $('#galaCaption').innerHTML = caption();
    $$('#galaSil button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === st.silhouette));
    $$('#galaColor button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === st.color));
    $$('#shoeSlider button').forEach(b => b.setAttribute('aria-pressed', b.dataset.shoe === st.shoes));
    $('#shoeSlider').style.setProperty('--px', pos[st.shoes]);
  }
  function renderBook() {
    $('#lookbook').innerHTML = looks.map((l, i) => `<button data-i="${i}" aria-label="Look number ${i + 1}">${Art.look({ ...l, color: col(l.color)[2] })}<span>No.${i + 1}</span></button>`).join('');
    $$('#lookbook button').forEach(b => b.addEventListener('click', () => {
      const l = looks[b.dataset.i];
      Modal.open({ art: `<div style="width:170px;margin:0 auto 8px">${Art.look({ ...l, color: col(l.color)[2], n: +b.dataset.i + 1 })}</div>`, kicker: `Look No. ${+b.dataset.i + 1}`, title: 'From the lookbook', body: l.caption.replace(/<[^>]+>/g, ''), button: 'Close' });
    }));
  }
  function init() {
    $('#galaSil').innerHTML = GALA.silhouette.map(([v, l]) => `<button data-v="${v}">${l}</button>`).join('');
    $('#galaColor').innerHTML = GALA.color.map(([v, l, c]) => `<button data-v="${v}" style="--c:${c}" aria-label="${l}"></button>`).join('');
    $$('#galaSil button').forEach(b => b.addEventListener('click', () => { st.silhouette = b.dataset.v; Music.sfx.paper(); render(); }));
    $$('#galaColor button').forEach(b => b.addEventListener('click', () => { st.color = b.dataset.v; Music.sfx.tap(); render(); }));
    $$('#shoeSlider button').forEach(b => b.addEventListener('click', () => {
      st.shoes = b.dataset.shoe; render(); Music.sfx.tap();
      if (firstShoe && st.shoes !== 'both') {
        firstShoe = false;
        setTimeout(() => { st.shoes = 'both'; render(); Music.sfx.chime(); toast('Both. Obviously. (Fine — pick again, we’ll allow it.)'); }, 700);
      } else firstShoe = false;
    }));
    $('#galaBand').addEventListener('change', e => { st.band = e.target.checked; Music.sfx.pop(); render(); });
    $('#galaSaveBtn').addEventListener('click', () => {
      looks.push({ ...st, caption: caption() }); looks = looks.slice(-8); store.set('looks', looks);
      renderBook(); render(); Music.sfx.win(); FX.burstAt($('#galaSketch'), 30, { colors: ['#9E1B32', '#F2C6CC', '#FBF6EE', '#E3C9A0'] });
      toast(`Look No. ${looks.length} saved to the lookbook.`);
    });
    render(); renderBook();
  }
  return { init };
})();

/* ---------------- BINGO ---------------- */
const Bingo = (() => {
  const FREE = BINGO.findIndex(t => t.startsWith('FREE'));
  let on = new Set(store.get('bingo', [FREE])), won = new Set();
  const LINES = [];
  for (let r = 0; r < 4; r++) LINES.push([0, 1, 2, 3].map(c => r * 4 + c));
  for (let c = 0; c < 4; c++) LINES.push([0, 1, 2, 3].map(r => r * 4 + c));
  LINES.push([0, 5, 10, 15], [3, 6, 9, 12]);
  function check(fresh) {
    const done = LINES.filter(l => l.every(i => on.has(i)));
    $$('.sq').forEach((s, i) => s.classList.toggle('win', done.some(l => l.includes(i))));
    $('#bingoStatus').textContent = done.length ? `${done.length} line${done.length > 1 ? 's' : ''} · ${on.size}/16 tropes survived` : `0 lines · two little ducks to win`;
    if (!fresh) return;
    done.forEach(l => {
      const k = l.join(); if (won.has(k)) return; won.add(k);
      const b = document.createElement('div'); b.className = 'bingo__banner go'; b.textContent = 'BINGO'; document.body.appendChild(b);
      setTimeout(() => b.remove(), 1700);
      Music.sfx.win(); haptic([10, 40, 10]); FX.burstAt($('#bingo'), 50, { colors: ['#9E1B32', '#F2C6CC', '#F6D365'] });
      toast(BINGO_LINES[(won.size - 1) % BINGO_LINES.length], 3200);
    });
  }
  function init() {
    $('#bingo').innerHTML = BINGO.map((t, i) => `<button class="sq${i === FREE ? ' free' : ''}${on.has(i) ? ' on' : ''}" role="gridcell" aria-pressed="${on.has(i)}">${t.replace('FREE: ', '')}</button>`).join('');
    LINES.filter(l => l.every(i => on.has(i))).forEach(l => won.add(l.join()));
    $$('.sq').forEach((s, i) => s.addEventListener('click', () => {
      if (i === FREE) { toast('The birthday girl square is always free.'); return; }
      on.has(i) ? on.delete(i) : on.add(i);
      s.classList.toggle('on', on.has(i)); s.setAttribute('aria-pressed', on.has(i));
      store.set('bingo', [...on]); on.has(i) ? Music.sfx.pop() : Music.sfx.tap(); haptic(6);
      check(true);
    }));
    check(false);
  }
  return { init };
})();

/* ---------------- RECEIPT ---------------- */
const Receipt = (() => {
  let printed = false;
  function html() {
    const d = new Date(), t = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `<p class="c"><b>THE SMALL JOYS CO.</b><br>EST. 24·11·2004<br>receipt for: ${CONFIG.initial}</p>
      <p class="c">24 NOV 2026 &nbsp; ${t}</p><div class="hr"></div>
      ${JOYS.map((j, i) => `<div class="row"><b>${String(i + 1).padStart(2, '0')}</b><span>${j}</span><span>₹0.00</span></div>`).join('')}
      <div class="hr"></div><div class="total"><span>ITEMS</span><span>22</span></div><div class="total"><span>TOTAL</span><span>₹0.00</span></div>
      <div class="total"><span>PAID IN</span><span>attention</span></div><div class="hr"></div>
      ${RECEIPT_NOTE.map(l => `<p class="note">${l}</p>`).join('')}
      <div class="bars">${Art.barcode(2411)}</div><p class="c">THANK YOU · COME BACK EVERY DAY</p>`;
  }
  function print() {
    if (printed) return; printed = true;
    const r = $('#receipt'), inner = $('#receiptInner'), btn = $('#printBtn');
    inner.innerHTML = html(); btn.disabled = true; btn.textContent = 'Printing…'; $('#printLed').classList.add('on');
    const full = inner.scrollHeight; let h = 0;
    const step = () => {
      h = Math.min(full, h + 9); r.style.maxHeight = h + 'px';
      if (h % 45 < 9) Music.sfx.tap();
      if (h < full) setTimeout(step, 28);
      else { $('#printLed').classList.remove('on'); btn.textContent = 'Printed with love'; FX.burstAt(r, 24, { colors: ['#9E1B32', '#F2C6CC'] }); Music.sfx.chime(); r.style.maxHeight = 'none'; }
    };
    step(); haptic(8);
  }
  function init() { $('#printBtn').addEventListener('click', print); }
  return { init };
})();

/* ---------------- THE CAKE ---------------- */
const Cake = (() => {
  const C = [160, 112], RX = 118, RY = 38, H = 116, T1 = 62, T2 = 104;
  const P = (deg, dy = 0) => { const a = deg * Math.PI / 180; return [+(C[0] + RX * Math.cos(a)).toFixed(1), +(C[1] + RY * Math.sin(a) + dy).toFixed(1)]; };
  const pt = p => `${p[0]} ${p[1]}`;
  const arc = (to, large, sweep) => `A${RX} ${RY} 0 ${large} ${sweep} ${pt(to)}`;
  let cut = false;

  function crumbs(n, seed, fn) { let s = seed, out = ''; const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280); for (let i = 0; i < n; i++) out += fn(r); return out; }
  function bands(deg) {   // the layers on a cut face, following the slope of the top edge
    const p = P(deg), L = [[0, .07, '#FFF6EA'], [.07, .36, '#8E1B2E'], [.36, .42, '#FFF3E6'], [.42, .7, '#9B2335'], [.7, .76, '#FFF3E6'], [.76, 1, '#86182A']];
    return L.map(([a, b, c]) => `<path d="M${C[0]} ${C[1] + a * H} L${p[0]} ${p[1] + a * H} L${p[0]} ${p[1] + b * H} L${C[0]} ${C[1] + b * H}Z" fill="${c}"/>`).join('')
      + crumbs(26, deg * 7, r => { const t = .1 + r() * .85, u = r(); const x = C[0] + (p[0] - C[0]) * u, y = C[1] + (p[1] - C[1]) * u + t * H; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(.6 + r()).toFixed(1)}" fill="#5c0c1b" opacity=".55"/>`; });
  }
  function svg() {
    const L = P(180), R = P(0), Lb = P(180, H), Rb = P(0, H), a = P(T1), b = P(T2), ab = P(T1, H), bb = P(T2, H);
    const sideWhole = `M${pt(L)} L${pt(Lb)} ${arc(Rb, 0, 0)} L${pt(R)} ${arc(L, 0, 1)}Z`;
    const sideLeft = `M${pt(L)} L${pt(Lb)} ${arc(bb, 0, 0)} L${pt(b)} ${arc(L, 0, 1)}Z`;
    const sideRight = `M${pt(a)} L${pt(ab)} ${arc(Rb, 0, 0)} L${pt(R)} ${arc(a, 0, 1)}Z`;
    const topCut = `M${C[0]} ${C[1]} L${pt(a)} ${arc(b, 1, 0)}Z`;
    const sliceSide = `M${pt(a)} L${pt(ab)} ${arc(bb, 0, 1)} L${pt(b)} ${arc(a, 0, 0)}Z`;
    const sliceTop = `M${C[0]} ${C[1]} L${pt(a)} ${arc(b, 0, 1)}Z`;
    const sideCrumbs = crumbs(140, 11, r => { const t = r() * 180, p = P(t, H - r() * 28); return `<circle cx="${p[0]}" cy="${p[1]}" r="${(.8 + r() * 1.6).toFixed(1)}" fill="${r() > .5 ? '#8E1B2E' : '#6B0F21'}"/>`; });
    const rosettes = Array.from({ length: 16 }, (_, i) => { const p = P(i * 22.5 + 8, -3); return `<g transform="translate(${p[0]} ${p[1]})"><ellipse rx="9" ry="5.5" fill="#FFFDF8" stroke="#E7D8C6" stroke-width=".8"/><path d="M-5 -1 Q0 -5 5 -1" stroke="#E7D8C6" fill="none"/></g>`; }).join('');
    const topCrumbs = crumbs(60, 3, r => { const ang = r() * Math.PI * 2, k = .72 + r() * .1; return `<circle cx="${(C[0] + Math.cos(ang) * RX * k).toFixed(1)}" cy="${(C[1] + Math.sin(ang) * RY * k).toFixed(1)}" r="${(.8 + r() * 1.4).toFixed(1)}" fill="#8E1B2E"/>`; });
    const piping = `<text x="${C[0]}" y="${C[1] + 13}" text-anchor="middle" transform="translate(0 ${C[1] * .62}) scale(1 .38)" font-family="Bodoni Moda, serif" font-style="italic" font-weight="700" font-size="74" fill="#9E1B32">22</text>`;
    const deco = `${topCrumbs}${piping}${rosettes}`;
    return `<defs>
        <linearGradient id="frostSide" x1="0" x2="1"><stop offset="0" stop-color="#E9DCCB"/><stop offset=".35" stop-color="#FFFDF8"/><stop offset=".7" stop-color="#F7EEE2"/><stop offset="1" stop-color="#DCCBB8"/></linearGradient>
        <radialGradient id="frostTop" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#F3E8DA"/></radialGradient>
        <clipPath id="topCutClip"><path d="${topCut}"/></clipPath>
        <radialGradient id="plateG" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E5DDD3"/></radialGradient>
      </defs>
      <ellipse cx="${C[0]}" cy="${C[1] + H + 8}" rx="${RX + 26}" ry="${RY + 12}" fill="url(#plateG)" stroke="#d8cfc4"/>
      <ellipse cx="${C[0]}" cy="${C[1] + H + 6}" rx="${RX + 8}" ry="${RY + 4}" fill="rgba(0,0,0,.08)"/>
      <g id="cakeWhole">
        <path d="${sideWhole}" fill="url(#frostSide)"/>${sideCrumbs}
        <ellipse cx="${C[0]}" cy="${C[1]}" rx="${RX}" ry="${RY}" fill="url(#frostTop)"/>${deco}
      </g>
      <g id="cakeCut" opacity="0">
        <path d="${sideLeft}" fill="url(#frostSide)"/><path d="${sideRight}" fill="url(#frostSide)"/>
        <g>${bands(T2)}<path d="M${C[0]} ${C[1]} L${pt(b)} L${pt(bb)} L${C[0]} ${C[1] + H}Z" fill="rgba(0,0,0,.14)"/></g>
        <g>${bands(T1)}<path d="M${C[0]} ${C[1]} L${pt(a)} L${pt(ab)} L${C[0]} ${C[1] + H}Z" fill="rgba(255,255,255,.06)"/></g>
        <path d="${topCut}" fill="url(#frostTop)"/><g clip-path="url(#topCutClip)">${deco}</g>
      </g>
      <g id="slicePlate" opacity="0"><ellipse cx="${C[0] + 90}" cy="${C[1] + H + 62}" rx="66" ry="20" fill="url(#plateG)" stroke="#d8cfc4"/></g>
      <g id="cakeSlice" opacity="0">
        <path d="${sliceSide}" fill="url(#frostSide)"/>${bands(T2)}<path d="${sliceTop}" fill="url(#frostTop)"/>
        <path d="M${pt(P((T1 + T2) / 2, -2))} m-6 0 a6 3.6 0 1 0 12 0 a6 3.6 0 1 0 -12 0" fill="#FFFDF8" stroke="#E7D8C6"/>
      </g>
      <line id="knife" class="knife" x1="0" y1="0" x2="0" y2="0" opacity="0"/>`;
  }
  function doCut() {
    if (cut) return; cut = true;
    const s = $('#cakeSvg');
    $('#cakeWhole', s).style.opacity = 0; $('#cakeCut', s).setAttribute('opacity', 1);
    const slice = $('#cakeSlice', s); slice.setAttribute('opacity', 1);
    $('#knife', s).remove();
    Music.sfx.rip(); haptic([12, 30, 20]); $('#cakeStage').style.touchAction = 'pan-y';
    slice.animate([{ transform: 'translate(0,0) rotate(0deg)' }, { transform: 'translate(86px, 64px) rotate(6deg)' }],
      { duration: 900, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards', delay: 120 });
    $('#slicePlate', s).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'forwards', delay: 300 });
    $('#cakeHint').textContent = 'first slice is yours';
    setTimeout(() => {
      SCORE.cake = 'birthday'; Music.zone('birthday');
      const r = s.getBoundingClientRect();
      FX.burst(r.left + r.width / 2, r.top + r.height * .3, 80, { up: true, power: 9, colors: ['#FBF6EE', '#9E1B32', '#F2C6CC', '#E3C9A0'], paper: true });
      const after = $('#cakeAfter'); after.hidden = false;
      $('#cakeWaldorf').textContent = FINALE.waldorf;
      $('#tracker').innerHTML = `<p class="tracker__title">${FINALE.real}</p>` + FINALE.steps.map((t, i) => `<div class="step${i === FINALE.steps.length - 1 ? ' now' : ''}" style="animation-delay:${(.5 + i * .6).toFixed(1)}s"><i>${i === FINALE.steps.length - 1 ? '' : '✓'}</i><span>${t}</span></div>`).join('');
      after.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1100);
  }
  function init() {
    const s = $('#cakeSvg'); s.innerHTML = svg();
    const stage = $('#cakeStage'), knife = $('#knife', s);
    const toSvg = e => { const r = s.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 320, (e.clientY - r.top) / r.height * 330]; };
    let start = null;
    stage.addEventListener('pointerdown', e => { if (cut) return; start = toSvg(e); try { stage.setPointerCapture(e.pointerId); } catch (x) {} knife.setAttribute('opacity', .9); knife.setAttribute('x1', start[0]); knife.setAttribute('y1', start[1]); knife.setAttribute('x2', start[0]); knife.setAttribute('y2', start[1]); });
    stage.addEventListener('pointermove', e => { if (!start || cut) return; const p = toSvg(e); knife.setAttribute('x2', p[0]); knife.setAttribute('y2', p[1]); });
    const end = e => { if (!start || cut) return; const p = toSvg(e); const dy = p[1] - start[1]; start = null; if (dy > 70) doCut(); else { knife.setAttribute('opacity', 0); if (Math.abs(dy) < 10) toast('Drag your finger down through the cake.'); } };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', () => { start = null; if (!cut) knife.setAttribute('opacity', 0); });
    s.setAttribute('tabindex', '0'); s.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doCut(); } });
  }
  return { init };
})();

/* ---------------- LETTER ---------------- */
const Letter = (() => {
  function init() {
    $('#letterBody').innerHTML = FINALE.wish.map(p => `<p>${p}</p>`).join('');
    $('#letterSign').textContent = FINALE.sign;
    $('#replyBtn').href = waLink('Dear Editor,\n');
  }
  return { init };
})();
