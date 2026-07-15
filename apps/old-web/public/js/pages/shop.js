import { PRODUCTS, auth, cart, showToast } from '../common.js';

// ========== SHOP PAGE ==========

function initShopPage() {
  const grid = document.getElementById('product-grid');
  const countEl = document.getElementById('product-count');
  if (!grid) return;

  let currentFilters = { category: 'All', color: [], size: [], price: 'All' };
  let currentSort = 'featured';

  function renderProducts() {
    // Populate categories if not done yet
    const categoryGroup = document.querySelector('.filter-group');
    if (categoryGroup && !categoryGroup.dataset.populated) {
      const existingButtons = Array.from(
        categoryGroup.querySelectorAll('.filter-btn[data-filter="category"]')
      ).map((btn) => btn.dataset.value);
      const allCategories = new Set(PRODUCTS.map((p) => p.category).filter(Boolean));
      allCategories.forEach((cat) => {
        if (!existingButtons.includes(cat)) {
          const btn = document.createElement('button');
          btn.className = 'filter-btn';
          btn.dataset.filter = 'category';
          btn.dataset.value = cat;
          btn.textContent = cat;
          btn.addEventListener('click', () => {
            categoryGroup
              .querySelectorAll('.filter-btn')
              .forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilters.category = cat;
            renderProducts();
          });
          categoryGroup.appendChild(btn);
        }
      });
      categoryGroup.dataset.populated = 'true';
    }

    let filtered = [...PRODUCTS];

    if (currentFilters.category !== 'All') {
      filtered = filtered.filter((p) => p.category === currentFilters.category);
    }

    if (currentFilters.color.length > 0) {
      filtered = filtered.filter(
        (p) => p.variants && p.variants.some((v) => currentFilters.color.includes(v.color))
      );
    }

    if (currentFilters.size.length > 0) {
      filtered = filtered.filter(
        (p) => p.variants && p.variants.some((v) => currentFilters.size.includes(v.size))
      );
    }

    if (currentFilters.price !== 'All') {
      filtered = filtered.filter((p) => {
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

    grid.innerHTML = filtered
      .map(
        (product) => `
      <a href="product.html?id=${product.id}" class="product-card reveal visible" id="product-${product.id}">
        <div class="product-card-image">
          ${product.isNew ? '<span class="badge-new">New</span>' : ''}
          ${auth.getCurrentUser() && auth.getCurrentUser().role === 'admin' ? '<div class="admin-edit-badge" onclick="event.preventDefault(); showToast(\'Admin Edit Mode\')">Edit</div>' : ''}
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

  // Filter checkboxes (Color & Size)
  document.querySelectorAll('.filter-checkbox').forEach((cb) => {
    cb.addEventListener('change', () => {
      const filterType = cb.dataset.filter;
      const filterValue = cb.value;

      if (cb.checked) {
        if (!currentFilters[filterType].includes(filterValue)) {
          currentFilters[filterType].push(filterValue);
        }
      } else {
        currentFilters[filterType] = currentFilters[filterType].filter((v) => v !== filterValue);
      }

      renderProducts();
    });
  });

  // Category & Price filter buttons
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const filterType = btn.dataset.filter;
      const filterValue = btn.dataset.value;

      const parentGroup = btn.closest('.filter-group');
      if (parentGroup) {
        parentGroup.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
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

function runInit() {
  if (window.PRODUCTS_LOADED) {
    initShopPage();
  } else {
    document.addEventListener('productsLoaded', initShopPage);
  }
}

runInit();
