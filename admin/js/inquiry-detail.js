/**
 * V MARK CORPORATION - Inquiry Detail Controller
 */
import { initAdminLayout, showToast, showConfirmDialog } from './admin-ui.js';
import { getInquiryById, updateInquiryStatus, addInquiryNote, deleteInquiry } from './admin-db.js';
import { getCurrentAdmin } from './admin-auth.js';

let inquiryId = null;
let currentInquiry = null;

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  inquiryId = urlParams.get('id');

  await initAdminLayout('inquiries', 'Inquiry Details', ['Admin', 'Inquiries', inquiryId || 'Detail']);

  if (!inquiryId) {
    showToast('No inquiry ID specified.', 'error');
    setTimeout(() => { window.location.href = '/admin/inquiries.html'; }, 1000);
    return;
  }

  await loadInquiryData();
  setupActions();
});

async function loadInquiryData() {
  try {
    currentInquiry = await getInquiryById(inquiryId);
    if (!currentInquiry) {
      showToast('Inquiry record not found.', 'error');
      setTimeout(() => { window.location.href = '/admin/inquiries.html'; }, 1500);
      return;
    }

    // Top Bar
    document.getElementById('inquiryTitleId').textContent = currentInquiry.id;
    const badge = document.getElementById('inquiryStatusBadge');
    badge.textContent = currentInquiry.status;
    badge.className = `badge badge-${currentInquiry.status}`;

    const dateFormatted = currentInquiry.createdAt ? new Date(currentInquiry.createdAt).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short'
    }) : 'Recently';
    document.getElementById('inquiryDateText').textContent = `Submitted on ${dateFormatted}`;

    // Customer Info
    document.getElementById('custName').textContent = currentInquiry.customerName || 'Anonymous';
    document.getElementById('custCompany').textContent = currentInquiry.companyName || 'Not Specified';
    
    const emailLink = document.getElementById('custEmailLink');
    emailLink.textContent = currentInquiry.email || 'N/A';
    emailLink.href = currentInquiry.email ? `mailto:${encodeURIComponent(currentInquiry.email)}` : '#';

    const phoneLink = document.getElementById('custPhoneLink');
    phoneLink.textContent = currentInquiry.phone || 'N/A';
    phoneLink.href = currentInquiry.phone ? `tel:${encodeURIComponent(currentInquiry.phone)}` : '#';

    document.getElementById('custLocation').textContent = `${currentInquiry.city ? currentInquiry.city + ', ' : ''}${currentInquiry.country || 'India'}`;

    // Requirement
    document.getElementById('reqProduct').textContent = currentInquiry.product || 'General Machinery';
    document.getElementById('reqQuantity').textContent = `${currentInquiry.quantity || 1} unit(s)`;
    document.getElementById('reqMessage').textContent = currentInquiry.message || 'No specific technical message provided.';

    // Attachment
    const attRow = document.getElementById('attachmentRow');
    const attLink = document.getElementById('attachmentLink');
    if (currentInquiry.attachment) {
      attRow.style.display = 'flex';
      attLink.href = currentInquiry.attachment;
    } else {
      attRow.style.display = 'none';
    }

    // Status select
    document.getElementById('updateStatusSelect').value = currentInquiry.status;

    // Contact Buttons
    setupContactButtons(currentInquiry);

    // Notes
    renderNotes(currentInquiry.adminNotes || []);

  } catch (err) {
    console.error('Error loading inquiry details:', err);
    showToast('Failed to load inquiry record.', 'error');
  }
}

