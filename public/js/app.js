/* ========================================
   BARE MINIMUM — Core Application JS
   ======================================== */

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
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
    <span>${message}</span>
  `;
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
  searchContainer.innerHTML = `
    <div class="search-input-wrapper">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input type="text" id="global-search" placeholder="Search..." autocomplete="off">
    </div>
    <div id="search-results" class="search-results-overlay"></div>
  `;
  
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
      searchResults.innerHTML = matched.map(p => `
        <a href="product.html?id=${p.id}" class="search-result-item">
          <img src="${p.image}" alt="${p.name}">
          <div class="search-result-info">
            <div class="search-result-name">${p.name}</div>
            <div class="search-result-price">₹${p.price}</div>
          </div>
        </a>
      `).join('');
    } else {
      searchResults.innerHTML = '<div class="search-result-empty">No products found.</div>';
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

// ========== SHOP PAGE ==========
function initShopPage() {
  const grid = document.getElementById('product-grid');
  const countEl = document.getElementById('product-count');
  if (!grid) return;

  let currentFilters = { category: 'All', color: [], size: [], price: 'All' };
  let currentSort = 'featured';

  function renderProducts() {
    let filtered = [...PRODUCTS];

    if (currentFilters.category !== 'All') {
      filtered = filtered.filter(p => p.category === currentFilters.category);
    }
    
    if (currentFilters.color.length > 0) {
      filtered = filtered.filter(p => p.variants && p.variants.some(v => currentFilters.color.includes(v.color)));
    }

    if (currentFilters.size.length > 0) {
      filtered = filtered.filter(p => p.variants && p.variants.some(v => currentFilters.size.includes(v.size)));
    }

    if (currentFilters.price !== 'All') {
      filtered = filtered.filter(p => {
        if (currentFilters.price === 'Under2000') return p.price < 2000;
        if (currentFilters.price === '2000to4000') return p.price >= 2000 && p.price <= 4000;
        if (currentFilters.price === 'Over4000') return p.price > 4000;
        return true;
      });
    }

    // Sort
    switch (currentSort) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    if (countEl) {
      countEl.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;
    }

    grid.innerHTML = filtered.map(product => `
      <a href="product.html?id=${product.id}" class="product-card reveal visible" id="product-${product.id}">
        <div class="product-card-image">
          ${product.isNew ? '<span class="badge-new">New</span>' : ''}
          ${auth.getCurrentUser() && auth.getCurrentUser().role === 'admin' ? '<div class="admin-edit-badge" onclick="event.preventDefault(); showToast(&apos;Admin Edit Mode&apos;)">Edit</div>' : ''}
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          <div class="product-card-overlay">
            <span class="btn btn-sm btn-outline-light">View Details</span>
          </div>
        </div>
        <div class="product-card-body">
          <div class="product-card-category">${product.category}</div>
          <div class="product-card-name">${product.name}</div>
          <div class="product-card-price">₹${product.price}</div>
        </div>
      </a>
    `).join('');
  }

  // Filter checkboxes (Color & Size)
  document.querySelectorAll('.filter-checkbox').forEach(cb => {
    cb.addEventListener('change', () => {
      const filterType = cb.dataset.filter;
      const filterValue = cb.value;
      
      if (cb.checked) {
        if (!currentFilters[filterType].includes(filterValue)) {
          currentFilters[filterType].push(filterValue);
        }
      } else {
        currentFilters[filterType] = currentFilters[filterType].filter(v => v !== filterValue);
      }
      
      renderProducts();
    });
  });

  // Category & Price filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const filterType = btn.dataset.filter;
      const filterValue = btn.dataset.value;
      
      const parentGroup = btn.closest('.filter-group');
      if (parentGroup) {
        parentGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      }
      btn.classList.add('active');
      
      if (filterType) {
        currentFilters[filterType] = filterValue;
      } else if (btn.dataset.category) {
        currentFilters.category = btn.dataset.category;
      }
      
      renderProducts();
    });
  });

  // Sort select
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      renderProducts();
    });
  }

  renderProducts();
}

// ========== PRODUCT DETAIL PAGE ==========
function initProductPage() {
  const container = document.getElementById('product-detail');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const product = PRODUCTS.find(p => p.id === productId);

  if (!product) {
    container.innerHTML = `
      <div class="container text-center" style="padding: 6rem 0;">
        <h2>Product not found</h2>
        <p style="margin: 1rem 0 2rem;">The product you're looking for doesn't exist.</p>
        <a href="shop.html" class="btn btn-primary">Browse Shop</a>
      </div>
    `;
    return;
  }

  // Set page title
  document.title = `${product.name} — Bare Minimum`;

  const uniqueColors = [...new Set(product.variants ? product.variants.map(v => v.color).filter(Boolean) : [])];
  const uniqueSizes = [...new Set(product.variants ? product.variants.map(v => v.size).filter(Boolean) : [])];

  let selectedColor = uniqueColors.length > 0 ? uniqueColors[0] : '';
  let selectedSize = uniqueSizes.length > 0 ? uniqueSizes[0] : '';
  let quantity = 1;

  function renderProduct() {
    container.innerHTML = `
      <div class="container">
        <div class="product-detail-grid">
          <div class="product-gallery">
            <div class="product-gallery-main" style="position: relative; overflow: hidden; border-radius: 8px;">
              <img src="${product.images[0]}" alt="${product.name}" id="main-image" style="transition: transform 0.3s ease; width: 100%; height: auto; display: block;">
            </div>
            ${product.images.length > 1 ? `
            <div class="product-gallery-thumbnails" style="display: flex; gap: 10px; margin-top: 10px;">
              ${product.images.map((img, idx) => `
                <img src="${img}" class="gallery-thumb ${idx === 0 ? 'active' : ''}" data-src="${img}" style="width: 80px; height: 80px; object-fit: cover; cursor: pointer; border: 2px solid ${idx === 0 ? '#333' : 'transparent'}; border-radius: 4px; transition: border-color 0.2s;">
              `).join('')}
            </div>
            ` : ''}
          </div>
          <div class="product-info">
            <div class="breadcrumb">
              <a href="index.html">Home</a>
              <span class="sep">›</span>
              <a href="shop.html">Shop</a>
              <span class="sep">›</span>
              <span>${product.name}</span>
            </div>
            <h1>${product.name}</h1>
            ${product.rating ? `
              <div class="product-rating" style="display: flex; align-items: center; gap: 5px; margin-bottom: 1rem; font-size: 0.9rem;">
                <span style="color: #c49a6c;">★★★★★</span>
                <span><strong>${product.rating}</strong> (${product.reviewCount} reviews)</span>
              </div>
            ` : ''}
            <div class="price">
              <span style="font-size: 1.5rem; font-weight: 600; color: #111;">₹${product.price}</span>
              ${product.mrp ? `<span style="font-size: 1rem; color: #888; text-decoration: line-through; margin-left: 0.5rem;">MRP ₹${product.mrp}</span>` : ''}
              <div style="font-size: 0.8rem; color: #666; margin-top: 0.2rem;">(Inclusive of all taxes)</div>
            </div>
            <p class="description">${product.description}</p>

            ${uniqueColors.length > 0 ? `
              <div class="product-options">
                <div class="option-label" id="color-label">Color — ${selectedColor}</div>
                <div class="color-options" style="display: flex; gap: 8px;">
                  ${uniqueColors.map(c => `
                    <button class="color-selector btn-toggle ${c === selectedColor ? 'active' : ''}" 
                            data-color="${c}" 
                            title="${c}"
                            style="border: 1px solid #ccc; padding: 6px 16px; border-radius: 4px; cursor: pointer; background: ${c === selectedColor ? '#333' : '#fff'}; color: ${c === selectedColor ? '#fff' : '#333'}; font-size: 0.9rem;">
                      ${c}
                    </button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            ${uniqueSizes.length > 0 ? `
              <div class="product-options" style="margin-top: 1rem;">
                <div class="option-label" id="size-label">Size — ${selectedSize}</div>
                <div class="size-options" style="display: flex; gap: 8px;">
                  ${uniqueSizes.map(s => `
                    <button class="size-swatch btn-toggle ${s === selectedSize ? 'active' : ''}" 
                            data-size="${s}" 
                            title="${s}"
                            style="border: 1px solid #ccc; padding: 4px 12px; border-radius: 4px; cursor: pointer; background: ${s === selectedSize ? '#333' : '#fff'}; color: ${s === selectedSize ? '#fff' : '#333'};">
                      ${s}
                    </button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <div class="option-label">Quantity</div>
            <div class="quantity-selector">
              <button id="qty-minus" aria-label="Decrease quantity">−</button>
              <input type="number" id="qty-input" value="${quantity}" min="1" max="10" readonly>
              <button id="qty-plus" aria-label="Increase quantity">+</button>
            </div>

            <div class="add-to-cart-row">
              <button class="btn btn-primary" id="add-to-cart-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Add to Cart
              </button>
            </div>

            <div class="return-policy-badge" style="display: flex; align-items: flex-start; gap: 12px; margin-top: 1.5rem; padding: 12px 16px; background: #fafafa; border: 1px solid #eee; border-radius: 6px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5" style="flex-shrink: 0;">
                <path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
              </svg>
              <div>
                <strong style="display: block; font-size: 0.9rem; color: #111;">30-Day Returns</strong>
                <span style="font-size: 0.85rem; color: #555;">Clear, simple, and hassle-free. Visible before checkout.</span>
              </div>
            </div>

            <div class="accordion" style="margin-top: 2rem;">
              <div class="accordion-item">
                <button class="accordion-trigger" aria-expanded="false">
                  Details & Care
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                <div class="accordion-content">
                  <div class="accordion-content-inner">${product.details}</div>
                </div>
              </div>
              <div class="accordion-item">
                <button class="accordion-trigger" aria-expanded="false">
                  Shipping & Returns
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                <div class="accordion-content">
                  <div class="accordion-content-inner">
                    Free shipping on orders over ₹6000. Standard delivery in 3-5 business days. 
                    Express delivery available at checkout. We offer hassle-free returns within 30 days 
                    of purchase. Items must be unused and in original packaging.
                  </div>
                </div>
              </div>
            </div>
              <div class="accordion-item">
                <button class="accordion-trigger" aria-expanded="false">
                  Legal & Compliance
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>
                <div class="accordion-content">
                  <div class="accordion-content-inner" style="font-size: 0.9rem; color: #555;">
                    <p><strong>Country of Origin:</strong> ${product.countryOfOrigin || 'India'}</p>
                    <p><strong>Net Quantity:</strong> ${product.netQuantity || '1 Unit'}</p>
                    <p><strong>Manufacturer:</strong> ${product.manufacturerDetails || 'Bare Minimum Mfg'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="product-reviews section" style="background: #fafafa; padding: 4rem 0; margin-top: 4rem;">
        <div class="container">
          <div class="section-header text-center">
            <h2>Customer Reviews</h2>
            <div class="divider mx-auto" style="margin: 1rem auto;"></div>
            ${product.rating ? `
              <div class="overall-rating" style="margin-top: 1.5rem; font-size: 1.1rem;">
                <span style="color: #c49a6c; font-size: 1.5rem;">★★★★★</span>
                <p style="margin-top: 0.5rem; color: #555;"><strong>${product.rating} out of 5</strong> based on ${product.reviewCount} reviews</p>
              </div>
            ` : ''}
          </div>
          <div class="reviews-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; margin-top: 3rem;">
            ${product.reviews ? product.reviews.map(r => `
              <div class="review-card" style="background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                <div class="review-header" style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                  <span class="review-author" style="font-weight: 600;">${r.author}</span>
                  <span class="review-date" style="color: #888; font-size: 0.85rem;">${r.date}</span>
                </div>
                <div class="review-stars" style="color: #c49a6c; margin-bottom: 1rem; font-size: 1.1rem;">
                  ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
                </div>
                <p class="review-text" style="color: #444; line-height: 1.6;">"${r.text}"</p>
              </div>
            `).join('') : '<p class="text-center" style="grid-column: 1/-1;">No reviews yet.</p>'}
          </div>
        </div>
      </div>

      <div class="related-products section" style="padding-top: 4rem;">
        <div class="container">
          <div class="section-header">
            <h2>You May Also Like</h2>
            <div class="divider"></div>
          </div>
          <div class="product-grid" id="related-grid"></div>
        </div>
      </div>
    `;

    // Render related products
    const related = PRODUCTS.filter(p => p.id !== product.id).slice(0, 4);
    const relatedGrid = document.getElementById('related-grid');
    if (relatedGrid) {
      relatedGrid.innerHTML = related.map(p => `
        <a href="product.html?id=${p.id}" class="product-card">
          <div class="product-card-image">
            ${p.isNew ? '<span class="badge-new">New</span>' : ''}
            <img src="${p.image}" alt="${p.name}" loading="lazy">
            <div class="product-card-overlay">
              <span class="btn btn-sm btn-outline-light">View Details</span>
            </div>
          </div>
          <div class="product-card-body">
            <div class="product-card-category">${p.category}</div>
            <div class="product-card-name">${p.name}</div>
            <div class="product-card-price">₹${p.price}</div>
          </div>
        </a>
      `).join('');
    }

    // Event listeners
    
    // Gallery
    const mainImage = document.getElementById('main-image');
    // Hover zoom effect
    mainImage.addEventListener('mousemove', (e) => {
      const rect = e.target.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mainImage.style.transformOrigin = `${x * 100}% ${y * 100}%`;
      mainImage.style.transform = 'scale(1.5)';
    });
    mainImage.addEventListener('mouseleave', () => {
      mainImage.style.transformOrigin = 'center center';
      mainImage.style.transform = 'scale(1)';
    });

    document.querySelectorAll('.gallery-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        document.querySelectorAll('.gallery-thumb').forEach(t => t.style.borderColor = 'transparent');
        thumb.style.borderColor = '#333';
        mainImage.src = thumb.dataset.src;
      });
    });

    // Color swatches
    document.querySelectorAll('.color-selector').forEach(swatch => {
      swatch.addEventListener('click', () => {
        document.querySelectorAll('.color-selector').forEach(s => {
          s.classList.remove('active');
          s.style.background = '#fff';
          s.style.color = '#333';
        });
        swatch.classList.add('active');
        swatch.style.background = '#333';
        swatch.style.color = '#fff';
        selectedColor = swatch.dataset.color;
        const label = document.getElementById('color-label');
        if (label) label.textContent = `Color — ${selectedColor}`;
      });
    });

    document.querySelectorAll('.size-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        document.querySelectorAll('.size-swatch').forEach(s => {
          s.classList.remove('active');
          s.style.background = '#fff';
          s.style.color = '#333';
        });
        swatch.classList.add('active');
        swatch.style.background = '#333';
        swatch.style.color = '#fff';
        selectedSize = swatch.dataset.size;
        const label = document.getElementById('size-label');
        if (label) label.textContent = `Size — ${selectedSize}`;
      });
    });

    // Quantity
    const qtyInput = document.getElementById('qty-input');
    document.getElementById('qty-minus')?.addEventListener('click', () => {
      if (quantity > 1) {
        quantity--;
        qtyInput.value = quantity;
      }
    });
    document.getElementById('qty-plus')?.addEventListener('click', () => {
      if (quantity < 10) {
        quantity++;
        qtyInput.value = quantity;
      }
    });

    // Add to cart
    document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
      cart.addItem(product.id, quantity, selectedColor + (selectedSize ? ' / ' + selectedSize : ''));
    });

    // Accordion
    document.querySelectorAll('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        const content = item.querySelector('.accordion-content');
        const isOpen = item.classList.contains('open');

        // Close all
        document.querySelectorAll('.accordion-item').forEach(ai => {
          ai.classList.remove('open');
          ai.querySelector('.accordion-content').style.maxHeight = '0';
          ai.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          item.classList.add('open');
          content.style.maxHeight = content.scrollHeight + 'px';
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  renderProduct();
}

// ========== CART PAGE ==========
function initCartPage() {
  const container = document.getElementById('cart-content');
  if (!container) return;

  function renderCart() {
    if (cart.items.length === 0) {
      container.innerHTML = `
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
      `;
      return;
    }

    const subtotal = cart.getTotal();
    const shipping = subtotal >= 6000 ? 0 : 500;
    const tax = Math.round(cart.getTax() * 100) / 100;
    const total = subtotal + shipping; // Price is already inclusive of tax

    container.innerHTML = `
      <div class="cart-layout">
        <div class="cart-items">
          <div class="cart-items-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </div>
          ${cart.items.map((item, index) => {
            const product = PRODUCTS.find(p => p.id === item.productId);
            if (!product) return '';
            const itemTotal = product.price * item.quantity;
            return `
              <div class="cart-item" data-index="${index}">
                <div class="cart-item-info">
                  <div class="cart-item-image">
                    <img src="${product.image}" alt="${product.name}">
                  </div>
                  <div>
                    <div class="cart-item-name">${product.name}</div>
                    ${item.color ? `<div class="cart-item-variant">${item.color}</div>` : ''}
                  </div>
                </div>
                <div class="cart-item-price">₹${product.price}</div>
                <div class="cart-item-qty">
                  <button onclick="updateCartItem(${index}, ${item.quantity - 1})" aria-label="Decrease">−</button>
                  <span>${item.quantity}</span>
                  <button onclick="updateCartItem(${index}, ${item.quantity + 1})" aria-label="Increase">+</button>
                </div>
                <div class="cart-item-total">₹${itemTotal}</div>
                <button class="cart-item-remove" onclick="removeCartItem(${index})" aria-label="Remove item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            `;
          }).join('')}
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
          ${shipping > 0 ? `
            <div class="cart-summary-row" style="margin-top: 0;">
              <span class="label" style="font-size: 0.75rem; color: var(--copper);">Free shipping on orders ₹6000+</span>
            </div>
          ` : ''}
          <div class="cart-summary-row total">
            <span class="label">Total</span>
            <span class="value">₹${total.toFixed(2)}</span>
          </div>
          <div class="promo-code">
            <input type="text" placeholder="Promo code" id="promo-input">
            <button class="btn btn-secondary btn-sm" onclick="applyPromo()">Apply</button>
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
    `;
  }

  // Global functions for inline handlers
  window.updateCartItem = (index, qty) => {
    cart.updateQuantity(index, qty);
    renderCart();
  };

  window.removeCartItem = (index) => {
    cart.removeItem(index);
    renderCart();
  };

  window.applyPromo = () => {
    const input = document.getElementById('promo-input');
    if (input && input.value.trim()) {
      showToast('Promo code applied!');
    }
  };

  window.checkout = () => {
    if (!auth.getCurrentUser()) {
      showToast('Please login to checkout.');
      window.location.href = 'login.html';
      return;
    }
    showToast('Thank you! Your order has been placed.');
    cart.clear();
    setTimeout(() => renderCart(), 1500);
  };

  renderCart();
}

// ========== FEATURED PRODUCTS (HOMEPAGE) ==========
function initFeaturedProducts() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  const featured = PRODUCTS.filter(p => p.isFeatured);
  grid.innerHTML = featured.map((product, i) => `
    <a href="product.html?id=${product.id}" class="product-card reveal reveal-delay-${i + 1}" id="featured-${product.id}">
      <div class="product-card-image">
        ${product.isNew ? '<span class="badge-new">New</span>' : ''}
        ${auth.getCurrentUser() && auth.getCurrentUser().role === 'admin' ? '<div class="admin-edit-badge" onclick="event.preventDefault(); showToast(&apos;Admin Edit Mode&apos;)">Edit</div>' : ''}
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <div class="product-card-overlay">
          <span class="btn btn-sm btn-outline-light">View Details</span>
        </div>
      </div>
      <div class="product-card-body">
        <div class="product-card-category">${product.category}</div>
        <div class="product-card-name">${product.name}</div>
        <div class="product-card-price">₹${product.price}</div>
      </div>
    </a>
  `).join('');
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
      authContainer.innerHTML = `
        ${adminLink}
        <a href="account.html" class="nav-avatar" title="My Account">
          <span class="avatar-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </span>
        </a>
        <a href="#" onclick="event.preventDefault(); auth.logout();" class="auth-link">Logout</a>
      `;
    } else {
      authContainer.innerHTML = `
        <a href="login.html" class="auth-link">Login</a>
      `;
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

// ========== CHECKOUT PAGE ==========
function initCheckoutPage() {
  const summaryContainer = document.getElementById('checkout-summary');
  if (!summaryContainer) return;

  function renderCheckoutSummary() {
    if (cart.items.length === 0) {
      summaryContainer.innerHTML = '<p>Your cart is empty. <a href="shop.html">Return to shop</a>.</p>';
      return;
    }
    
    const subtotal = cart.getTotal();
    const shipping = subtotal >= 6000 ? 0 : 500;
    const tax = Math.round(cart.getTax() * 100) / 100;
    const total = subtotal + shipping;

    summaryContainer.innerHTML = `
      <h3 style="font-size: 1.25rem; margin-bottom: 1.5rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem;">Order Summary</h3>
      <div class="checkout-items" style="margin-bottom: 1.5rem;">
        ${cart.items.map((item) => {
          const product = PRODUCTS.find(p => p.id === item.productId);
          if (!product) return '';
          return `
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center;">
              <div style="position: relative;">
                <img src="${product.image}" alt="${product.name}" style="width: 64px; height: 64px; object-fit: cover; border-radius: 6px; border: 1px solid #eee;">
                <span style="position: absolute; top: -8px; right: -8px; background: #666; color: #fff; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">${item.quantity}</span>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 500; font-size: 0.95rem;">${product.name}</div>
                ${item.color ? `<div style="font-size: 0.8rem; color: #666;">${item.color}</div>` : ''}
              </div>
              <div style="font-weight: 500;">₹${(product.price * item.quantity).toFixed(2)}</div>
            </div>
          `;
        }).join('')}
      </div>
      <div style="border-top: 1px solid #eee; padding-top: 1rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem;">
          <span style="color: #555;">Subtotal</span>
          <span>₹${subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem;">
          <span style="color: #555;">Included GST</span>
          <span>₹${tax.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.95rem;">
          <span style="color: #555;">Shipping</span>
          <span>${shipping === 0 ? 'Free' : '₹' + shipping.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 1px solid #eee; padding-top: 1rem; font-weight: 600; font-size: 1.25rem;">
          <span>Total</span>
          <span>₹${total.toFixed(2)}</span>
        </div>
      </div>
    `;
  }
  
  renderCheckoutSummary();

  const checkoutForm = document.getElementById('checkout-form');
  const pincodeInput = document.getElementById('checkout-pincode');
  const cityInput = document.getElementById('checkout-city');
  const stateInput = document.getElementById('checkout-state');
  const serviceabilityMsg = document.getElementById('serviceability-msg');
  let isServiceable = false;
  let deliveryEstimate = null;

  if (pincodeInput) {
    pincodeInput.addEventListener('input', async (e) => {
      const pin = e.target.value.trim();
      if (pin.length === 6) {
        serviceabilityMsg.textContent = 'Checking serviceability...';
        serviceabilityMsg.style.color = '#666';
        try {
          const res = await fetch(`/api/logistics/pincode/${pin}`);
          const data = await res.json();
          if (data.success) {
            cityInput.value = data.city;
            stateInput.value = data.state;
            isServiceable = data.serviceable;
            
            if (isServiceable) {
              const d1 = new Date(data.estimatedMin).toLocaleDateString();
              const d2 = new Date(data.estimatedMax).toLocaleDateString();
              serviceabilityMsg.textContent = `Serviceable! Delivery estimated between ${d1} and ${d2}.`;
              serviceabilityMsg.style.color = 'green';
            } else {
              serviceabilityMsg.textContent = 'Sorry, we do not deliver to this pincode at the moment.';
              serviceabilityMsg.style.color = 'red';
            }
          } else {
            isServiceable = false;
            cityInput.value = '';
            stateInput.value = '';
            serviceabilityMsg.textContent = 'Invalid pincode.';
            serviceabilityMsg.style.color = 'red';
          }
        } catch (err) {
          serviceabilityMsg.textContent = 'Error checking pincode.';
          serviceabilityMsg.style.color = 'red';
        }
      } else {
        cityInput.value = '';
        stateInput.value = '';
        serviceabilityMsg.textContent = '';
        isServiceable = false;
      }
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const activeTab = document.querySelector('.payment-tab.active');
      const paymentMethod = activeTab ? activeTab.dataset.target : 'card';
      
      const emailInput = document.getElementById('checkout-email');
      const phoneInput = document.getElementById('checkout-phone');
      const contact = emailInput ? emailInput.value : '';
      const user = auth.getCurrentUser();
      
      const subtotal = cart.getTotal();
      const shipping = subtotal >= 6000 ? 0 : 500;
      const tax = Math.round(cart.getTax() * 100) / 100;
      const total = subtotal + shipping;

      if (!isServiceable) {
        alert('Please enter a serviceable pincode to proceed.');
        return;
      }

      if (paymentMethod === 'cod') {
        if (!user || !user.is_verified) {
          alert('Cash on Delivery is only available for verified accounts. Please log in with a verified phone number.');
          return;
        }
      }

      const address1 = document.getElementById('checkout-address1') ? document.getElementById('checkout-address1').value : '';
      const address2 = document.getElementById('checkout-address2') ? document.getElementById('checkout-address2').value : '';
      const landmark = document.getElementById('checkout-landmark') ? document.getElementById('checkout-landmark').value : '';
      const city = cityInput ? cityInput.value : '';
      const state = stateInput ? stateInput.value : '';
      const pincode = pincodeInput ? pincodeInput.value : '';

      const address = { address1, address2, landmark, city, state, pincode };

      try {
        const response = await window.auth.fetchWithAuth('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            paymentMethod,
            contact,
            address,
            items: cart.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            }))
          })
        });
        const data = await response.json();
        
        if (!data.success) {
          alert('Failed to initialize order: ' + (data.message || 'Server error'));
          return;
        }

        if (paymentMethod === 'cod') {
          alert('Order placed successfully (Cash on Delivery)!');
          cart.clear();
          window.location.href = 'invoice.html?id=' + data.orderId;
          return;
        } else {
          alert('Order placed successfully! (Note: Payment Gateway is in Sandbox mode)');
          cart.clear();
          window.location.href = 'invoice.html?id=' + data.orderId;
          return;
        }

        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          name: "Bare Minimum",
          description: "Curated Essentials",
          order_id: data.orderId,
          handler: async function (response) {
            const verifyRes = await fetch('/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert('Payment successful! Order placed.');
              cart.clear();
              window.location.href = 'invoice.html?id=' + data.orderId;
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: "Test User",
            email: "test@bareminimum.example.com",
            contact: "9999999999"
          },
          theme: {
            color: "#c49a6c"
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
          alert('Payment Failed: ' + response.error.description);
        });
        rzp.open();
      } catch (err) {
        console.error(err);
        alert('An error occurred while connecting to the payment gateway.');
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

    banner.innerHTML = `
      <div class="container" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem;">
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
