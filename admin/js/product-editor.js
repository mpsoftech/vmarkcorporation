/**
 * V MARK CORPORATION - Product Editor Controller
 * Handles add/edit workflow, multi-image upload, specs table repeater, and live syncing.
 */
import { initAdminLayout, showToast, compressImage, showConfirmDialog } from './admin-ui.js';
import { getProductById, saveProduct, getAllCategories, resolveImageUrl } from './admin-db.js';
import { uploadImageToStorage } from './admin-storage.js';

let editingProductId = null;
let currentMainImage = '';
let currentGallery = [];
let userEditedSlug = false;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  editingProductId = urlParams.get('id');

  const pageTitle = editingProductId ? 'Edit Product' : 'Add New Product';
  const navId = editingProductId ? 'products' : 'product-new';

  // 1. Concurrently fetch layout, categories, and product data from instant cache
  const layoutPromise = initAdminLayout(navId, pageTitle, ['Admin', 'Products', pageTitle]);
  const categoriesPromise = getAllCategories();
  const productPromise = editingProductId ? getProductById(editingProductId) : Promise.resolve(null);

  const [_, categories, product] = await Promise.all([
    layoutPromise,
    categoriesPromise,
    productPromise
  ]);

  // 2. Pre-select target category immediately on dropdown render (eliminates blinking/jumping)
  const targetCategory = product ? (product.categoryId || product.category || 'engraving-rotary') : '';
  populateCategoriesDropdown(categories, targetCategory, product?.categoryName);

  setupImageHandlers();
  setupRepeaterControls();
  setupFormSubmit();

  if (editingProductId) {
    if (!product) {
      showToast('Product not found in database.', 'error');
      setTimeout(() => { window.location.href = '/admin/products.html'; }, 1500);
      return;
    }
    populateProductFormData(product);
  } else {
    // Populate default empty specs & features for new product
    addSpecRow("Operation Mode", "Automatic / Semi-Automatic");
    addSpecRow("Chassis Build", "Heavy duty industrial fabrication");
    addFeatureRow("Heavy duty vibration-free steel construction");
    addFeatureRow("Easy to clean and maintain between batches");
    addApplicationRow("Textile rotary screen engraving departments");

    // Auto slug generator on new product (only if slug not manually typed)
    const nameInput = document.getElementById('prodName');
    const slugInput = document.getElementById('prodSlug');
    slugInput?.addEventListener('input', () => {
      userEditedSlug = true;
    });
    nameInput?.addEventListener('input', () => {
      if (!editingProductId && !userEditedSlug) {
        slugInput.value = nameInput.value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
    });
  }
});

function populateCategoriesDropdown(categories, selectedCategory = '', fallbackCategoryName = '') {
  const select = document.getElementById('prodCategory');
  if (!select) return;

  try {
    const safeCats = Array.isArray(categories) && categories.length > 0 ? categories : [];
    
    let optionsHtml = safeCats.map(cat => `
      <option value="${cat.id}" ${cat.id === selectedCategory ? 'selected' : ''}>${escapeHtml(cat.name)}</option>
    `).join('');

    // If product has a custom category not present in defaults, append it
    if (selectedCategory && !safeCats.some(c => c.id === selectedCategory)) {
      optionsHtml += `<option value="${escapeHtml(selectedCategory)}" selected>${escapeHtml(fallbackCategoryName || selectedCategory)}</option>`;
    }

    select.innerHTML = optionsHtml;
    if (selectedCategory) {
      select.value = selectedCategory;
    }
  } catch (err) {
    console.error('Failed to populate categories dropdown:', err);
  }
}

