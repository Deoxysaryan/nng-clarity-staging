/* Brainology LP: introduction film play button, and "pick your pattern" chips that open the enquiry form with the area chosen. */
(() => {
  'use strict';
  const film = document.querySelector('.v4-film');
  if (film) {
    const v = film.querySelector('video');
    const b = film.querySelector('.v4-film-play');
    b.addEventListener('click', () => {
      v.controls = true; film.classList.add('is-playing'); v.play().catch(() => {});
      window.dataLayer?.push({ event: 'video_play', video_name: 'narayani-introduction' });
    });
    v.addEventListener('ended', () => { film.classList.remove('is-playing'); v.controls = false; v.load(); });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-pick-reason]');
    if (!a) return;
    const form = document.querySelector('#en-form');
    if (!form) return;
    e.preventDefault();
    form.elements.reason.value = a.dataset.pickReason;
    form.elements.reason.dispatchEvent(new Event('change'));
    if (!form.elements.details.value) form.elements.details.value = a.dataset.pickLabel;
    document.querySelector('#enquire').scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => form.elements.firstName.focus({ preventScroll: true }), 700);
    window.dataLayer?.push({ event: 'pattern_pick', pattern: a.dataset.pickLabel });
  });
})();
/* Phone and tablet rails move on their own while on screen, one card at a time, then loop.
   Habit cards: every 7 s, one full "pattern, then practice" picture cycle, enough to read the card.
   Moments photos: every 3.5 s, they carry only a name.
   Any touch, swipe or hover pauses the rail; it resumes 8 s after the last touch. */
