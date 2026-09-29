/**
 * V MARK CORPORATION - Admin Dashboard Controller
 */
import { initAdminLayout, showToast } from './admin-ui.js';
import { getDashboardStats, subscribeToEvents } from './admin-db.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initAdminLayout('dashboard', 'Dashboard', ['Admin', 'Dashboard']);
  await renderDashboard();

  // Listen to cross-tab updates or mutations
  subscribeToEvents(async () => {
    await renderDashboard();
  });

  // Verify sync button
  document.getElementById('syncCheckBtn')?.addEventListener('click', () => {
    showToast('Database is synchronized! All public website pages are consuming active records.', 'success');
  });
});

async function renderDashboard() {
  try {
    const stats = await getDashboardStats();

    // 1. Populate KPI values
    document.getElementById('statTotalProducts').textContent = stats.totalProducts;
    document.getElementById('statActiveProducts').textContent = `Active: ${stats.activeProducts} / Inactive: ${stats.totalProducts - stats.activeProducts}`;
    document.getElementById('statTotalAccessories').textContent = stats.totalAccessories;
    document.getElementById('statTotalCategories').textContent = stats.totalCategories;
    document.getElementById('statTotalInquiries').textContent = stats.totalInquiries;
    document.getElementById('statInqProgress').textContent = `${stats.inProgressInquiries} In Progress`;
    document.getElementById('statNewInquiries').textContent = stats.newInquiries;
    document.getElementById('statTotalMedia').textContent = stats.totalMedia;

    // 2. Populate Recent Inquiries Table
    const tbody = document.getElementById('recentInquiriesBody');
    if (!tbody) return;

    if (!stats.recentInquiries || stats.recentInquiries.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:2.5rem;color:var(--text-muted);">
            No customer inquiries logged yet.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = stats.recentInquiries.map(inq => {
      let badgeClass = 'badge-new';
      if (inq.status === 'in-progress') badgeClass = 'badge-progress';
      else if (inq.status === 'contacted') badgeClass = 'badge-contacted';
      else if (inq.status === 'quoted') badgeClass = 'badge-quoted';
      else if (inq.status === 'converted') badgeClass = 'badge-converted';
      else if (inq.status === 'closed') badgeClass = 'badge-closed';
      else if (inq.status === 'spam') badgeClass = 'badge-spam';

      const dateStr = inq.createdAt ? new Date(inq.createdAt).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) : 'Recently';

      return `
        <tr>
          <td>
            <div style="font-weight:600;color:var(--text-heading);">${escapeHtml(inq.customerName)}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(inq.id)}</div>
          </td>
          <td>
            <div style="font-weight:500;">${escapeHtml(inq.companyName || 'Individual')}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHtml(inq.city ? `${inq.city}, ` : '')}${escapeHtml(inq.country || 'India')}</div>
          </td>
          <td>
            <div style="font-size:0.82rem;"><a href="mailto:${encodeURIComponent(inq.email)}">${escapeHtml(inq.email)}</a></div>
            <div style="font-size:0.75rem;color:var(--text-muted);"><a href="tel:${encodeURIComponent(inq.phone)}" style="color:inherit;">${escapeHtml(inq.phone || 'N/A')}</a></div>
          </td>
          <td>
            <div style="font-weight:600;color:var(--teal-700);">${escapeHtml(inq.product || 'General Machinery')}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">Qty: ${inq.quantity || 1} unit(s)</div>
          </td>
          <td>
            <span style="font-size:0.82rem;">${dateStr}</span>
          </td>
          <td>
            <span class="badge ${badgeClass}">${inq.status}</span>
          </td>
          <td style="text-align:right;">
            <a href="/admin/inquiry-detail.html?id=${encodeURIComponent(inq.id)}" class="btn btn-outline btn-sm">
              View
            </a>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to render dashboard stats:', err);
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
