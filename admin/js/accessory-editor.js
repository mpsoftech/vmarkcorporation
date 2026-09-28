/**
 * V MARK CORPORATION - Accessory Editor Controller
 */
import { initAdminLayout, showToast, compressImage } from './admin-ui.js';
import { getAccessoryById, saveAccessory, resolveImageUrl } from './admin-db.js';
import { uploadImageToStorage } from './admin-storage.js';

let editingId = null;
let currentMainImage = '';
let currentGallery = [];

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  editingId = urlParams.get('id');

  const pageTitle = editingId ? 'Edit Accessory' : 'Add New Accessory';
  const navId = editingId ? 'accessories' : 'accessory-new';
  await initAdminLayout(navId, pageTitle, ['Admin', 'Accessories', pageTitle]);

  setupImageHandlers();
  setupRepeaterControls();
  setupFormSubmit();

  if (editingId) {
    await loadAccessoryData(editingId);
  } else {
    addSpecRow("Compatibility", "Standard Rotary Nickel Screens");
    addFeatureRow("Manufactured to precision industrial tolerances");
    
    const nameInput = document.getElementById('accName');
    const slugInput = document.getElementById('accSlug');
    nameInput?.addEventListener('input', () => {
      if (!editingId) {
        slugInput.value = nameInput.value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
    });
  }
});

async function loadAccessoryData(id) {
  try {
    const item = await getAccessoryById(id);
    if (!item) {
      showToast('Accessory not found in database.', 'error');
      setTimeout(() => { window.location.href = 'accessories.html'; }, 1500);
      return;
    }

    document.getElementById('pageFormTitle').textContent = `Edit: ${item.name}`;
    document.getElementById('accName').value = item.name || '';
    document.getElementById('accSlug').value = item.slug || item.id || '';
    document.getElementById('accCompatible').value = Array.isArray(item.compatibleProducts) ? item.compatibleProducts.join(', ') : (item.compatibleProducts || '');
    document.getElementById('accShortDesc').value = item.shortDesc || '';
    document.getElementById('accDesc').value = item.description || item.overview || '';
    document.getElementById('accStatus').checked = (item.status === 'active');
    document.getElementById('accDisplayOrder').value = item.displayOrder || 1;

    if (item.image) {
      setMainImage(item.image);
    }

    if (Array.isArray(item.galleryImages) && item.galleryImages.length > 0) {
      currentGallery = [...item.galleryImages];
      renderGallery();
    }

    const specsContainer = document.getElementById('accSpecsContainer');
    specsContainer.innerHTML = '';
    if (Array.isArray(item.specs) && item.specs.length > 0) {
      item.specs.forEach(s => addSpecRow(s.label, s.value));
    } else {
      addSpecRow("Specification", "Standard");
    }

    const featContainer = document.getElementById('accFeaturesContainer');
    featContainer.innerHTML = '';
    if (Array.isArray(item.keyFeatures) && item.keyFeatures.length > 0) {
      item.keyFeatures.forEach(f => addFeatureRow(f));
    } else {
      addFeatureRow("High durability component");
    }

  } catch (err) {
    console.error('Error loading accessory:', err);
    showToast('Failed to load accessory details.', 'error');
  }
}

function setupRepeaterControls() {
  document.getElementById('addSpecBtn')?.addEventListener('click', () => addSpecRow());
  document.getElementById('addFeatureBtn')?.addEventListener('click', () => addFeatureRow());
}

function addSpecRow(label = '', value = '') {
  const container = document.getElementById('accSpecsContainer');
  const row = document.createElement('div');
  row.className = 'repeater-row spec-row';
  row.innerHTML = `
    <input type="text" class="form-control spec-label" placeholder="Spec label (e.g. Dimensions)" value="${escapeHtml(label)}" style="flex:1;">
    <input type="text" class="form-control spec-val" placeholder="Value (e.g. 640mm Repeat)" value="${escapeHtml(value)}" style="flex:2;">
    <button type="button" class="btn-icon" style="color:#dc2626;" onclick="this.parentElement.remove()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;
  container.appendChild(row);
}

function addFeatureRow(text = '') {
  const container = document.getElementById('accFeaturesContainer');
  const row = document.createElement('div');
  row.className = 'repeater-row feature-row';
  row.innerHTML = `
    <span style="color:var(--teal-600);font-weight:700;">•</span>
    <input type="text" class="form-control feature-text" placeholder="Key feature or advantage" value="${escapeHtml(text)}" style="flex:1;">
    <button type="button" class="btn-icon" style="color:#dc2626;" onclick="this.parentElement.remove()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;
  container.appendChild(row);
}