(() => {
  'use strict';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const auto = (rail, step) => {
    if (!rail) return;
    let pausedUntil = 0, visible = false;
    const pause = () => { pausedUntil = Date.now() + 8000; };
    ['pointerdown', 'touchstart', 'wheel', 'mouseenter'].forEach((ev) => rail.addEventListener(ev, pause, { passive: true }));
    new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0.6 }).observe(rail);
    setInterval(() => {
      if (!visible || Date.now() < pausedUntil || rail.scrollWidth <= rail.clientWidth + 4) return;
      const pad = parseFloat(getComputedStyle(rail).scrollPaddingLeft) || 0;
      const x = rail.scrollLeft;
      const nextCard = [...rail.children].find((c) => c.offsetLeft - rail.offsetLeft - pad > x + 8);
      const atEnd = x + rail.clientWidth >= rail.scrollWidth - 8;
      rail.scrollTo({ left: atEnd || !nextCard ? 0 : nextCard.offsetLeft - rail.offsetLeft - pad, behavior: 'smooth' });
    }, step);
  };
  auto(document.querySelector('.v4-cards'), 7000);
  auto(document.querySelector('.v4-mo-grid'), 3500);
})();
/* Client words rail on phones: moves every 6 s (time to read one quote), same pause rules. */
(() => {
  'use strict';
  const rail = document.querySelector('.v4-proof .v4-quotes');
  if (!rail || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let pausedUntil = 0, visible = false;
  const pause = () => { pausedUntil = Date.now() + 8000; };
  ['pointerdown', 'touchstart', 'wheel', 'mouseenter'].forEach((ev) => rail.addEventListener(ev, pause, { passive: true }));
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0.6 }).observe(rail);
  setInterval(() => {
    if (!visible || Date.now() < pausedUntil || rail.scrollWidth <= rail.clientWidth + 4) return;
    const pad = parseFloat(getComputedStyle(rail).scrollPaddingLeft) || 0;
    const x = rail.scrollLeft;
    const n = [...rail.children].find((c) => c.offsetLeft - rail.offsetLeft - pad > x + 8);
    const atEnd = x + rail.clientWidth >= rail.scrollWidth - 8;
    rail.scrollTo({ left: atEnd || !n ? 0 : n.offsetLeft - rail.offsetLeft - pad, behavior: 'smooth' });
  }, 6000);
})();
/* The loop: plays thought, belief, words, reaction, then the break, every 2.8 s while on screen. Tapping a step jumps to it and pauses. */
(() => {
  'use strict';
  const box = document.querySelector('[data-loop]');
  if (!box) return;
  const nodes = [...box.querySelectorAll('.v4-ln')];
  const says = [...box.querySelectorAll('.v4-ls')];
  let at = 0, pausedUntil = 0, visible = false;
  const show = (n) => {
    at = n; box.dataset.at = n;
    nodes.forEach((b, k) => b.classList.toggle('is-on', k === n || (n === 4 && k <= 3 && false)));
    says.forEach((s) => { s.hidden = Number(s.dataset.step) !== n; });
    const c = box.querySelector('[data-loop-n]'); if (c) { c.textContent = n < 4 ? n + 1 : '✓'; c.nextElementSibling.textContent = n < 4 ? 'of 4' : 'loop broken'; }
  };
  nodes.forEach((b) => b.addEventListener('click', () => { pausedUntil = Date.now() + 9000; show(Number(b.dataset.step)); }));
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0.5 }).observe(box);
  show(0);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  setInterval(() => { if (!visible || reduce || Date.now() < pausedUntil) return; show((at + 1) % 5); }, 2800);
})();
/* Fact strip hides while the visitor scrolls down and comes back when they scroll up or reach the top. */
(() => {
  let last = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    if (Math.abs(y - last) < 6) return;
    document.body.classList.toggle('v4-tick-hide', y > last && y > 120);
    last = y;
  }, { passive: true });
})();
/* Hide floating buttons while any form is in view, so they never cover a field. */
(() => {
  const seen = new Set();
  const io = new IntersectionObserver((es) => { es.forEach((e) => { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); document.body.classList.toggle('v4-form-in', seen.size > 0); }, { threshold: 0.05 });
  document.querySelectorAll('#en-inline, #v4-hf, #v4-bf, .v4-quotes, .v4-proof-stats, .bk2-trust, .v4-ring, .v4-loopfilm, .v4-cards, .nq-cards, .pr4-grid, .cv5-list, .wy4-cards, .nw-cards, .no-grid, .n-calc, .n-creds, .fq2-list, .fq2-ask, .m5-actions, .v4-fl-card, .cl-tool, .cl-plans, .cl-toc, .cl-qs, .cl-en-fees').forEach((f) => io.observe(f));
})();
/* Meet ring: lights the four areas one after another every 2.6 s and shows that area's line in the centre. Tap an area to jump to it. */
(() => {
  'use strict';
  const ring = document.querySelector('.v4-ring');
  if (!ring) return;
  const items = [...ring.querySelectorAll('li')];
  const say = ring.querySelector('[data-core]');
  let at = 0, vis = false, paused = 0;
  const show = (n) => {
    at = n; items.forEach((li, k) => li.classList.toggle('is-on', k === n));
    say.classList.add('is-fade');
    setTimeout(() => { say.textContent = items[n].querySelector('small').textContent; say.classList.remove('is-fade'); }, 180);
  };
  items.forEach((li, k) => li.addEventListener('click', () => { paused = Date.now() + 8000; show(k); }));
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; }, { threshold: 0.4 }).observe(ring);
  show(0);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => { if (vis && Date.now() > paused) show((at + 1) % items.length); }, 2600);
})();
/* Loop explainer: tap to play the 6-second film; the button returns when it ends. */
(() => {
  const f = document.querySelector('.v4-loopfilm');
  if (!f) return;
  const v = f.querySelector('video'), b = f.querySelector('.v4-loop-play');
  b.addEventListener('click', () => { f.classList.add('is-playing'); v.play().catch(() => {}); window.dataLayer?.push({ event: 'video_play', video_name: 'loop-explainer' }); });
  v.addEventListener('ended', () => f.classList.remove('is-playing'));
})();
/* Floating buttons stay out of the hero, which has its own form. */
(() => { const set = () => document.body.classList.toggle('v4-top', scrollY < 480); set(); addEventListener('scroll', set, { passive: true }); })();
