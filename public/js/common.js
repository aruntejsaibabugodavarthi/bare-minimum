// DOMPurify setup can go here

// ========== PRODUCT DATA ==========

let PRODUCTS = [];


// ========== CART MANAGEMENT ==========

class Cart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('bm_cart')) || [];
    this.updateBadge();
  }

  save() {
    localStorage.setItem('bm_cart', JSON.stringify(this.items));
    this.updateBadge();
  }

  addItem(productId, quantity = 1, color = '') {
    const existing = this.items.find(
      item => item.productId === productId && item.color === color
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ productId, quantity, color });
    }
    this.save();
    showToast('Added to cart');
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.save();
  }

  updateQuantity(index, quantity) {
    if (quantity <= 0) {
      this.removeItem(index);
      return;
    }
    this.items[index].quantity = quantity;
    this.save();
  }

  getTotal() {
    return this.items.reduce((sum, item) => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  getTax() {
    return this.items.reduce((sum, item) => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      if (product && product.gstSlab) {
        const gstRate = product.gstSlab / 100;
        const basePrice = product.price / (1 + gstRate);
        const itemTax = (product.price - basePrice) * item.quantity;
        return sum + itemTax;
      }
      return sum;
    }, 0);
  }

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  clear() {
    this.items = [];
    this.save();
  }

  updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = this.getItemCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.classList.toggle('visible', count > 0);
    });
  }
}

// Global cart instance
const cart = new Cart();


// ========== TOAST NOTIFICATION ==========

function showToast(message) {
  // Remove existing toast
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = DOMPurify.sanitize(`
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
    <span>${message}</span>
  `);
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}


// ========== NAVIGATION ==========

function initNavigation() {
  // Scroll effect
  let lastScroll = 0;
  const nav = document.querySelector('.nav');

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // Mobile menu toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu on link click
    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
}


// ========== SEARCH & AUTOCOMPLETE ==========

function initSearch() {
  const navLinks = document.getElementById('nav-links');
  if (!navLinks) return;

  const searchContainer = document.createElement('div');
  searchContainer.className = 'nav-search';
  searchContainer.innerHTML = DOMPurify.sanitize(`
    <div class="search-input-wrapper">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input type="text" id="global-search" placeholder="Search..." autocomplete="off">
    </div>
    <div id="search-results" class="search-results-overlay"></div>
  `);
  
  const cartLink = navLinks.querySelector('.nav-cart');
  if (cartLink) {
    navLinks.insertBefore(searchContainer, cartLink);
  } else {
    navLinks.appendChild(searchContainer);
  }

  const searchInput = document.getElementById('global-search');
  const searchResults = document.getElementById('search-results');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      searchResults.classList.remove('visible');
      return;
    }

    const matched = PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    ).slice(0, 5);

    if (matched.length > 0) {
      searchResults.innerHTML = DOMPurify.sanitize(matched.map(p => `
        <a href="product.html?id=${p.id}" class="search-result-item">
          <img src="${p.image}" alt="${p.name}">
          <div class="search-result-info">
            <div class="search-result-name">${p.name}</div>
            <div class="search-result-price">₹${p.price}</div>
          </div>
        </a>
      `).join(''));
    } else {
      searchResults.innerHTML = DOMPurify.sanitize('<div class="search-result-empty">No products found.</div>');
    }
    searchResults.classList.add('visible');
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target)) {
      searchResults.classList.remove('visible');
    }
  });
}


// ========== SCROLL REVEAL ==========

function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}


// ========== NEWSLETTER ==========

function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    if (input && input.value.trim()) {
      showToast('Welcome to the Bare Minimum community!');
      input.value = '';
    }
  });
}


// ========== AUTHENTICATION ==========

class Auth {
  constructor() {
    this.token = localStorage.getItem('bm_access_token');
    this.refreshToken = localStorage.getItem('bm_refresh_token');
    this.user = JSON.parse(localStorage.getItem('bm_user')) || null;
  }

  setSession(tokens, user) {
    this.token = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.user = user;
    localStorage.setItem('bm_access_token', this.token);
    localStorage.setItem('bm_refresh_token', this.refreshToken);
    localStorage.setItem('bm_user', JSON.stringify(user));
  }