function setupContactButtons(inq) {
  const emailBtn = document.getElementById('emailReplyBtn');
  const callBtn = document.getElementById('callCustomerBtn');
  const waBtn = document.getElementById('whatsappCustomerBtn');

  // Email
  if (inq.email) {
    const subject = encodeURIComponent(`Quotation Inquiry [${inq.id}] - V MARK Corporation`);
    const body = encodeURIComponent(
      `Dear ${inq.customerName},\n\nThank you for reaching out to V MARK Corporation regarding the ${inq.product || 'machinery'}.\n\n` +
      `We have received your requirement for ${inq.quantity || 1} unit(s).\n\n` +
      `Attached please find our technical catalog and preliminary pricing proposal.\n\n` +
      `Best regards,\nSales & Engineering Team\nV MARK Corporation, Ahmedabad, India\nWebsite: https://vmarkcorporation.com/`
    );
    emailBtn.href = `mailto:${encodeURIComponent(inq.email)}?subject=${subject}&body=${body}`;
    emailBtn.style.display = 'inline-flex';
  } else {
    emailBtn.style.display = 'none';
  }

  // Call
  if (inq.phone) {
    callBtn.href = `tel:${encodeURIComponent(inq.phone)}`;
    callBtn.style.display = 'inline-flex';

    // WhatsApp
    const cleanPhone = (inq.phone || '').replace(/[^0-9]/g, '');
    const waText = encodeURIComponent(`Hello ${inq.customerName}, this is regarding your quotation inquiry [${inq.id}] with V MARK Corporation for ${inq.product}. How can we assist you?`);
    waBtn.href = `https://wa.me/${cleanPhone}?text=${waText}`;
    waBtn.style.display = 'inline-flex';
  } else {
    callBtn.style.display = 'none';
    waBtn.style.display = 'none';
  }
}

function renderNotes(notes) {
  const container = document.getElementById('notesList');
  if (!container) return;

  if (!notes || notes.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted);font-size:0.8rem;text-align:center;padding:1rem;">No internal notes logged yet.</p>`;
    return;
  }

  container.innerHTML = notes.map(n => `
    <div class="note-bubble">
      <div class="note-header">
        <strong style="color:var(--text-heading);">${escapeHtml(n.admin || 'Admin')}</strong>
        <span>${new Date(n.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div style="font-size:0.82rem;color:var(--text-body);line-height:1.5;">${escapeHtml(n.note)}</div>
    </div>
  `).join('');
}

function setupActions() {
  // Update status button
  document.getElementById('saveStatusBtn')?.addEventListener('click', async () => {
    const newStatus = document.getElementById('updateStatusSelect').value;
    const res = await updateInquiryStatus(inquiryId, newStatus);
    if (res.success) {
      showToast(`Status updated to "${newStatus}".`, 'success');
      const badge = document.getElementById('inquiryStatusBadge');
      badge.textContent = newStatus;
      badge.className = `badge badge-${newStatus}`;
    } else {
      showToast('Failed to update status.', 'error');
    }
  });

  // Add internal note button
  document.getElementById('addNoteBtn')?.addEventListener('click', async () => {
    const input = document.getElementById('newNoteInput');
    const text = input.value.trim();
    if (!text) {
      showToast('Please type a note first.', 'warning');
      return;
    }

    const currentAdmin = getCurrentAdmin();
    const adminName = currentAdmin ? currentAdmin.name : 'Admin';

    const res = await addInquiryNote(inquiryId, text, adminName);
    if (res.success) {
      showToast('Note added successfully.', 'success');
      input.value = '';
      renderNotes(res.inquiry.adminNotes);
    } else {
      showToast('Failed to save note.', 'error');
    }
  });

  // Delete inquiry
  document.getElementById('deleteInquiryBtn')?.addEventListener('click', async () => {
    const confirmed = await showConfirmDialog({
      title: "Delete Inquiry",
      message: `Permanently delete quotation record ${inquiryId}? This cannot be undone.`,
      confirmText: "Delete",
      isDanger: true
    });

    if (confirmed) {
      const res = await deleteInquiry(inquiryId);
      if (res.success) {
        showToast('Inquiry deleted.', 'success');
        setTimeout(() => { window.location.href = '/admin/inquiries.html'; }, 800);
      } else {
        showToast('Failed to delete inquiry.', 'error');
      }
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
