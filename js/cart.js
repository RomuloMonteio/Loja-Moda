/* ============================================================
   CART.JS — Cart state, add/remove/update + page rendering
   ============================================================ */

/* ---- State ---- */
function getCart() {
  return JSON.parse(localStorage.getItem('noir_cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('noir_cart', JSON.stringify(cart));
  updateCartBadge();
  if (typeof renderCartSidebarItems === 'function') renderCartSidebarItems();
}

/* ---- Key for matching items ---- */
function cartKey(id, size, color) {
  return `${id}__${size}__${color}`;
}

/* ---- Add ---- */
function cartAdd(product, size, color, qty = 1) {
  const cart = getCart();
  const key = cartKey(product.id, size, color);
  const existing = cart.find(i => cartKey(i.id, i.size, i.color) === key);
  if (existing) {
    existing.qty = Math.min(existing.qty + qty, 10);
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      ph: product.ph,
      size, color, qty,
    });
  }
  saveCart(cart);
  showToast(`${product.name} adicionado ao carrinho`, 'success');
  // Animate cart icon
  const icon = document.getElementById('cartBtn');
  icon?.classList.add('cart-icon-anim');
  setTimeout(() => icon?.classList.remove('cart-icon-anim'), 500);
}

/* ---- Update quantity ---- */
function cartUpdateQty(id, size, color, delta) {
  const cart = getCart();
  const key = cartKey(id, size, color);
  const item = cart.find(i => cartKey(i.id, i.size, i.color) === key);
  if (!item) return;
  item.qty = Math.max(1, Math.min(10, item.qty + delta));
  saveCart(cart);
  if (typeof renderCartPage === 'function') renderCartPage();
}

/* ---- Remove ---- */
function cartRemove(id, size, color) {
  const key = cartKey(id, size, color);
  const cart = getCart().filter(i => cartKey(i.id, i.size, i.color) !== key);
  saveCart(cart);
  if (typeof renderCartPage === 'function') renderCartPage();
}

/* ---- Clear ---- */
function cartClear() {
  saveCart([]);
  if (typeof renderCartPage === 'function') renderCartPage();
}

/* ---- Totals ---- */
function cartTotals(coupon = '') {
  const cart = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = coupon === 'NOIR10' ? subtotal * 0.1 : coupon === 'FREE' ? 4.99 : 0;
  const discountLabel = coupon === 'NOIR10' ? '10% desconto' : coupon === 'FREE' ? 'Envio grátis' : '';
  const afterDiscount = Math.max(0, subtotal - (coupon === 'NOIR10' ? discount : 0));
  const shipping = afterDiscount >= 80 ? 0 : (coupon === 'FREE' ? 0 : 4.99);
  const total = afterDiscount + shipping;
  return { subtotal, discount: coupon === 'NOIR10' ? discount : 0, discountLabel, shipping, total, count: cart.reduce((s,i) => s + i.qty, 0) };
}

/* ---- Expose globals ---- */
window.getCart = getCart;
window.cartAdd = cartAdd;
window.cartUpdateQty = cartUpdateQty;
window.cartRemove = cartRemove;
window.cartClear = cartClear;
window.cartTotals = cartTotals;

/* ============================================================
   CART PAGE
   ============================================================ */
