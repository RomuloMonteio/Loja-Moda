/* ============================================================
   APP.JS — Shared logic: nav, cursor, toast, newsletter, scroll
   ============================================================ */

/* ---- Helpers ---- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const fmt = (n) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n);

/* ---- SVG Icons ---- */
const ICONS = {
  search:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>`,
  heart:    `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  heartFill:`<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  bag:      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
  user:     `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  x:        `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  arrow:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  arrowL:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  check:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  chevron:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>`,
  truck:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  refresh:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>`,
  shield:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  headset:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z"/><path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>`,
  minus:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  plus:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  star:     `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  starO:    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  instagram:`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>`,
  tiktok:   `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.77a8.16 8.16 0 004.77 1.52V6.82a4.85 4.85 0 01-1-.13z"/></svg>`,
  whatsapp: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
};

/* ---- Render stars ---- */
function renderStars(rating, count = null) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let html = '<div class="stars">';
  for (let i = 0; i < 5; i++) {
    html += i < full ? ICONS.star : (i === full && half ? ICONS.star : ICONS.starO);
  }
  html += '</div>';
  if (count !== null) html += `<span class="stars-count">(${count})</span>`;
  return `<div class="stars-wrap">${html}</div>`;
}

/* ---- Render product placeholder ---- */
function renderPlaceholder(ph, label = '') {
  return `<div class="product-placeholder ${ph}" title="${label}"></div>`;
}

/* ============================================================
   NAV & FOOTER INJECTION
   ============================================================ */
function renderHeader() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const links = [
    { href: 'shop.html',    label: 'Loja' },
    { href: 'shop.html#collections', label: 'Coleções' },
    { href: 'about.html',   label: 'Marca' },
    { href: 'contact.html', label: 'Contacto' },
  ];
  const navLinks = links.map(l =>
    `<a href="${l.href}" class="nav-link${currentPage === l.href ? ' active' : ''}">${l.label}</a>`
  ).join('');

  return `
    <header class="nav" id="nav">
      <div class="container nav-inner">
        <a href="index.html" class="nav-logo">NOIR.</a>
        <nav class="nav-links">${navLinks}</nav>
        <div class="nav-actions">
          <button class="nav-icon-btn" id="searchBtn" aria-label="Pesquisar">${ICONS.search}</button>
          <a href="wishlist.html" class="nav-icon-btn" aria-label="Wishlist">${ICONS.heart}</a>
          <a href="account.html" class="nav-icon-btn" aria-label="Conta">${ICONS.user}</a>
          <button class="nav-icon-btn" id="cartBtn" aria-label="Carrinho">
            ${ICONS.bag}
            <span class="nav-cart-count" id="cartCount">0</span>
          </button>
          <button class="nav-hamburger" id="menuBtn" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
    <nav class="mobile-menu" id="mobileMenu">
      <div class="mobile-menu-links">
        ${links.map(l => `<a href="${l.href}" class="mobile-menu-link">${l.label}</a>`).join('')}
        <a href="account.html" class="mobile-menu-link">Conta</a>
        <a href="wishlist.html" class="mobile-menu-link">Wishlist</a>
      </div>
    </nav>
  `;
}

