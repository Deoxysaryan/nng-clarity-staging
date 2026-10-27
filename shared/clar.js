/* Clarity LP: the free "Where do you need clarity first?" check, session pre-fill, and in-view motion. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fill the enquiry form with a session (and optionally an area and a note), then bring it into view.
  const fillForm = ({ session, reason, details }) => {
    const form = document.querySelector('#en-form');
    if (!form) return false;
    if (session && form.elements.session) form.elements.session.value = session;
    if (reason && form.elements.reason) { form.elements.reason.value = reason; form.elements.reason.dispatchEvent(new Event('change')); }
    if (details && form.elements.details && !form.elements.details.value) form.elements.details.value = details;
    document.querySelector('#enquire').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => form.elements.firstName.focus({ preventScroll: true }), 700);
    return true;
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-pick-session]');
    if (!a) return;
    e.preventDefault();
    fillForm({ session: a.dataset.pickSession });
    window.dataLayer?.push({ event: 'session_pick', session: a.dataset.pickSession, form_source: a.dataset.source || 'page' });
  });

  // Free check: four taps, then a personal result. Nothing is stored or sent.
  const tool = document.querySelector('[data-cltool]');
  if (tool) {
    const Q2 = {
      Career: ['Thinking of a job change', 'Planning to start something of my own', 'Working hard, but no growth', 'Unsure of my direction'],
      Money: ['A big investment or property decision', 'Planning to expand the business', 'Effort is high, results are not', 'Money comes, but does not stay'],
      Relationships: ['A marriage or rishta decision', 'Tension at home', 'Unsure about a relationship', 'Children’s future and family plans'],
      Health: ['Too much on my plate', 'Low energy most days', 'No time for myself', 'Worried about someone at home'],
    };
    const TONIGHT = {
      Career: 'Write down the one work decision you keep postponing. Under it, write what waiting one more year would cost you.',
      Money: 'Write down the money step you are weighing. Next to it, write what would make you feel ready, apart from the money itself.',
      Relationships: 'Write down the one conversation you have been avoiding. Then write the first sentence you would say, kindly.',
      Health: 'Before you sleep, write three things you said yes to today that you could have said no to.',
    };
    const DUR = { weeks: 'for a few weeks', months: 'for a few months', year: 'for more than a year' };
    const icons = {};
    tool.querySelectorAll('[data-q="0"] button').forEach((b) => { icons[b.dataset.v] = b.querySelector('svg').outerHTML; });
    const qs = [...tool.querySelectorAll('.cl-q')];
    const prog = [...tool.querySelectorAll('.cl-prog i')];
    const res = tool.querySelector('.cl-res');
    const ans = {};
    let started = false;
    const show = (n) => {
      qs.forEach((q, k) => { q.hidden = k !== n; });
      prog.forEach((p, k) => p.classList.toggle('is-on', k <= n));
      res.hidden = n < 4;
      tool.classList.toggle('is-done', n >= 4);
      const q = qs[n];
      if (q && started) q.querySelector('button')?.focus({ preventScroll: true });
    };
    const result = () => {
      const area = ans[0], sit = ans[1], dur = ans[2], tried = ans[3];
      const bigStep = Q2[area].indexOf(sit) === 0 || Q2[area].indexOf(sit) === 1;
      const adv = dur === 'year' || tried === 'remedies' || bigStep;
      res.querySelector('[data-res-ic]').innerHTML = icons[area];
      res.querySelector('[data-res-area]').textContent = area;
      res.querySelector('[data-res-why]').textContent = `You said: ${sit.charAt(0).toLowerCase() + sit.slice(1)}, ${DUR[dur]}. That is where we begin.`;
      res.querySelector('[data-res-tonight]').textContent = TONIGHT[area];
      res.querySelector('[data-res-ses]').textContent = adv ? 'Advanced Clarity' : 'Clarity Session';
      res.querySelector('[data-res-fee]').textContent = adv ? 'Rs 11,000 · with Life Map Report 2027' : 'Rs 5,000 · spoken guidance';
      res.querySelector('[data-res-sesw]').textContent = adv
        ? (bigStep ? 'A step this big deserves the right month. You get the whole year in writing, on WhatsApp within 9 hours of your session.' : 'Something on your mind this long needs a plan you can keep all year. You get it in writing, on WhatsApp within 9 hours of your session.')
        : 'One clear, one-to-one conversation is the right place to start.';
      const book = res.querySelector('[data-cl-book]');
      book.dataset.session = adv ? 'Advanced Clarity' : 'Clarity';
      book.dataset.area = area;
      book.dataset.note = `Free check: ${sit}, ${DUR[dur]}`;
      window.dataLayer?.push({ event: 'clarity_check_done', check_area: area, check_session: book.dataset.session });
    };
    tool.addEventListener('click', (e) => {
      const b = e.target.closest('.cl-q button');
      if (!b) return;
      started = true;
      const n = Number(b.closest('.cl-q').dataset.q);
      ans[n] = b.dataset.v;
      b.classList.add('is-picked');
      if (n === 0) {
        tool.querySelector('[data-dyn]').innerHTML = Q2[ans[0]].map((t) => `<button type="button" data-v="${t}">${t}</button>`).join('');
        window.dataLayer?.push({ event: 'clarity_check_start', check_area: ans[0] });
      }
      setTimeout(() => { b.classList.remove('is-picked'); if (n === 3) result(); show(n + 1); }, reduce ? 0 : 220);
    });
    res.querySelector('[data-cl-book]').addEventListener('click', (e) => {
      e.preventDefault();
      const d = e.currentTarget.dataset;
      fillForm({ session: d.session, reason: d.area, details: d.note });
      window.dataLayer?.push({ event: 'session_pick', session: d.session, form_source: 'clarity-check' });
    });
    res.querySelector('.cl-again').addEventListener('click', () => { Object.keys(ans).forEach((k) => delete ans[k]); show(0); });
    show(0);
  }

  // In-view motion: wheel, report pages, question chips, hero chips. One class each; CSS does the rest.
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-on'); io.unobserve(e.target); } }), { threshold: 0.3 });
  document.querySelectorAll('[data-wheel], [data-book], .cl-qs, .cl-plans, .cl-toc').forEach((el) => io.observe(el));

  // Question chips: light one at a time while on screen.
  const qList = document.querySelector('.cl-qs ul');
  if (qList && !reduce) {
    const items = [...qList.children]; let k = 0, t = null;
    new IntersectionObserver(([e]) => { clearInterval(t); if (e.isIntersecting) t = setInterval(() => { items.forEach((li, j) => li.classList.toggle('is-lit', j === k)); k = (k + 1) % items.length; }, 1800); }, { threshold: 0.4 }).observe(qList);
  }
})();
