/**
 * V MARK CORPORATION - Product Catalog Management Controller
 */
import { initAdminLayout, showToast, showConfirmDialog } from './admin-ui.js';
import { getAllProducts, deleteProduct, toggleProductStatus, subscribeToEvents, resolveImageUrl, getAllCategories } from './admin-db.js';

let currentFilters = {
  search: '',
  category: 'all',
  status: 'all',
  sortBy: 'order'
};

let renderDebounceTimer = null;
let lastRenderedFingerprint = '';

document.addEventListener('DOMContentLoaded', async () => {
  await initAdminLayout('products', 'Product Catalog', ['Admin', 'Products']);

  // Read URL search params if present
  const params = new URLSearchParams(window.location.search);
  if (params.get('search')) {
    currentFilters.search = params.get('search');
    const input = document.getElementById('productSearchInput');
    if (input) input.value = currentFilters.search;
  }
  if (params.get('category')) {
    currentFilters.category = params.get('category');
    const select = document.getElementById('categoryFilter');
    if (select) select.value = currentFilters.category;
  }

  setupEventListeners();
  await populateCategoryFilter();
  await loadAndRenderProducts();

  // Listen to cross-tab updates & live sync with debounced coalescing
  subscribeToEvents(async (event) => {
    if (event && typeof event.type === 'string' && (event.type.startsWith('product_') || event.type === 'cloud_synced' || event.type === 'database_seeded')) {
      scheduleRenderProducts(150);
    }
  });
});

function scheduleRenderProducts(delay = 150) {
  clearTimeout(renderDebounceTimer);
  renderDebounceTimer = setTimeout(() => {
    loadAndRenderProducts();
  }, delay);
}

async function populateCategoryFilter() {
  const select = document.getElementById('categoryFilter');
  if (!select) return;

  try {
    const categories = await getAllCategories();
    if (Array.isArray(categories) && categories.length > 0) {
      const selectedVal = currentFilters.category || select.value || 'all';
      const currentOpts = Array.from(select.options).map(o => o.value).join(',');
      const newOpts = ['all', ...categories.map(c => c.id)].join(',');

      // Only update DOM if options actually changed (prevents blink/reset)
      if (currentOpts !== newOpts) {
        select.innerHTML = '<option value="all">All Categories</option>' + categories.map(cat => `
          <option value="${cat.id}">${escapeHtml(cat.name)}</option>
        `).join('');
      }
      select.value = selectedVal;
    }
  } catch (err) {
    console.debug('Category filter populate notice:', err);
  }
}

function setupEventListeners() {
  const searchInput = document.getElementById('productSearchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const statusFilter = document.getElementById('statusFilter');
  const sortBySelect = document.getElementById('sortBySelect');

  let searchTimer;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentFilters.search = e.target.value.trim();
      lastRenderedFingerprint = ''; // Force redraw on user search
      loadAndRenderProducts();
    }, 200);
  });

  categoryFilter?.addEventListener('change', (e) => {
    currentFilters.category = e.target.value;
    lastRenderedFingerprint = ''; // Force redraw on filter change
    loadAndRenderProducts();
  });

  statusFilter?.addEventListener('change', (e) => {
    currentFilters.status = e.target.value;
    lastRenderedFingerprint = ''; // Force redraw on status change
    loadAndRenderProducts();
  });

  sortBySelect?.addEventListener('change', (e) => {
    currentFilters.sortBy = e.target.value;
    lastRenderedFingerprint = ''; // Force redraw on sort change
    loadAndRenderProducts();
  });
}

