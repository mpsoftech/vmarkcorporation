/**
 * V MARK Corporation - Standalone Machinery Catalog Controller
 * Handles real-time search, category filtering, deep-linking,
 * and responsive card rendering linking to dedicated product pages.
 */

import { VMARK_PRODUCTS } from './products-data.js';
import { trackCategoryFilter, trackSearch } from './firebase.js';

let currentCategory = 'all';
let currentSearchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  initCatalogPage();
  initNavigation();
  initBackToTop();
});

function initCatalogPage() {
  const searchInput = document.getElementById('catalogSearchInput');
  const filterPills = document.querySelectorAll('.filter-pill');
  const countIndicator = document.getElementById('catalogCountIndicator');

  // Check URL query parameters for initial category (e.g., products.html?category=engraving-rotary)
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');
  if (initialCategory) {
    currentCategory = initialCategory;
    filterPills.forEach(pill => {
      if (pill.dataset.category === initialCategory) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  // Filter pills click handling
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.category || 'all';

      // Update URL without full page reload
      const newUrl = new URL(window.location);
      if (currentCategory === 'all') {
        newUrl.searchParams.delete('category');
      } else {
        newUrl.searchParams.set('category', currentCategory);
      }
      window.history.replaceState({}, '', newUrl);

      trackCategoryFilter(currentCategory);
      renderCatalog();
    });
  });

  // Search input handling
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentSearchQuery = e.target.value.trim().toLowerCase();
        if (currentSearchQuery.length >= 2) {
          trackSearch(currentSearchQuery);
        }
        renderCatalog();
      }, 200);
    });
  }

  renderCatalog();
}

function renderCatalog() {
  const gridContainer = document.getElementById('catalogGrid');
  const countIndicator = document.getElementById('catalogCountIndicator');
  if (!gridContainer || !VMARK_PRODUCTS) return;

  const filtered = VMARK_PRODUCTS.filter(product => {
    const matchesCategory = (currentCategory === 'all') || (product.category === currentCategory);
    const matchesSearch = !currentSearchQuery || (
      (product.name && product.name.toLowerCase().includes(currentSearchQuery)) ||
      (product.tagline && product.tagline.toLowerCase().includes(currentSearchQuery)) ||
      (product.categoryName && product.categoryName.toLowerCase().includes(currentSearchQuery)) ||
      (product.shortDesc && product.shortDesc.toLowerCase().includes(currentSearchQuery)) ||
      (product.overview && product.overview.toLowerCase().includes(currentSearchQuery))
    );
    return matchesCategory && matchesSearch;
  });

  // Update count indicator
  if (countIndicator) {
    countIndicator.innerHTML = `Showing <strong>${filtered.length}</strong> of <strong>${VMARK_PRODUCTS.length}</strong> industrial machines and accessories`;
  }

  if (filtered.length === 0) {
    gridContainer.innerHTML = `
      <div class="no-results-message" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem;">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--text-muted); margin-bottom: 1rem;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-heading);">No machinery found matching your filter</h3>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Try searching for terms like "Coating", "Polymerizer", "Stirrer", "Washer", or switch to "All Products".</p>
        <button type="button" class="btn btn-outline btn-sm" id="resetCatalogFiltersBtn">Reset All Filters</button>
      </div>
    `;

    const resetBtn = document.getElementById('resetCatalogFiltersBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        currentCategory = 'all';
        currentSearchQuery = '';
        const searchInput = document.getElementById('catalogSearchInput');
        if (searchInput) searchInput.value = '';
        document.querySelectorAll('.filter-pill').forEach(p => {
          if (p.dataset.category === 'all') p.classList.add('active');
          else p.classList.remove('active');
        });
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('category');
        window.history.replaceState({}, '', newUrl);
        renderCatalog();
      });
    }
    return;
  }

  gridContainer.innerHTML = filtered.map(product => {
    const featureBullets = (product.keyFeatures || []).slice(0, 3).map(feat => `
      <li>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${feat}</span>
      </li>
    `).join('');

    const imgSrc = (product.image && product.image.startsWith('/')) ? product.image : '/' + (product.image || 'assets/images/vmark_logo.png');

    return `
      <div class="product-card" data-id="${product.id}">
        <div class="product-card-thumb">
          <a href="product.html?id=${encodeURIComponent(product.id)}" aria-label="View specifications for ${product.name}">
            <img src="${imgSrc}" alt="${product.name} — V MARK Corporation" loading="lazy" onerror="this.onerror=null;this.src='/assets/images/vmark_logo.png'">
          </a>
          <span class="product-card-badge">${product.badge || 'Machinery'}</span>
        </div>
        <div class="product-card-body">
          <span class="product-card-category">${product.categoryName}</span>
          <h3 class="product-card-title">
            <a href="product.html?id=${encodeURIComponent(product.id)}" style="color: inherit; text-decoration: none;">
              ${product.name}
            </a>
          </h3>
          <p class="product-card-desc">${product.shortDesc}</p>
          <ul class="product-card-features">
            ${featureBullets}
          </ul>
          <div class="product-card-actions">
            <a href="product.html?id=${encodeURIComponent(product.id)}" class="btn btn-outline btn-sm" style="justify-content: center;">
              View Specs
            </a>
            <a href="product.html?id=${encodeURIComponent(product.id)}#rfqSection" class="btn btn-primary btn-sm" style="justify-content: center;">
              Request Quote
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function initNavigation() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const expanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !expanded);
      navMenu.classList.toggle('active');
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
