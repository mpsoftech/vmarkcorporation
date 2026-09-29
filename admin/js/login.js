/**
 * V MARK CORPORATION - Admin Login Logic
 */
import { loginAdmin, getCurrentAdmin } from './admin-auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to dashboard or redirect param
  const current = getCurrentAdmin();
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get('redirect') ? decodeURIComponent(urlParams.get('redirect')) : '/admin/index.html';

  if (current) {
    window.location.href = redirectUrl;
    return;
  }

  const form = document.getElementById('adminLoginForm');
  const emailInput = document.getElementById('adminEmail');
  const passInput = document.getElementById('adminPassword');
  const rememberCheckbox = document.getElementById('rememberMe');
  const submitBtn = document.getElementById('loginSubmitBtn');
  const alertBox = document.getElementById('loginAlert');
  const alertMsg = document.getElementById('loginAlertMsg');
  const togglePassBtn = document.getElementById('togglePasswordBtn');

  // Toggle password visibility
  if (togglePassBtn && passInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      togglePassBtn.innerHTML = isPass
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    });
  }

  // Handle form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      alertBox.style.display = 'none';

      const email = emailInput.value.trim();
      const password = passInput.value;
      const remember = rememberCheckbox.checked;

      submitBtn.disabled = true;
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
        Authenticating...
      `;

      try {
        const result = await loginAdmin(email, password, remember);
        if (result.success) {
          submitBtn.innerHTML = `Signed In! Redirecting...`;
          submitBtn.style.background = '#10b981';
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 400);
        } else {
          alertMsg.textContent = result.error || 'Authentication failed. Please check credentials.';
          alertBox.style.display = 'flex';
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      } catch (err) {
        alertMsg.textContent = err.message || 'An unexpected error occurred.';
        alertBox.style.display = 'flex';
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
});
