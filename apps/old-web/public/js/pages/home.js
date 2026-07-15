import { PRODUCTS, auth, showToast } from '../common.js';

// ========== FEATURED PRODUCTS (HOMEPAGE) ==========

function initFeaturedProducts() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  const featured = PRODUCTS.filter((p) => p.isFeatured);
  grid.innerHTML = featured
    .map(
      (product, i) => `
    <a href="product.html?id=${product.id}" class="product-card reveal reveal-delay-${i + 1} visible" id="featured-${product.id}">
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
  `
    )
    .join('');
}

function runInit() {
  if (window.PRODUCTS_LOADED) {
    initFeaturedProducts();
  } else {
    document.addEventListener('productsLoaded', initFeaturedProducts);
  }
}

runInit();