async function loadAndRenderProducts() {
  const tbody = document.getElementById('productsTableBody');
  const countBadge = document.getElementById('productCountBadge');
  if (!tbody) return;

  try {
    const products = await getAllProducts(currentFilters);
    if (countBadge) {
      countBadge.textContent = `Showing ${products.length} machine${products.length === 1 ? '' : 's'}`;
    }

    if (!Array.isArray(products) || products.length === 0) {
      if (lastRenderedFingerprint !== 'empty') {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align:center;padding:3.5rem 1.5rem;">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom:0.75rem;">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <h4 style="color:var(--text-heading);margin-bottom:0.35rem;">No machinery found</h4>
              <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem;">Try adjusting your search criteria or add a new machine.</p>
              <a href="/admin/product-editor.html" class="btn btn-primary btn-sm">+ Add New Product</a>
            </td>
          </tr>
        `;
        lastRenderedFingerprint = 'empty';
      }
      return;
    }

    // Compute fingerprint to avoid redundant DOM destruction and image blinking
    const fingerprint = products.map(p => `${p.id}_${p.name}_${p.categoryId}_${p.status}_${p.displayOrder}`).join('|');
    if (fingerprint === lastRenderedFingerprint) {
      return; // Exact same data is already rendered, skip repaint
    }
    lastRenderedFingerprint = fingerprint;

    tbody.innerHTML = products.map(product => {
      const isActive = product.status === 'active';
      const imgSrc = resolveImageUrl(product.image);
      const updatedDate = product.updatedAt ? new Date(product.updatedAt).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'Default';

      const catNameMap = {
        'engraving-rotary': 'Rotary Screen & Engraving',
        'colour-kitchen': 'Colour Kitchen Machinery',
        'stirrers-mixers': 'Industrial Stirrers & Mixers',
        'washing-plant': 'Washing Plant Machinery',
        'accessories': 'Parts & Accessories'
      };
      const catLabel = catNameMap[product.categoryId] || catNameMap[product.category] || product.categoryName || product.categoryId;

      return `
        <tr data-id="${product.id}">
          <td>
            <img src="${imgSrc}" alt="${escapeHtml(product.name)}" class="table-thumb" onerror="this.onerror=null;this.src='/assets/images/vmark_logo.png'">
          </td>
          <td>
            <div style="font-weight:600;color:var(--text-heading);font-size:0.9rem;">
              <a href="/admin/product-editor.html?id=${encodeURIComponent(product.id)}" style="color:inherit;">
                ${escapeHtml(product.name)}
              </a>
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);font-family:var(--font-mono);">/${escapeHtml(product.slug || product.id)}</div>
            ${product.tagline ? `<div style="font-size:0.75rem;color:var(--teal-700);">${escapeHtml(product.tagline)}</div>` : ''}
          </td>
          <td>
            <span style="font-weight:500;font-size:0.82rem;">${escapeHtml(catLabel)}</span>
          </td>
          <td style="text-align:center;">
            <span style="font-weight:600;font-family:var(--font-mono);font-size:0.85rem;">${product.displayOrder || 1}</span>
          </td>
          <td style="text-align:center;">
            <label class="switch" title="Toggle active status">
              <input type="checkbox" class="status-toggle-input" data-id="${product.id}" ${isActive ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </td>
          <td>
            <span style="font-size:0.8rem;color:var(--text-muted);">${updatedDate}</span>
          </td>
          <td style="text-align:right;white-space:nowrap;">
            <div style="display:inline-flex;gap:0.35rem;">
              <a href="/product.html?id=${encodeURIComponent(product.id)}" target="_blank" class="btn-icon" title="View on public site">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
              <a href="/admin/product-editor.html?id=${encodeURIComponent(product.id)}" class="btn-icon" title="Edit product">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </a>
              <button type="button" class="btn-icon delete-product-btn" data-id="${product.id}" data-name="${escapeHtml(product.name)}" title="Delete product" style="color:#dc2626;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach event listeners to status toggles
    tbody.querySelectorAll('.status-toggle-input').forEach(checkbox => {
      checkbox.addEventListener('change', async (e) => {
        const id = e.target.dataset.id;
        const newStatus = e.target.checked ? 'active' : 'inactive';
        await toggleProductStatus(id, newStatus);
        showToast(`Product set to ${newStatus}.`, 'info');
      });
    });

    // Attach delete listeners
    tbody.querySelectorAll('.delete-product-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const confirmed = await showConfirmDialog({
          title: "Delete Product",
          message: `Are you sure you want to permanently remove "${name}" from the machinery catalog? This will also remove it from the public website.`,
          confirmText: "Delete Product",
          isDanger: true
        });

        if (confirmed) {
          const res = await deleteProduct(id);
          if (res.success) {
            showToast(`"${name}" was deleted successfully.`, 'success');
            lastRenderedFingerprint = ''; // Force redraw on delete
            await loadAndRenderProducts();
          } else {
            showToast(res.error || 'Failed to delete product', 'error');
          }
        }
      });
    });

  } catch (err) {
    console.error('Failed to load products:', err);
    tbody.innerHTML = `<tr><td colspan="7" style="color:#dc2626;padding:2rem;text-align:center;">Error loading products: ${escapeHtml(err.message || 'Unknown error')}</td></tr>`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
