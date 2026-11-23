/* ==========================================================================
   Games: Death-by-Chocolate Stack, Piña Colada Catch
   ========================================================================== */
function setupCanvas(cv) {
  const dpr = Math.min(2, window.devicePixelRatio || 1), r = cv.getBoundingClientRect();
  cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { g, W: r.width, H: r.height };
}
function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

/* ======================= DEATH-BY-CHOCOLATE STACK ======================= */
const Stack = (() => {
  let cv, g, W, H, raf = 0, visible = false, state = 'idle';
  let blocks, cur, falling, crumbs, cam, camT, score, combo, best = store.get('stackBest', 0), last = 0, crowned = false;
  const LH = 20, BASE = () => Math.min(220, W * .58);
  function reset() {
    const w = BASE();
    blocks = [{ x: (W - w) / 2, w, kind: 0, perfect: false }];
    falling = []; crumbs = []; cam = camT = 0; score = 0; combo = 0; crowned = false;
    spawn();
    $('#stackScore').textContent = 0;
  }
  function spawn() {
    const top = blocks[blocks.length - 1], dir = blocks.length % 2 ? 1 : -1;
    cur = { x: dir > 0 ? -top.w * .2 : W - top.w * .8, w: top.w, dir, kind: blocks.length % 2 };
  }
  const yOf = i => H - 64 - (i + 1) * LH + cam;
  function drawLayer(b, i, y) {
    const { x, w } = b;
    const grad = g.createLinearGradient(0, y, 0, y + LH);
    if (b.kind) { grad.addColorStop(0, '#F2C27A'); grad.addColorStop(1, '#C98A3E'); } else { grad.addColorStop(0, '#E9B46B'); grad.addColorStop(1, '#B8762F'); }
    g.fillStyle = grad; rrect(g, x, y + 2, w, LH - 3, 8); g.fill();
    g.strokeStyle = 'rgba(110,60,20,.35)'; g.lineWidth = 1; g.stroke();
    if (b.kind) {                   // waffle grid
      g.strokeStyle = 'rgba(140,80,25,.45)'; g.lineWidth = 1.2;
      for (let gx = x + 10; gx < x + w - 6; gx += 12) { g.beginPath(); g.moveTo(gx, y + 5); g.lineTo(gx, y + LH - 3); g.stroke(); }
    } else { g.fillStyle = 'rgba(255,240,210,.35)'; rrect(g, x + 6, y + 4, w - 12, 4, 2); g.fill(); }
    if (b.perfect || i >= 10) {     // chocolate drip
      g.fillStyle = '#4A2316';
      rrect(g, x + 3, y + 1, w - 6, 5, 3); g.fill();
      for (let k = 0; k < Math.max(2, w / 26); k++) { const dx = x + 8 + ((k * 37 + i * 13) % Math.max(10, w - 16)); g.beginPath(); g.ellipse(dx, y + 7, 2.6, 5 + (k * 7 + i) % 6, 0, 0, Math.PI * 2); g.fill(); }
    }
    if (i >= 15) { g.fillStyle = '#D7263D'; for (let k = 0; k < 3; k++) { const dx = x + w * (.2 + k * .3); g.beginPath(); g.arc(dx, y + 2, 3.4, 0, Math.PI * 2); g.fill(); } }
  }
  function drawCrown(top, y) {
    g.fillStyle = '#FFFDF8'; g.strokeStyle = '#E7D8C6';
    const cx = top.x + top.w / 2;
    for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(cx + k * 14 - 9, y + 2); g.quadraticCurveTo(cx + k * 14, y - 22 + Math.abs(k) * 5, cx + k * 14 + 9, y + 2); g.fill(); g.stroke(); }
    g.fillStyle = '#D7263D'; g.beginPath(); g.arc(cx, y - 20, 5, 0, Math.PI * 2); g.fill();
  }
  function frame(t) {
    raf = visible ? requestAnimationFrame(frame) : 0;
    const dt = Math.min(2.5, (t - (last || t)) / 16.67); last = t;
    if (state === 'play') {
      const v = Math.min(6.2, 2.1 + score * .14) * dt;
      cur.x += cur.dir * v;
      const top = blocks[blocks.length - 1];
      if (cur.x > W - cur.w * .15) cur.dir = -1; if (cur.x < -cur.w * .85) cur.dir = 1;
      if (cur.x + cur.w < top.x - 40 && cur.dir < 0) cur.dir = 1; if (cur.x > top.x + top.w + 40 && cur.dir > 0) cur.dir = -1;
    }
    camT = Math.max(0, blocks.length * LH - H * .5); cam += (camT - cam) * .1;
    // background
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#FCEFE6'); bg.addColorStop(1, '#F6DCCB'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(158,27,50,.05)'; for (let i = 0; i < 10; i++) g.fillRect(0, (i * 64 + cam * .3) % H, W, 1);
    // plate
    const py = H - 64 + LH + cam - 6;
    g.fillStyle = '#FFFFFF'; g.beginPath(); g.ellipse(W / 2, py + 8, BASE() * .78, 14, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#E2D8CD'; g.stroke();
    blocks.forEach((b, i) => { const y = yOf(i - 1) ; if (y > -LH && y < H + LH) drawLayer(b, i, y); });
    if (crowned) drawCrown(blocks[blocks.length - 1], yOf(blocks.length - 2));
    if (state === 'play' || state === 'idle') drawLayer(cur, blocks.length, yOf(blocks.length - 1) - (state === 'idle' ? 0 : 0));
    // falling trims
    falling.forEach(f => { f.vy += .45 * dt; f.y += f.vy * dt; f.rot += f.vr * dt; g.save(); g.translate(f.x + f.w / 2, f.y + LH / 2); g.rotate(f.rot); drawLayer({ x: -f.w / 2, w: f.w, kind: f.kind }, 0, -LH / 2); g.restore(); });
    falling = falling.filter(f => f.y < H + 60);
    crumbs.forEach(c => { c.vy += .3 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.life -= .03 * dt; g.globalAlpha = Math.max(0, c.life); g.fillStyle = c.c; g.fillRect(c.x, c.y, 3, 3); });
    g.globalAlpha = 1; crumbs = crumbs.filter(c => c.life > 0);
  }
  function drop() {
    if (state === 'over') return;
    const top = blocks[blocks.length - 1];
    const L = Math.max(cur.x, top.x), R = Math.min(cur.x + cur.w, top.x + top.w), ov = R - L;
    const y = yOf(blocks.length - 1);
    if (ov <= 4) {
      falling.push({ x: cur.x, y, w: cur.w, vy: 0, rot: 0, vr: cur.x > top.x ? .05 : -.05, kind: cur.kind });
      Music.sfx.fail(); haptic([20, 40, 20]); return over();
    }
    let nb;
    if (Math.abs(cur.x - top.x) < 5) {
      combo++; nb = { x: top.x, w: Math.min(BASE(), top.w + (combo >= 3 ? 6 : 0)), kind: cur.kind, perfect: true };
      if (combo >= 3) nb.x = top.x - (nb.w - top.w) / 2;
      Music.sfx.chime(); haptic(12);
      if (combo === 3) toast('Perfect ×3 — the stack is growing back!');
    } else {
      combo = 0; nb = { x: L, w: ov, kind: cur.kind, perfect: false };
      const cutX = cur.x < top.x ? cur.x : R, cutW = cur.w - ov;
      falling.push({ x: cutX, y, w: cutW, vy: -1, rot: 0, vr: cur.x < top.x ? -.06 : .06, kind: cur.kind });
      Music.sfx.stack(); haptic(8);
    }
    for (let k = 0; k < 8; k++) crumbs.push({ x: nb.x + Math.random() * nb.w, y: y + LH, vx: (Math.random() - .5) * 3, vy: -Math.random() * 3, life: 1, c: Math.random() > .5 ? '#C98A3E' : '#4A2316' });
    blocks.push(nb); score = blocks.length - 1; $('#stackScore').textContent = score;
    const ms = score === CONFIG.hisScore ? `${score} — that’s my record. You’re about to embarrass me.` : STACK.milestones[score];
    if (ms) toast(ms, 2600);
    if (score === 22) { crowned = true; Music.sfx.win(); const r = cv.getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.top + 80, 60, { up: true, colors: ['#FFFDF8', '#9E1B32', '#F6D365'] }); }
    spawn();
  }
  function over() {
    state = 'over'; $('#stackGame').classList.remove('is-playing');
    if (score > best) { best = score; store.set('stackBest', best); $('#stackBest').textContent = best; }
    const his = CONFIG.hisScore;
    $('#stackOverTitle').textContent = score >= 22 ? 'Crowned.' : score > his ? 'You beat Chennai.' : score === his ? 'A tie.' : `Stack of ${score}`;
    $('#stackOverText').textContent = score > his ? `${score} vs ${his}. He’s pretending to be fine about it.` : score === his ? `${score} each. Rematch, obviously.` : `Chennai’s record is ${his}. You’re ${his - score} pancake${his - score === 1 ? '' : 's'} away from bragging rights.`;
    setTimeout(() => { $('#stackOver').hidden = false; }, 600);
  }
  function init() {
    cv = $('#stackCanvas'); ({ g, W, H } = setupCanvas(cv));
    $('#stackBest').textContent = best; $('#stackHis').textContent = CONFIG.hisScore;
    reset();
    const game = $('#stackGame');
    game.addEventListener('pointerdown', e => { if (state !== 'play' || e.target.closest('button')) return; e.preventDefault(); drop(); });
    game.addEventListener('click', e => { if (state !== 'idle' || e.target.closest('button')) return; state = 'play'; game.classList.add('is-playing'); $('#stackTap').hidden = true; });
    $('#stackAgain').addEventListener('click', () => { $('#stackOver').hidden = true; reset(); state = 'play'; game.classList.add('is-playing'); });
    addEventListener('resize', () => { if (state !== 'play') { ({ g, W, H } = setupCanvas(cv)); reset(); } }, { passive: true });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) { last = 0; raf = requestAnimationFrame(frame); } }).observe(cv);
  }
  return { init };
})();

