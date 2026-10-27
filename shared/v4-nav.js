/* Landing page menu: builds the drawer from the page's own list (#v4-nav-items), jumps to sections, marks the one on screen. */
(() => {
  'use strict';
  const src = document.querySelector('#v4-nav-items');
  const head = document.querySelector('.header-inner');
  if (!src || !head) return;
  const cfg = JSON.parse(src.textContent);
  const I = {
    quote: '<path d="M7 21c0-5 2-9 7-11M17 21c0-5 2-9 7-11"/><path d="M7 21a3 3 0 1 0 0-.01M17 21a3 3 0 1 0 0-.01"/>',
    person: '<circle cx="16" cy="11" r="5"/><path d="M6 27a10 10 0 0 1 20 0"/>',
    star: '<path d="M16 4c1 6 6 11 12 12-6 1-11 6-12 12-1-6-6-11-12-12 6-1 11-6 12-12Z"/>',
    compass: '<circle cx="16" cy="16" r="11"/><path d="m20 12-2.5 5.5L12 20l2.5-5.5Z"/>',
    calc: '<rect x="8" y="4" width="16" height="24" rx="2.5"/><path d="M11.5 8h9v4h-9zM12 16.5h.01M16 16.5h.01M20 16.5h.01M12 20.5h.01M16 20.5h.01M20 20.5h.01M12 24.5h8"/>',
    loop: '<path d="M24 12a9 9 0 1 0 1 8"/><path d="M25 6v6h-6"/>',
    grid: '<rect x="5" y="5" width="9" height="9" rx="1.5"/><rect x="18" y="5" width="9" height="9" rx="1.5"/><rect x="5" y="18" width="9" height="9" rx="1.5"/><rect x="18" y="18" width="9" height="9" rx="1.5"/>',
    play: '<circle cx="16" cy="16" r="11"/><path d="m13.5 11 7 5-7 5Z"/>',
    heart: '<path d="M16 26s-10-6-10-13a5.5 5.5 0 0 1 10-3 5.5 5.5 0 0 1 10 3c0 7-10 13-10 13Z"/>',
    cal: '<rect x="5" y="7" width="22" height="20" rx="2"/><path d="M5 12h22M11 4v5M21 4v5"/><path d="m11.5 19.5 3 3 6-6"/>',
    ask: '<circle cx="16" cy="16" r="11"/><path d="M13 13a3 3 0 1 1 4 2.8c-.7.3-1 .9-1 1.6v.6M16 22h.01"/>',
    book: '<path d="M5 7c4-1.5 7.5-1 11 1.5V27c-3.5-2.5-7-3-11-1.5ZM27 7c-4-1.5-7.5-1-11 1.5V27c3.5-2.5 7-3 11-1.5Z"/>',
  };
  const svg = (k) => '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (I[k] || I.star) + '</svg>';
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'v4-burger'; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'v4-nav');
  btn.innerHTML = '<b>Menu</b><i aria-hidden="true"><span></span><span></span></i><span class="n-sr" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Open menu</span>';
  head.appendChild(btn);
  const bd = document.createElement('div'); bd.className = 'v4-nav-bd'; bd.setAttribute('aria-hidden', 'true');
  const nav = document.createElement('nav'); nav.id = 'v4-nav'; nav.className = 'v4-nav'; nav.setAttribute('aria-label', 'Page sections'); nav.setAttribute('aria-hidden', 'true'); nav.inert = true;
  const logo = head.querySelector('.brand img');
  nav.innerHTML = '<div class="v4-nav-head">' + (logo ? '<img src="' + logo.getAttribute('src') + '" alt="Transformation with NNG">' : '') + '<button type="button" class="v4-nav-x" aria-label="Close menu">×</button></div>'
    + '<p class="v4-nav-k">' + cfg.kicker + '</p><ul>'
    + cfg.items.map((it, k) => '<li style="--i:' + k + '"><a href="#' + it.id + '"><span class="v4-nav-i">' + svg(it.icon) + '</span><span class="v4-nav-t">' + it.label + (it.sub ? '<small>' + it.sub + '</small>' : '') + '</span><span class="v4-nav-c" aria-hidden="true">›</span></a></li>').join('')
    + '</ul><div class="v4-nav-foot"><a class="wa-btn" href="#enquire" data-source="menu">' + cfg.cta + '</a><p>Prefer to talk? <a href="tel:+919205511101">Call</a> or <a href="https://wa.me/919205511101" target="_blank" rel="noopener">WhatsApp</a></p></div>';
  document.body.append(bd, nav);
  let last = null;
  let lockY = 0;
  const lock = (on) => {
    /* iOS ignores overflow:hidden on body, so pin the page in place while the menu is open */
    const st = document.body.style;
    if (on) { lockY = scrollY; st.position = 'fixed'; st.top = -lockY + 'px'; st.left = '0'; st.right = '0'; st.width = '100%'; document.documentElement.style.scrollBehavior = 'auto'; }
    else if (st.position === 'fixed') { st.position = ''; st.top = ''; st.left = ''; st.right = ''; st.width = ''; scrollTo(0, lockY); document.documentElement.style.scrollBehavior = ''; }
  };
  const open = (on) => {
    if (on !== document.body.classList.contains('v4-nav-open')) lock(on);
    document.body.classList.toggle('v4-nav-open', on);
    btn.setAttribute('aria-expanded', String(on)); nav.setAttribute('aria-hidden', String(!on)); nav.inert = !on;
    if (on) { last = document.activeElement; nav.querySelector('.v4-nav-x').focus(); window.dataLayer?.push({ event: 'menu_open' }); }
    else if (last) last.focus({ preventScroll: true });
  };
  btn.addEventListener('click', () => open(true));
  bd.addEventListener('click', () => open(false));
  nav.querySelector('.v4-nav-x').addEventListener('click', () => open(false));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('v4-nav-open')) open(false); });
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    e.preventDefault(); last = null; open(false);
    const t = document.querySelector(a.getAttribute('href'));
    window.dataLayer?.push({ event: 'menu_jump', section: a.getAttribute('href').slice(1) });
    setTimeout(() => t && scrollTo({ top: t.getBoundingClientRect().top + scrollY - 36, behavior: 'smooth' }), 260);
  });
  const links = [...nav.querySelectorAll('ul a')];
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((l) => l.classList.toggle('is-here', l.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-40% 0px -55% 0px' });
  cfg.items.forEach((it) => { const s = document.getElementById(it.id); if (s) io.observe(s); });
})();
