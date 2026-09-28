/**
 * V MARK CORPORATION - Inquiry Management Controller
 */
import { initAdminLayout, showToast, showConfirmDialog } from './admin-ui.js';
import { getAllInquiries, updateInquiryStatus, deleteInquiry, exportInquiriesToCSV, getAllProducts, subscribeToEvents } from './admin-db.js';

let currentFilters = {
  status: 'all',
  productId: 'all',
  search: ''
};

let loadedInquiries = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Check URL query parameters
  const params = new URLSearchParams(window.location.search);
  if (params.get('status')) {
    currentFilters.status = params.get('status');
  }

  await initAdminLayout('inquiries', 'Customer Inquiries', ['Admin', 'Inquiries']);

  // Sync tab active states
  document.querySelectorAll('#statusTabs .tab-btn').forEach(btn => {
    if (btn.dataset.status === currentFilters.status) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  await loadProductsFilter();
  setupEventListeners();
  await loadAndRenderInquiries();

  // Listen to new inquiries or status updates in real time
  subscribeToEvents(async (event) => {
    if (event.type.startsWith('inquiry_')) {
      await loadAndRenderInquiries();
    }
  });
});

async function loadProductsFilter() {
  const select = document.getElementById('inquiryProductFilter');
  if (!select) return;

  const products = await getAllProducts();
  const options = products.map(p => `<option value="${p.name}">${escapeHtml(p.name)}</option>`).join('');
  select.innerHTML = `<option value="all">All Equipment Types</option>` + options;
}

function setupEventListeners() {
  const searchInput = document.getElementById('inquirySearchInput');
  const productFilter = document.getElementById('inquiryProductFilter');
  const exportBtn = document.getElementById('exportCsvBtn');

  // Status Tab Clicks
  document.querySelectorAll('#statusTabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#statusTabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilters.status = btn.dataset.status;
      loadAndRenderInquiries();
    });
  });

  let debounceTimer;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentFilters.search = e.target.value.trim();
      loadAndRenderInquiries();
    }, 200);
  });

  productFilter?.addEventListener('change', (e) => {
    currentFilters.productId = e.target.value;
    loadAndRenderInquiries();
  });

  exportBtn?.addEventListener('click', () => {
    if (loadedInquiries.length === 0) {
      showToast('No inquiries to export.', 'warning');
      return;
    }
    exportInquiriesToCSV(loadedInquiries);
    showToast(`Exported ${loadedInquiries.length} inquiries to CSV.`, 'success');
  });
}

async function loadAndRenderInquiries() {
  const tbody = document.getElementById('inquiriesTableBody');
  const countIndicator = document.getElementById('inquiryCountIndicator');
  const tabCountNew = document.getElementById('tabCountNew');
  if (!tbody) return;

  try {
    const all = await getAllInquiries();
    const newCount = all.filter(i => i.status === 'new').length;
    if (tabCountNew) tabCountNew.textContent = newCount;

    loadedInquiries = await getAllInquiries(currentFilters);

    if (countIndicator) {
      countIndicator.textContent = `Showing ${loadedInquiries.length} of ${all.length} inquiries`;
    }

    if (loadedInquiries.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:3.5rem 1.5rem;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" style="margin-bottom:0.75rem;">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <h4 style="color:var(--text-heading);margin-bottom:0.35rem;">No inquiries matching filter</h4>
            <p style="color:var(--text-muted);font-size:0.85rem;">Try selecting a different status tab or clear the search field.</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = loadedInquiries.map(inq => {
      let badgeClass = 'badge-new';
      if (inq.status === 'in-progress') badgeClass = 'badge-progress';
      else if (inq.status === 'contacted') badgeClass = 'badge-contacted';
      else if (inq.status === 'quoted') badgeClass = 'badge-quoted';
      else if (inq.status === 'converted') badgeClass = 'badge-converted';
      else if (inq.status === 'closed') badgeClass = 'badge-closed';
      else if (inq.status === 'spam') badgeClass = 'badge-spam';

      const submittedDate = inq.createdAt ? new Date(inq.createdAt).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'Recently';

      return `
        <tr data-id="${inq.id}">
          <td>
            <span style="font-family:var(--font-mono);font-weight:700;color:var(--teal-700);font-size:0.82rem;">${escapeHtml(inq.id)}</span>
          </td>
          <td>
            <div style="font-weight:600;color:var(--text-heading);font-size:0.88rem;">${escapeHtml(inq.customerName)}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);"><a href="mailto:${encodeURIComponent(inq.email)}">${escapeHtml(inq.email)}</a></div>
            <div style="font-size:0.75rem;color:var(--text-muted);"><a href="tel:${encodeURIComponent(inq.phone)}" style="color:inherit;">${escapeHtml(inq.phone)}</a></div>
          </td>
          <td>
            <div style="font-weight:500;font-size:0.85rem;">${escapeHtml(inq.companyName || 'Private Lead')}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(inq.city ? `${inq.city}, ` : '')}${escapeHtml(inq.country || 'India')}</div>
          </td>
          <td>
            <div style="font-weight:600;color:var(--text-heading);font-size:0.85rem;">${escapeHtml(inq.product || 'General Machinery')}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">Qty: ${inq.quantity || 1} unit(s)</div>
          </td>
          <td>
            <span style="font-size:0.8rem;color:var(--text-body);">${submittedDate}</span>
          </td>
          <td>
            <select class="form-control status-select" data-id="${inq.id}" style="padding:0.25rem 0.5rem;font-size:0.75rem;font-weight:600;width:auto;">
              <option value="new" ${inq.status === 'new' ? 'selected' : ''}>New</option>
              <option value="contacted" ${inq.status === 'contacted' ? 'selected' : ''}>Contacted</option>
              <option value="in-progress" ${inq.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
              <option value="quoted" ${inq.status === 'quoted' ? 'selected' : ''}>Quoted</option>
              <option value="converted" ${inq.status === 'converted' ? 'selected' : ''}>Converted</option>
              <option value="closed" ${inq.status === 'closed' ? 'selected' : ''}>Closed</option>
              <option value="spam" ${inq.status === 'spam' ? 'selected' : ''}>Spam</option>
            </select>
          </td>
          <td style="text-align:right;white-space:nowrap;">
            <div style="display:inline-flex;gap:0.35rem;">
              <a href="inquiry-detail.html?id=${encodeURIComponent(inq.id)}" class="btn btn-outline btn-sm">
                Details
              </a>
              <button type="button" class="btn-icon delete-inq-btn" data-id="${inq.id}" data-name="${escapeHtml(inq.customerName)}" title="Delete inquiry" style="color:#dc2626;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Status change listener
    tbody.querySelectorAll('.status-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        const id = e.target.dataset.id;
        const newStatus = e.target.value;
        await updateInquiryStatus(id, newStatus);
        showToast(`Inquiry ${id} status set to "${newStatus}".`, 'info');
      });
    });

    // Delete inquiry listener
    tbody.querySelectorAll('.delete-inq-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const confirmed = await showConfirmDialog({
          title: "Delete Inquiry",
          message: `Are you sure you want to permanently delete quotation inquiry ${id} from ${name}?`,
          confirmText: "Delete",
          isDanger: true
        });

        if (confirmed) {
          await deleteInquiry(id);
          showToast(`Inquiry ${id} deleted.`, 'success');
          await loadAndRenderInquiries();
        }
      });
    });

  } catch (err) {
    console.error('Error loading inquiries:', err);
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
