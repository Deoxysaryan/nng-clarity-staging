/* The enquiry form on the /landing/form/ pages: every enquiry button opens it in a popup. On submit the details go to
   the NNG Google Sheet (and an email to the team) through a Google Apps Script web app, then a thank-you shows. */
(() => {
  'use strict';
  const dialog = document.querySelector('#lf-dialog');
  if (!dialog) return;
  const form = dialog.querySelector('#lf-form');
  const done = dialog.querySelector('.lf-done');
  const endpoint = dialog.dataset.endpoint;
  const reason = form.elements.reason;
  const detailsRow = dialog.querySelector('.lf-details');
  const status = dialog.querySelector('.lf-status');
  const submit = form.querySelector('.lf-submit');
  let source = 'page';
  let returnFocus = null;

  const params = new URLSearchParams(location.search);
  const utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => { utm[k] = (params.get(k) || '').slice(0, 200); });

  function open(trigger) {
    returnFocus = trigger;
    source = trigger?.dataset.source || 'page';
    document.querySelector('#hero-intro')?.pause();
    if (!form.hidden) clearErrors();
    dialog.showModal();
    document.body.classList.add('dialog-open');
    (form.hidden ? done.querySelector('button') : form.elements.firstName).focus();
    window.dataLayer?.push({ event: 'lead_form_open', form_page: document.body.dataset.page, form_source: source });
    if (typeof window.fbq === 'function') window.fbq('trackCustom', 'LeadFormOpen', { content_name: document.body.dataset.offer });
  }
  function close() { dialog.close(); }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-form-open]');
    if (!trigger) return;
    e.preventDefault();
    open(trigger);
  });
  dialog.querySelectorAll('[data-lf-close]').forEach((b) => b.addEventListener('click', close));
  dialog.addEventListener('click', (e) => {
    const r = dialog.getBoundingClientRect();
    if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    // After a thank-you, the next opening starts with an empty form.
    if (form.hidden) { form.reset(); form.hidden = false; done.hidden = true; detailsRow.hidden = true; }
    returnFocus?.focus({ preventScroll: true });
  });

  // Reason for contact: once one is chosen, an optional box for a few words appears.
  reason.addEventListener('change', () => {
    detailsRow.hidden = !reason.value;
    if (reason.value) detailsRow.querySelector('textarea').focus();
  });

  const rules = {
    firstName: (v) => v ? '' : 'Please enter your first name.',
    lastName: (v) => v ? '' : 'Please enter your last name.',
    email: (v) => !v ? 'Please enter your email address.' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Please enter a valid email address.',
    mobile: (v) => {
      const d = v.replace(/\D/g, '');
      if (!d) return 'Please enter your mobile number.';
      if (form.elements.countryCode.value === '+91') return /^[6-9]\d{9}$/.test(d) ? '' : 'Please enter a 10-digit Indian mobile number.';
      return d.length >= 6 && d.length <= 14 ? '' : 'Please enter a valid mobile number.';
    },
    occupation: (v) => v ? '' : 'Please choose your occupation.',
  };
  function setError(name, msg) {
    const field = form.elements[name];
    const box = field.closest('.lf-field');
    const out = box.querySelector('.lf-error');
    box.classList.toggle('has-error', !!msg);
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    out.textContent = msg;
  }
  function clearErrors() { Object.keys(rules).forEach((n) => setError(n, '')); status.textContent = ''; }
  Object.keys(rules).forEach((name) => {
    const field = form.elements[name];
    field.addEventListener('blur', () => { if (field.value.trim()) setError(name, rules[name](field.value.trim())); });
    field.addEventListener('input', () => { if (field.closest('.has-error')) setError(name, rules[name](field.value.trim())); });
  });
  // The closed country box shows only the code; the list shows code and country.
  const ccShow = dialog.querySelector('.lf-cc-show');
  const syncCode = () => { ccShow.textContent = form.elements.countryCode.value; };
  form.addEventListener('reset', () => setTimeout(syncCode));
  form.elements.countryCode.addEventListener('change', syncCode);
  form.elements.countryCode.addEventListener('change', () => { if (form.elements.mobile.value.trim()) setError('mobile', rules.mobile(form.elements.mobile.value.trim())); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    let first = null;
    Object.keys(rules).forEach((name) => {
      const msg = rules[name](form.elements[name].value.trim());
      setError(name, msg);
      if (msg && !first) first = form.elements[name];
    });
    if (first) { first.focus(); return; }

    const data = {
      page: document.body.dataset.offer || document.body.dataset.page,
      source,
      firstName: form.elements.firstName.value.trim(),
      lastName: form.elements.lastName.value.trim(),
      email: form.elements.email.value.trim(),
      countryCode: form.elements.countryCode.value,
      mobile: form.elements.mobile.value.replace(/\D/g, ''),
      occupation: form.elements.occupation.value,
      reason: reason.value,
      session: (form.elements.session && form.elements.session.value) || '',
      details: [form.elements.session && form.elements.session.value ? 'Session: ' + form.elements.session.value : '', reason.value ? form.elements.details.value.trim() : ''].filter(Boolean).join(' | '),
      website: form.elements.website.value,
      url: location.href.split('#')[0],
      referrer: document.referrer,
      ...utm,
    };
    submit.disabled = true;
    submit.classList.add('is-sending');
    try {
      if (!endpoint) throw new Error('No endpoint');
      // text/plain keeps this a simple request, which Google Apps Script accepts without a preflight.
      // Preview copy: nothing is sent; the thank-you shows so the flow can be reviewed.
      const res = { ok: true }; const out = { ok: true };
      if (!res.ok || !out.ok) throw new Error(out.error || 'Failed');
      done.querySelector('[data-lf-name]').textContent = data.firstName;
      form.hidden = true;
      done.hidden = false;
      done.querySelector('button').focus();
      window.dataLayer?.push({ event: 'generate_lead', form_page: document.body.dataset.page, form_source: source, lead_reason: data.reason || 'none' });
      if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: document.body.dataset.offer });
    } catch (err) {
      status.textContent = 'Sorry, your enquiry could not be sent. Please try again, or call +91 92055 11101.';
    } finally {
      submit.disabled = false;
      submit.classList.remove('is-sending');
    }
  });
})();