function renderCartPage() {
  const wrap = document.getElementById('cartPageItems');
  const summaryWrap = document.getElementById('cartPageSummary');
  if (!wrap) return;

  const cart = getCart();

  if (!cart.length) {
    wrap.innerHTML = `
      <div style="text-align:center;padding:80px 0;color:var(--text-3)">
        ${ICONS.bag}
        <div style="font-family:var(--font-display);font-size:32px;letter-spacing:.06em;text-transform:uppercase;margin:16px 0 8px;color:var(--text)">Carrinho Vazio</div>
        <p style="font-size:14px;margin-bottom:24px">Ainda não adicionaste nenhum produto.</p>
        <a href="shop.html" class="btn btn-primary">Explorar a Loja</a>
      </div>`;
    if (summaryWrap) summaryWrap.innerHTML = '';
    return;
  }

  wrap.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--s5);padding-bottom:var(--s4);border-bottom:1px solid var(--border)">
      <div class="label">Os teus artigos (${cart.reduce((s,i)=>s+i.qty,0)})</div>
      <button class="btn btn-ghost btn-sm" onclick="if(confirm('Limpar carrinho?'))cartClear()">Limpar tudo</button>
    </div>
    ${cart.map(item => `
      <div class="cart-item" style="padding:var(--s5) 0" data-id="${item.id}">
        <div class="cart-item-img" style="width:100px;height:120px">
          <div class="product-placeholder ${item.ph}" style="width:100%;height:100%"></div>
        </div>
        <div class="cart-item-info" style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <a href="product.html?id=${item.id}" class="cart-item-name" style="font-size:15px">${item.name}</a>
            <span style="font-weight:700;font-size:16px;white-space:nowrap">${fmt(item.price * item.qty)}</span>
          </div>
          <div class="cart-item-meta" style="font-size:13px">${item.size ? 'Tamanho: ' + item.size : ''} ${item.color ? '· ' + item.color : ''}</div>
          <div class="cart-item-meta" style="font-size:13px">${fmt(item.price)} por unidade</div>
          <div style="display:flex;align-items:center;gap:16px;margin-top:12px">
            <div class="cart-qty">
              <button class="cart-qty-btn" onclick="cartUpdateQty('${item.id}','${item.size}','${item.color}',-1)">${ICONS.minus}</button>
              <span class="cart-qty-num">${item.qty}</span>
              <button class="cart-qty-btn" onclick="cartUpdateQty('${item.id}','${item.size}','${item.color}',1)">${ICONS.plus}</button>
            </div>
            <button class="cart-item-remove" onclick="cartRemove('${item.id}','${item.size}','${item.color}')">${ICONS.trash} Remover</button>
          </div>
        </div>
      </div>
    `).join('')}
  `;

  if (summaryWrap) renderCartSummary(summaryWrap);
}

let appliedCoupon = '';

function renderCartSummary(el) {
  const t = cartTotals(appliedCoupon);
  el.innerHTML = `
    <div class="order-summary">
      <div class="order-summary-title">Resumo</div>
      <div class="order-line">
        <span class="order-line-label">Subtotal</span>
        <span class="order-line-value">${fmt(t.subtotal)}</span>
      </div>
      ${t.discount > 0 ? `<div class="order-line"><span class="order-line-label" style="color:var(--green)">${t.discountLabel}</span><span style="color:var(--green)">-${fmt(t.discount)}</span></div>` : ''}
      <div class="order-line">
        <span class="order-line-label">Envio</span>
        <span class="order-line-value" style="color:${t.shipping===0?'var(--green)':'inherit'}">${t.shipping === 0 ? 'GRÁTIS' : fmt(t.shipping)}</span>
      </div>
      ${t.subtotal < 80 && t.shipping > 0 ? `<div style="font-size:11px;color:var(--text-3);margin-bottom:8px">Faltam ${fmt(80-t.subtotal)} para envio grátis</div>` : ''}
      <div class="order-line total">
        <span>Total</span>
        <span>${fmt(t.total)}</span>
      </div>
      <div class="coupon-wrap" style="margin-top:var(--s4)">
        <input class="form-input" id="couponInput" placeholder="Código de desconto" value="${appliedCoupon}" style="height:42px">
        <button class="coupon-btn" onclick="applyCoupon()">Aplicar</button>
      </div>
      ${appliedCoupon ? `<div style="font-size:12px;color:var(--green);margin-top:6px">${ICONS.check} Código aplicado!</div>` : ''}
      <a href="checkout.html" class="btn btn-primary btn-full" style="margin-top:var(--s5)">Finalizar Compra</a>
      <a href="shop.html" class="btn btn-outline btn-full" style="margin-top:var(--s2);font-size:11px;height:40px">Continuar a Comprar</a>
      <div style="text-align:center;font-size:11px;color:var(--text-4);margin-top:12px;display:flex;align-items:center;justify-content:center;gap:6px">
        ${ICONS.shield} Pagamento 100% seguro
      </div>
    </div>
  `;
}

function applyCoupon() {
  const input = document.getElementById('couponInput');
  if (!input) return;
  const code = input.value.trim().toUpperCase();
  const valid = ['NOIR10', 'FREE'];
  if (valid.includes(code)) {
    appliedCoupon = code;
    showToast('Código aplicado com sucesso!', 'success');
  } else {
    showToast('Código inválido.', 'error');
    appliedCoupon = '';
  }
  const summaryWrap = document.getElementById('cartPageSummary');
  if (summaryWrap) renderCartSummary(summaryWrap);
}
window.applyCoupon = applyCoupon;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cartPageItems')) renderCartPage();
});
