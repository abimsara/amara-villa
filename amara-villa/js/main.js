/* ============ MOBILE MENU ============ */
(function(){
  const menuBtn = document.querySelector('.menu-btn');
  const nav = document.getElementById('nav');
  if(!menuBtn || !nav) return;

  function closeNav(){
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded','false');
    document.body.classList.remove('nav-open');
  }
  function openNav(){
    nav.classList.add('open');
    menuBtn.setAttribute('aria-expanded','true');
    document.body.classList.add('nav-open');
  }
  menuBtn.addEventListener('click',(e)=>{
    e.stopPropagation();
    nav.classList.contains('open') ? closeNav() : openNav();
  });
  document.addEventListener('click',(e)=>{
    if(!nav.classList.contains('open')) return;
    if(nav.contains(e.target) || menuBtn.contains(e.target)) return;
    closeNav();
  });
  document.addEventListener('keydown',(e)=>{
    if(e.key === 'Escape') closeNav();
  });
  window.addEventListener('resize',()=>{
    if(window.innerWidth > 980) closeNav();
  });
})();

/* ============ STICKY HEADER SHADOW ============ */
(function(){
  const header = document.querySelector('.site-header');
  if(!header) return;
  function check(){
    header.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', check, {passive:true});
  check();
})();

/* ============ SCROLL REVEAL ============ */
(function(){
  const els = document.querySelectorAll('.reveal');
  if(!els.length) return;
  if(!('IntersectionObserver' in window)){
    els.forEach(el=>el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
  els.forEach(el=>io.observe(el));
})();

/* ============ DATE LOGIC (checkin -> checkout) ============ */
(function(){
  const checkin = document.getElementById('checkin');
  const checkout = document.getElementById('checkout');
  if(!checkin || !checkout) return;

  const today = new Date().toISOString().split('T')[0];
  checkin.min = today;
  checkout.min = today;

  checkin.addEventListener('change', ()=>{
    if(!checkin.value) return;
    checkout.min = checkin.value;
    if(checkout.value && checkout.value <= checkin.value){
      const d = new Date(checkin.value);
      d.setDate(d.getDate()+1);
      checkout.value = d.toISOString().split('T')[0];
    }
  });
  checkout.addEventListener('change', ()=>{
    if(checkin.value && checkout.value && checkout.value <= checkin.value){
      checkout.setCustomValidity('Check-out must be after check-in');
    }else{
      checkout.setCustomValidity('');
    }
  });
})();

/* ============ HOME — BOOKING BAR → CONTACT PAGE ============ */
(function(){
  const form = document.getElementById('availability-form');
  if(!form) return;
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const ci = document.getElementById('checkin').value;
    const co = document.getElementById('checkout').value;
    const g  = document.getElementById('guests').value;
    const s  = document.getElementById('suite').value;
    const params = new URLSearchParams({checkin:ci, checkout:co, guests:g, suite:s});
    window.location.href = 'contact.html?' + params.toString();
  });
})();

/* ============ CONTACT — PREFILL FROM URL ============ */
(function(){
  const form = document.getElementById('booking-form');
  if(!form) return;
  const params = new URLSearchParams(window.location.search);
  ['checkin','checkout','guests','suite'].forEach(k=>{
    const el = document.getElementById(k);
    const v = params.get(k);
    if(el && v){ el.value = v; }
  });
  // re-run date min logic for prefilled values
  const ci = document.getElementById('checkin');
  const co = document.getElementById('checkout');
  if(ci && co && ci.value){
    co.min = ci.value;
  }
})();

/* ============ CONTACT FORM SUBMIT ============ */
(function(){
  const form = document.getElementById('booking-form');
  if(!form) return;
  const ok = document.getElementById('form-ok');
  const err = document.getElementById('form-err');

  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const ci = document.getElementById('checkin').value;
    const co = document.getElementById('checkout').value;

    ok.classList.remove('show');
    err.classList.remove('show');

    if(ci && co && co <= ci){
      document.getElementById('checkout').setCustomValidity('Check-out must be after check-in');
      form.reportValidity();
      return;
    }
    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }
    // No backend — show success. Connect to WPForms / backend later.
    ok.classList.add('show');
    form.reset();
    ok.scrollIntoView({behavior:'smooth', block:'center'});
    setTimeout(()=>ok.classList.remove('show'), 8000);
  });
})();

/* ============ LIGHTBOX GALLERY ============ */
(function(){
  const gallery = document.querySelector('.gallery');
  if(!gallery) return;
  const links = Array.from(gallery.querySelectorAll('a'));
  if(!links.length) return;

  // Build lightbox DOM once
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role','dialog');
  lb.setAttribute('aria-modal','true');
  lb.setAttribute('aria-label','Image viewer');
  lb.innerHTML = `
    <button class="lb-close" aria-label="Close">✕</button>
    <button class="lb-prev" aria-label="Previous">‹</button>
    <button class="lb-next" aria-label="Next">›</button>
    <img alt="" />
    <span class="lb-count"></span>
  `;
  document.body.appendChild(lb);

  const imgEl = lb.querySelector('img');
  const countEl = lb.querySelector('.lb-count');
  let idx = 0;

  function show(i){
    idx = (i + links.length) % links.length;
    const link = links[idx];
    const img = link.querySelector('img');
    imgEl.src = img.src;
    imgEl.alt = img.alt || '';
    countEl.textContent = (idx+1) + ' / ' + links.length;
  }
  function open(i){
    show(i);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close(){
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  links.forEach((a,i)=>{
    a.addEventListener('click',(e)=>{
      e.preventDefault();
      open(i);
    });
  });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', ()=>show(idx-1));
  lb.querySelector('.lb-next').addEventListener('click', ()=>show(idx+1));
  lb.addEventListener('click',(e)=>{ if(e.target === lb) close(); });
  document.addEventListener('keydown',(e)=>{
    if(!lb.classList.contains('open')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowLeft') show(idx-1);
    if(e.key === 'ArrowRight') show(idx+1);
  });
  // Touch swipe
  let sx = 0;
  lb.addEventListener('touchstart',(e)=>{ sx = e.touches[0].clientX; },{passive:true});
  lb.addEventListener('touchend',(e)=>{
    const dx = e.changedTouches[0].clientX - sx;
    if(Math.abs(dx) > 50) dx > 0 ? show(idx-1) : show(idx+1);
  });
})();

/* ============ ROOM BOOK BUTTONS → CONTACT ============ */
(function(){
  document.querySelectorAll('[data-book-suite]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const suite = btn.getAttribute('data-book-suite');
      window.location.href = 'contact.html?suite=' + encodeURIComponent(suite);
    });
  });
})();