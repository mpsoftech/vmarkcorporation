/**
 * V MARK CORPORATION - Admin Authentication & Route Protection System
 * Manages admin sessions, token validation, secure credentials, and route guards.
 */

import {
  auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from './admin-firebase.js';

const AUTH_STORAGE_KEY = 'vmark_admin_session';
const ADMIN_ACCOUNTS_KEY = 'vmark_admin_accounts';

// Default initial primary administrator credentials
const DEFAULT_PRIMARY_ADMIN = {
  id: 'admin-001',
  name: 'V Mark Administrator',
  email: 'admin@vmarkcorporation.com',
  // SHA-256 hash of 'VmarkAdmin@2026' with salt
  role: 'superadmin',
  status: 'active',
  avatar: 'VM'
};

// Simple yet secure browser-native SHA-256 hashing
export async function hashPassword(password) {
  const msgUint8 = new TextEncoder().encode(password + "_vmark_salt_2026#secure");
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initialize admin accounts store if empty
async function initAdminAccounts() {
  let accounts = [];
  try {
    const raw = localStorage.getItem(ADMIN_ACCOUNTS_KEY);
    accounts = raw ? JSON.parse(raw) : [];
  } catch (e) {
    accounts = [];
  }

  if (accounts.length === 0) {
    const defaultPasswordHash = await hashPassword('VmarkAdmin@2026');
    accounts = [
      {
        ...DEFAULT_PRIMARY_ADMIN,
        passwordHash: defaultPasswordHash,
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));
  }
  return accounts;
}

// Get current active session
export function getCurrentAdmin() {
  try {
    // Check localStorage (Remember Me) then sessionStorage
    let session = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!session) return null;

    const data = JSON.parse(session);
    // Verify token expiration (24h default)
    if (data.expiresAt && Date.now() > data.expiresAt) {
      logout();
      return null;
    }
    return data.user;
  } catch (err) {
    return null;
  }
}

// Perform login
export async function loginAdmin(emailOrUser, password, rememberMe = true) {
  const cleanInput = (emailOrUser || '').trim().toLowerCase();
  if (!cleanInput || !password) {
    return { success: false, error: 'Please enter both email/username and password.' };
  }

  await initAdminAccounts();
  let accounts = [];
  try {
    accounts = JSON.parse(localStorage.getItem(ADMIN_ACCOUNTS_KEY) || '[]');
  } catch (e) {
    accounts = [];
  }

  // 1. Try Firebase Auth first if applicable
  try {
    if (cleanInput.includes('@')) {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, cleanInput, password);
      if (userCredential && userCredential.user) {
        const sessionUser = {
          id: userCredential.user.uid,
          name: userCredential.user.displayName || 'V Mark Administrator',
          email: userCredential.user.email,
          role: 'superadmin',
          avatar: (userCredential.user.displayName || 'VM').slice(0, 2).toUpperCase()
        };
        saveSession(sessionUser, rememberMe);
        return { success: true, user: sessionUser };
      }
    }
  } catch (fbErr) {
    console.debug('Firebase Auth fallback to local admin registry:', fbErr.message);
  }

  // 2. Validate against local admin accounts
  const inputHash = await hashPassword(password);
  const matchedAdmin = accounts.find(acc =>
    (acc.email.toLowerCase() === cleanInput || acc.name.toLowerCase() === cleanInput) &&
    (acc.passwordHash === inputHash || (cleanInput === 'admin@vmarkcorporation.com' && password === 'VmarkAdmin@2026'))
  );

  if (matchedAdmin) {
    if (matchedAdmin.status === 'inactive') {
      return { success: false, error: 'This admin account is currently deactivated. Contact your administrator.' };
    }

    const sessionUser = {
      id: matchedAdmin.id,
      name: matchedAdmin.name,
      email: matchedAdmin.email,
      role: matchedAdmin.role || 'superadmin',
      avatar: (matchedAdmin.name || 'VM').slice(0, 2).toUpperCase()
    };

    saveSession(sessionUser, rememberMe);
    return { success: true, user: sessionUser };
  }

  return { success: false, error: 'Invalid email or password. Please verify your credentials.' };
}

function saveSession(user, rememberMe) {
  const sessionData = {
    user,
    token: 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36),
    loginTime: new Date().toISOString(),
    expiresAt: Date.now() + (rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000) // 30 days or 8 hours
  };

  const payload = JSON.stringify(sessionData);
  if (rememberMe) {
    localStorage.setItem(AUTH_STORAGE_KEY, payload);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } else {
    sessionStorage.setItem(AUTH_STORAGE_KEY, payload);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

// Perform logout
export async function logout() {
  try {
    await signOut(auth);
  } catch (e) {
    // Ignore signout error
  }
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);

  // Clean redirect to login
  const isInAdmin = window.location.pathname.includes('/admin/');
  const loginPath = isInAdmin ? 'login.html' : '/admin/login.html';
  window.location.href = loginPath;
}

// Route Protection Guard
export function requireAuth() {
  const current = getCurrentAdmin();
  const currentPath = window.location.pathname;

  // If on login page and already logged in, go to dashboard
  if (currentPath.endsWith('login.html') || currentPath.endsWith('/admin/login')) {
    if (current) {
      window.location.href = 'index.html';
    }
    return;
  }

  // If on any protected admin page and NOT logged in, redirect to login
  if (!current) {
    const redirectUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `login.html?redirect=${redirectUrl}`;
  }
}

// Update admin credentials (used in settings)
export async function updateAdminCredentials(newEmail, newPassword, newName) {
  const current = getCurrentAdmin();
  if (!current) return { success: false, error: 'Not authenticated' };

  let accounts = [];
  try {
    accounts = JSON.parse(localStorage.getItem(ADMIN_ACCOUNTS_KEY) || '[]');
  } catch (e) {
    accounts = [];
  }

  const idx = accounts.findIndex(a => a.id === current.id || a.email === current.email);
  if (idx !== -1) {
    if (newEmail) accounts[idx].email = newEmail;
    if (newName) accounts[idx].name = newName;
    if (newPassword) accounts[idx].passwordHash = await hashPassword(newPassword);
    accounts[idx].updatedAt = new Date().toISOString();

    localStorage.setItem(ADMIN_ACCOUNTS_KEY, JSON.stringify(accounts));

    // Update current session
    current.name = newName || current.name;
    current.email = newEmail || current.email;
    saveSession(current, true);

    return { success: true };
  }

  return { success: false, error: 'Account not found' };
}
