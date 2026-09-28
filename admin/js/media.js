/**
 * V MARK CORPORATION - Media Library Controller
 */
import { initAdminLayout, showToast, showConfirmDialog, compressImage } from './admin-ui.js';
import { getAllMedia, saveMediaItem, deleteMediaItem, subscribeToEvents, resolveImageUrl } from './admin-db.js';
import { uploadImageToStorage } from './admin-storage.js';

let currentFolder = 'all';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', async () => {
  await initAdminLayout('media', 'Media Library', ['Admin', 'Media']);

  setupEventListeners();
  setupUploadDropzone();
  await loadAndRenderMedia();

  subscribeToEvents(async (event) => {
    if (event.type.startsWith('media_')) {
      await loadAndRenderMedia();
    }
  });
});

function setupEventListeners() {
  const searchInput = document.getElementById('mediaSearchInput');
  const folderFilter = document.getElementById('mediaFolderFilter');
  const openUploadBtn = document.getElementById('openUploadBtn');
  const closeUploadBtn = document.getElementById('closeUploadCardBtn');
  const uploadCard = document.getElementById('uploadCard');

  let debounceTimer;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentSearch = e.target.value.trim();
      loadAndRenderMedia();
    }, 200);
  });

  folderFilter?.addEventListener('change', (e) => {
    currentFolder = e.target.value;
    loadAndRenderMedia();
  });

  openUploadBtn?.addEventListener('click', () => {
    uploadCard.style.display = 'block';
    uploadCard.scrollIntoView({ behavior: 'smooth' });
  });

  closeUploadBtn?.addEventListener('click', () => {
    uploadCard.style.display = 'none';
  });

  // Preview modal close
  const previewModal = document.getElementById('previewModal');
  document.getElementById('closePreviewModalBtn')?.addEventListener('click', () => {
    previewModal.classList.remove('open');
  });
}

function setupUploadDropzone() {
  const dropzone = document.getElementById('mediaDropzone');
  const fileInput = document.getElementById('mediaFileInput');
  const folderSelect = document.getElementById('uploadFolderSelect');
  const usedInInput = document.getElementById('uploadUsedInInput');

  dropzone?.addEventListener('click', () => fileInput?.click());

  ['dragenter', 'dragover'].forEach(name => {
    dropzone?.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropzone?.addEventListener(name, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone?.addEventListener('drop', async (e) => {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUploadFile(e.dataTransfer.files[0], folderSelect.value, usedInInput.value.trim());
    }
  });

  fileInput?.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleUploadFile(e.target.files[0], folderSelect.value, usedInInput.value.trim());
      fileInput.value = '';
    }
  });
}

async function handleUploadFile(file, folder, usedInText) {
  try {
    showToast('Optimizing & compressing image...', 'info');
    const result = await compressImage(file, 1600, 0.85);

    showToast('Uploading to Firebase Storage (gs://vmark-corporation.firebasestorage.app)...', 'info');
    let finalUrl = result.dataUrl;
    let fileName = file.name;

    try {
      const storageRes = await uploadImageToStorage(result.blob || file, folder || 'website', file.name);
      finalUrl = storageRes.downloadURL;
      fileName = storageRes.fileName;
      showToast(`Uploaded to Cloud Storage: ${storageRes.fileName}`, 'success');
    } catch (storageErr) {
      console.warn('Firebase Storage upload notice, saving local preview:', storageErr);
      showToast(`Saved to library: ${storageErr.message}`, 'info');
    }

    const mediaPayload = {
      fileName: fileName,
      fileUrl: finalUrl,
      folder: folder || 'products',
      fileType: result.mimeType || 'image/webp',
      fileSize: result.sizeFormatted,
      width: result.width,
      height: result.height,
      usedIn: usedInText ? [usedInText] : ['General Media Library'],
      createdAt: new Date().toISOString()
    };

    await saveMediaItem(mediaPayload);
    document.getElementById('uploadCard').style.display = 'none';
    await loadAndRenderMedia();
  } catch (err) {
    showToast(err.message || 'Failed to upload image.', 'error');
  }
}

