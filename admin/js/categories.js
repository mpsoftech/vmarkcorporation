/**
 * V MARK CORPORATION - Category Management Controller
 */
import { initAdminLayout, showToast, showConfirmDialog } from './admin-ui.js';
import { getAllCategories, getCategoryById, saveCategory, deleteCategory, subscribeToEvents, resolveImageUrl } from './admin-db.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initAdminLayout('categories', 'Product Categories', ['Admin', 'Categories']);

  setupModalHandlers();
  await loadAndRenderCategories();

  subscribeToEvents(async (event) => {
    if (event && typeof event.type === 'string' && (event.type.startsWith('category_') || event.type.startsWith('product_') || event.type === 'cloud_synced')) {
      await loadAndRenderCategories();
    }
  });
});

async function loadAndRenderCategories() {
  const tbody = document.getElementById('categoriesTableBody');
  if (!tbody) return;

  try {
    const categories = await getAllCategories();

    if (!Array.isArray(categories) || categories.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center;padding:3rem;color:var(--text-muted);">
            No categories found. Click "Add New Category" above to create one.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = categories.map(cat => {
      const isActive = cat.status === 'active';
      const imgSrc = resolveImageUrl(cat.image);

      return `
        <tr data-id="${cat.id}">
          <td>
            <img src="${imgSrc}" alt="${escapeHtml(cat.name)}" class="table-thumb" onerror="this.onerror=null;this.src='/assets/images/vmark_logo.png'">
          </td>
          <td>
            <div style="font-weight:600;color:var(--text-heading);">${escapeHtml(cat.name)}</div>
          </td>
          <td>
            <span style="font-family:var(--font-mono);font-size:0.8rem;color:var(--text-muted);">${escapeHtml(cat.slug || cat.id)}</span>
          </td>
          <td>
            <div style="font-size:0.8rem;color:var(--text-body);max-width:340px;">
              ${escapeHtml(cat.description ? (cat.description.slice(0, 95) + (cat.description.length > 95 ? '...' : '')) : '-')}
            </div>
          </td>
          <td style="text-align:center;">
            <span class="badge" style="background:#eff6ff;color:#2563eb;font-weight:700;">${cat.productCount || 0}</span>
          </td>
          <td style="text-align:center;">
            <span style="font-family:var(--font-mono);font-weight:600;">${cat.displayOrder || 1}</span>
          </td>
          <td style="text-align:center;">
            <span class="badge ${isActive ? 'badge-active' : 'badge-inactive'}">${cat.status}</span>
          </td>
          <td style="text-align:right;white-space:nowrap;">
            <div style="display:inline-flex;gap:0.35rem;">
              <button type="button" class="btn-icon edit-cat-btn" data-id="${cat.id}" title="Edit category">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button type="button" class="btn-icon delete-cat-btn" data-id="${cat.id}" data-name="${escapeHtml(cat.name)}" title="Delete category" style="color:#dc2626;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach edit handlers
    tbody.querySelectorAll('.edit-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => openEditCategoryModal(btn.dataset.id));
    });

    // Attach delete handlers
    tbody.querySelectorAll('.delete-cat-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const confirmed = await showConfirmDialog({
          title: "Delete Category",
          message: `Are you sure you want to delete category "${name}"? Machinery assigned to this category will remain in the database.`,
          confirmText: "Delete",
          isDanger: true
        });

        if (confirmed) {
          await deleteCategory(id);
          showToast(`Category "${name}" deleted.`, 'success');
          await loadAndRenderCategories();
        }
      });
    });

  } catch (err) {
    console.error('Error loading categories:', err);
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;padding:2.5rem;color:#dc2626;">
          Failed to load categories. Please refresh or try again.
        </td>
      </tr>
    `;
  }
}

function setupModalHandlers() {
  const modal = document.getElementById('categoryModal');
  const openBtn = document.getElementById('openAddCategoryModalBtn');
  const closeBtn = document.getElementById('closeCategoryModalBtn');
  const cancelBtn = document.getElementById('cancelCatModalBtn');
  const form = document.getElementById('categoryForm');
  const nameInput = document.getElementById('catName');
  const slugInput = document.getElementById('catSlug');
  const saveBtn = document.getElementById('saveCatBtn');

  openBtn?.addEventListener('click', () => {
    document.getElementById('categoryModalTitle').textContent = 'Add New Category';
    document.getElementById('catEditId').value = '';
    form.reset();
    document.getElementById('catStatus').checked = true;
    document.getElementById('catOrder').value = '1';
    modal?.classList.add('open');
  });

  const closeModal = () => modal?.classList.remove('open');
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  // Close on backdrop click or ESC
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) {
      closeModal();
    }
  });

  nameInput?.addEventListener('input', () => {
    if (!document.getElementById('catEditId').value) {
      slugInput.value = nameInput.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';
    }

    try {
      const editId = document.getElementById('catEditId').value;
      const name = nameInput.value.trim();
      const slug = slugInput.value.trim();
      const description = document.getElementById('catDesc').value.trim();
      const image = document.getElementById('catImage').value.trim() || '/assets/images/rotary_screen_coating_machine.jpg';
      const displayOrder = Number(document.getElementById('catOrder').value) || 1;
      const status = document.getElementById('catStatus').checked ? 'active' : 'inactive';

      const payload = {
        name,
        slug,
        description,
        image,
        displayOrder,
        status
      };

      if (editId) payload.id = editId;

      const res = await saveCategory(payload);
      if (res.success) {
        showToast(`Category "${name}" saved!`, 'success');
        closeModal();
        await loadAndRenderCategories();
      } else {
        showToast(res.error || 'Failed to save category.', 'error');
      }
    } catch (err) {
      console.error('Error saving category:', err);
      showToast(err.message || 'Failed to save category.', 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Category';
      }
    }
  });
}

async function openEditCategoryModal(id) {
  try {
    const cat = await getCategoryById(id);
    if (!cat) {
      showToast('Category not found.', 'error');
      return;
    }

    document.getElementById('categoryModalTitle').textContent = `Edit Category: ${cat.name}`;
    document.getElementById('catEditId').value = cat.id;
    document.getElementById('catName').value = cat.name || '';
    document.getElementById('catSlug').value = cat.slug || cat.id || '';
    document.getElementById('catDesc').value = cat.description || '';
    document.getElementById('catImage').value = cat.image || '';
    document.getElementById('catOrder').value = cat.displayOrder || 1;
    document.getElementById('catStatus').checked = (cat.status === 'active');

    document.getElementById('categoryModal')?.classList.add('open');
  } catch (err) {
    console.error('Error opening category edit modal:', err);
    showToast('Failed to load category for editing.', 'error');
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
