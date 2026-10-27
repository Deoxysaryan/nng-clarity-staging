/* Brainology LP: the full enquiry form shown inline in the enquiry section. Same fields, checks, payload, endpoint and events as the popup. */
(() => {
  'use strict';
  const box = document.querySelector('#en-inline');
  const dlg = document.querySelector('#lf-dialog');
  if (!box || !dlg) return;
  const form = box.querySelector('#en-form');
  const done = box.querySelector('.lf-done');
  const endpoint = dlg.dataset.endpoint;
  const el = form.elements;
  const reason = el.reason;
  const detailsRow = box.querySelector('.lf-details');
  const status = box.querySelector('.lf-status');
  const submit = form.querySelector('.lf-submit');
  const offer = document.body.dataset.offer || document.body.dataset.page;
  const params = new URLSearchParams(location.search);
  const utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => { utm[k] = (params.get(k) || '').slice(0, 200); });

  let started = false;
  form.addEventListener('focusin', () => {
    if (started) return;
    started = true;
    window.dataLayer?.push({ event: 'lead_form_open', form_page: document.body.dataset.page, form_source: 'enquiry-inline' });
    if (typeof window.fbq === 'function') window.fbq('trackCustom', 'LeadFormOpen', { content_name: offer });
  });
  reason.addEventListener('change', () => { detailsRow.hidden = !reason.value; });

  const rules = {
    firstName: (v) => v ? '' : 'Please enter your first name.',
    lastName: (v) => v ? '' : 'Please enter your last name.',
    email: (v) => !v ? 'Please enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Please enter a valid email address.',
    mobile: (v) => {
      const d = v.replace(/\D/g, '');
      if (!d) return 'Please enter your mobile number.';
      if (el.countryCode.value === '+91') return /^[6-9]\d{9}$/.test(d) ? '' : 'Please enter a 10-digit Indian mobile number.';
      return d.length >= 6 && d.length <= 14 ? '' : 'Please enter a valid mobile number.';
    },
    occupation: (v) => v ? '' : 'Please choose your occupation.',
  };
  const setError = (name, msg) => {
    const f = el[name].closest('.lf-field');
    f.classList.toggle('has-error', !!msg);
    el[name].setAttribute('aria-invalid', msg ? 'true' : 'false');
    f.querySelector('.lf-error').textContent = msg;
  };
  Object.keys(rules).forEach((n) => {
    el[n].addEventListener('blur', () => { if (el[n].value.trim()) setError(n, rules[n](el[n].value.trim())); });
    el[n].addEventListener('input', () => { if (el[n].closest('.has-error')) setError(n, rules[n](el[n].value.trim())); });
  });
  const ccShow = box.querySelector('.lf-cc-show');
  el.countryCode.addEventListener('change', () => { if (ccShow) ccShow.textContent = el.countryCode.value; });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    let first = null;
    Object.keys(rules).forEach((n) => { const m = rules[n](el[n].value.trim()); setError(n, m); if (m && !first) first = el[n]; });
    if (first) { first.focus(); return; }
    const data = {
      page: offer, source: 'enquiry-inline',
      firstName: el.firstName.value.trim(), lastName: el.lastName.value.trim(), email: el.email.value.trim(),
      countryCode: el.countryCode.value, mobile: el.mobile.value.replace(/\D/g, ''), occupation: el.occupation.value,
      reason: reason.value, session: (el.session && el.session.value) || '', details: [el.session && el.session.value ? 'Session: ' + el.session.value : '', reason.value ? el.details.value.trim() : ''].filter(Boolean).join(' | '), website: el.website.value,
      url: location.href.split('#')[0], referrer: document.referrer, ...utm,
    };
    submit.disabled = true; submit.classList.add('is-sending');
    try {
      if (!endpoint) throw new Error('No endpoint');
      if (endpoint !== 'preview') {
        const res = await fetch(endpoint, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || !out.ok) throw new Error(out.error || 'Failed');
      }
      done.querySelector('[data-lf-name]').textContent = data.firstName;
      form.hidden = true; done.hidden = false;
      window.dataLayer?.push({ event: 'generate_lead', form_page: document.body.dataset.page, form_source: 'enquiry-inline', lead_reason: data.reason || 'none' });
      if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: offer });
    } catch (err) {
      status.textContent = 'Sorry, your enquiry could not be sent. Please try again, or call +91 92055 11101.';
    } finally { submit.disabled = false; submit.classList.remove('is-sending'); }
  });
})();
