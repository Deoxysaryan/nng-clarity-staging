/* Brainology LP: the two-step enquiry form in the hero. Same payload, endpoint and events as the popup form. */
(() => {
  'use strict';
  const f = document.querySelector('#v4-hf');
  const dlg = document.querySelector('#lf-dialog');
  if (!f || !dlg) return;
  const endpoint = dlg.dataset.endpoint;
  const steps = f.querySelectorAll('.v4-hf-step');
  const done = f.querySelector('.v4-hf-done');
  const status = f.querySelector('.v4-hf-status');
  const el = f.elements;
  const params = new URLSearchParams(location.search);
  const utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => { utm[k] = (params.get(k) || '').slice(0, 200); });
  const offer = document.body.dataset.offer || document.body.dataset.page;
  const rules = {
    firstName: (v) => v ? '' : 'Please enter your first name.',
    mobile: (v) => {
      const d = v.replace(/\D/g, '');
      if (!d) return 'Please enter your mobile number.';
      if (el.countryCode.value === '+91') return /^[6-9]\d{9}$/.test(d) ? '' : 'Please enter a 10-digit Indian mobile number.';
      return d.length >= 6 && d.length <= 14 ? '' : 'Please enter a valid mobile number.';
    },
    lastName: (v) => v ? '' : 'Please enter your last name.',
    email: (v) => !v ? 'Please enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Please enter a valid email address.',
    occupation: (v) => v ? '' : 'Please choose your occupation.',
  };
  const setErr = (name, msg) => {
    const box = el[name].closest('.v4-hf-f');
    box.classList.toggle('has-error', !!msg);
    el[name].setAttribute('aria-invalid', msg ? 'true' : 'false');
    box.querySelector('.v4-hf-err').textContent = msg;
  };
  const check = (names) => {
    let first = null;
    names.forEach((n) => { const m = rules[n](el[n].value.trim()); setErr(n, m); if (m && !first) first = el[n]; });
    if (first) first.focus();
    return !first;
  };
  Object.keys(rules).forEach((n) => el[n].addEventListener('input', () => { if (el[n].closest('.has-error')) setErr(n, rules[n](el[n].value.trim())); }));
  const show = (i) => { steps.forEach((s, k) => { s.hidden = k !== i; }); };
  let step = 0;
  let opened = false;
  f.querySelector('.v4-hf-back').addEventListener('click', () => { step = 0; show(0); el.firstName.focus(); });
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (step === 0) {
      if (!check(['firstName', 'mobile'])) return;
      f.querySelectorAll('[data-hf-name]').forEach((s) => { s.textContent = el.firstName.value.trim(); });
      step = 1; show(1); el.lastName.focus();
      if (!opened) {
        opened = true;
        window.dataLayer?.push({ event: 'lead_form_open', form_page: document.body.dataset.page, form_source: 'hero-form' });
        if (typeof window.fbq === 'function') window.fbq('trackCustom', 'LeadFormOpen', { content_name: offer });
      }
      return;
    }
    if (!check(['lastName', 'email', 'occupation'])) return;
    const r = f.querySelector('input[name="hfReason"]:checked');
    const data = {
      page: offer, source: 'hero-form',
      firstName: el.firstName.value.trim(), lastName: el.lastName.value.trim(), email: el.email.value.trim(),
      countryCode: el.countryCode.value, mobile: el.mobile.value.replace(/\D/g, ''), occupation: el.occupation.value,
      reason: r ? r.value : '', session: (el.session && el.session.value) || '', details: [el.session && el.session.value ? 'Session: ' + el.session.value : '', r ? r.dataset.label : ''].filter(Boolean).join(' | '), website: el.website.value,
      url: location.href.split('#')[0], referrer: document.referrer, ...utm,
    };
    const btn = steps[1].querySelector('button[type="submit"]');
    btn.disabled = true; status.textContent = '';
    try {
      if (!endpoint) throw new Error('No endpoint');
      if (endpoint !== 'preview') {
        const res = await fetch(endpoint, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || !out.ok) throw new Error(out.error || 'Failed');
      }
      steps.forEach((s) => { s.hidden = true; });
      f.querySelector('.v4-hf-title').hidden = true;
      done.hidden = false;
      window.dataLayer?.push({ event: 'generate_lead', form_page: document.body.dataset.page, form_source: 'hero-form', lead_reason: data.reason || 'none' });
      if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: offer });
    } catch (err) {
      status.textContent = 'Sorry, your enquiry could not be sent. Please try again, or call +91 92055 11101.';
    } finally { btn.disabled = false; }
  });
})();
