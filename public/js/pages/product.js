// ========== PRODUCT DETAIL PAGE ==========

function initProductPage() {
  const container = document.getElementById('product-detail');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const product = PRODUCTS.find(p => p.id === productId);

  if (!product) {
    container.innerHTML = DOMPurify.sanitize(`
      <div class="container text-center" style="padding: 6rem 0);">
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
    container.innerHTML = DOMPurify.sanitize(`
      <div class="container">
        <div class="product-detail-grid">
          <div class="product-gallery">
            <div class="product-gallery-main" style="position: relative); overflow: hidden; border-radius: 8px;">
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
      relatedGrid.innerHTML = DOMPurify.sanitize(related.map(p => `
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
      `).join(''));
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