function populateProductFormData(product) {
  document.getElementById('pageFormTitle').textContent = `Edit: ${product.name}`;
  document.getElementById('prodName').value = product.name || '';
  document.getElementById('prodSlug').value = product.slug || product.id || '';
  document.getElementById('prodBadge').value = product.badge || '';
  document.getElementById('prodTagline').value = product.tagline || '';
  document.getElementById('prodShortDesc').value = product.shortDesc || '';
  document.getElementById('prodOverview').value = product.overview || '';

  // Set Category
  const targetCategory = product.categoryId || product.category;
  const select = document.getElementById('prodCategory');
  if (select && targetCategory) {
    select.value = targetCategory;
  }

  document.getElementById('prodStatus').checked = (product.status === 'active');
  document.getElementById('prodDisplayOrder').value = product.displayOrder || 1;

  // View on public site button
  const liveBtn = document.getElementById('viewLiveBtn');
  if (liveBtn) {
    liveBtn.href = `/product.html?id=${encodeURIComponent(product.id)}`;
    liveBtn.style.display = 'inline-flex';
  }

  // Set Main Image
  if (product.image) {
    setMainImage(product.image);
  }

  // Set Gallery
  if (Array.isArray(product.galleryImages) && product.galleryImages.length > 0) {
    currentGallery = [...product.galleryImages];
    renderGallery();
  }

  // Set Specs
  const specsContainer = document.getElementById('specsContainer');
  if (specsContainer) {
    specsContainer.innerHTML = '';
    if (Array.isArray(product.specs) && product.specs.length > 0) {
      product.specs.forEach(s => addSpecRow(s.label, s.value));
    } else {
      addSpecRow("Operation Mode", "Automatic");
    }
  }

    // Set Features
    const featContainer = document.getElementById('featuresContainer');
    if (featContainer) {
      featContainer.innerHTML = '';
      if (Array.isArray(product.keyFeatures) && product.keyFeatures.length > 0) {
        product.keyFeatures.forEach(f => addFeatureRow(f));
      } else {
        addFeatureRow("Precision engineering design");
      }
    }

    // Set Applications
    const appContainer = document.getElementById('applicationsContainer');
    if (appContainer) {
      appContainer.innerHTML = '';
      if (Array.isArray(product.applications) && product.applications.length > 0) {
        product.applications.forEach(a => addApplicationRow(a));
      } else {
        addApplicationRow("Textile screen printing plants");
      }
    }
}

// ================= SPECS & REPEATERS =================
function setupRepeaterControls() {
  document.getElementById('addSpecRowBtn')?.addEventListener('click', () => addSpecRow());
  document.getElementById('addFeatureRowBtn')?.addEventListener('click', () => addFeatureRow());
  document.getElementById('addAppRowBtn')?.addEventListener('click', () => addApplicationRow());
}

function addSpecRow(label = '', value = '') {
  const container = document.getElementById('specsContainer');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'repeater-row spec-row';
  row.innerHTML = `
    <input type="text" class="form-control spec-label" placeholder="Specification (e.g., Repeats)" value="${escapeHtml(label)}" style="flex:1;">
    <input type="text" class="form-control spec-val" placeholder="Value (e.g., 640mm, 820mm, 914mm)" value="${escapeHtml(value)}" style="flex:2;">
    <button type="button" class="btn-icon" style="color:#dc2626;" title="Remove row" onclick="this.parentElement.remove()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;
  container.appendChild(row);
}

function addFeatureRow(text = '') {
  const container = document.getElementById('featuresContainer');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'repeater-row feature-row';
  row.innerHTML = `
    <span style="color:var(--teal-600);font-weight:700;">•</span>
    <input type="text" class="form-control feature-text" placeholder="Operational advantage or feature bullet" value="${escapeHtml(text)}" style="flex:1;">
    <button type="button" class="btn-icon" style="color:#dc2626;" title="Remove bullet" onclick="this.parentElement.remove()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;
  container.appendChild(row);
}

