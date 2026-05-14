/* ============================================================
   SHOP.JS — Product grid, filters, sorting, search, pagination
   ============================================================ */

const PAGE_SIZE = 12;
let shopState = {
  category: '',
  gender: '',
  collection: '',
  colors: [],
  sizes: [],
  priceMax: 300,
  sort: 'featured',
  search: '',
  page: 1,
};

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('shopGrid')) return;

  // Read URL params
  const params = new URLSearchParams(window.location.search);
  if (params.get('category'))   shopState.category   = params.get('category');
  if (params.get('collection')) shopState.collection = params.get('collection');
  if (params.get('gender'))     shopState.gender     = params.get('gender');
  if (params.get('q'))          shopState.search     = params.get('q');

  initShopFilters();
  renderShopGrid();
});

/* ============================================================
   FILTER LOGIC
   ============================================================ */
function filteredProducts() {
  return PRODUCTS.filter(p => {
    if (shopState.category   && p.category   !== shopState.category)   return false;
    if (shopState.collection && p.collection !== shopState.collection) return false;
    if (shopState.gender     && p.gender !== shopState.gender && p.gender !== 'unisex') return false;
    if (shopState.colors.length && !shopState.colors.some(c => p.colors.some(pc => pc.name.toLowerCase() === c.toLowerCase()))) return false;
    if (shopState.sizes.length  && !shopState.sizes.some(s => p.sizes?.includes(s))) return false;
    if (p.price > shopState.priceMax) return false;
    if (shopState.search) {
      const q = shopState.search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.category.includes(q) && !p.tags.some(t => t.includes(q))) return false;
    }
    return true;
  });
}

function sortedProducts(list) {
  const s = [...list];
  switch (shopState.sort) {
    case 'price-asc':   return s.sort((a,b) => a.price - b.price);
    case 'price-desc':  return s.sort((a,b) => b.price - a.price);
    case 'new':         return s.sort((a,b) => b.isNew - a.isNew);
    case 'rating':      return s.sort((a,b) => b.rating - a.rating);
    default:            return s.sort((a,b) => (b.isBestSeller - a.isBestSeller) || (b.isNew - a.isNew));
  }
}

/* ============================================================
   RENDER GRID
   ============================================================ */