async function loadAndRenderMedia() {
  const grid = document.getElementById('mediaGrid');
  const countIndicator = document.getElementById('mediaCountIndicator');
  if (!grid) return;

  try {
    const media = await getAllMedia(currentFolder, currentSearch);
    if (countIndicator) {
      countIndicator.textContent = `Showing ${media.length} media file${media.length === 1 ? '' : 's'}`;
    }

    if (media.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:3rem 1rem;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom:0.75rem;">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <h4 style="color:var(--text-heading);margin-bottom:0.35rem;">No media files found</h4>
          <p style="color:var(--text-muted);font-size:0.85rem;">Upload new machinery photos or clear filter settings.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = media.map(item => {
      const usedInStr = Array.isArray(item.usedIn) ? item.usedIn.join(', ') : (item.usedIn || 'Catalog');

      return `
        <div class="media-card" data-id="${item.id}">
          <div class="media-thumb-box" onclick="window.openMediaPreview('${item.id}')">
            <img src="${resolveImageUrl(item.fileUrl)}" alt="${escapeHtml(item.fileName)}" loading="lazy" onerror="this.src='/assets/images/vmark_logo.png'">
            <span class="media-folder-tag">${escapeHtml(item.folder)}</span>
          </div>
          <div class="media-card-body">
            <div class="media-filename" title="${escapeHtml(item.fileName)}">${escapeHtml(item.fileName)}</div>
            <div class="media-meta-line">
              <span>${item.width ? `${item.width}×${item.height}` : 'Vector/Web'}</span>
              <span>${item.fileSize || 'Standard'}</span>
            </div>
            <div class="media-used-in" title="${escapeHtml(usedInStr)}">
              Used in: ${escapeHtml(usedInStr)}
            </div>
            <div class="media-card-footer">
              <button type="button" class="btn btn-outline btn-sm" onclick="window.copyMediaUrl('${item.fileUrl}')" style="padding:0.25rem 0.5rem;font-size:0.75rem;">
                Copy URL
              </button>
              <button type="button" class="btn-icon" style="color:#dc2626;" onclick="window.deleteMedia('${item.id}', '${escapeHtml(item.fileName)}')" title="Delete asset">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error loading media assets:', err);
  }
}

// Global modal preview
window.openMediaPreview = async (id) => {
  const media = await getAllMedia();
  const item = media.find(m => m.id === id);
  if (!item) return;

  document.getElementById('previewModalTitle').textContent = item.fileName;
  document.getElementById('previewModalImg').src = resolveImageUrl(item.fileUrl);
  document.getElementById('previewUrlInput').value = item.fileUrl;
  document.getElementById('previewDimensions').textContent = `${item.width || 'Auto'} × ${item.height || 'Auto'} px (${item.fileSize || '-'})`;
  document.getElementById('previewUsedIn').textContent = Array.isArray(item.usedIn) ? item.usedIn.join(', ') : (item.usedIn || '-');

  document.getElementById('copyUrlModalBtn').onclick = () => {
    window.copyMediaUrl(item.fileUrl);
  };

  document.getElementById('previewModal').classList.add('open');
};

window.copyMediaUrl = (url) => {
  navigator.clipboard.writeText(url).then(() => {
    showToast('Image URL copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy to clipboard.', 'error');
  });
};

window.deleteMedia = async (id, name) => {
  const confirmed = await showConfirmDialog({
    title: "Delete Media Asset",
    message: `Are you sure you want to delete "${name}"? Any products using this URL may lose their thumbnail.`,
    confirmText: "Delete",
    isDanger: true
  });

  if (confirmed) {
    await deleteMediaItem(id);
    showToast(`"${name}" deleted.`, 'success');
    await loadAndRenderMedia();
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
