/**
 * V MARK CORPORATION - MAIN APPLICATION LOGIC
 * Navigation, Product Catalog Filter/Search, Product Detail Modal, RFQ Handler, and WhatsApp Integration
 */
import {
  submitRFQ,
  trackProductView,
  trackContactInteraction
} from './firebase.js';
import { getPublicCatalog, onCatalogChange, loadPublicContent } from './public-catalog-service.js';
import { resolveImageUrl } from './image-helper.js';
import { VMARK_PRODUCTS as STATIC_PRODUCTS } from './products-data.js';

let currentCatalog = STATIC_PRODUCTS;

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initRFQForm();
  initProductCatalog();
  initProductModal();
  initDiagramModal();
  initScrollEffects();

  // Async load dynamic catalog & CMS content from Firestore database "vmarkcorporation"
  (async () => {
    try {
      currentCatalog = await getPublicCatalog();
      await applyCMSContent();
      renderProducts();
      populateRFQDropdown(currentCatalog);
    } catch (e) {
      console.debug('Catalog/CMS load fallback:', e);
    }
  })();

  // Re-render when admin updates catalog in Admin Panel
  onCatalogChange(async () => {
    try {
      currentCatalog = await getPublicCatalog();
      await applyCMSContent();
      renderProducts();
      populateRFQDropdown(currentCatalog);
    } catch (err) {
      console.debug('Catalog live reload notice:', err);
    }
  });
});

async function applyCMSContent() {
  try {
    const hp = await loadPublicContent('homepage');
    if (hp && hp.heroSubheading) {
      const sub = document.querySelector('.hero-subheading');
      if (sub) sub.textContent = hp.heroSubheading;
    }

    const ct = await loadPublicContent('contact');
    if (ct && ct.whatsappNumber) {
      const clean = ct.whatsappNumber.replace(/[^0-9]/g, '');
      const waBtn = document.querySelector('.floating-whatsapp-btn');
      if (waBtn) waBtn.href = `https://wa.me/${clean}?text=${encodeURIComponent('Hello V MARK Corporation, I am interested in your textile machinery.')}`;
    }
  } catch (err) {
    console.debug('CMS content apply notice:', err);
  }
}

/* ================= NAVIGATION & HEADER ================= */
function initNavigation() {
  const header = document.getElementById('siteHeader');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky Header Scrolled Class
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile Menu Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      mobileToggle.innerHTML = isOpen
        ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
        : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', false);
        mobileToggle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
      });
    });
  }

  // Active Nav Link Observer
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = { root: null, rootMargin: '-20% 0px -70% 0px', threshold: 0 };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => sectionObserver.observe(sec));

  // Track Floating WhatsApp and Direct Contact links
  const floatingWa = document.querySelector('.floating-whatsapp-btn');
  if (floatingWa) {
    floatingWa.addEventListener('click', () => {
      trackContactInteraction('whatsapp', 'floating_button');
    });
  }

  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', () => {
      trackContactInteraction('phone', 'direct_call');
    });
  });

  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', () => {
      trackContactInteraction('email', 'direct_email');
    });
  });
}

/* ================= PRODUCT CATALOG (FEATURED PRODUCTS) ================= */
function initProductCatalog() {
  const gridContainer = document.getElementById('productsGrid');
  if (!gridContainer) return;

  renderProducts();
}

