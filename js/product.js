/* ============================================================
   PRODUCT.JS — Gallery, size selector, add to cart, reviews
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('productGallery')) return;

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get('id')) || 1;
  const product = (typeof PRODUCTS !== 'undefined' ? PRODUCTS : []).find(p => p.id === id) || PRODUCTS?.[0];
  if (!product) return;

  renderProduct(product);
  renderRelated(product);
});

/* ============================================================
   RENDER PRODUCT
   ============================================================ */
function renderProduct(p) {
  // Gallery
  const gallery = document.getElementById('productGallery');
  const thumbs  = document.getElementById('productThumbs');
  const name    = document.getElementById('productName');
  const priceEl = document.getElementById('productPrice');
  const ratEl   = document.getElementById('productRating');
  const descEl  = document.getElementById('productDesc');
  const detailsEl = document.getElementById('productDetails');
  const sizesEl   = document.getElementById('productSizes');
  const colorsEl  = document.getElementById('productColors');
  const breadEl   = document.getElementById('productBreadcrumb');

  // Breadcrumb
  if (breadEl) {
    breadEl.innerHTML = `
      <a href="index.html">Início</a>
      <span class="breadcrumb-sep">/</span>
      <a href="shop.html">Loja</a>
      <span class="breadcrumb-sep">/</span>
      <a href="shop.html?category=${p.category}">${CATEGORIES?.find(c=>c.id===p.category)?.label || p.category}</a>
      <span class="breadcrumb-sep">/</span>
      <span class="breadcrumb-current">${p.name}</span>
    `;
  }

  // Gallery media helper
  const makeMedia = (filter = 'none', scale = 1) => p.img
    ? `<img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:contain;padding:8% 12% 4%;filter:${filter};transform:scale(${scale});transition:transform .4s ease">`
    : `<div class="product-placeholder ${p.ph}" style="width:100%;height:100%;filter:${filter}"></div>`;

  if (gallery) {
    gallery.innerHTML = `
      <div class="product-gallery-main" id="galleryMain">
        ${makeMedia('none', 1)}
        ${p.isLimited ? '<div class="badge badge-limited" style="position:absolute;top:16px;left:16px">Limited</div>' : ''}
        ${p.isNew    ? '<div class="badge badge-new"     style="position:absolute;top:16px;left:16px">New</div>'     : ''}
      </div>
    `;
  }
  if (thumbs) {
    const variants = [
      { filter: 'none',                  scale: 1    },
      { filter: 'brightness(1.1)',       scale: 1.04 },
      { filter: 'brightness(0.88) saturate(1.2)', scale: 1 },
    ];
    thumbs.innerHTML = variants.map((v, i) => `
      <button class="product-thumb${i===0?' active':''}" data-index="${i}" onclick="setThumb(${i},this)">
        ${makeMedia(v.filter, v.scale)}
      </button>
    `).join('');
  }

  // Info
  if (name) {
    name.innerHTML = `
      <div class="label" style="margin-bottom:6px">${p.brand} · ${p.collection?.replace('-',' ').toUpperCase()}</div>
      ${p.name}
    `;
  }
  if (priceEl) {
    const onSale = p.comparePrice && p.comparePrice > p.price;
    priceEl.innerHTML = `
      <span class="price-lg">${fmt(p.price)}</span>
      ${onSale ? `<span class="price-compare">${fmt(p.comparePrice)}</span><span class="badge badge-sale">−${Math.round((1-p.price/p.comparePrice)*100)}%</span>` : ''}
    `;
  }
  if (ratEl) {
    ratEl.innerHTML = renderStars(p.rating, p.reviewCount) +
      `<span style="font-size:12px;color:var(--text-3);margin-left:4px">· <a href="#reviews" style="color:var(--text-2)">Ver avaliações</a></span>`;
  }

  // Colors
  if (colorsEl) {
    colorsEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <span class="label">Cor: <span id="selectedColor" style="color:var(--text);text-transform:none;font-size:12px">${p.colors[0]?.name}</span></span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${p.colors.map((c, i) => `
          <button class="color-dot${i===0?' active':''}" style="width:28px;height:28px;background:${c.hex};border:2px solid ${i===0?'var(--text)':'transparent'}"
            data-color="${c.name}" onclick="selectColor('${c.name}',this)" title="${c.name}"></button>
        `).join('')}
      </div>
    `;
  }

  // Sizes
  if (sizesEl) {
    const stockObj = typeof p.stock === 'object' ? p.stock : {};
    sizesEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <span class="label">Tamanho: <span id="selectedSize" style="color:var(--text);text-transform:none;font-size:12px">—</span></span>
        <button class="btn btn-ghost btn-sm" onclick="document.getElementById('sizeGuideModal')?.classList.add('open')">Guia de tamanhos</button>
      </div>
      <div class="size-grid">
        ${p.sizes.map(s => {
          const inStock = !stockObj[s] || stockObj[s] > 0;
          return `<button class="size-btn${inStock?'':' out-of-stock'}" data-size="${s}" ${inStock?`onclick="selectSize('${s}',this)"`:'disabled'} title="${inStock?'':'Esgotado'}">${s}</button>`;
        }).join('')}
      </div>
    `;
  }

  // Description
  if (descEl) descEl.textContent = p.description;
  if (detailsEl) {
    detailsEl.innerHTML = `<ul style="display:flex;flex-direction:column;gap:6px">
      ${p.details.map(d => `<li style="display:flex;gap:8px;font-size:13px;color:var(--text-3)">${ICONS.check}<span>${d}</span></li>`).join('')}
    </ul>`;
  }

  // Add to cart btn wiring
  const addBtn = document.getElementById('addToCartBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const size  = document.getElementById('selectedSize')?.textContent;
      const color = document.getElementById('selectedColor')?.textContent;
      if (!size || size === '—') { showToast('Seleciona um tamanho.', 'error'); return; }
      cartAdd(p, size, color);
      openCart();
    });
  }

  // Wishlist btn
  const wlBtn = document.getElementById('wishlistBtn');
  if (wlBtn) {
    const inWl = isInWishlist(p.id);
    wlBtn.innerHTML = inWl ? ICONS.heartFill : ICONS.heart;
    wlBtn.classList.toggle('active', inWl);
    wlBtn.addEventListener('click', () => {
      const added = toggleWishlist(p.id, wlBtn);
      wlBtn.innerHTML = added ? ICONS.heartFill : ICONS.heart;
    });
  }

  // Reviews
  renderReviews(p);

  // Stock info
  const stockMsg = document.getElementById('stockMsg');
  if (stockMsg) {
    const total = Object.values(p.stock).reduce((s,v) => s + (Number(v)||0), 0);
    if (total <= 5 && total > 0) {
      stockMsg.innerHTML = `<span style="color:var(--yellow);font-size:13px;display:flex;align-items:center;gap:6px">⚡ Apenas ${total} unidades restantes!</span>`;
    }
  }
}

