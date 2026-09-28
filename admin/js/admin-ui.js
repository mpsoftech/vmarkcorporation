/**
 * V MARK CORPORATION - Common Admin UI Framework
 * Injects unified sidebar, top header, real-time notification engine,
 * confirmation modals, toast alerts, and image compression utility.
 */

import { getCurrentAdmin, logout, requireAuth } from './admin-auth.js';
import { getAllInquiries, subscribeToEvents } from './admin-db.js';

// Audio chime for new inquiry alert (synthesized Web Audio API - no external file needed!)
export function playNotificationChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
}

// Toast notification helper
export function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else if (type === 'warning') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  } else {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0d9488" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <div style="flex:1;">${message}</div>
    <button type="button" style="background:none;border:none;color:#94a3b8;cursor:pointer;padding:2px;" onclick="this.parentElement.remove()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Confirmation Dialog Modal
export function showConfirmDialog({ 
  title = "Are you sure?", 
  message = "This action cannot be undone.", 
  confirmText = "Delete", 
  cancelText = "Cancel",
  isDanger = true 
}) {
  return new Promise((resolve) => {
    let overlay = document.getElementById('adminConfirmModal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'adminConfirmModal';
      overlay.className = 'modal-overlay';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3 style="color:${isDanger ? '#dc2626' : 'var(--text-heading)'};">${title}</h3>
          <button type="button" class="modal-close" id="confirmModalClose">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="modal-body">
          <p style="color:var(--text-body);font-size:0.95rem;">${message}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" id="confirmModalCancel">${cancelText}</button>
          <button type="button" class="btn ${isDanger ? 'btn-danger' : 'btn-primary'}" id="confirmModalOk">${confirmText}</button>
        </div>
      </div>
    `;

    overlay.classList.add('open');

    const cleanUp = () => {
      overlay.classList.remove('open');
    };

    document.getElementById('confirmModalOk').onclick = () => {
      cleanUp();
      resolve(true);
    };

    document.getElementById('confirmModalCancel').onclick = () => {
      cleanUp();
      resolve(false);
    };

    document.getElementById('confirmModalClose').onclick = () => {
      cleanUp();
      resolve(false);
    };
  });
}

// Client-side image compressor (converts to optimized WEBP/JPEG)
export function compressImage(file, maxWidth = 1400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    // Validate MIME type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return reject(new Error('Invalid image format. Supported formats: JPG, JPEG, PNG, WEBP.'));
    }

    // Validate size (max 8MB raw)
    if (file.size > 8 * 1024 * 1024) {
      return reject(new Error('File exceeds maximum 8MB size limit.'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP if browser supports, otherwise jpeg
        const mimeType = 'image/webp';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        
        // Approximate size
        const head = `data:${mimeType};base64,`;
        const sizeBytes = Math.round((dataUrl.length - head.length) * 3 / 4);
        const sizeFormatted = sizeBytes > 1024 * 1024 
          ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(sizeBytes / 1024)} KB`;

        canvas.toBlob((blob) => {
          resolve({
            blob: blob || file,
            dataUrl,
            width,
            height,
            sizeFormatted,
            mimeType,
            originalName: file.name
          });
        }, mimeType, quality);
      };
      img.onerror = () => reject(new Error('Failed to decode image data.'));
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
  });
}

// Master Layout Initializer
export async function initAdminLayout(activeNavId = 'dashboard', pageTitle = 'Dashboard', breadcrumbTrail = ['Home', 'Dashboard']) {
  // 1. Guard route
  requireAuth();
  const currentAdmin = getCurrentAdmin();

  // 2. Inject Sidebar HTML
  const sidebarContainer = document.getElementById('adminSidebar');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = `
      <div class="sidebar-header">
        <a href="index.html" class="sidebar-brand">
          <img src="/assets/images/vmark_logo.png" alt="V MARK Logo" class="sidebar-logo">
          <div class="brand-text">
            <h2>V MARK</h2>
            <span>Admin Console</span>
          </div>
        </a>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section-title">Core Management</div>
        <a href="index.html" class="sidebar-nav-link ${activeNavId === 'dashboard' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          Dashboard
        </a>

        <div class="nav-section-title">Machinery Catalog</div>
        <a href="products.html" class="sidebar-nav-link ${activeNavId === 'products' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          All Products
        </a>
        <a href="product-editor.html" class="sidebar-nav-link ${activeNavId === 'product-new' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          Add Product
        </a>
        <a href="categories.html" class="sidebar-nav-link ${activeNavId === 'categories' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          Categories
        </a>

        <div class="nav-section-title">Accessories</div>
        <a href="accessories.html" class="sidebar-nav-link ${activeNavId === 'accessories' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          All Accessories
        </a>
        <a href="accessory-editor.html" class="sidebar-nav-link ${activeNavId === 'accessory-new' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Accessory
        </a>

        <div class="nav-section-title">Sales & Leads</div>
        <a href="inquiries.html" class="sidebar-nav-link ${activeNavId === 'inquiries' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          Customer Inquiries
          <span class="nav-badge" id="sidebarInquiryBadge" style="display:none;">0</span>
        </a>

        <div class="nav-section-title">Assets & Content</div>
        <a href="media.html" class="sidebar-nav-link ${activeNavId === 'media' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          Media Library
        </a>
        <a href="content.html" class="sidebar-nav-link ${activeNavId === 'content' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          Website Content
        </a>

        <div class="nav-section-title">Configuration</div>
        <a href="settings.html" class="sidebar-nav-link ${activeNavId === 'settings' ? 'active' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          Settings
        </a>
      </nav>

      <div class="sidebar-footer">
        <a href="/index.html" target="_blank" class="live-site-link">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          View Public Site
        </a>
      </div>
    `;
  }

  // 3. Inject Header HTML
  const headerContainer = document.getElementById('adminHeader');
  if (headerContainer) {
    const breadcrumbHtml = breadcrumbTrail.map((crumb, idx) => {
      const isLast = idx === breadcrumbTrail.length - 1;
      return `<span ${isLast ? 'style="color:var(--text-heading);font-weight:600;"' : ''}>${crumb}</span>`;
    }).join(' <span style="opacity:0.4;">/</span> ');

    headerContainer.innerHTML = `
      <div class="header-left">
        <button type="button" class="mobile-nav-toggle" id="adminMobileToggle" aria-label="Toggle Navigation">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div class="page-title-block">
          <h1>${pageTitle}</h1>
          <div class="page-breadcrumbs">${breadcrumbHtml}</div>
        </div>
      </div>

      <div class="header-right">
        <div class="header-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="globalHeaderSearch" placeholder="Search catalog & inquiries...">
        </div>

        <!-- Notification Bell -->
        <div style="position:relative;">
          <button type="button" class="notification-bell-btn" id="headerNotificationBtn" aria-label="View notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span class="notification-badge" id="headerNotificationBadge" style="display:none;">0</span>
          </button>
          <div class="profile-dropdown" id="notificationDropdown" style="width:300px;right:0;">
            <div style="padding:0.75rem 0.85rem;border-bottom:1px solid var(--border-light);display:flex;justify-content:space-between;align-items:center;">
              <strong style="font-size:0.85rem;color:var(--text-heading);">Notifications</strong>
              <a href="inquiries.html?status=new" style="font-size:0.75rem;">View All</a>
            </div>
            <div id="notificationList" style="max-height:260px;overflow-y:auto;">
              <p style="padding:1rem;color:var(--text-muted);font-size:0.8rem;text-align:center;">Loading notifications...</p>
            </div>
          </div>
        </div>

        <!-- Admin Profile -->
        <div style="position:relative;">
          <div class="admin-profile-pill" id="adminProfilePill">
            <div class="profile-avatar">${currentAdmin ? (currentAdmin.avatar || 'VM') : 'VM'}</div>
            <div class="profile-info">
              <span class="profile-name">${currentAdmin ? currentAdmin.name : 'Administrator'}</span>
              <span class="profile-role">${currentAdmin ? currentAdmin.role : 'Superadmin'}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <div class="profile-dropdown" id="adminProfileDropdown">
            <div style="padding:0.5rem 0.85rem;border-bottom:1px solid var(--border-light);margin-bottom:0.25rem;">
              <div style="font-weight:600;font-size:0.85rem;color:var(--text-heading);">${currentAdmin ? currentAdmin.name : 'Admin'}</div>
              <div style="font-size:0.72rem;color:var(--text-muted);">${currentAdmin ? currentAdmin.email : ''}</div>
            </div>
            <a href="settings.html" class="dropdown-item">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              Account Settings
            </a>
            <button type="button" class="dropdown-item logout" id="adminLogoutBtn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    `;

    // Hook Profile Dropdown
    const pill = document.getElementById('adminProfilePill');
    const profileDropdown = document.getElementById('adminProfileDropdown');
    if (pill && profileDropdown) {
      pill.onclick = (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('open');
        document.getElementById('notificationDropdown')?.classList.remove('open');
      };
    }

    // Hook Notification Dropdown
    const bellBtn = document.getElementById('headerNotificationBtn');
    const notifDropdown = document.getElementById('notificationDropdown');
    if (bellBtn && notifDropdown) {
      bellBtn.onclick = (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('open');
        profileDropdown?.classList.remove('open');
      };
    }

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
      profileDropdown?.classList.remove('open');
      notifDropdown?.classList.remove('open');
    });

    // Hook Logout
    document.getElementById('adminLogoutBtn')?.addEventListener('click', async () => {
      const confirmLogout = await showConfirmDialog({
        title: "Sign Out",
        message: "Are you sure you want to log out of the administration console?",
        confirmText: "Sign Out",
        isDanger: false
      });
      if (confirmLogout) {
        logout();
      }
    });

    // Mobile sidebar toggle
    const mobileToggle = document.getElementById('adminMobileToggle');
    if (mobileToggle && sidebarContainer) {
      mobileToggle.onclick = () => {
        sidebarContainer.classList.toggle('open');
      };
    }

    // Global Header Search
    const searchInput = document.getElementById('globalHeaderSearch');
    if (searchInput) {
      searchInput.onkeydown = (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
          window.location.href = `products.html?search=${encodeURIComponent(searchInput.value.trim())}`;
        }
      };
    }
  }

  // 4. Update Notifications & Real-Time Badge
  await updateNotificationBadge();

  // 5. Listen to Cross-tab / Database events
  subscribeToEvents(async (event) => {
    if (event && event.type && (event.type === 'inquiry_created' || event.type === 'inquiry_created_live')) {
      playNotificationChime();
      const customer = (event.payload && event.payload.customerName) ? event.payload.customerName : 'Customer';
      const prod = (event.payload && event.payload.product) ? event.payload.product : 'Machinery';
      showToast(`🔔 New Inquiry from ${customer} (${prod})`, 'info', 6000);
      await updateNotificationBadge();
    }
  });
}

