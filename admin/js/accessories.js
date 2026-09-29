/**
 * V MARK CORPORATION - Accessories Management Controller
 */
import { initAdminLayout, showToast, showConfirmDialog } from './admin-ui.js';
import { getAllAccessories, deleteAccessory, toggleAccessoryStatus, subscribeToEvents, resolveImageUrl } from './admin-db.js';

let currentFilters = {
  search: '',
  status: 'all'
};

document.addEventListener('DOMContentLoaded', async () => {
  await initAdminLayout('accessories', 'Accessories Management', ['Admin', 'Accessories']);

  setupEventListeners();
  await loadAndRenderAccessories();

  subscribeToEvents(async (event) => {
    if (event.type.startsWith('accessory_')) {
      await loadAndRenderAccessories();
    }
  });
});

function setupEventListeners() {
  const searchInput = document.getElementById('accessorySearchInput');
  const statusFilter = document.getElementById('accessoryStatusFilter');

  let debounceTimer;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentFilters.search = e.target.value.trim();
      loadAndRenderAccessories();
    }, 200);
  });

  statusFilter?.addEventListener('change', (e) => {
    currentFilters.status = e.target.value;
    loadAndRenderAccessories();
  });
}

async function loadAndRenderAccessories() {
  const tbody = document.getElementById('accessoriesTableBody');
  const countBadge = document.getElementById('accessoryCountBadge');
  if (!tbody) return;

  try {
    const accessories = await getAllAccessories(currentFilters);
    if (countBadge) {
      countBadge.textContent = `Showing ${accessories.length} accessor${accessories.length === 1 ? 'y' : 'ies'}`;
    }

    if (accessories.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:3.5rem 1.5rem;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom:0.75rem;">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h4 style="color:var(--text-heading);margin-bottom:0.35rem;">No accessories found</h4>
            <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:1rem;">Add consumables, UV lamps, or spare parts to the catalog.</p>
            <a href="/admin/accessory-editor.html" class="btn btn-primary btn-sm">+ Add New Accessory</a>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = accessories.map(item => {
      const isActive = item.status === 'active';
      const imgSrc = resolveImageUrl(item.image);
      const compatStr = Array.isArray(item.compatibleProducts) ? item.compatibleProducts.join(', ') : (item.compatibleProducts || 'General Rotary Screens');
      const updatedDate = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'Default';

      return `
        <tr data-id="${item.id}">
          <td>
            <img src="${imgSrc}" alt="${escapeHtml(item.name)}" class="table-thumb" onerror="this.onerror=null;this.src='/assets/images/vmark_logo.png'">
          </td>
          <td>
            <div style="font-weight:600;color:var(--text-heading);font-size:0.9rem;">
              <a href="/admin/accessory-editor.html?id=${encodeURIComponent(item.id)}" style="color:inherit;">
                ${escapeHtml(item.name)}
              </a>
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);font-family:var(--font-mono);">/${escapeHtml(item.slug || item.id)}</div>
            ${item.shortDesc ? `<div style="font-size:0.75rem;color:var(--text-body);margin-top:0.15rem;">${escapeHtml(item.shortDesc.slice(0, 75))}${item.shortDesc.length > 75 ? '...' : ''}</div>` : ''}
          </td>
          <td>
            <span style="font-size:0.8rem;color:var(--teal-700);font-weight:500;">${escapeHtml(compatStr)}</span>
          </td>
          <td style="text-align:center;">
            <span style="font-weight:600;font-family:var(--font-mono);font-size:0.85rem;">${item.displayOrder || 1}</span>
          </td>
          <td style="text-align:center;">
            <label class="switch" title="Toggle active status">
              <input type="checkbox" class="status-toggle-input" data-id="${item.id}" ${isActive ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </td>
          <td>
            <span style="font-size:0.8rem;color:var(--text-muted);">${updatedDate}</span>
          </td>
          <td style="text-align:right;white-space:nowrap;">
            <div style="display:inline-flex;gap:0.35rem;">
              <a href="/product.html?id=${encodeURIComponent(item.id)}" target="_blank" class="btn-icon" title="View live">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
              <a href="/admin/accessory-editor.html?id=${encodeURIComponent(item.id)}" class="btn-icon" title="Edit accessory">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </a>
              <button type="button" class="btn-icon delete-acc-btn" data-id="${item.id}" data-name="${escapeHtml(item.name)}" title="Delete accessory" style="color:#dc2626;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.status-toggle-input').forEach(checkbox => {
      checkbox.addEventListener('change', async (e) => {
        const id = e.target.dataset.id;
        const newStatus = e.target.checked ? 'active' : 'inactive';
        await toggleAccessoryStatus(id, newStatus);
        showToast(`Accessory set to ${newStatus}.`, 'info');
      });
    });

    tbody.querySelectorAll('.delete-acc-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const confirmed = await showConfirmDialog({
          title: "Delete Accessory",
          message: `Are you sure you want to permanently delete "${name}"?`,
          confirmText: "Delete",
          isDanger: true
        });

        if (confirmed) {
          const res = await deleteAccessory(id);
          if (res.success) {
            showToast(`"${name}" was deleted successfully.`, 'success');
            await loadAndRenderAccessories();
          } else {
            showToast(res.error || 'Failed to delete accessory', 'error');
          }
        }
      });
    });

  } catch (err) {
    console.error('Error loading accessories:', err);
    tbody.innerHTML = `<tr><td colspan="7" style="color:#dc2626;padding:2rem;text-align:center;">Error: ${err.message}</td></tr>`;
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
