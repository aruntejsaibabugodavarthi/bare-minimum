import { PRODUCTS, cart, showToast } from '../common.js';

// ========== CART PAGE ==========

function initCartPage() {
  const container = document.getElementById('cart-content');
  if (!container) return;

  function renderCart() {
    if (cart.items.length === 0) {
      container.innerHTML = DOMPurify.sanitize(`
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <h3>Your Cart is Empty</h3>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <a href="shop.html" class="btn btn-primary">Browse Products</a>
        </div>
      `);
      return;
    }

    const subtotal = cart.getTotal();
    const shipping = subtotal >= 6000 ? 0 : 500;
    const tax = Math.round(cart.getTax() * 100) / 100;
    const total = subtotal + shipping; // Price is already inclusive of tax

    container.innerHTML = DOMPurify.sanitize(`
      <div class="cart-layout">
        <div class="cart-items">
          <div class="cart-items-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </div>
          ${cart.items
            .map((item, index) => {
              const product = PRODUCTS.find((p) => p.id === item.productId);
              if (!product) return '';
              const itemTotal = product.price * item.quantity;
              return `
              <div class="cart-item" data-index="${index}">
                <div class="cart-item-info">
                  <div class="cart-item-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                  </div>
                  <div>
                    <div class="cart-item-name">${product.name}</div>
                    ${item.color ? `<div class="cart-item-variant">${item.color}</div>` : ''}
                  </div>
                </div>
                <div class="cart-item-price">₹${product.price}</div>
                <div class="cart-item-qty">
                  <button class="qty-btn" data-action="decrease" data-index="${index}" aria-label="Decrease">−</button>
                  <span>${item.quantity}</span>
                  <button class="qty-btn" data-action="increase" data-index="${index}" aria-label="Increase">+</button>
                </div>
                <div class="cart-item-total">₹${itemTotal}</div>
                <button class="cart-item-remove remove-btn" data-index="${index}" aria-label="Remove item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            `;
            })
            .join('')}
        </div>

        <div class="cart-summary">
          <h3>Order Summary</h3>
          <div class="cart-summary-row">
            <span class="label">Subtotal</span>
            <span class="value">₹${subtotal.toFixed(2)}</span>
          </div>
          <div class="cart-summary-row">
            <span class="label">Included GST</span>
            <span class="value">₹${tax.toFixed(2)}</span>
          </div>
          <div class="cart-summary-row">
            <span class="label">Shipping</span>
            <span class="value">${shipping === 0 ? 'Free' : '₹' + shipping.toFixed(2)}</span>
          </div>
          ${
            shipping > 0
              ? `
            <div class="cart-summary-row" style="margin-top: 0;">
              <span class="label" style="font-size: 0.75rem; color: var(--copper);">Free shipping on orders ₹6000+</span>
            </div>
          `
              : ''
          }
          <div class="cart-summary-row total">
            <span class="label">Total</span>
            <span class="value">₹${total.toFixed(2)}</span>
          </div>
          <div class="promo-code">
            <input type="text" placeholder="Promo code" id="promo-input">
            <button class="btn btn-secondary btn-sm" id="apply-promo-btn">Apply</button>
          </div>
          <a href="checkout.html" class="btn btn-primary" style="display: block; text-align: center; text-decoration: none; margin-bottom: 1rem;">
            Proceed to Checkout
          </a>
          <div class="cart-trust-badges" style="text-align: center; padding-top: 1rem; border-top: 1px solid #eee;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px; color: #222; font-size: 0.85rem; font-weight: 500;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Secure 256-bit SSL Checkout
            </div>
            <p style="font-size: 0.8rem; color: #666; margin: 0;">We offer a 30-day hassle-free return policy.</p>
          </div>
        </div>
      </div>
    `);

    // Add Event Listeners for cart actions
    container.querySelectorAll('.qty-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        const action = e.currentTarget.dataset.action;
        const item = cart.items[index];
        if (action === 'decrease') {
          cart.updateQuantity(index, item.quantity - 1);
        } else if (action === 'increase') {
          cart.updateQuantity(index, item.quantity + 1);
        }
        renderCart();
      });
    });

    container.querySelectorAll('.remove-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        cart.removeItem(index);
        renderCart();
      });
    });

    const promoBtn = document.getElementById('apply-promo-btn');
    if (promoBtn) {
      promoBtn.addEventListener('click', () => {
        const input = document.getElementById('promo-input');
        if (input && input.value.trim()) {
          showToast('Promo code applied!');
        }
      });
    }

    // Handle manual quantity input changes
    document.querySelectorAll('.qty-input').forEach((input) => {
      input.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        let qty = parseInt(e.target.value);
        if (isNaN(qty) || qty < 1) qty = 1;
        cart.updateQuantity(index, qty);
        renderCart();
      });
    });
  }

  renderCart();
}

function runInit() {
  if (window.PRODUCTS_LOADED) {
    initCartPage();
  } else {
    document.addEventListener('productsLoaded', initCartPage);
  }
}

runInit();