// Update Notification Badge and Dropdown List
export async function updateNotificationBadge() {
  try {
    const inquiries = await getAllInquiries();
    const newInquiries = inquiries.filter(i => i.status === 'new');
    const count = newInquiries.length;

    const headerBadge = document.getElementById('headerNotificationBadge');
    const sidebarBadge = document.getElementById('sidebarInquiryBadge');
    const notifList = document.getElementById('notificationList');

    if (headerBadge) {
      if (count > 0) {
        headerBadge.textContent = count > 99 ? '99+' : count;
        headerBadge.style.display = 'flex';
      } else {
        headerBadge.style.display = 'none';
      }
    }

    if (sidebarBadge) {
      if (count > 0) {
        sidebarBadge.textContent = count;
        sidebarBadge.style.display = 'inline-block';
        sidebarBadge.classList.add('pulse');
      } else {
        sidebarBadge.style.display = 'none';
      }
    }

    if (notifList) {
      if (newInquiries.length === 0) {
        notifList.innerHTML = `<p style="padding:1.5rem;color:var(--text-muted);font-size:0.8rem;text-align:center;">No new inquiries</p>`;
      } else {
        notifList.innerHTML = newInquiries.slice(0, 5).map(inq => `
          <a href="inquiry-detail.html?id=${encodeURIComponent(inq.id)}" style="display:block;padding:0.65rem 0.85rem;border-bottom:1px solid var(--border-light);text-decoration:none;transition:background 0.15s ease;" onmouseover="this.style.background='var(--surface-hover)'" onmouseout="this.style.background='transparent'">
            <div style="font-weight:600;font-size:0.82rem;color:var(--text-heading);">${inq.customerName} <span style="font-size:0.72rem;color:var(--text-muted);font-weight:400;">(${inq.companyName || 'Private'})</span></div>
            <div style="font-size:0.75rem;color:var(--teal-600);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${inq.product || 'Machinery'}</div>
            <div style="font-size:0.68rem;color:var(--text-muted);">${new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </a>
        `).join('');
      }
    }
  } catch (err) {
    console.debug('Notification update error:', err);
  }
}