function addApplicationRow(text = '') {
  const container = document.getElementById('applicationsContainer');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'repeater-row app-row';
  row.innerHTML = `
    <input type="text" class="form-control app-text" placeholder="Application area or target facility" value="${escapeHtml(text)}" style="flex:1;">
    <button type="button" class="btn-icon" style="color:#dc2626;" title="Remove" onclick="this.parentElement.remove()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;
  container.appendChild(row);
}

// ================= IMAGE HANDLING & COMPRESSION =================
function setupImageHandlers() {
  const mainDropzone = document.getElementById('mainImgDropzone');
  const mainFileInput = document.getElementById('mainImgFileInput');
  const mainUrlInput = document.getElementById('prodImageUrl');
  const removeMainBtn = document.getElementById('removeMainImgBtn');

  // Stop click bubbling on file inputs to avoid double trigger
  mainFileInput?.addEventListener('click', (e) => e.stopPropagation());

  // Trigger file picker
  mainDropzone?.addEventListener('click', () => mainFileInput?.click());

  // Drag and drop
  ['dragenter', 'dragover'].forEach(name => {
    mainDropzone?.addEventListener(name, (e) => {
      e.preventDefault();
      mainDropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    mainDropzone?.addEventListener(name, (e) => {
      e.preventDefault();
      mainDropzone.classList.remove('dragover');
    });
  });

  mainDropzone?.addEventListener('drop', async (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processMainImageFile(e.dataTransfer.files[0]);
    }
  });

  mainFileInput?.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files[0]) {
      await processMainImageFile(e.target.files[0]);
    }
  });

  mainUrlInput?.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val) setMainImage(val);
  });

  removeMainBtn?.addEventListener('click', () => {
    setMainImage('');
  });

  // Gallery multi-upload
  const galleryBtn = document.getElementById('uploadGalleryBtn');
  const galleryFileInput = document.getElementById('galleryFileInput');

  galleryFileInput?.addEventListener('click', (e) => e.stopPropagation());
  galleryBtn?.addEventListener('click', () => galleryFileInput?.click());

  galleryFileInput?.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    showToast(`Uploading ${files.length} gallery image(s) to Firebase Storage...`, 'info');
    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        // Upload to Firebase Storage bucket gs://vmark-corporation.firebasestorage.app
        const storageRes = await uploadImageToStorage(compressed.blob || file, 'products', file.name);
        currentGallery.push(storageRes.downloadURL);
      } catch (err) {
        console.warn('Firebase Storage upload warning, using local preview:', err);
        const compressed = await compressImage(file);
        currentGallery.push(compressed.dataUrl);
      }
    }
    renderGallery();
    galleryFileInput.value = '';
  });
}

async function processMainImageFile(file) {
  try {
    showToast('Compressing image...', 'info');
    const result = await compressImage(file, 1600, 0.85);
    setMainImage(result.dataUrl); // Quick local preview

    showToast('Uploading to Firebase Storage (gs://vmark-corporation.firebasestorage.app)...', 'info');
    const storageRes = await uploadImageToStorage(result.blob || file, 'products', file.name);
    setMainImage(storageRes.downloadURL);
    showToast(`Uploaded to Cloud Storage: ${storageRes.fileName}`, 'success');
  } catch (err) {
    console.warn('Storage upload notice:', err);
    showToast(`Notice: Image preview preserved locally (${err.message})`, 'info');
  }
}

function setMainImage(src) {
  if (src) {
    const resolved = resolveImageUrl(src);
    currentMainImage = resolved;
    const preview = document.getElementById('mainImgPreview');
    const noMsg = document.getElementById('noMainImgMsg');
    const removeBtn = document.getElementById('removeMainImgBtn');
    const urlInput = document.getElementById('prodImageUrl');

    if (preview) {
      preview.src = resolved;
      preview.style.display = 'block';
    }
    if (noMsg) noMsg.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'block';
    if (urlInput && !src.startsWith('data:')) {
      urlInput.value = resolved;
    }
  } else {
    currentMainImage = '';
    const preview = document.getElementById('mainImgPreview');
    const noMsg = document.getElementById('noMainImgMsg');
    const removeBtn = document.getElementById('removeMainImgBtn');
    const urlInput = document.getElementById('prodImageUrl');

    if (preview) {
      preview.src = '';
      preview.style.display = 'none';
    }
    if (noMsg) noMsg.style.display = 'block';
    if (removeBtn) removeBtn.style.display = 'none';
    if (urlInput) urlInput.value = '';
  }
}

function renderGallery() {
  const container = document.getElementById('galleryGrid');
  if (!container) return;

  if (currentGallery.length === 0) {
    container.innerHTML = `<p style="grid-column:1/-1;font-size:0.8rem;color:var(--text-muted);text-align:center;padding:1rem;">No extra gallery photos</p>`;
    return;
  }

  container.innerHTML = currentGallery.map((imgSrc, idx) => `
    <div class="gallery-item" data-index="${idx}">
      <img src="${resolveImageUrl(imgSrc)}" alt="Gallery photo ${idx + 1}" onerror="this.onerror=null;this.src='/assets/images/vmark_logo.png'">
      <div class="item-actions">
        ${idx > 0 ? `
          <button type="button" class="action-badge" title="Move left" onclick="window.reorderGalleryItem(${idx}, -1)">
            ‹
          </button>
        ` : ''}
        ${idx < currentGallery.length - 1 ? `
          <button type="button" class="action-badge" title="Move right" onclick="window.reorderGalleryItem(${idx}, 1)">
            ›
          </button>
        ` : ''}
        <button type="button" class="action-badge" title="Delete photo" onclick="window.deleteGalleryItem(${idx})">
          ×
        </button>
      </div>
    </div>
  `).join('');
}

// Expose gallery reorder/delete globally for onclick inline handlers
window.reorderGalleryItem = (idx, direction) => {
  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= currentGallery.length) return;
  const temp = currentGallery[idx];
  currentGallery[idx] = currentGallery[targetIdx];
  currentGallery[targetIdx] = temp;
  renderGallery();
};

window.deleteGalleryItem = (idx) => {
  currentGallery.splice(idx, 1);
  renderGallery();
};

// ================= FORM SUBMISSION =================
function setupFormSubmit() {
  const form = document.getElementById('productForm');
  const saveBtn = document.getElementById('saveProductBtn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('prodName').value.trim();
    const slug = document.getElementById('prodSlug').value.trim();
    const badge = document.getElementById('prodBadge').value.trim();
    const tagline = document.getElementById('prodTagline').value.trim();
    const shortDesc = document.getElementById('prodShortDesc').value.trim();
    const overview = document.getElementById('prodOverview').value.trim();
    const categorySelect = document.getElementById('prodCategory');
    const category = categorySelect?.value || 'engraving-rotary';
    const categoryName = (categorySelect && categorySelect.options[categorySelect.selectedIndex]?.text) || 'Machinery';
    const status = document.getElementById('prodStatus').checked ? 'active' : 'inactive';
    const displayOrder = Number(document.getElementById('prodDisplayOrder').value) || 1;

    // Collect Specs
    const specs = [];
    document.querySelectorAll('.spec-row').forEach(row => {
      const label = row.querySelector('.spec-label')?.value.trim();
      const value = row.querySelector('.spec-val')?.value.trim();
      if (label && value) {
        specs.push({ label, value });
      }
    });

    // Collect Features
    const keyFeatures = [];
    document.querySelectorAll('.feature-row').forEach(row => {
      const text = row.querySelector('.feature-text')?.value.trim();
      if (text) keyFeatures.push(text);
    });

    // Collect Applications
    const applications = [];
    document.querySelectorAll('.app-row').forEach(row => {
      const text = row.querySelector('.app-text')?.value.trim();
      if (text) applications.push(text);
    });

    const productPayload = {
      name,
      slug,
      badge: badge || 'Machinery',
      tagline,
      shortDesc,
      overview,
      categoryId: category,
      category: category,
      categoryName,
      status,
      displayOrder,
      image: currentMainImage || '/assets/images/vmark_logo.png',
      galleryImages: currentGallery.length > 0 ? currentGallery : [currentMainImage || '/assets/images/vmark_logo.png'],
      specs,
      keyFeatures,
      applications
    };

    if (editingProductId) {
      productPayload.id = editingProductId;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = `Saving...`;

    try {
      const res = await saveProduct(productPayload);
      if (res.success) {
        showToast(`Product "${name}" was saved successfully!`, 'success');
        setTimeout(() => {
          window.location.href = '/admin/products.html';
        }, 800);
      } else {
        showToast(res.error || 'Failed to save product.', 'error');
        saveBtn.disabled = false;
        saveBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Save Product`;
      }
    } catch (err) {
      showToast(err.message || 'Error occurred while saving.', 'error');
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Save Product`;
    }
  });
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
