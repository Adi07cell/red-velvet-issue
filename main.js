/* ==========================================================================
   Conductor
   ========================================================================== */
(function () {
  // art
  $$('[data-art]').forEach(el => {
    const k = el.dataset.art;
    el.innerHTML = k === 'bow' ? Art.bow() : k === 'stiletto' ? Art.stiletto() : k === 'sneaker' ? Art.sneaker() : k === 'barcode' ? Art.barcode() : '';
  });
  document.title = `Spotted: ${CONFIG.initial}`;

  Cover.init();
  Lock.init(open);
  Feed.init(); Pearls.init(); Gala.init(); Bingo.init(); Receipt.init(); Cake.init(); Letter.init();
  requestAnimationFrame(() => { Stack.init(); Catch.init(); });
  Reveal.watch();

  function open() {
    Music.start('spotted');
    Music.sfx.shutter(); haptic([15, 50, 15]);
    const f = $('#flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
    $('#lock').classList.add('is-gone');
    window.scrollTo(0, 0);
    document.body.classList.remove('is-locked'); document.body.classList.add('is-open');
    $('#issue').removeAttribute('aria-hidden');
    setTimeout(() => $('#lock').remove(), 700);
    setTimeout(() => { const r = $('#masthead').getBoundingClientRect(); FX.burst(r.left + r.width / 2, r.bottom, 40, { up: true, paper: true, power: 7 }); }, 1900);

    // the sound pill
    const s = $('#sound'); s.hidden = false;
    s.addEventListener('click', () => Music.toggle());
    Music.subscribe(({ on, track }) => { s.classList.toggle('is-on', on); $('#soundLabel').textContent = on ? `♪ ${track.title}` : 'Sound off'; });

    // the score follows the issue
    let zt; const zio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; clearTimeout(zt);
      zt = setTimeout(() => Music.zone(SCORE[e.target.id]), 700);
    }), { rootMargin: '-45% 0px -45% 0px' });
    Object.keys(SCORE).forEach(id => { const el = document.getElementById(id); if (el) zio.observe(el); });
  }
})();