function setupImageHandlers() {
  const mainDropzone = document.getElementById('mainImgDropzone');
  const mainFileInput = document.getElementById('mainImgFileInput');
  const mainUrlInput = document.getElementById('accImageUrl');
  const removeMainBtn = document.getElementById('removeMainImgBtn');

  mainDropzone?.addEventListener('click', () => mainFileInput?.click());

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

  removeMainBtn?.addEventListener('click', () => setMainImage(''));

  const galleryBtn = document.getElementById('uploadGalleryBtn');
  const galleryFileInput = document.getElementById('galleryFileInput');

  galleryBtn?.addEventListener('click', () => galleryFileInput?.click());
  galleryFileInput?.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    showToast(`Uploading ${files.length} gallery image(s) to Firebase Storage...`, 'info');
    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        const storageRes = await uploadImageToStorage(compressed.blob || file, 'accessories', file.name);
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
    const result = await compressImage(file, 1200, 0.85);
    setMainImage(result.dataUrl); // Immediate local preview

    showToast('Uploading to Firebase Storage (gs://vmark-corporation.firebasestorage.app)...', 'info');
    const storageRes = await uploadImageToStorage(result.blob || file, 'accessories', file.name);
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
    const urlInput = document.getElementById('accImageUrl');

    preview.src = resolved;
    preview.style.display = 'block';
    noMsg.style.display = 'none';
    removeBtn.style.display = 'block';
    if (urlInput && !src.startsWith('data:')) urlInput.value = resolved;
  } else {
    currentMainImage = '';
    const preview = document.getElementById('mainImgPreview');
    const noMsg = document.getElementById('noMainImgMsg');
    const removeBtn = document.getElementById('removeMainImgBtn');
    const urlInput = document.getElementById('accImageUrl');

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
    container.innerHTML = `<p style="grid-column:1/-1;font-size:0.8rem;color:var(--text-muted);text-align:center;padding:1rem;">No gallery photos</p>`;
    return;
  }

  container.innerHTML = currentGallery.map((imgSrc, idx) => `
    <div class="gallery-item" data-index="${idx}">
      <img src="${resolveImageUrl(imgSrc)}" alt="Gallery ${idx + 1}">
      <div class="item-actions">
        <button type="button" class="action-badge" title="Delete photo" onclick="window.deleteAccGalleryItem(${idx})">
          ×
        </button>
      </div>
    </div>
  `).join('');
}

window.deleteAccGalleryItem = (idx) => {
  currentGallery.splice(idx, 1);
  renderGallery();
};

function setupFormSubmit() {
  const form = document.getElementById('accessoryForm');
  const saveBtn = document.getElementById('saveAccessoryBtn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('accName').value.trim();
    const slug = document.getElementById('accSlug').value.trim();
    const compatRaw = document.getElementById('accCompatible').value.trim();
    const shortDesc = document.getElementById('accShortDesc').value.trim();
    const description = document.getElementById('accDesc').value.trim();
    const status = document.getElementById('accStatus').checked ? 'active' : 'inactive';
    const displayOrder = Number(document.getElementById('accDisplayOrder').value) || 1;

    const compatibleProducts = compatRaw ? compatRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    const specs = [];
    document.querySelectorAll('.spec-row').forEach(row => {
      const label = row.querySelector('.spec-label')?.value.trim();
      const value = row.querySelector('.spec-val')?.value.trim();
      if (label && value) specs.push({ label, value });
    });

    const keyFeatures = [];
    document.querySelectorAll('.feature-row').forEach(row => {
      const text = row.querySelector('.feature-text')?.value.trim();
      if (text) keyFeatures.push(text);
    });

    const payload = {
      name,
      slug,
      shortDesc,
      description,
      overview: description,
      compatibleProducts,
      status,
      displayOrder,
      image: currentMainImage || '/assets/images/vmark_logo.png',
      galleryImages: currentGallery.length > 0 ? currentGallery : [currentMainImage || '/assets/images/vmark_logo.png'],
      specs,
      keyFeatures
    };

    if (editingId) payload.id = editingId;

    saveBtn.disabled = true;
    saveBtn.innerHTML = 'Saving...';

    try {
      const res = await saveAccessory(payload);
      if (res.success) {
        showToast(`Accessory "${name}" saved successfully!`, 'success');
        setTimeout(() => { window.location.href = 'accessories.html'; }, 800);
      } else {
        showToast(res.error || 'Failed to save accessory.', 'error');
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Save Accessory';
      }
    } catch (err) {
      showToast(err.message, 'error');
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Save Accessory';
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
