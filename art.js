/* ==========================================================================
   Illustrations: bow, shoes, croquis + gowns, icons, barcode.
   ========================================================================== */
const Art = (() => {
  let n = 0; const uid = p => `${p}${++n}`;
  const svg = (inner, vb, extra = '') => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" ${extra}>${inner}</svg>`;
  const satin = id => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6B0F21"/><stop offset=".4" stop-color="#9E1B32"/><stop offset=".55" stop-color="#E0566F"/><stop offset=".7" stop-color="#9E1B32"/><stop offset="1" stop-color="#6B0F21"/></linearGradient>`;

  function bow() {
    const g = uid('b');
    return svg(`<defs>${satin(g)}</defs>
      <path d="M48 36 L30 66 L40 62 L46 70 L54 38Z M52 36 L70 66 L60 62 L54 70 L46 38Z" fill="url(#${g})"/>
      <path d="M50 32 C36 8 4 4 4 28 C4 48 36 48 50 32Z M50 32 C64 8 96 4 96 28 C96 48 64 48 50 32Z" fill="url(#${g})"/>
      <path d="M50 32 C40 18 18 14 14 26 M50 32 C60 18 82 14 86 26" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/>
      <rect x="42" y="24" width="16" height="16" rx="6" fill="#8E1B2E" stroke="#6B0F21"/>`, '0 0 100 72');
  }

  function stiletto(color = '#9E1B32', small) {
    return svg(`<path d="M16 40 L12 68 L18 68 L22 44Z" fill="${color}" filter="brightness(.8)"/>
      <path d="M10 38 C9 26 14 16 24 14 C30 24 40 34 56 42 C70 48 86 50 94 56 C98 59 96 64 90 64 L58 63 C44 62 32 56 24 46 L20 44 Z" fill="${color}"/>
      <path d="M24 46 C34 56 50 62 90 64" stroke="#2A0A10" stroke-opacity=".5" stroke-width="2" fill="none"/>
      <path d="M24 15 C30 23 38 30 50 37" stroke="#F2C6CC" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      ${small ? '' : '<path d="M60 47 C70 50 80 52 88 55" stroke="#fff" stroke-opacity=".55" stroke-width="2.2" fill="none" stroke-linecap="round"/>'}`, '0 0 100 72');
  }

  function sneaker(accent = '#9E1B32') {
    return svg(`<path d="M6 58 L6 40 C6 32 14 28 24 30 L38 34 C46 26 54 22 62 26 L76 40 C86 42 96 46 98 54 L98 60 Z" fill="#FFFDF8" stroke="#2A0A10" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M5 58 L99 58 L99 62 C99 66 95 68 91 68 L13 68 C8 68 5 66 5 62Z" fill="${accent}"/>
      <path d="M8 62 H96" stroke="#fff" stroke-opacity=".5" stroke-width="1.2" stroke-dasharray="3 3"/>
      <path d="M44 32 L52 40 M50 29 L58 37 M56 27 L63 34" stroke="#2A0A10" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M26 50 C44 48 62 46 84 46" stroke="${accent}" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M6 40 C6 34 10 31 16 31 L16 52 L6 52Z" fill="#F2C6CC" opacity=".8"/>`, '0 0 104 72');
  }

  /* ---------- fashion croquis ---------- */
  const GOWN = {
    mermaid: 'M84 86 Q92 79 100 87 Q108 79 116 86 L113 112 L110 140 Q116 170 114 200 Q111 238 108 262 Q124 298 142 340 Q100 352 58 340 Q76 298 92 262 Q89 238 86 200 Q84 170 90 140 L87 112 Z',
    ballgown: 'M84 86 Q92 79 100 87 Q108 79 116 86 L113 112 L110 140 Q142 192 164 340 Q100 358 36 340 Q58 192 90 140 L87 112 Z',
    slip: 'M88 86 Q100 94 112 86 L114 140 Q118 232 126 338 Q100 345 74 338 Q82 232 86 140 Z',
  };
  const DRAPE = {
    mermaid: 'M100 270 Q96 300 86 336 M106 268 Q112 300 124 338 M100 150 Q99 200 100 255',
    ballgown: 'M100 150 Q86 240 70 344 M100 150 Q100 250 100 350 M100 150 Q116 240 132 344',
    slip: 'M98 150 Q94 240 90 336 M104 160 Q108 240 112 336',
  };
  function look({ silhouette = 'mermaid', color = '#F4EDE1', shoes = 'both', band = false, n: no } = {}) {
    const g = uid('dr'), dark = color === '#1B1820' || color === '#8E1B2E';
    const stroke = dark ? 'rgba(255,255,255,.35)' : 'rgba(42,10,16,.25)';
    const shoeL = shoes === 'sneakers' ? 'sneaker' : 'stiletto', shoeR = shoes === 'stilettos' ? 'stiletto' : 'sneaker';
    const foot = (kind, x, flip) => `<g transform="translate(${x} 336) scale(${flip ? -.26 : .26} .26)">${kind === 'sneaker'
      ? '<path d="M6 58 L6 40 C6 32 14 28 24 30 L38 34 C46 26 54 22 62 26 L76 40 C86 42 96 46 98 54 L98 60 Z" fill="#FFFDF8" stroke="#2A0A10" stroke-width="3"/><path d="M5 58 L99 58 L99 64 L5 64Z" fill="#9E1B32"/>'
      : '<path d="M16 40 L12 68 L18 68 L22 44Z" fill="#9E1B32"/><path d="M10 38 C9 26 14 16 24 14 C30 24 40 34 56 42 C70 48 86 50 94 56 C98 59 96 64 90 64 L58 63 C44 62 32 56 24 46 L20 44 Z" fill="#9E1B32"/>'}</g>`;
    return svg(`<defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".45" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs>
      <path d="M86 36 C82 14 118 14 114 36 C120 52 118 74 112 84 L88 84 C82 74 80 52 86 36Z" fill="#2A0A10"/>
      <rect x="96" y="58" width="8" height="18" fill="#C98E6F"/>
      <ellipse cx="100" cy="44" rx="12.5" ry="15.5" fill="#D9A07F"/>
      <path d="M96 52 Q100 54.5 104 52" stroke="#9E1B32" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M88 30 C92 22 108 22 112 30 C108 26 92 26 88 30Z" fill="#2A0A10"/>
      ${band ? `<path d="M87 33 C92 22 108 22 113 33" stroke="#1B2A4A" stroke-width="4.5" fill="none" stroke-linecap="round"/><circle cx="111" cy="30" r="3.4" fill="#1B2A4A"/>` : ''}
      <path d="M86 84 C80 110 76 140 74 168 M114 84 C122 106 128 128 120 150 L112 152" stroke="#C98E6F" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${foot(shoeL, 86, true)}${foot(shoeR, 108, false)}
      <path d="${GOWN[silhouette]}" fill="${color}" stroke="#2A0A10" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="${GOWN[silhouette]}" fill="url(#${g})"/>
      <path d="${DRAPE[silhouette]}" stroke="${stroke}" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      ${silhouette === 'slip' ? '<path d="M90 86 L92 70 M110 86 L108 70" stroke="#2A0A10" stroke-width="1.2"/>' : ''}
      <path d="M90 140 Q100 144 110 140" stroke="${stroke}" stroke-width="1.4" fill="none"/>
      ${no ? `<text x="186" y="360" text-anchor="end" font-family="DM Mono, monospace" font-size="9" fill="#6B4A4F">LOOK NO. ${no}</text>` : ''}`, '0 0 200 370');
  }

  /* ---------- notification icons (24×24 line) ---------- */
  const I = d => svg(`<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</g>`, '0 0 24 24');
  const icon = {
    cal: () => I('<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M12 13.2c-.9-1.3-2.9-.6-2.4.9.4 1.1 2.4 2.4 2.4 2.4s2-1.3 2.4-2.4c.5-1.5-1.5-2.2-2.4-.9z" fill="currentColor"/>'),
    sun: () => I('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>'),
    lab: () => I('<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 15h9"/>'),
    msg: () => I('<path d="M4 5.5h16v10H9l-5 4z"/><path d="M8.5 10.5h7"/>'),
  };

  function barcode(seed = 2422) {
    let s = seed, x = 0, bars = '';
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    while (x < 96) { const w = 1 + Math.floor(r() * 3); if (r() > .35) bars += `<rect x="${x}" y="0" width="${w}" height="26" fill="#2A0A10"/>`; x += w + 1; }
    return svg(bars, '0 0 96 26', 'preserveAspectRatio="none"');
  }

  return { bow, stiletto, sneaker, look, icon, barcode };
})();
