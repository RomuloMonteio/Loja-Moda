# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão Geral

E-commerce premium de moda/streetwear — marca fictícia **NOIR.** — construído em HTML + CSS + JavaScript puro (sem framework, sem build step). Abre diretamente no browser como ficheiros estáticos.

## Estrutura do Projeto

```
/
├── index.html          # Home (hero, coleções, best sellers, reviews, newsletter)
├── shop.html           # Loja com filtros sidebar + grid de produtos
├── product.html        # Página de produto (galeria, tamanhos, cores, reviews)
├── cart.html           # Página de carrinho com resumo e cupões
├── checkout.html       # Checkout multi-passo (contacto → entrega → pagamento)
├── wishlist.html       # Wishlist persistida em localStorage
├── account.html        # Login / Registo
├── about.html          # Sobre a marca
├── contact.html        # Formulário + canais sociais
├── tracking.html       # Rastreamento de encomendas
├── css/
│   ├── main.css        # Design system completo (tokens, reset, todos os componentes)
│   └── animations.css  # Keyframes, scroll reveal, marquee, page transitions
└── js/
    ├── data.js         # Mock data: PRODUCTS[], COLLECTIONS[], REVIEWS[], BENEFITS[]
    ├── app.js          # Shared: nav inject, footer inject, cursor, toast, newsletter,
    │                   #   scroll reveal, wishlist helpers, cart badge, cart sidebar render
    ├── cart.js         # Cart state (localStorage), add/remove/qty, cart page render
    ├── shop.js         # Filter/sort/paginate, renderProductCard(), quickAdd()
    └── product.js      # Gallery, size/color selector, reviews, related products
```

## Como Abrir

```bash
# Abrir directamente (sem servidor)
xdg-open index.html   # Linux
open index.html       # macOS

# Ou com servidor local (recomendado para evitar CORS em alguns browsers):
python3 -m http.server 8080
# → http://localhost:8080
```

Não existe build, npm, nem dependências — todos os recursos são locais excepto as Google Fonts (CDN).

## Arquitectura de JavaScript

### Injecção de Nav/Footer
`app.js` define `renderHeader()` e `renderFooter()` e injeta-os nos elementos `<div id="header">` e `<div id="footer">` presentes em cada página. Assim, nav e footer são definidos **uma única vez** no JS.

### Estado Persistente (localStorage)
| Chave | Conteúdo |
|---|---|
| `noir_cart` | Array de `{id, name, price, ph, size, color, qty}` |
| `noir_wishlist` | Array de IDs de produto |
| `noir_newsletter` | `"1"` quando o utilizador já subscreveu |

### Funções Globais Chave
- `cartAdd(product, size, color)` — adicionar ao carrinho e abrir sidebar
- `cartUpdateQty(id, size, color, delta)` — ±1 na quantidade
- `cartRemove(id, size, color)` — remover item
- `cartTotals(coupon?)` — `{subtotal, discount, shipping, total}`
- `toggleWishlist(id, btn)` — toggle wishlist + animação
- `showToast(msg, type)` — toast temporário (success | error | default)
- `openCart()` / `closeCart()` — sidebar do carrinho
- `renderProductCard(product)` — HTML de um card de produto (usado em shop e home)
- `quickAdd(id)` — adicionar ao carrinho sem escolher tamanho (usa o primeiro)

### Dados Mock
Todos os produtos estão em `js/data.js` como array `PRODUCTS`. Cada produto tem:
`id, slug, name, brand, category, gender, collection, price, comparePrice, isNew, isBestSeller, isLimited, badge, rating, reviewCount, stock{size:qty}, colors[{name,hex}], ph (classe CSS placeholder), description, details[], sizes[], tags[]`

### Imagens
Não existem imagens reais — são substituídas por `<div class="product-placeholder ph-N">` com gradientes CSS definidos em `main.css` (`.ph-1` a `.ph-8`). Para adicionar imagens reais, substitui os `renderPlaceholder()` por `<img src="...">`.

## Design System (css/main.css)

### Tokens Principais
```css
--bg / --bg-2 / --bg-3 / --bg-4 / --bg-5   /* fundos escuros */
--text / --text-2 / --text-3 / --text-4     /* texto (claro → muted) */
--accent                                     /* dourado #c4a47c */
--border / --border-2 / --border-3          /* bordas sutis */
--font-display: 'Bebas Neue'
--font-ui:      'Space Grotesk'
--font-editorial: 'Cormorant Garamond'
--t1 / --t2 / --t3 / --t-spring            /* transitions */
--nav-h: 68px
--pad: clamp(16px, 5vw, 80px)
```

### Componentes CSS Reutilizáveis
`.btn`, `.btn-primary`, `.btn-outline`, `.btn-ghost`, `.btn-accent`, `.btn-lg`, `.btn-sm`, `.btn-full` — botões
`.product-card` — card de produto com hover, wishlist, actions
`.collection-card` — card de coleção com overlay animado
`.cart-sidebar` — sidebar de carrinho
`.form-input`, `.form-select`, `.form-textarea`, `.form-checkbox` — formulários
`.modal-overlay` + `.modal` — modais
`.toast` — notificações
`.tabs` + `.tab-btn` + `.tab-panel` — tabs
`.accordion-item` — acordeão
`.size-btn` — selector de tamanho
`.reveal` / `.reveal-left` / `.reveal-right` — scroll animations (IntersectionObserver)
`.marquee-wrap` + `.marquee-track` — banda de texto animada

## Códigos de Desconto (para teste)
- `NOIR10` — 10% de desconto
- `FREE` — envio grátis

## Convenções
- Todas as páginas carregam: `data.js` → `app.js` → `cart.js` → (page-specific js)
- O nav injeta-se automaticamente ao `DOMContentLoaded` via `renderHeader()`
- Ícones SVG estão definidos no objeto `ICONS` em `app.js` (não usar font icons)
- `fmt(n)` formata preços em EUR/pt-PT
- Animações de scroll usam `.reveal` + IntersectionObserver em `initScrollReveal()`
