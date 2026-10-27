/* No tracking vendor, personal fields, persistent storage or automatic messages. */
(() => {
  'use strict';
  const menuButton=document.querySelector('.menu-button');
  const nav=document.querySelector('#landing-nav');
  const pageName=document.body.dataset.page;
  const offer=document.body.dataset.offer;
  // Optional diagram exploration. All labels, scope and limitations remain visible.
  document.querySelectorAll('.visual-explainer').forEach(figure=>{
    const labels=[...figure.querySelectorAll('[data-visual-step]')];
    figure.querySelector('.visual-hint').hidden=false;
    labels.forEach(button=>{
      button.disabled=false;
      button.addEventListener('click',()=>{
        const reset=button.getAttribute('aria-pressed')==='true';
        labels.forEach(label=>label.setAttribute('aria-pressed',String(!reset&&label===button)));
        if(reset)delete figure.dataset.visualActive;
        else figure.dataset.visualActive=button.dataset.visualStep;
      });
    });
  });
  const clean=s=>String(s||'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,120);
  function closeMenu(){if(!nav||!menuButton)return;nav.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Open page menu');}
  if(menuButton&&nav)menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';nav.classList.toggle('is-open',open);menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close page menu':'Open page menu');});
  if(nav)nav.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
  document.addEventListener('click',e=>{if(!e.target.closest('.header'))closeMenu();});
  const topicButtons=[...document.querySelectorAll('[data-select-topic]')];
  topicButtons.forEach((button,index)=>button.addEventListener('click',()=>{
    topicButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    const topic=index===0?'':clean(button.dataset.selectTopic);
    document.querySelector('.selected-topic').textContent=topic?`Enquiry topic: ${topic}`:`General ${offer} enquiry`;
    document.querySelectorAll('[data-whatsapp]:not([data-topic])').forEach(a=>{
      const text=[`Hello NNG team, I would like to enquire about ${offer}.`,topic?`My enquiry is about: ${topic}.`:'','Please share the appropriate scope, format, duration, fees and availability.',`Enquiry source: ${pageName} landing page (${clean(a.dataset.source)}).`].filter(Boolean).join('\n');
      a.href=`https://wa.me/919205511101?text=${encodeURIComponent(text)}`;
    });
  }));
  // Optional integration event means link intent only, never a sent message or booking.
  document.querySelectorAll('[data-whatsapp]').forEach(a=>a.addEventListener('click',()=>document.dispatchEvent(new CustomEvent('nng:enquiry-intent',{detail:{source:clean(a.dataset.source),offer,page:pageName}}))));

  const videos={
    deepa:{title:'Deepa’s experience',id:'1UYkU2iDhSzTj9R_ecnDAjL_5NdMmL5se',note:'Written quotation translated from Hindi. A personal experience of Narayani’s wider guidance.'},
    manish:{title:'Manish’s experience',id:'1LZi0IWknj_vDINvaMf1n0OdIQHnZOGyp',note:'Written quotation translated from Hindi. A personal experience of Narayani’s wider guidance.'},
    navleen:{title:'Navleen’s experience',id:'1l0SNg8sedyAuktzfDbX9GzY5R-fJMd1-',note:'A family’s account of major decisions. Availability in a testimonial is not a response-time promise or proof of programme membership.'},
    london:{title:'A client in London',id:'1AwPpu4js_H6nEMStqEz5cMaVMaKgpAe0',note:'Her account of business and personal guidance, not a verified result of any one consultation service.'},
    puneet:{title:'Puneet’s experience',id:'1kuLWPPJJ6taVMR19VpA1lUjv6MEMYExa',note:'Puneet describes working in banking. No employer, division or senior job title is inferred.'},
  };
  const videoDialog=document.querySelector('#video-dialog');
  const privacyDialog=document.querySelector('#privacy-dialog');
  const stage=document.querySelector('#video-stage');
  let returnFocus=null;
  function openDialog(dialog,trigger){closeMenu();document.querySelector('#hero-intro')?.pause();returnFocus=trigger;dialog.showModal();document.body.classList.add('dialog-open');dialog.querySelector('.dialog-close').focus();}
  for(const dialog of [videoDialog,privacyDialog]){
    dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
    dialog.addEventListener('close',()=>{if(dialog===videoDialog)stage.replaceChildren();document.body.classList.remove('dialog-open');returnFocus?.focus({preventScroll:true});});
  }
  document.querySelectorAll('[data-video]').forEach(trigger=>trigger.addEventListener('click',()=>{
    const film=videos[trigger.dataset.video];
    stage.replaceChildren();document.querySelector('#video-title').textContent=film.title;document.querySelector('#video-note').textContent=film.note;
    const panel=document.createElement('div');panel.className='external-video';
    const note=document.createElement('p');note.textContent='This film is hosted on Google Drive. Loading it connects your browser to Google. You can also open the original in a new tab.';
    const load=document.createElement('button');load.type='button';load.className='button';load.textContent='Load the client video';
    const original=document.createElement('a');original.className='text-link';original.href=`https://drive.google.com/file/d/${film.id}/view`;original.target='_blank';original.rel='noopener noreferrer';original.textContent='Open original on Google Drive ↗';
    load.addEventListener('click',()=>{const iframe=document.createElement('iframe');iframe.title=film.title;iframe.src=`https://drive.google.com/file/d/${film.id}/preview`;iframe.allow='fullscreen';iframe.setAttribute('allowfullscreen','');iframe.referrerPolicy='no-referrer';stage.replaceChildren(iframe);videoDialog.querySelector('.dialog-close').focus();});
    panel.append(note,load,document.createElement('br'),original);stage.append(panel);openDialog(videoDialog,trigger);
  }));
  document.querySelector('[data-privacy]').addEventListener('click',e=>openDialog(privacyDialog,e.currentTarget));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]'))closeMenu();});
  matchMedia('(min-width:801px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
  if('IntersectionObserver' in window){
    const artObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('is-seen');artObserver.unobserve(e.target);}},{threshold:.25});
    document.querySelectorAll('[data-motion]').forEach(e=>artObserver.observe(e));
    const sticky=document.querySelector('.mobile-cta');let heroVisible=true,enquiryVisible=false,footerVisible=false;
    const stickyObserver=new IntersectionObserver(entries=>{for(const e of entries){if(e.target.classList.contains('hero-actions'))heroVisible=e.isIntersecting;if(e.target.classList.contains('enquiry-section'))enquiryVisible=e.isIntersecting;if(e.target.classList.contains('footer'))footerVisible=e.isIntersecting;}if(sticky)sticky.hidden=heroVisible||enquiryVisible||footerVisible;},{threshold:0});
    ['.hero-actions','.enquiry-section','.footer'].forEach(s=>{const el=document.querySelector(s);if(el)stickyObserver.observe(el);});
  }
})();
