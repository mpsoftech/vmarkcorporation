/**
 * V MARK CORPORATION - Public Website Integration Service
 * Connects the public website (index.html, products.html, product.html)
 * dynamically to the Admin Panel database (Firestore + local persistent store).
 *
 * Real-time updates: When admin modifies products or site content,
 * the public website updates instantly without needing a code rebuild.
 */

import { getAllProducts, getAllAccessories, getProductById, getSiteContent, subscribeToEvents } from '../admin/js/admin-db.js';
import { VMARK_PRODUCTS as DEFAULT_STATIC_PRODUCTS } from './products-data.js';

// Cache
let currentCatalog = null;

/**
 * Get all active products & accessories from the database.
 * Falls back to default static catalog if database is initializing.
 */
export async function getPublicCatalog() {
  try {
    const [activeProds, activeAccs] = await Promise.all([
      getAllProducts({ status: 'active' }),
      getAllAccessories({ status: 'active' })
    ]);

    const combined = [...activeProds, ...activeAccs];

    if (combined.length > 0) {
      currentCatalog = combined;
      if (typeof window !== 'undefined') {
        window.VMARK_PRODUCTS = combined;
      }
      return combined;
    }
  } catch (err) {
    console.debug('[Public Catalog Service] Using static fallback catalog:', err);
  }

  // Fallback
  currentCatalog = DEFAULT_STATIC_PRODUCTS;
  if (typeof window !== 'undefined') {
    window.VMARK_PRODUCTS = DEFAULT_STATIC_PRODUCTS;
  }
  return DEFAULT_STATIC_PRODUCTS;
}

/**
 * Get product details by ID or Slug from dynamic database
 */
export async function getPublicProductById(id) {
  if (!id) return null;
  const cleanId = id.trim().toLowerCase();

  try {
    // 1. Check database first
    const fromDb = await getProductById(cleanId);
    if (fromDb && fromDb.status === 'active') {
      return fromDb;
    }
  } catch (e) {
    console.debug('[Public Catalog Service] Fetch product by ID DB error:', e);
  }

  // 2. Check cached catalog
  if (currentCatalog) {
    const found = currentCatalog.find(p => p.id === cleanId || p.slug === cleanId);
    if (found) return found;
  }

  // 3. Check static products
  return DEFAULT_STATIC_PRODUCTS.find(p => p.id === cleanId || p.slug === cleanId) || null;
}

/**
 * Load dynamic CMS content for public site sections
 */
export async function loadPublicContent(section) {
  try {
    return await getSiteContent(section);
  } catch (err) {
    return {};
  }
}

/**
 * Subscribe to Admin changes so public pages re-render live
 */
export function onCatalogChange(callback) {
  subscribeToEvents(async (event) => {
    if (
      event.type.startsWith('product_') || 
      event.type.startsWith('accessory_') || 
      event.type.startsWith('database_') ||
      event.type === 'content_updated'
    ) {
      console.log('[Public Catalog Service] Catalog modified by admin, refreshing view...', event.type);
      await getPublicCatalog();
      callback(event);
    }
  });
}