/* ======================= PIÑA COLADA CATCH ======================= */
const Catch = (() => {
  let cv, g, W, H, raf = 0, visible = false, state = 'idle', last = 0;
  let glass, items, splashes, score, counts, timeLeft, spawnT, shake;
  function reset() {
    glass = { x: W / 2, w: 64 }; items = []; splashes = []; score = 0; counts = {}; timeLeft = 30; spawnT = 0; shake = 0;
    $('#catchScore').textContent = 0; $('#catchTime').textContent = 30;
  }
  function spawn() {
    const bad = Math.random() < .26;
    const pool = bad ? CATCH.bad : CATCH.good;
    const it = pool[Math.floor(Math.random() * pool.length)];
    items.push({ ...it, bad, x: 24 + Math.random() * (W - 48), y: -20, vy: 2 + Math.random() * 1.6 + (30 - timeLeft) * .05, rot: Math.random() * 6, vr: (Math.random() - .5) * .08 });
  }
  function drawItem(it) {
    g.save(); g.translate(it.x, it.y); g.rotate(it.rot);
    switch (it.id) {
      case 'pineapple': g.fillStyle = '#F6C944'; g.beginPath(); g.moveTo(-11, 8); g.lineTo(11, 8); g.lineTo(6, -9); g.lineTo(-6, -9); g.closePath(); g.fill(); g.strokeStyle = '#D89B1F'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-7, 2); g.lineTo(7, 2); g.moveTo(-4, -4); g.lineTo(4, -4); g.stroke(); break;
      case 'coconut': g.fillStyle = '#6B4226'; g.beginPath(); g.arc(0, 0, 11, Math.PI, 0); g.fill(); g.fillStyle = '#FFFDF8'; g.beginPath(); g.arc(0, 0, 8, Math.PI, 0); g.fill(); g.fillStyle = '#6B4226'; g.fillRect(-11, 0, 22, 3); break;
      case 'ice': g.fillStyle = 'rgba(190,230,245,.85)'; rrect(g, -9, -9, 18, 18, 4); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-5, -5); g.lineTo(0, -5); g.stroke(); break;
      case 'splash': g.fillStyle = 'rgba(210,235,255,.95)'; g.beginPath(); g.moveTo(0, -12); g.quadraticCurveTo(10, 2, 0, 10); g.quadraticCurveTo(-10, 2, 0, -12); g.fill(); g.strokeStyle = '#9ec8e6'; g.stroke(); g.fillStyle = '#1B2A4A'; g.font = '700 7px DM Mono, monospace'; g.textAlign = 'center'; g.fillText('R', 0, 4); break;
      case 'cherry': g.strokeStyle = '#3c6b2a'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, -4); g.quadraticCurveTo(3, -12, 8, -14); g.stroke(); g.fillStyle = '#C8102E'; g.beginPath(); g.arc(0, 2, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.arc(-2.5, -.5, 2, 0, Math.PI * 2); g.fill(); break;
      case 'vervain': g.strokeStyle = '#4C7A3A'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 12); g.lineTo(0, -10); g.stroke(); g.fillStyle = '#8E6CC3'; [-8, -3, 2].forEach(y => { g.beginPath(); g.arc(-4, y, 3, 0, Math.PI * 2); g.arc(4, y + 2, 3, 0, Math.PI * 2); g.fill(); }); break;
      case 'deadline': g.fillStyle = '#FFE066'; g.fillRect(-12, -12, 24, 24); g.fillStyle = '#C8102E'; g.font = '700 8px DM Mono, monospace'; g.textAlign = 'center'; g.fillText('DUE', 0, 3); break;
      case 'petri': g.strokeStyle = '#8fb3c9'; g.lineWidth = 2; g.fillStyle = 'rgba(240,230,170,.75)'; g.beginPath(); g.arc(0, 0, 12, 0, Math.PI * 2); g.fill(); g.stroke(); g.fillStyle = '#C9A227'; g.beginPath(); g.arc(-3, -2, 2, 0, Math.PI * 2); g.arc(4, 3, 1.6, 0, Math.PI * 2); g.fill(); break;
    }
    g.restore();
  }
  function drawGlass() {
    const gx = glass.x + (shake > 0 ? Math.sin(shake * 2) * 4 : 0), top = H - 110, w = glass.w;
    const fill = Math.min(1, score / 30);
    // liquid
    g.save(); g.beginPath(); g.moveTo(gx - w / 2, top); g.quadraticCurveTo(gx - w / 2 - 6, top + 50, gx - 10, top + 72); g.lineTo(gx + 10, top + 72); g.quadraticCurveTo(gx + w / 2 + 6, top + 50, gx + w / 2, top); g.closePath(); g.clip();
    const ly = top + 72 - fill * 72; const lg = g.createLinearGradient(0, ly, 0, top + 72); lg.addColorStop(0, '#FFF8E1'); lg.addColorStop(1, '#F6D365');
    g.fillStyle = lg; g.fillRect(gx - w, ly, w * 2, 80); g.restore();
    g.strokeStyle = 'rgba(42,10,16,.6)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(gx - w / 2, top); g.quadraticCurveTo(gx - w / 2 - 6, top + 50, gx - 10, top + 72); g.lineTo(gx + 10, top + 72); g.quadraticCurveTo(gx + w / 2 + 6, top + 50, gx + w / 2, top); g.stroke();
    g.beginPath(); g.moveTo(gx, top + 72); g.lineTo(gx, top + 92); g.moveTo(gx - 18, top + 94); g.lineTo(gx + 18, top + 94); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.moveTo(gx - w / 2 + 6, top + 8); g.quadraticCurveTo(gx - w / 2 + 2, top + 40, gx - 8, top + 62); g.stroke();
    if (score >= 12) { g.fillStyle = '#9E1B32'; g.beginPath(); g.moveTo(gx + 6, top - 2); g.lineTo(gx + 30, top - 34); g.lineTo(gx + 40, top - 14); g.closePath(); g.fill(); g.strokeStyle = '#6B4226'; g.beginPath(); g.moveTo(gx + 8, top + 4); g.lineTo(gx + 32, top - 26); g.stroke(); }
    if (counts.cherry) { g.fillStyle = '#C8102E'; g.beginPath(); g.arc(gx - 12, top - 4, 6, 0, Math.PI * 2); g.fill(); }
  }
  function frame(t) {
    raf = visible ? requestAnimationFrame(frame) : 0;
    const dt = Math.min(2.5, (t - (last || t)) / 16.67); last = t;
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#FFF6DD'); bg.addColorStop(1, '#FBE3B8'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(158,27,50,.06)'; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc((i * 97) % W, 60 + (i * 53) % 200, 18 + i * 3, 0, Math.PI * 2); g.fill(); }
    if (state === 'play') {
      timeLeft -= dt / 60; $('#catchTime').textContent = Math.max(0, Math.ceil(timeLeft));
      spawnT -= dt; if (spawnT <= 0) { spawn(); spawnT = Math.max(16, 34 - (30 - timeLeft) * .6); }
      const top = H - 110;
      items.forEach(it => { it.y += it.vy * dt; it.rot += it.vr * dt;
        if (!it.done && it.y > top - 6 && it.y < top + 20 && Math.abs(it.x - glass.x) < glass.w / 2 + 6) {
          it.done = true;
          if (it.bad) { score = Math.max(0, score - 2); shake = 12; toast(it.msg, 1800); Music.sfx.fail(); haptic([30, 30, 30]); }
          else { score += it.pts; counts[it.id] = (counts[it.id] || 0) + 1; Music.sfx.pop(); haptic(6); for (let k = 0; k < 6; k++) splashes.push({ x: it.x, y: top, vx: (Math.random() - .5) * 4, vy: -Math.random() * 4, life: 1 }); }
          $('#catchScore').textContent = score;
        } });
      items = items.filter(it => !it.done && it.y < H + 30);
      if (timeLeft <= 0) end();
    }
    items.forEach(drawItem);
    if (shake > 0) shake -= dt;
    drawGlass();
    splashes.forEach(s => { s.vy += .25 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= .04 * dt; g.globalAlpha = Math.max(0, s.life); g.fillStyle = '#FFF8E1'; g.beginPath(); g.arc(s.x, s.y, 3, 0, Math.PI * 2); g.fill(); });
    g.globalAlpha = 1; splashes = splashes.filter(s => s.life > 0);
  }
  function end() {
    state = 'over'; $('#catchGame').classList.remove('is-playing');
    const lines = CATCH.good.filter(i => counts[i.id]).map(i => `<li><span>${i.label}</span><span>×${counts[i.id]}</span></li>`).join('') || '<li><span>ice</span><span>×1 (we assume)</span></li>';
    const verdict = CATCH.verdicts.filter(([min]) => score >= min).pop()[1];
    $('#catchOver').innerHTML = `<div class="recipe"><p class="mono" style="margin:0;color:#9E1B32">Recipe card · No. 22</p><h3>The Twenty-Two</h3><p class="by">a piña colada, by R. · score ${score}</p><ul>${lines}</ul><p class="verdict">${verdict}</p></div><button class="btn btn--velvet" id="catchAgain">Mix another</button>`;
    $('#catchOver').hidden = false; Music.sfx.win();
    $('#catchAgain').addEventListener('click', () => { $('#catchOver').hidden = true; reset(); state = 'play'; $('#catchGame').classList.add('is-playing'); });
  }
  function init() {
    cv = $('#catchCanvas'); ({ g, W, H } = setupCanvas(cv)); reset();
    const game = $('#catchGame');
    const move = e => { const r = cv.getBoundingClientRect(); glass.x = Math.max(glass.w / 2 + 8, Math.min(W - glass.w / 2 - 16, e.clientX - r.left)); };
    game.addEventListener('pointerdown', e => { if (state !== 'play' || e.target.closest('button')) return; e.preventDefault(); move(e); });
    game.addEventListener('click', e => { if (state !== 'idle' || e.target.closest('button')) return; move(e); state = 'play'; game.classList.add('is-playing'); $('#catchTap').hidden = true; });
    game.addEventListener('pointermove', e => { if (state === 'play') move(e); });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) { last = 0; raf = requestAnimationFrame(frame); } }).observe(cv);
  }
  return { init };
})();