/* ---- Thumb ---- */
function setThumb(idx, btn) {
  document.querySelectorAll('.product-thumb').forEach(t => t.classList.remove('active'));
  btn?.classList.add('active');
}
window.setThumb = setThumb;

/* ---- Color ---- */
function selectColor(name, btn) {
  document.querySelectorAll('[data-color]').forEach(b => {
    b.style.border = '2px solid transparent';
    b.classList.remove('active');
  });
  btn.style.border = '2px solid var(--text)';
  btn.classList.add('active');
  const label = document.getElementById('selectedColor');
  if (label) label.textContent = name;
}
window.selectColor = selectColor;

/* ---- Size ---- */
function selectSize(s, btn) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const label = document.getElementById('selectedSize');
  if (label) label.textContent = s;
}
window.selectSize = selectSize;

/* ============================================================
   REVIEWS
   ============================================================ */
function renderReviews(p) {
  const el = document.getElementById('reviewsList');
  if (!el) return;
  const reviews = (typeof REVIEWS !== 'undefined' ? REVIEWS : []).slice(0, 4);

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:24px;margin-bottom:var(--s6);padding:var(--s5);background:var(--bg-2);border-radius:var(--r3)">
      <div style="text-align:center">
        <div style="font-family:var(--font-display);font-size:64px;line-height:1;color:var(--accent)">${p.rating}</div>
        ${renderStars(p.rating)}
        <div style="font-size:12px;color:var(--text-3);margin-top:4px">${p.reviewCount} avaliações</div>
      </div>
      <div style="flex:1">
        ${[5,4,3,2,1].map(n => {
          const frac = n >= Math.floor(p.rating) ? (n===5?0.7:0.2) : 0.05;
          return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="font-size:12px;color:var(--text-3);width:8px">${n}</span>
            ${ICONS.star}
            <div style="flex:1;height:4px;background:var(--bg-4);border-radius:2px;overflow:hidden">
              <div style="width:${Math.round(frac*100)}%;height:100%;background:var(--accent);border-radius:2px"></div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
    ${reviews.map(r => `
      <div style="padding:var(--s5) 0;border-bottom:1px solid var(--border)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:36px;height:36px;border-radius:50%;background:var(--bg-4);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600">${r.name[0]}</div>
            <div>
              <div style="font-size:13px;font-weight:600">${r.name}</div>
              <div style="font-size:11px;color:var(--text-3)">${r.verified?'✓ Compra verificada · ':''}${r.date}</div>
            </div>
          </div>
          ${renderStars(r.rating)}
        </div>
        <p style="font-size:14px;color:var(--text-2);line-height:1.65">${r.text}</p>
      </div>
    `).join('')}
  `;
}

/* ============================================================
   RELATED PRODUCTS
   ============================================================ */
function renderRelated(p) {
  const el = document.getElementById('relatedGrid');
  if (!el) return;
  const related = (typeof PRODUCTS !== 'undefined' ? PRODUCTS : [])
    .filter(x => x.id !== p.id && (x.category === p.category || x.collection === p.collection))
    .slice(0, 4);
  el.innerHTML = related.map(r => renderProductCard(r)).join('');
  initScrollReveal();
}
