/* Brainology LP: gated book request. Name, email, mobile and occupation are all required.
   Sends to the same enquiry endpoint, marked source "book-request", so every request lands in the NNG sheet. */
(() => {
  'use strict';
  const f = document.querySelector('#v4-bf');
  const dlg = document.querySelector('#lf-dialog');
  if (!f || !dlg) return;
  const endpoint = dlg.dataset.endpoint;
  const el = f.elements;
  const status = f.querySelector('.v4-hf-status');
  const done = f.querySelector('.v4-bf-done');
  const offer = document.body.dataset.offer || document.body.dataset.page;
  const params = new URLSearchParams(location.search);
  const utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => { utm[k] = (params.get(k) || '').slice(0, 200); });
  const rules = {
    name: (v) => v.length >= 2 ? '' : 'Please enter your full name.',
    email: (v) => !v ? 'Please enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Please enter a valid email address.',
    mobile: (v) => {
      const d = v.replace(/\D/g, '');
      if (!d) return 'Please enter your mobile number.';
      if (el.countryCode.value === '+91') return /^[6-9]\d{9}$/.test(d) ? '' : 'Please enter a 10-digit Indian mobile number.';
      return d.length >= 6 && d.length <= 14 ? '' : 'Please enter a valid mobile number.';
    },
    occupation: (v) => v ? '' : 'Please choose your occupation.',
  };
  const setErr = (n, m) => {
    const box = el[n].closest('.v4-hf-f');
    box.classList.toggle('has-error', !!m);
    el[n].setAttribute('aria-invalid', m ? 'true' : 'false');
    box.querySelector('.v4-hf-err').textContent = m;
  };
  Object.keys(rules).forEach((n) => el[n].addEventListener('input', () => { if (el[n].closest('.has-error')) setErr(n, rules[n](el[n].value.trim())); }));
  let started = false;
  f.addEventListener('focusin', () => {
    if (started) return; started = true;
    window.dataLayer?.push({ event: 'lead_form_open', form_page: document.body.dataset.page, form_source: 'book-request' });
  });
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    let first = null;
    Object.keys(rules).forEach((n) => { const m = rules[n](el[n].value.trim()); setErr(n, m); if (m && !first) first = el[n]; });
    if (first) { first.focus(); return; }
    const parts = el.name.value.trim().split(/\s+/);
    const data = {
      page: offer, source: 'book-request',
      firstName: parts[0], lastName: parts.slice(1).join(' ') || '-',
      email: el.email.value.trim(), countryCode: el.countryCode.value, mobile: el.mobile.value.replace(/\D/g, ''),
      occupation: el.occupation.value, reason: 'Other',
      details: 'Book request: Change Your Mind, Transform Your Life. Please email a copy.',
      website: el.website.value, url: location.href.split('#')[0], referrer: document.referrer, ...utm,
    };
    const btn = f.querySelector('.v4-bf-btn');
    btn.disabled = true; status.textContent = '';
    try {
      if (!endpoint) throw new Error('No endpoint');
      if (endpoint !== 'preview') {
        const res = await fetch(endpoint, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || !out.ok) throw new Error(out.error || 'Failed');
      }
      f.querySelector('[data-bf-name]').textContent = data.firstName;
      f.querySelector('[data-bf-email]').textContent = data.email;
      f.querySelectorAll('.v4-bf-title, .v4-bf-grid, .v4-bf-btn').forEach((x) => { x.hidden = true; });
      done.hidden = false;
      window.dataLayer?.push({ event: 'generate_lead', form_page: document.body.dataset.page, form_source: 'book-request', lead_reason: 'book' });
      if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: offer + ' (book request)' });
    } catch (err) {
      status.textContent = 'Sorry, your request could not be sent. Please try again, or call +91 92055 11101.';
    } finally { btn.disabled = false; }
  });
})();