  async logout() {
    if (this.refreshToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken })
        });
      } catch (e) {
        console.error('Logout error', e);
      }
    }
    this.token = null;
    this.refreshToken = null;
    this.user = null;
    localStorage.removeItem('bm_access_token');
    localStorage.removeItem('bm_refresh_token');
    localStorage.removeItem('bm_user');
    showToast('Logged out');
    setTimeout(() => location.reload(), 500);
  }

  async fetchWithAuth(url, options = {}) {
    if (!this.token) {
      window.location.href = 'login.html';
      return;
    }
    
    options.headers = options.headers || {};
    options.headers['Authorization'] = `Bearer ${this.token}`;
    
    let res = await fetch(url, options);
    
    if (res.status === 401 && this.refreshToken) {
      // Try refresh
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
      
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        this.setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken }, this.user);
        
        // Retry original request
        options.headers['Authorization'] = `Bearer ${this.token}`;
        res = await fetch(url, options);
      } else {
        this.logout();
      }
    }
    return res;
  }

  getCurrentUser() {
    return this.user;
  }
}

const auth = new Auth();

function initAuth() {
  // 1. Setup Navigation Auth State
  const navLinks = document.getElementById('nav-links');
  if (navLinks) {
    const user = auth.getCurrentUser();
    const authContainer = document.createElement('div');
    authContainer.className = 'nav-auth';

    if (user) {
      const initial = (user.name || user.email || user.phone || 'U').charAt(0).toUpperCase();
      let adminLink = user.role === 'admin' ? '<a href="admin.html" class="nav-admin">Dashboard</a>' : '';
      authContainer.innerHTML = DOMPurify.sanitize(`
        ${adminLink}
        <a href="account.html" class="nav-avatar" title="My Account">
          <span class="avatar-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
        </a>
        <a href="#" onclick="event.preventDefault()); auth.logout();" class="auth-link">Logout</a>
      `;
    } else {
      authContainer.innerHTML = DOMPurify.sanitize(`
        <a href="login.html" class="auth-link">Login</a>
      `);
    }
    navLinks.appendChild(authContainer);
  }

  // 2. Auth Page Logic (only runs if on login.html)
  const otpRequestForm = document.getElementById('otp-request-form');
  const otpVerifyForm = document.getElementById('otp-verify-form');
  const emailLoginForm = document.getElementById('email-login-form');
  const btnGoogleLogin = document.getElementById('btn-google-login');
  
  let currentPhone = '';

  if (otpRequestForm) {
    otpRequestForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      currentPhone = document.getElementById('phone-number').value.trim();
      const idempotencyKey = crypto.randomUUID();
      try {
        const res = await fetch('/api/auth/request-otp', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey
          },
          body: JSON.stringify({ phone: currentPhone })
        });
        const data = await res.json();
        if (data.success) {
          showToast('OTP Sent! (Check SMS)');
          otpRequestForm.style.display = 'none';
          otpVerifyForm.style.display = 'block';
        } else {
          showToast(data.message || 'Failed to send OTP');
        }
      } catch (err) {
        showToast('Failed to connect to server');
      }
    });
  }

  if (otpVerifyForm) {
    otpVerifyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const otp = document.getElementById('otp-code').value.trim();
      try {
        const res = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: currentPhone, otp })
        });
        const data = await res.json();
        if (data.success) {
          auth.setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken }, data.user);
          if (data.new_user) {
            window.location.href = 'account.html';
          } else {
            window.location.href = 'index.html';
          }
        } else {
          showToast(data.message || 'Invalid OTP');
        }
      } catch (err) {
        showToast('Failed to connect to server');
      }
    });
  }

  if (emailLoginForm) {
    emailLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email-addr').value.trim();
      const password = document.getElementById('password').value.trim();
      try {
        const res = await fetch('/api/auth/login-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
          auth.setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken }, data.user);
          window.location.href = 'index.html';
        } else {
          showToast(data.message);
        }
      } catch (err) {
        showToast('Failed to connect to server');
      }
    });
  }

  if (btnGoogleLogin) {
    btnGoogleLogin.addEventListener('click', async (e) => {
      e.preventDefault();
      // MOCK Google OAuth Flow
      const mockEmail = prompt("MOCK OAUTH: Enter email to simulate google login returning:");
      if (!mockEmail) return;
      
      try {
        const res = await fetch('/api/auth/social-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: mockEmail, 
            name: mockEmail.split('@')[0], 
            provider: 'google', 
            providerId: 'g_' + Math.random().toString(36).substr(2) 
          })
        });
        const data = await res.json();
        if (data.success) {
          auth.setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken }, data.user);
          window.location.href = 'index.html';
        } else {
          showToast(data.message);
        }
      } catch (err) {
        showToast('Failed to connect to server');
      }
    });
  }
}


