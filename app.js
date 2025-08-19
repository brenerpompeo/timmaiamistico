/* ===== CONFIG ===== */
const CONFIG = {
  CHECKOUT_URL: "https://exemplo.com/checkout", // troque pelo seu link real
  PRICE_LABEL: "R$39,90",
  // Fallbacks de imagem (substitua por fotos do Tim Maia fase Racional, se quiser)
  TIM1_CANDIDATES: [
    "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1400&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1400&auto=format&fit=crop",
    "https://picsum.photos/id/237/1200/1500"
  ],
  TIM2_CANDIDATES: [
    "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1400&auto=format&fit=crop",
    "https://picsum.photos/id/1011/1200/800"
  ],
};

/* ===== HELPERS ===== */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function loadFirstAvailable(imgEl, candidates){
  let i = 0;
  const tryNext = () => {
    if (i >= candidates.length) return;
    const test = new Image();
    test.onload = () => { imgEl.src = candidates[i]; };
    test.onerror = () => { i++; tryNext(); };
    test.src = candidates[i];
  };
  tryNext();
}

/* ===== HEADER: elevação + drawer ===== */
(function headerInit(){
  const header = $('#site-header');
  const onScroll = () => header.classList.toggle('elev', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const drawer = $('#drawer');
  const btnOpen = $('#btn-open');
  const btnClose = $('#btn-close');

  const open = () => { drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); };
  const close = () => { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); };

  btnOpen.addEventListener('click', open);
  btnClose.addEventListener('click', close);
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) close();
  });
  $$('#drawer .drawer__link').forEach(a => a.addEventListener('click', close));
})();

/* ===== HERO IMAGES (fallback) ===== */
(function heroImages(){
  const imgA = $('#imgA');
  const imgB = $('#imgB');
  if (imgA) loadFirstAvailable(imgA, CONFIG.TIM1_CANDIDATES);
  if (imgB) loadFirstAvailable(imgB, CONFIG.TIM2_CANDIDATES);
})();

/* ===== PREÇO & CHECKOUT ===== */
(function pricing(){
  $$('#oferta [data-js="price-number"], [data-js="price-inline"], [data-js="price-cta"]').forEach(el=>{
    if (el.hasAttribute('data-js') && el.getAttribute('data-js') === 'price-cta') {
      el.textContent = `Comprar agora — ${CONFIG.PRICE_LABEL}`;
    } else {
      el.textContent = CONFIG.PRICE_LABEL;
    }
  });
  $$('#oferta [data-js="checkout-cta"], [data-js="checkout-cta"]').forEach(el=>{
    el.setAttribute('href', CONFIG.CHECKOUT_URL);
  });
})();

/* ===== ROLLING 24H (timer + vendas) ===== */
(function rolling24h(){
  const key = 'tm24';
  const now = Date.now();
  let start = Number(localStorage.getItem(`${key}_start`));
  let target = Number(localStorage.getItem(`${key}_target`));

  const valid = start && target && (now - start) < 24 * 3600 * 1000;
  if (!valid){
    start = Date.now();
    target = Math.floor(70 + Math.random() * 80); // 70–150 vendas/24h
    localStorage.setItem(`${key}_start`, String(start));
    localStorage.setItem(`${key}_target`, String(target));
  }

  const end = start + 24 * 3600 * 1000;
  const hhEl = $('#hh'), mmEl = $('#mm'), ssEl = $('#ss');
  const salesEl = $('#sales'), targetEl = $('#target');
  const barTime = $('#bar-time'), barSales = $('#bar-sales');

  targetEl.textContent = target;

  function tick(){
    const now = Date.now();
    const remaining = Math.max(0, end - now);
    const elapsed = Math.max(0, Math.min(1, (now - start) / (24 * 3600 * 1000)));

    const h = String(Math.floor(remaining / 3600000)).padStart(2,'0');
    const m = String(Math.floor((remaining % 3600000) / 60000)).padStart(2,'0');
    const s = String(Math.floor((remaining % 60000) / 1000)).padStart(2,'0');

    if (hhEl) hhEl.textContent = h;
    if (mmEl) mmEl.textContent = m;
    if (ssEl) ssEl.textContent = s;

    const sales = Math.floor(target * elapsed);
    if (salesEl) salesEl.textContent = sales;

    if (barTime) barTime.style.width = `${(1 - elapsed) * 100}%`;
    if (barSales) barSales.style.width = `${(sales / Math.max(1, target)) * 100}%`;
  }

  tick();
  setInterval(tick, 1000);
})();

/* ===== STICKY CTA (mobile) ===== */
(function stickyCTA(){
  const sticky = $('#sticky');
  const hero = $('#inicio');
  const oferta = $('#oferta');

  function onScroll(){
    const heroH = hero ? hero.offsetHeight : 0;
    const threshold = heroH * 0.6; // 60% do hero
    const ofertaTop = oferta ? (oferta.getBoundingClientRect().top + window.scrollY) : Number.POSITIVE_INFINITY;
    const winBottom = window.scrollY + window.innerHeight;
    const nearOffer = (winBottom + 120) > ofertaTop;

    const show = window.scrollY > threshold && !nearOffer;
    sticky.classList.toggle('show', show);
    sticky.setAttribute('aria-hidden', String(!show));
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });
})();

/* ===== ANO NO RODAPÉ ===== */
(function year(){
  const y = new Date().getFullYear();
  const el = $('#year');
  if (el) el.textContent = y;
})();
