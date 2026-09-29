/**
 * V MARK Corporation - Dedicated Product Detail Controller
 * Manages dynamic rendering of machinery specifications, RFQ submission,
 * WhatsApp enquiry links, Google Analytics tracking, and SEO schemas.
 */

import { VMARK_PRODUCTS as STATIC_PRODUCTS } from './products-data.js';
import { getPublicProductById, getPublicCatalog } from './public-catalog-service.js';
import { resolveImageUrl } from './image-helper.js';
import {
  submitRFQ,
  trackProductView,
  trackContactInteraction
} from './firebase.js';

let allCatalogProducts = STATIC_PRODUCTS;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    allCatalogProducts = await getPublicCatalog();
  } catch (e) {
    allCatalogProducts = STATIC_PRODUCTS;
  }

  await initProductDetailPage();
  initNavigation();
  initBackToTop();
});

async function initProductDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const contentWrapper = document.getElementById('productDetailContent');
  const notFoundWrapper = document.getElementById('productNotFound');

  if (!productId) {
    showNotFound();
    return;
  }

  const product = await getPublicProductById(productId);

  if (!product) {
    showNotFound();
    return;
  }

  // Display content, hide not found
  if (contentWrapper) contentWrapper.style.display = 'block';
  if (notFoundWrapper) notFoundWrapper.style.display = 'none';

  // 1. Update Dynamic SEO & Document Title
  updateSEO(product);

  // 2. Render Breadcrumbs
  renderBreadcrumbs(product);

  // 3. Render Hero Section
  renderHero(product);

  // 4. Render Specifications Table
  renderSpecifications(product);

  // 5. Render Key Features & Applications
  renderFeaturesAndApplications(product);

  // 6. Render Engineering Overview
  renderOverview(product);

  // 7. Setup Dedicated RFQ Form
  setupRFQForm(product);

  // 8. Render Related Machinery
  renderRelatedMachinery(product);

  // 9. Analytics tracking
  trackProductView(product);
}

function showNotFound() {
  const contentWrapper = document.getElementById('productDetailContent');
  const notFoundWrapper = document.getElementById('productNotFound');
  if (contentWrapper) contentWrapper.style.display = 'none';
  if (notFoundWrapper) notFoundWrapper.style.display = 'block';
  document.title = 'Machinery Not Found | V MARK Corporation';
}

function updateSEO(product) {
  document.title = `${product.name} | V MARK Corporation - Textile Machinery`;

  // Update meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = `${product.name} by V MARK Corporation Ahmedabad. ${product.shortDesc || product.tagline}. High-speed precision textile engineering.`;

  // Inject JSON-LD Schema
  const schemaScript = document.createElement('script');
  schemaScript.type = 'application/ld+json';
  const schemaData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    'name': product.name,
    'image': [
      resolveImageUrl(product.image).startsWith('http') 
        ? resolveImageUrl(product.image) 
        : window.location.origin + resolveImageUrl(product.image)
    ],
    'description': product.shortDesc || product.tagline,
    'brand': {
      '@type': 'Brand',
      'name': 'V MARK Corporation'
    },
    'manufacturer': {
      '@type': 'Organization',
      'name': 'V MARK Corporation',
      'url': 'https://vmarkcorporation.com'
    },
    'offers': {
      '@type': 'Offer',
      'url': window.location.href,
      'priceCurrency': 'INR',
      'price': '0',
      'priceValidUntil': '2028-12-31',
      'availability': 'https://schema.org/InStock',
      'itemCondition': 'https://schema.org/NewCondition'
    }
  };
  schemaScript.textContent = JSON.stringify(schemaData);
  document.head.appendChild(schemaScript);
}

function renderBreadcrumbs(product) {
  const categoryLink = document.getElementById('breadcrumbCategory');
  const productName = document.getElementById('breadcrumbProduct');

  if (categoryLink) {
    categoryLink.textContent = product.categoryName || 'Equipment';
    categoryLink.href = `products.html?category=${encodeURIComponent(product.category || 'all')}`;
  }
  if (productName) {
    productName.textContent = product.name;
  }
}