function renderShopGrid() {
  const grid = document.getElementById('shopGrid');
  const countEl = document.getElementById('shopCount');
  const paginationEl = document.getElementById('shopPagination');
  if (!grid) return;

  const all = sortedProducts(filteredProducts());
  const total = all.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  shopState.page = Math.min(shopState.page, totalPages || 1);

  const page = all.slice((shopState.page - 1) * PAGE_SIZE, shopState.page * PAGE_SIZE);

  if (countEl) countEl.textContent = `${total} produto${total !== 1 ? 's' : ''}`;

  if (!page.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:80px 0;color:var(--text-3)">
        <div style="font-size:48px;margin-bottom:12px;opacity:.3">◯</div>
        <div style="font-family:var(--font-display);font-size:24px;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px;color:var(--text)">Sem produtos</div>
        <p style="font-size:14px;margin-bottom:20px">Tenta ajustar os filtros.</p>
        <button class="btn btn-outline" onclick="clearAllFilters()">Limpar filtros</button>
      </div>`;
    if (paginationEl) paginationEl.innerHTML = '';
    return;
  }

  grid.innerHTML = page.map(p => renderProductCard(p)).join('');

  // Re-init wishlist states
  grid.querySelectorAll('[data-wish]').forEach(btn => {
    if (isInWishlist(Number(btn.dataset.wish))) btn.classList.add('active');
  });

  // Pagination
  if (paginationEl) {
    let html = '';
    if (shopState.page > 1)
      html += `<button class="page-btn" onclick="goPage(${shopState.page-1})">${ICONS.arrowL}</button>`;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - shopState.page) <= 1) {
        html += `<button class="page-btn${i === shopState.page ? ' active' : ''}" onclick="goPage(${i})">${i}</button>`;
      } else if (Math.abs(i - shopState.page) === 2) {
        html += `<span style="color:var(--text-4);padding:0 4px">…</span>`;
      }
    }
    if (shopState.page < totalPages)
      html += `<button class="page-btn" onclick="goPage(${shopState.page+1})">${ICONS.arrow}</button>`;
    paginationEl.innerHTML = html;
  }

  // Scroll reveal
  initScrollReveal();
}

function goPage(n) {
  shopState.page = n;
  renderShopGrid();
  document.getElementById('shopGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
window.goPage = goPage;

/* ============================================================
   PRODUCT CARD HTML
   ============================================================ */
function renderProductCard(p) {
  const onSale = p.comparePrice && p.comparePrice > p.price;
  const badge = p.isLimited ? 'limited' : p.isNew ? 'new' : onSale ? 'sale' : p.isBestSeller ? null : null;
  const badgeLabel = p.isLimited ? 'Limited' : p.isNew ? 'New' : onSale ? `−${Math.round((1-p.price/p.comparePrice)*100)}%` : '';
  const wl = (typeof isInWishlist !== 'undefined') && isInWishlist(p.id);

  return `
    <article class="product-card reveal" data-id="${p.id}">
      <div class="product-card-media">
        <a href="product.html?id=${p.id}">
          <div class="product-placeholder product-card-img-main ${p.ph}"></div>
          <div class="product-placeholder product-card-img-hover ${p.ph}" style="opacity:.85;filter:brightness(1.15)"></div>
        </a>
        ${badge ? `<div class="product-card-badges"><span class="badge badge-${badge}">${badgeLabel || badge}</span></div>` : ''}
        <button class="product-card-wishlist${wl ? ' active' : ''}" data-wish="${p.id}"
          onclick="toggleWishlist(${p.id},this);renderShopGrid()" aria-label="Wishlist">
          ${wl ? ICONS.heartFill : ICONS.heart}
        </button>
        <div class="product-card-actions">
          <button class="product-card-action" onclick="quickAdd(${p.id})">Adicionar</button>
          <a href="product.html?id=${p.id}" class="product-card-action product-card-action-icon">${ICONS.arrow}</a>
        </div>
      </div>
      <div class="product-card-info">
        <a href="product.html?id=${p.id}">
          <div class="product-card-name">${p.name}</div>
        </a>
        <div class="product-card-meta">${p.collection?.replace('-',' ').toUpperCase()}</div>
        <div class="product-card-price">
          <span class="price">${fmt(p.price)}</span>
          ${onSale ? `<span class="price-compare">${fmt(p.comparePrice)}</span>` : ''}
        </div>
        <div class="product-card-colors">
          ${p.colors.map(c => `<div class="color-dot" style="background:${c.hex}" title="${c.name}"></div>`).join('')}
        </div>
      </div>
    </article>
  `;
}
window.renderProductCard = renderProductCard;

/* ============================================================
   QUICK ADD (picks first size automatically)
   ============================================================ */
function quickAdd(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  const size = p.sizes?.[0] || '';
  const color = p.colors?.[0]?.name || '';
  cartAdd(p, size, color);
  openCart();
}
window.quickAdd = quickAdd;

/* ============================================================
   FILTERS INIT
   ============================================================ */
function initShopFilters() {
  // Sort
  const sortSel = document.getElementById('sortSelect');
  if (sortSel) {
    sortSel.value = shopState.sort;
    sortSel.addEventListener('change', () => {
      shopState.sort = sortSel.value;
      shopState.page = 1;
      renderShopGrid();
    });
  }

  // Category pills / buttons
  $$('[data-filter-cat]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filterCat === shopState.category);
    btn.addEventListener('click', () => {
      shopState.category = btn.dataset.filterCat === shopState.category ? '' : btn.dataset.filterCat;
      shopState.page = 1;
      $$('[data-filter-cat]').forEach(b => b.classList.toggle('active', b.dataset.filterCat === shopState.category));
      renderShopGrid();
      updateActiveChips();
    });
  });

  // Gender
  $$('[data-filter-gender]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filterGender === shopState.gender);
    btn.addEventListener('click', () => {
      shopState.gender = btn.dataset.filterGender === shopState.gender ? '' : btn.dataset.filterGender;
      shopState.page = 1;
      $$('[data-filter-gender]').forEach(b => b.classList.toggle('active', b.dataset.filterGender === shopState.gender));
      renderShopGrid();
      updateActiveChips();
    });
  });

  // Size chips
  $$('[data-filter-size]').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = btn.dataset.filterSize;
      const idx = shopState.sizes.indexOf(s);
      if (idx === -1) shopState.sizes.push(s);
      else shopState.sizes.splice(idx, 1);
      btn.classList.toggle('active', shopState.sizes.includes(s));
      shopState.page = 1;
      renderShopGrid();
      updateActiveChips();
    });
  });

  // Color swatches
  $$('[data-filter-color]').forEach(swatch => {
    swatch.addEventListener('click', () => {
      const c = swatch.dataset.filterColor;
      const idx = shopState.colors.indexOf(c);
      if (idx === -1) shopState.colors.push(c);
      else shopState.colors.splice(idx, 1);
      swatch.classList.toggle('active', shopState.colors.includes(c));
      shopState.page = 1;
      renderShopGrid();
      updateActiveChips();
    });
  });

  // Price range
  const priceRange = document.getElementById('priceRange');
  const priceVal   = document.getElementById('priceVal');
  if (priceRange) {
    priceRange.addEventListener('input', () => {
      shopState.priceMax = Number(priceRange.value);
      if (priceVal) priceVal.textContent = `€${priceRange.value}`;
      shopState.page = 1;
      renderShopGrid();
      updateActiveChips();
    });
  }

  // Mobile filter toggle
  const filterToggle = document.getElementById('filterToggle');
  const filterPanel  = document.getElementById('filterPanel');
  filterToggle?.addEventListener('click', () => filterPanel?.classList.toggle('open'));

  updateActiveChips();
}

function updateActiveChips() {
  const el = document.getElementById('activeFilters');
  if (!el) return;
  const chips = [];
  if (shopState.category)     chips.push({ label: shopState.category, clear: () => { shopState.category = ''; } });
  if (shopState.gender)       chips.push({ label: shopState.gender,   clear: () => { shopState.gender = ''; } });
  if (shopState.collection)   chips.push({ label: shopState.collection.replace('-',' '), clear: () => { shopState.collection = ''; } });
  shopState.colors.forEach(c => chips.push({ label: c, clear: () => { shopState.colors = shopState.colors.filter(x => x !== c); } }));
  shopState.sizes.forEach(s  => chips.push({ label: `Size ${s}`, clear: () => { shopState.sizes = shopState.sizes.filter(x => x !== s); } }));
  if (shopState.priceMax < 300) chips.push({ label: `Até €${shopState.priceMax}`, clear: () => { shopState.priceMax = 300; } });

  el.innerHTML = chips.map((c, i) =>
    `<span class="filter-chip">${c.label}<span class="filter-chip-remove" onclick="clearFilter(${i})">×</span></span>`
  ).join('');
  el._chips = chips;
}

function clearFilter(i) {
  const chips = document.getElementById('activeFilters')?._chips;
  if (!chips?.[i]) return;
  chips[i].clear();
  shopState.page = 1;
  renderShopGrid();
  initShopFilters();
}

function clearAllFilters() {
  shopState = { ...shopState, category:'', gender:'', collection:'', colors:[], sizes:[], priceMax:300, page:1 };
  renderShopGrid();
  initShopFilters();
}
window.clearAllFilters = clearAllFilters;
window.clearFilter = clearFilter;