function renderFooter() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="footer-logo">NOIR.</div>
            <p class="footer-tagline">Roupa construída com intenção. Cada peça pensada para durar além das tendências.</p>
            <div class="footer-social">
              <a href="#" class="footer-social-link" aria-label="Instagram">${ICONS.instagram}</a>
              <a href="#" class="footer-social-link" aria-label="TikTok">${ICONS.tiktok}</a>
              <a href="#" class="footer-social-link" aria-label="WhatsApp">${ICONS.whatsapp}</a>
            </div>
          </div>
          <div>
            <div class="footer-col-title">Loja</div>
            <ul class="footer-links">
              <li><a href="shop.html" class="footer-link">Todos os Produtos</a></li>
              <li><a href="shop.html?collection=new-season" class="footer-link">New Season</a></li>
              <li><a href="shop.html?collection=essentials" class="footer-link">Essentials</a></li>
              <li><a href="shop.html?collection=limited" class="footer-link">Limited Edition</a></li>
            </ul>
          </div>
          <div>
            <div class="footer-col-title">Suporte</div>
            <ul class="footer-links">
              <li><a href="tracking.html" class="footer-link">Rastrear Encomenda</a></li>
              <li><a href="contact.html" class="footer-link">Devoluções</a></li>
              <li><a href="contact.html" class="footer-link">Guia de Tamanhos</a></li>
              <li><a href="contact.html" class="footer-link">Contacto</a></li>
            </ul>
          </div>
          <div>
            <div class="footer-col-title">Empresa</div>
            <ul class="footer-links">
              <li><a href="about.html" class="footer-link">Sobre a Marca</a></li>
              <li><a href="#" class="footer-link">Sustentabilidade</a></li>
              <li><a href="#" class="footer-link">Privacidade</a></li>
              <li><a href="#" class="footer-link">Termos</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 NOIR. Todos os direitos reservados.</span>
          <div class="footer-payment">
            <span class="payment-icon">VISA</span>
            <span class="payment-icon">MC</span>
            <span class="payment-icon">AMEX</span>
            <span class="payment-icon">MB</span>
            <span class="payment-icon">PAYPAL</span>
          </div>
        </div>
      </div>
    </footer>
  `;
}

function renderCartSidebar() {
  return `
    <div class="cart-overlay" id="cartOverlay"></div>
    <aside class="cart-sidebar" id="cartSidebar">
      <div class="cart-sidebar-header">
        <span class="cart-sidebar-title">Carrinho</span>
        <button class="nav-icon-btn" id="cartClose">${ICONS.x}</button>
      </div>
      <div class="cart-items-wrap" id="cartItemsWrap"></div>
      <div class="cart-sidebar-footer" id="cartSidebarFooter"></div>
    </aside>
  `;
}

function renderSearchOverlay() {
  return `
    <div class="search-overlay" id="searchOverlay">
      <button class="search-close" id="searchClose">${ICONS.x}</button>
      <div class="search-input-wrap">
        <input type="text" class="search-input" id="searchInput" placeholder="Pesquisar..." autocomplete="off" spellcheck="false">
      </div>
      <div class="search-results" id="searchResults"></div>
    </div>
  `;
}

function renderNewsletterPopup() {
  return `
    <div class="newsletter-popup" id="newsletterPopup">
      <button class="newsletter-popup-close" id="newsletterClose">${ICONS.x}</button>
      <div class="newsletter-popup-tag">Oferta exclusiva</div>
      <div class="newsletter-popup-title">10% de desconto</div>
      <p class="newsletter-popup-sub">Na tua primeira encomenda. Subscreve e recebe acesso antecipado a drops exclusivos.</p>
      <form class="newsletter-popup-form" id="newsletterForm">
        <input type="email" class="newsletter-popup-input" placeholder="o teu email" required>
        <button type="submit" class="newsletter-popup-btn">Subscrever</button>
      </form>
    </div>
  `;
}

function renderToastContainer() {
  return `<div class="toast-container" id="toastContainer"></div>`;
}

function renderCursor() {
  return `<div class="cursor" id="cursor"></div><div class="cursor-ring" id="cursorRing"></div>`;
}

function renderPageTransition() {
  return `<div class="page-transition-overlay" id="pageTransition"></div>`;
}

/* ============================================================
   INJECT INTO DOM
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Inject persistent elements
  document.body.insertAdjacentHTML('afterbegin',
    renderCursor() + renderPageTransition() + renderCartSidebar() + renderSearchOverlay()
  );

  const headerEl = document.getElementById('header');
  if (headerEl) headerEl.outerHTML = renderHeader();

  const footerEl = document.getElementById('footer');
  if (footerEl) footerEl.innerHTML = renderFooter();

  document.body.insertAdjacentHTML('beforeend',
    renderNewsletterPopup() + renderToastContainer()
  );

  initNav();
  initCursor();
  initCartSidebar();
  initSearch();
  initNewsletter();
  initScrollReveal();
  initAccordions();
  initTabs();
  updateCartBadge();
});

/* ============================================================
   NAV
   ============================================================ */
function initNav() {
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  // Scroll: add .scrolled class
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 30);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      menuBtn.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  // Close mobile menu on resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && mobileMenu?.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      menuBtn?.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  if (!cursor || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  // Ring follows with lag
  const animRing = () => {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  };
  animRing();

  // Hover states
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('a, button, [role="button"], .product-card, label, input, select');
    cursor.classList.toggle('is-hovering', !!el);
    ring.classList.toggle('is-hovering', !!el);
  });

  document.addEventListener('mousedown', () => cursor.classList.add('is-clicking'));
  document.addEventListener('mouseup', () => cursor.classList.remove('is-clicking'));
}

/* ============================================================
   CART SIDEBAR
   ============================================================ */
function initCartSidebar() {
  const cartBtn = document.getElementById('cartBtn');
  const cartClose = document.getElementById('cartClose');
  const overlay = document.getElementById('cartOverlay');

  const open = () => {
    document.getElementById('cartSidebar')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCartSidebarItems();
  };
  const close = () => {
    document.getElementById('cartSidebar')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
  };

  cartBtn?.addEventListener('click', open);
  cartClose?.addEventListener('click', close);
  overlay?.addEventListener('click', close);

  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  window.openCart = open;
  window.closeCart = close;
}

/* ============================================================
   SEARCH
   ============================================================ */
function initSearch() {
  const searchBtn = document.getElementById('searchBtn');
  const searchClose = document.getElementById('searchClose');
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');

  const open = () => {
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input?.focus(), 100);
  };
  const close = () => {
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
    if (input) input.value = '';
    if (results) results.innerHTML = '';
  };

  searchBtn?.addEventListener('click', open);
  searchClose?.addEventListener('click', close);
  overlay?.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  input?.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!results) return;
    if (q.length < 2) { results.innerHTML = ''; return; }
    const found = (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []).filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some(t => t.includes(q))
    ).slice(0, 6);
    results.innerHTML = found.length
      ? found.map(p => `
          <a href="product.html?id=${p.id}" class="product-card" onclick="closeSearch()" style="display:block">
            <div class="product-card-media" style="aspect-ratio:3/4">
              ${p.img
                ? `<img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;padding:10% 12% 5%">`
                : renderPlaceholder(p.ph, p.name)
              }
            </div>
            <div class="product-card-info" style="padding:8px 0 0">
              <div class="product-card-name">${p.name}</div>
              <div class="product-card-price"><span class="price">${fmt(p.price)}</span></div>
            </div>
          </a>`).join('')
      : `<p style="color:var(--text-3);font-size:14px;grid-column:1/-1">Sem resultados para "${q}"</p>`;
  });

  window.closeSearch = close;
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(msg, type = 'default') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-dot"></span>${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 2800);
}
window.showToast = showToast;

/* ============================================================
   NEWSLETTER POPUP
   ============================================================ */
function initNewsletter() {
  const popup = document.getElementById('newsletterPopup');
  const close = document.getElementById('newsletterClose');
  const form = document.getElementById('newsletterForm');

  if (!popup) return;
  if (localStorage.getItem('noir_newsletter')) return;

  // Show after 5 seconds
  setTimeout(() => popup.classList.add('visible'), 5000);

  close?.addEventListener('click', () => {
    popup.classList.remove('visible');
    localStorage.setItem('noir_newsletter', '1');
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    popup.classList.remove('visible');
    localStorage.setItem('noir_newsletter', '1');
    showToast('Subscrito com sucesso! Usa o código NOIR10 na tua primeira encomenda.', 'success');
  });
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => observer.observe(el));
}

/* ============================================================
   ACCORDIONS
   ============================================================ */
function initAccordions() {
  $$('.accordion-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      const isOpen = item.classList.contains('open');
      // Close all in same group
      btn.closest('.accordion-group')?.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ============================================================
   TABS
   ============================================================ */
function initTabs() {
  $$('.tabs').forEach(tabGroup => {
    tabGroup.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.dataset.tab;
        tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const container = tabGroup.nextElementSibling;
        if (!container) return;
        container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        const target = container.querySelector(`[data-panel="${panel}"]`);
        target?.classList.add('active');
      });
    });
  });
}

/* ============================================================
   PAGE TRANSITIONS
   ============================================================ */
document.addEventListener('click', e => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
  if (link.target === '_blank') return;
  e.preventDefault();
  const overlay = document.getElementById('pageTransition');
  if (!overlay) { window.location = href; return; }
  overlay.classList.add('entering');
  setTimeout(() => { window.location = href; }, 450);
});

window.addEventListener('pageshow', () => {
  const overlay = document.getElementById('pageTransition');
  if (overlay) {
    overlay.classList.remove('entering');
    overlay.classList.add('leaving');
    setTimeout(() => overlay.classList.remove('leaving'), 500);
  }
});

/* ============================================================
   WISHLIST HELPERS
   ============================================================ */
function getWishlist() {
  return JSON.parse(localStorage.getItem('noir_wishlist') || '[]');
}
function isInWishlist(id) {
  return getWishlist().includes(id);
}
function toggleWishlist(id, btn) {
  const wl = getWishlist();
  const idx = wl.indexOf(id);
  if (idx === -1) {
    wl.push(id);
    showToast('Adicionado à wishlist', 'success');
    btn?.classList.add('active');
    btn?.querySelector('svg')?.classList.add('wishlist-anim');
    setTimeout(() => btn?.querySelector('svg')?.classList.remove('wishlist-anim'), 400);
  } else {
    wl.splice(idx, 1);
    showToast('Removido da wishlist');
    btn?.classList.remove('active');
  }
  localStorage.setItem('noir_wishlist', JSON.stringify(wl));
  return idx === -1;
}
window.getWishlist = getWishlist;
window.isInWishlist = isInWishlist;
window.toggleWishlist = toggleWishlist;

/* ============================================================
   CART BADGE
   ============================================================ */
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('noir_cart') || '[]');
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cartCount');
  if (!badge) return;
  badge.textContent = count;
  badge.classList.toggle('visible', count > 0);
  badge.classList.add('cart-icon-anim');
  setTimeout(() => badge.classList.remove('cart-icon-anim'), 500);
}
window.updateCartBadge = updateCartBadge;

/* ============================================================
   CART SIDEBAR RENDER
   ============================================================ */
function renderCartSidebarItems() {
  const wrap = document.getElementById('cartItemsWrap');
  const footer = document.getElementById('cartSidebarFooter');
  if (!wrap || !footer) return;
  const cart = JSON.parse(localStorage.getItem('noir_cart') || '[]');

  if (!cart.length) {
    wrap.innerHTML = `<div class="cart-empty-msg">${ICONS.bag}<p>O teu carrinho está vazio.<br>Explora a nossa coleção.</p></div>`;
    footer.innerHTML = `<a href="shop.html" class="btn btn-primary btn-full" onclick="closeCart()">Ir para a Loja</a>`;
    return;
  }

  wrap.innerHTML = cart.map(item => `
    <div class="cart-item" data-id="${item.id}" data-size="${item.size}" data-color="${item.color}">
      <div class="cart-item-img">
        ${item.img
          ? `<img src="${item.img}" alt="${item.name}" style="width:100%;height:100%;object-fit:contain;padding:4px">`
          : `<div class="product-placeholder ${item.ph || 'ph-1'}"></div>`
        }
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">${item.size ? 'Tamanho: ' + item.size : ''}${item.color ? ' · ' + item.color : ''}</div>
        <div class="cart-item-bottom">
          <div class="cart-qty">
            <button class="cart-qty-btn" onclick="cartUpdateQty('${item.id}','${item.size}','${item.color}',-1)">${ICONS.minus}</button>
            <span class="cart-qty-num">${item.qty}</span>
            <button class="cart-qty-btn" onclick="cartUpdateQty('${item.id}','${item.size}','${item.color}',1)">${ICONS.plus}</button>
          </div>
          <span class="cart-item-price">${fmt(item.price * item.qty)}</span>
        </div>
        <button class="cart-item-remove" onclick="cartRemove('${item.id}','${item.size}','${item.color}')">${ICONS.trash} Remover</button>
      </div>
    </div>
  `).join('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 80 ? 0 : 4.99;
  footer.innerHTML = `
    <div class="cart-subtotal">
      <span class="cart-subtotal-label">Subtotal</span>
      <span class="cart-subtotal-value">${fmt(subtotal)}</span>
    </div>
    <div class="cart-subtotal" style="font-size:12px;margin-bottom:0">
      <span style="color:var(--text-3);font-size:11px;letter-spacing:.06em">Envio</span>
      <span style="color:${shipping===0?'var(--green)':'var(--text-2)'};font-size:13px">${shipping === 0 ? 'GRÁTIS' : fmt(shipping)}</span>
    </div>
    <div style="font-size:11px;color:var(--text-3);margin:4px 0 12px;text-align:right">
      ${subtotal >= 80 ? '✓ Envio grátis aplicado' : `Faltam ${fmt(80-subtotal)} para envio grátis`}
    </div>
    <a href="checkout.html" class="btn btn-primary btn-full" style="margin-bottom:8px">Finalizar Compra</a>
    <a href="cart.html" class="btn btn-outline btn-full" style="font-size:11px;height:40px" onclick="closeCart()">Ver Carrinho</a>
  `;
}
window.renderCartSidebarItems = renderCartSidebarItems;
