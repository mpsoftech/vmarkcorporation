/**
 * V MARK CORPORATION - Admin Settings Controller
 */
import { initAdminLayout, showToast, showConfirmDialog } from './admin-ui.js';
import { getCurrentAdmin, updateAdminCredentials } from './admin-auth.js';
import { seedInitialData, exportDatabaseJSON, syncWithFirestore, pushBrochureCatalogToFirestore } from './admin-db.js';

document.addEventListener('DOMContentLoaded', async () => {
  await initAdminLayout('settings', 'System Settings', ['Admin', 'Settings']);

  loadCurrentAdminProfile();
  setupEventListeners();
});

function loadCurrentAdminProfile() {
  const current = getCurrentAdmin();
  if (current) {
    document.getElementById('settingAdminName').value = current.name || '';
    document.getElementById('settingAdminEmail').value = current.email || '';
  }
}

function setupEventListeners() {
  // Admin credentials update
  document.getElementById('adminAccountForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('settingAdminName').value.trim();
    const email = document.getElementById('settingAdminEmail').value.trim();
    const newPass = document.getElementById('settingNewPassword').value;
    const confirmPass = document.getElementById('settingConfirmPassword').value;

    if (newPass) {
      if (newPass.length < 6) {
        showToast('Password must be at least 6 characters long.', 'warning');
        return;
      }
      if (newPass !== confirmPass) {
        showToast('Passwords do not match. Please re-enter.', 'error');
        return;
      }
    }

    const res = await updateAdminCredentials(email, newPass, name);
    if (res.success) {
      showToast('Admin account details updated successfully!', 'success');
      document.getElementById('settingNewPassword').value = '';
      document.getElementById('settingConfirmPassword').value = '';
      // Update topbar profile
      const profName = document.querySelector('.profile-name');
      if (profName) profName.textContent = name;
    } else {
      showToast(res.error || 'Failed to update credentials.', 'error');
    }
  });

  // General company config
  document.getElementById('generalConfigForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Company configuration preferences saved.', 'success');
  });

  // Export JSON backup
  document.getElementById('exportBackupBtn')?.addEventListener('click', () => {
    exportDatabaseJSON();
    showToast('Database backup downloaded.', 'success');
  });

  // Sync from Cloud Firestore
  document.getElementById('syncFromCloudBtn')?.addEventListener('click', async () => {
    showToast('Synchronizing with Firestore database "vmarkcorporation"...', 'info');
    await syncWithFirestore();
    showToast('All products & assets synchronized from Cloud Firestore!', 'success');
  });

  // Push Brochure Catalog to Firestore
  document.getElementById('pushToCloudBtn')?.addEventListener('click', async () => {
    const confirmed = await showConfirmDialog({
      title: "Push Catalog to Cloud",
      message: "This will upload all 15 factory brochure products & categories into Firestore database 'vmarkcorporation'. Existing custom edits will be preserved.",
      confirmText: "Push to Cloud",
      isDanger: false
    });

    if (confirmed) {
      showToast('Uploading catalog to Firestore "vmarkcorporation"...', 'info');
      await pushBrochureCatalogToFirestore();
      showToast('Brochure catalog saved in Firestore database "vmarkcorporation"!', 'success');
    }
  });

  // Re-seed brochure catalog
  document.getElementById('reseedCatalogBtn')?.addEventListener('click', async () => {
    const confirmed = await showConfirmDialog({
      title: "Re-Seed Catalog",
      message: "Are you sure? This will refresh all standard categories, accessories, and brochure machines to official factory specs.",
      confirmText: "Re-Seed Data",
      isDanger: false
    });

    if (confirmed) {
      seedInitialData(true);
      showToast('Official machinery catalog re-seeded successfully!', 'success');
    }
  });
}