function renderProducts() {
  const gridContainer = document.getElementById('productsGrid');
  if (!gridContainer) return;

  const catalog = (currentCatalog && currentCatalog.length > 0) ? currentCatalog : STATIC_PRODUCTS;
  if (!catalog || catalog.length === 0) return;

  // Display only 3 featured active products on the homepage
  const featured = catalog.filter(p => p.status === 'active' || !p.status).slice(0, 3);

  gridContainer.innerHTML = featured.map(product => {
    const featureBullets = (product.keyFeatures || []).slice(0, 3).map(feat => `
      <li>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${feat}</span>
      </li>
    `).join('');

    const imgSrc = resolveImageUrl(product.image);

    return `
      <div class="product-card" data-id="${product.id}">
        <div class="product-card-thumb">
          <a href="product.html?id=${encodeURIComponent(product.id)}" aria-label="View specifications for ${product.name}">
            <img src="${imgSrc}" alt="${product.name} — V MARK Corporation" loading="lazy" onerror="this.onerror=null;this.src='/assets/images/vmark_logo.png'">
          </a>
          <span class="product-card-badge">${product.badge}</span>
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
            <a href="product.html?id=${encodeURIComponent(product.id)}" class="btn btn-outline btn-sm view-details-btn" style="justify-content: center;">
              View Specs
            </a>
            <button class="btn btn-primary btn-sm request-quote-card-btn" data-id="${product.id}" data-name="${product.name}" type="button">
              Request Quote
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach card quote button listeners
  gridContainer.querySelectorAll('.request-quote-card-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prodName = e.currentTarget.getAttribute('data-name');
      selectProductForRFQ(prodName);
    });
  });
}

/* ================= PRODUCT DETAIL MODAL ================= */
let activeModalProductId = null;

function initProductModal() {
  const modal = document.getElementById('productDetailModal');
  const closeBtn = document.getElementById('modalCloseBtn');

  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', closeProductModal);
  }

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeProductModal();
    }
  });

  // Close on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeProductModal();
    }
  });
}

function openProductModal(productId) {
  const modal = document.getElementById('productDetailModal');
  if (!modal) return;

  const catalog = (currentCatalog && currentCatalog.length > 0) ? currentCatalog : STATIC_PRODUCTS;
  const product = catalog.find(p => p.id === productId || p.slug === productId);
  if (!product) return;

  activeModalProductId = productId;

  // Track product view in Firebase Analytics
  trackProductView(product);

  // Breadcrumbs
  document.getElementById('modalBreadcrumbCategory').textContent = product.categoryName;
  document.getElementById('modalBreadcrumbProduct').textContent = product.name;

  // Image & Identity
  const imgElem = document.getElementById('modalProductImg');
  const modalImgSrc = resolveImageUrl(product.image);
  imgElem.src = modalImgSrc;
  imgElem.onerror = () => { imgElem.src = '/assets/images/vmark_logo.png'; };
  imgElem.alt = `${product.name} — V MARK Corporation`;

  document.getElementById('modalProductBadge').textContent = product.badge;
  document.getElementById('modalProductTitle').textContent = product.name;
  document.getElementById('modalProductTagline').textContent = product.tagline;
  document.getElementById('modalProductOverview').textContent = product.overview;

  // Features List
  const featuresList = document.getElementById('modalFeaturesList');
  featuresList.innerHTML = (product.keyFeatures || []).map(f => `
    <li>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${f}</span>
    </li>
  `).join('');

  // Applications
  const appsList = document.getElementById('modalApplicationsList');
  if (appsList) {
    appsList.innerHTML = (product.applications || []).map(a => `
      <li>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="4"></circle>
        </svg>
        <span>${a}</span>
      </li>
    `).join('');
  }

  // Technical Specs Table
  const specsTbody = document.getElementById('modalSpecsTbody');
  if (specsTbody) {
    if (product.specs && product.specs.length > 0) {
      specsTbody.innerHTML = product.specs.map(s => `
        <tr>
          <td>${s.label}</td>
          <td><strong>${s.value}</strong></td>
        </tr>
      `).join('');
      document.getElementById('modalSpecsContainer').style.display = 'block';
    } else {
      document.getElementById('modalSpecsContainer').style.display = 'none';
    }
  }

  // Modal Action Buttons
  const quoteBtn = document.getElementById('modalQuoteBtn');
  if (quoteBtn) {
    quoteBtn.onclick = () => {
      closeProductModal();
      selectProductForRFQ(product.name);
    };
  }

  const whatsappBtn = document.getElementById('modalWhatsAppBtn');
  if (whatsappBtn) {
    const text = encodeURIComponent(`Hello V MARK Corporation, I am interested in getting a technical quotation for the ${product.name}. Please share details.`);
    whatsappBtn.href = `https://wa.me/918980285862?text=${text}`;
    whatsappBtn.onclick = () => {
      trackContactInteraction('whatsapp', `modal_${product.id}`);
    };
  }

  const fullPageBtn = document.getElementById('modalFullPageBtn');
  if (fullPageBtn) {
    fullPageBtn.href = `product.html?id=${encodeURIComponent(product.id)}`;
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  const modal = document.getElementById('productDetailModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    activeModalProductId = null;
  }
}

/* ================= RFQ FORM HANDLER ================= */
export function populateRFQDropdown(products = null) {
  const selectElem = document.getElementById('rfqProductSelect');
  if (!selectElem) return;

  const catalog = (products && products.length > 0) 
    ? products 
    : ((currentCatalog && currentCatalog.length > 0) ? currentCatalog : STATIC_PRODUCTS);

  if (!catalog || catalog.length === 0) return;

  const categories = [
    { key: 'engraving-rotary', label: 'Rotary Screen Printing & Engraving' },
    { key: 'colour-kitchen', label: 'Smart Colour Kitchen Systems' },
    { key: 'stirrers-mixers', label: 'Stirrers, Mixers & Agitators' },
    { key: 'washing-plant', label: 'Washing Plant' },
    { key: 'accessories', label: 'Accessories & Spares' }
  ];

  let html = '<option value="">-- Select Machinery / Equipment --</option>';

  categories.forEach(cat => {
    const items = catalog.filter(p => (p.category === cat.key || p.categoryId === cat.key) && p.status !== 'inactive');
    if (items.length > 0) {
      html += `<optgroup label="${cat.label}">`;
      items.forEach(p => {
        html += `<option value="${p.name}">${p.name}</option>`;
      });
      html += `</optgroup>`;
    }
  });

  const otherItems = catalog.filter(p => 
    !categories.some(c => c.key === p.category || c.key === p.categoryId) && p.status !== 'inactive'
  );
  if (otherItems.length > 0) {
    html += `<optgroup label="Other Machinery & Custom Solutions">`;
    otherItems.forEach(p => {
      html += `<option value="${p.name}">${p.name}</option>`;
    });
    html += `</optgroup>`;
  }

  selectElem.innerHTML = html;
}

function initRFQForm() {
  const selectElem = document.getElementById('rfqProductSelect');
  const rfqForm = document.getElementById('rfqForm');
  const successBanner = document.getElementById('rfqSuccessBanner');
  const waEnquiryBtn = document.getElementById('rfqWhatsAppEnquiryBtn');

  // Populate dynamic select dropdown
  populateRFQDropdown(currentCatalog);

  // Form Submission
  if (rfqForm) {
    rfqForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = rfqForm.querySelector('button[type="submit"]');
      const name = document.getElementById('rfqName').value.trim();
      const company = document.getElementById('rfqCompany').value.trim();
      const email = document.getElementById('rfqEmail').value.trim();
      const phone = document.getElementById('rfqPhone').value.trim();
      const country = document.getElementById('rfqCountry').value.trim();
      const product = document.getElementById('rfqProductSelect').value;
      const quantity = document.getElementById('rfqQuantity').value;
      const message = document.getElementById('rfqMessage').value.trim();

      if (!name || !company || !email || !phone || !product) {
        alert('Please complete all required fields including Name, Company, Email, Phone, and Machinery of interest.');
        return;
      }

      // UI Submitting state
      const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Send Enquiry';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
            <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"></path>
          </svg>
          Recording Enquiry...
        `;
      }

      // 1. Submit RFQ lead to Cloud Firestore & trigger Analytics event
      const firestoreResult = await submitRFQ({
        name,
        company,
        email,
        phone,
        country: country || 'India',
        product,
        quantity: quantity || 1,
        message: message || ''
      });

      // 2. Construct WhatsApp message link
      const waMessage = `*Quotation Enquiry - V MARK Corporation*\n` +
        `*Name:* ${name}\n` +
        `*Company:* ${company}\n` +
        `*Email:* ${email}\n` +
        `*Phone:* ${phone}\n` +
        `*Country:* ${country || 'India'}\n` +
        `*Machinery:* ${product}\n` +
        `*Quantity:* ${quantity || 1}\n` +
        `*Requirement Details:* ${message || 'Please provide technical catalog and price quote.'}` +
        (firestoreResult.success ? `\n*Ref ID:* #${firestoreResult.id.slice(0, 8).toUpperCase()}` : '');

      const waUrl = `https://wa.me/918980285862?text=${encodeURIComponent(waMessage)}`;

      if (waEnquiryBtn) {
        waEnquiryBtn.href = waUrl;
        waEnquiryBtn.style.display = 'inline-flex';
        waEnquiryBtn.onclick = () => {
          trackContactInteraction('whatsapp', 'rfq_forward_button');
        };
      }

      if (successBanner) {
        const refSnippet = firestoreResult.success
          ? `<div style="margin-top: 0.5rem; font-size: 0.875rem; color: #15803d; font-weight: 600;">Inquiry Reference ID: #${firestoreResult.id.toUpperCase()}</div>`
          : '';

        successBanner.innerHTML = `
          <h4 style="font-weight: 700; margin-bottom: 0.35rem;">Enquiry Received &amp; Recorded!</h4>
          <p style="font-size: 0.9375rem;">
            Thank you for contacting V MARK Corporation. Your quotation request has been securely recorded. Our technical team in Ahmedabad will review your specifications and prepare a formal proposal. You can also click below to forward this request directly via WhatsApp.
          </p>
          ${refSnippet}
        `;
        successBanner.style.display = 'block';
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Restore submit button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }

      rfqForm.reset();
    });
  }
}

export function selectProductForRFQ(productName) {
  const rfqSection = document.getElementById('rfq-section');
  const selectElem = document.getElementById('rfqProductSelect');

  if (selectElem) {
    // Look for matching option
    let found = false;
    for (let i = 0; i < selectElem.options.length; i++) {
      if (selectElem.options[i].value === productName) {
        selectElem.selectedIndex = i;
        found = true;
        break;
      }
    }
    if (!found) {
      // Add custom option if not matched exactly
      const opt = document.createElement('option');
      opt.value = productName;
      opt.text = productName;
      opt.selected = true;
      selectElem.add(opt);
    }
  }

  if (rfqSection) {
    rfqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const nameInput = document.getElementById('rfqName');
    if (nameInput) setTimeout(() => nameInput.focus(), 600);
  }
}

if (typeof window !== 'undefined') {
  window.selectProductForRFQ = selectProductForRFQ;
}

/* ================= SCROLL EFFECTS & UTILITIES ================= */
function initScrollEffects() {
  const backToTopBtn = document.getElementById('backToTopBtn');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