function renderHero(product) {
  const badgeEl = document.getElementById('productBadge');
  const catTagEl = document.getElementById('productCategoryTag');
  const titleEl = document.getElementById('productTitle');
  const taglineEl = document.getElementById('productTagline');
  const shortDescEl = document.getElementById('productShortDesc');
  const imgEl = document.getElementById('productImage');
  const quickSpecsEl = document.getElementById('productQuickSpecs');
  const waBtn = document.getElementById('productWaBtn');
  const printBtn = document.getElementById('productPrintBtn');

  if (badgeEl) badgeEl.textContent = product.badge || 'Textile Machinery';
  if (catTagEl) catTagEl.textContent = product.categoryName || 'Industrial Equipment';
  if (titleEl) titleEl.textContent = product.name;
  if (taglineEl) taglineEl.textContent = product.tagline || '';
  if (shortDescEl) shortDescEl.textContent = product.shortDesc || product.overview || '';

  if (imgEl) {
    const imgSrc = resolveImageUrl(product.image);
    imgEl.src = imgSrc;
    imgEl.alt = `${product.name} — V MARK Corporation Ahmedabad`;
    imgEl.onerror = () => {
      imgEl.onerror = null;
      imgEl.src = '/assets/images/vmark_logo.png';
    };
  }

  // Quick specs highlights (first 4 specs)
  if (quickSpecsEl) {
    const topSpecs = (product.specs || []).slice(0, 4);
    if (topSpecs.length > 0) {
      quickSpecsEl.innerHTML = topSpecs.map(spec => `
        <div class="quick-spec-card">
          <div class="quick-spec-label">${spec.label}</div>
          <div class="quick-spec-value">${spec.value}</div>
        </div>
      `).join('');
    } else {
      quickSpecsEl.style.display = 'none';
    }
  }

  // Setup WhatsApp enquiry button
  if (waBtn) {
    const waText = `*Machinery Quotation Enquiry — V MARK Corporation*\n` +
      `*Product:* ${product.name}\n` +
      `*Category:* ${product.categoryName}\n` +
      `*Link:* ${window.location.href}\n\n` +
      `Hello, I would like to request technical specifications, pricing, and delivery timeline for this machine.`;

    waBtn.href = `https://wa.me/918980285862?text=${encodeURIComponent(waText)}`;
    waBtn.addEventListener('click', () => {
      trackContactInteraction('whatsapp', `product_detail_${product.id}`);
    });
  }

  // Setup Print Specs button
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

function renderSpecifications(product) {
  const tbody = document.getElementById('specsTableBody');
  const section = document.getElementById('specsSection');
  if (!tbody) return;

  if (product.specs && product.specs.length > 0) {
    tbody.innerHTML = product.specs.map(s => `
      <tr>
        <td class="spec-param-name">${s.label}</td>
        <td class="spec-param-val">${s.value}</td>
      </tr>
    `).join('');
  } else {
    if (section) section.style.display = 'none';
  }
}

function renderFeaturesAndApplications(product) {
  const featuresGrid = document.getElementById('featuresGrid');
  const appsList = document.getElementById('applicationsList');

  if (featuresGrid) {
    if (product.keyFeatures && product.keyFeatures.length > 0) {
      featuresGrid.innerHTML = product.keyFeatures.map(feat => `
        <div class="feature-check-card">
          <div class="feature-check-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div class="feature-check-text">${feat}</div>
        </div>
      `).join('');
    } else {
      featuresGrid.innerHTML = '<p class="text-muted">Standard high-performance textile engineering specifications apply.</p>';
    }
  }

  if (appsList) {
    if (product.applications && product.applications.length > 0) {
      appsList.innerHTML = product.applications.map(app => `
        <div class="app-pill">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>${app}</span>
        </div>
      `).join('');
    } else {
      appsList.style.display = 'none';
    }
  }
}

function renderOverview(product) {
  const overviewEl = document.getElementById('productOverviewText');
  if (overviewEl) {
    overviewEl.textContent = product.overview || product.shortDesc || 'Engineered with premium components for high reliability, minimum downtime, and optimal resource efficiency in textile processing environments.';
  }
}

function setupRFQForm(product) {
  const selectEl = document.getElementById('rfqProductSelect');
  const form = document.getElementById('productRfqForm');
  const successBanner = document.getElementById('rfqSuccessAlert');
  const waForwardBtn = document.getElementById('rfqWhatsAppForwardBtn');

  // Populate product select options
  if (selectEl) {
    const catalog = (allCatalogProducts && allCatalogProducts.length > 0) ? allCatalogProducts : STATIC_PRODUCTS;
    if (catalog && catalog.length > 0) {
      selectEl.innerHTML = catalog.map(p => `
        <option value="${p.name}" ${(p.id === product.id || p.name === product.name) ? 'selected' : ''}>
          ${p.name} (${p.categoryName || 'Equipment'})
        </option>
      `).join('');
    }
  }

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const name = document.getElementById('rfqName').value.trim();
    const company = document.getElementById('rfqCompany').value.trim();
    const email = document.getElementById('rfqEmail').value.trim();
    const phone = document.getElementById('rfqPhone').value.trim();
    const country = document.getElementById('rfqCountry').value.trim();
    const chosenProduct = selectEl ? selectEl.value : product.name;
    const quantity = document.getElementById('rfqQuantity').value;
    const message = document.getElementById('rfqMessage').value.trim();

    if (!name || !company || !email || !phone || !chosenProduct) {
      alert('Please fill out all required fields: Name, Company, Email, Phone, and Machinery of interest.');
      return;
    }

    // Submitting UI state
    const originalText = submitBtn ? submitBtn.innerHTML : 'Submit RFQ';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"></path>
        </svg>
        Transmitting RFQ...
      `;
    }

    try {
      // 1. Submit to Firestore & Analytics
      const firestoreResult = await submitRFQ({
        name,
        company,
        email,
        phone,
        country: country || 'India',
        product: chosenProduct,
        quantity: quantity || 1,
        message: message || ''
      });

      // 2. Prepare WhatsApp link
      const waMsg = `*Quotation Enquiry — V MARK Corporation*\n` +
        `*Name:* ${name}\n` +
        `*Company:* ${company}\n` +
        `*Email:* ${email}\n` +
        `*Phone:* ${phone}\n` +
        `*Country:* ${country || 'India'}\n` +
        `*Machinery:* ${chosenProduct}\n` +
        `*Quantity:* ${quantity || 1}\n` +
        `*Requirement:* ${message || 'Please provide quotation and specifications.'}` +
        (firestoreResult.success ? `\n*Ref ID:* #${firestoreResult.id.slice(0, 8).toUpperCase()}` : '');

      const waUrl = `https://wa.me/918980285862?text=${encodeURIComponent(waMsg)}`;

      if (waForwardBtn) {
        waForwardBtn.href = waUrl;
        waForwardBtn.style.display = 'inline-flex';
        waForwardBtn.onclick = () => {
          trackContactInteraction('whatsapp', 'product_rfq_forward_btn');
        };
      }

      if (successBanner) {
        const refHtml = firestoreResult.success
          ? `<div style="margin-top: 0.5rem; font-size: 0.875rem; color: #15803d; font-weight: 700;">Reference ID: #${firestoreResult.id.toUpperCase()}</div>`
          : '';

        successBanner.innerHTML = `
          <h4 style="font-weight: 700; margin-bottom: 0.35rem; color: #15803d;">Quotation Request Recorded!</h4>
          <p style="font-size: 0.9375rem; color: #166534;">
            Thank you for requesting specifications for <strong>${chosenProduct}</strong>. Our engineering team in Ahmedabad will prepare your formal quotation. You can also forward this request immediately to our WhatsApp desk below.
          </p>
          ${refHtml}
        `;
        successBanner.style.display = 'block';
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Reset form fields
      form.reset();
      if (selectEl) selectEl.value = product.name;

    } catch (err) {
      console.error('[RFQ Submission Error]', err);
      alert('There was a problem submitting your request. Please try again or reach out directly on WhatsApp.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    }
  });
}

function renderRelatedMachinery(product) {
  const container = document.getElementById('relatedProductsGrid');
  if (!container || !allCatalogProducts) return;

  // Find products in the same category, excluding current product
  const related = allCatalogProducts
    .filter(p => (p.category === product.category || p.categoryId === product.categoryId) && p.id !== product.id)
    .slice(0, 3);

  // If fewer than 3, backfill from other categories
  if (related.length < 3) {
    const others = allCatalogProducts.filter(p => p.id !== product.id && !related.some(r => r.id === p.id));
    related.push(...others.slice(0, 3 - related.length));
  }

  container.innerHTML = related.map(rel => {
    const imgSrc = resolveImageUrl(rel.image);
    return `
      <div class="product-card" data-id="${rel.id}">
        <div class="product-card-thumb">
          <img src="${imgSrc}" alt="${rel.name} — V MARK Corporation" loading="lazy" onerror="this.onerror=null;this.src='/assets/images/vmark_logo.png'">
          <span class="product-card-badge">${rel.badge || 'Machinery'}</span>
        </div>
        <div class="product-card-body">
          <span class="product-card-category">${rel.categoryName}</span>
          <h3 class="product-card-title">${rel.name}</h3>
          <p class="product-card-desc">${rel.shortDesc}</p>
          <div class="product-card-actions">
            <a href="product.html?id=${encodeURIComponent(rel.id)}" class="btn btn-primary btn-sm" style="grid-column: 1 / -1; justify-content: center;">
              View Specifications
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

    // Close mobile nav when clicking any link
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