// ========== SUPPORT WIDGET ==========

function initSupportWidget() {
  const widgetHTML = `
    <div class="support-widget" id="support-widget">
      <div class="support-panel" id="support-panel">
        <div class="support-panel-header">
          <h4>Customer Support</h4>
          <p>We typically reply in a few minutes.</p>
        </div>
        <div class="support-panel-body">
          <p>Hi there! How can we help you today?</p>
          <a href="mailto:support@bareminimum.example.com" class="btn btn-primary btn-sm" style="width: 100%; text-decoration: none;">Send us an Email</a>
          <p style="margin-top: 1rem; font-size: 0.8rem; color: #888;">Or call us at 1-800-555-BARE<br>(Mon-Fri 9am-5pm PST)</p>
        </div>
      </div>
      <button class="support-toggle" id="support-toggle" aria-label="Toggle support chat">
        <svg class="icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <svg class="icon-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', widgetHTML);

  const toggleBtn = document.getElementById('support-toggle');
  const panel = document.getElementById('support-panel');
  
  if (toggleBtn && panel) {
    toggleBtn.addEventListener('click', () => {
      toggleBtn.classList.toggle('active');
      panel.classList.toggle('open');
    });
  }
}


// ========== DPDP CONSENT MANAGER ==========

class ConsentManager {
  constructor() {
    this.storageKey = 'bm_consent';
    this.consentState = JSON.parse(localStorage.getItem(this.storageKey));
    this.init();
  }

  init() {
    if (!this.consentState) {
      setTimeout(() => this.showBanner(), 1000);
    }
  }

  showBanner() {
    if (document.getElementById('consent-banner')) return;
    
    const banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: #111;
      color: #fff;
      padding: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: 0 -4px 12px rgba(0,0,0,0.15);
      animation: slideUp 0.5s ease-out;
    `;

    banner.innerHTML = DOMPurify.sanitize(`
      <div class="container" style="display: flex); flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem;">
        <div style="flex: 1 1 300px;">
          <h4 style="margin: 0 0 0.5rem; color: #fff; font-size: 1.1rem;">We Value Your Privacy (DPDP Act 2023)</h4>
          <p style="margin: 0; font-size: 0.9rem; color: #ccc; line-height: 1.5;">
            We process personal data to fulfill orders, ensure security, and improve your experience. 
            By clicking "Accept All", you consent to our <a href="privacy.html" style="color: var(--copper); text-decoration: underline;">Privacy Policy</a>.
          </p>
        </div>
        <div style="display: flex; gap: 1rem;">
          <button id="btn-accept-consent" class="btn btn-primary btn-sm" style="background: var(--copper); border-color: var(--copper); padding: 0.5rem 1.5rem;">Accept All</button>
        </div>
      </div>
    `;

    // Add animation style
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(banner);

    document.getElementById('btn-accept-consent').addEventListener('click', () => {
      this.accept();
      banner.style.transform = 'translateY(100%)';
      banner.style.transition = 'transform 0.3s ease-in';
      setTimeout(() => banner.remove(), 300);
    });
  }

  accept() {
    this.consentState = {
      essential: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(this.storageKey, JSON.stringify(this.consentState));
  }
}


// ========== INIT ==========

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success) {
      PRODUCTS = data.products.map(p => ({
        ...p,
        // The API returns 'images' as a parsed JSON array, and 'slug' as 'id' for the frontend
        id: p.slug,
        image: p.images[0],
        variants: [ // Quick mock of variants since we don't have them in the new schema yet
          { id: p.slug + '-v1', size: 'Standard', color: 'Standard', stock: p.inventoryCount }
        ],
        isNew: true,
        isFeatured: true,
        rating: 4.5,
        reviewCount: 10,
        reviews: []
      }));
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }

  initAuth();
  initNavigation();
  initSearch();
  initFeaturedProducts();
  initShopPage();
  initProductPage();
  initCartPage();
  initCheckoutPage();
  initSupportWidget();
  initNewsletter();
  initScrollReveal();
  new ConsentManager();
});
