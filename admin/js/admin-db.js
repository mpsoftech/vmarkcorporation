/**
 * V MARK CORPORATION - Comprehensive Data Management Service
 * Dual-layer architecture: Cloud Firestore (database: "vmarkcorporation")
 * with instant client-side caching & real-time live synchronization.
 *
 * Ensures zero-lag UI, resilient operation, and seamless public site integration.
 */

import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  onSnapshot 
} from './admin-firebase.js';

import { VMARK_PRODUCTS } from '../../js/products-data.js';
import { resolveImageUrl } from '../../js/image-helper.js';

export { resolveImageUrl };

// Keys for local persistence
const STORAGE_KEYS = {
  PRODUCTS: 'vmark_db_products',
  ACCESSORIES: 'vmark_db_accessories',
  CATEGORIES: 'vmark_db_categories',
  INQUIRIES: 'vmark_db_inquiries',
  MEDIA: 'vmark_db_media',
  CONTENT: 'vmark_db_content',
  SETTINGS: 'vmark_db_settings',
  LAST_SEEDED: 'vmark_db_seeded_v2'
};

// Cross-tab broadcast for real-time reactivity
let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  broadcastChannel = new BroadcastChannel('vmark_admin_events');
}

export function broadcastEvent(type, payload = {}) {
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type, payload, timestamp: Date.now() });
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('vmark_event', { detail: { type, payload } }));
    }
  } catch (err) {
    console.debug('Broadcast error:', err);
  }
}

export function subscribeToEvents(callback) {
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event) => callback(event.data);
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('vmark_event', (e) => callback(e.detail));
  }
}

// Helper to safely get from localStorage
function getLocal(key, defaultValue = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

// Helper to safely save to localStorage
function setLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

// ================= INITIAL BROCHURE DATA DEFINITIONS =================
export const DEFAULT_CATEGORIES = [
  {
    id: "engraving-rotary",
    name: "Rotary Screen & Engraving",
    slug: "engraving-rotary",
    description: "Precision high-speed coating, exposure, polymerizing, and endring alignment machinery for textile rotary nickel screens.",
    image: "/assets/images/rotary_screen_coating_machine.jpg",
    status: "active",
    displayOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: "colour-kitchen",
    name: "Colour Kitchen Machinery",
    slug: "colour-kitchen",
    description: "Automated dosing, computerized color matching (ECOLOPS), thickener paste preparation (TPPS), and vacuum straining systems.",
    image: "/assets/images/thickener_paste_prep_machine.jpg",
    status: "active",
    displayOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: "stirrers-mixers",
    name: "Industrial Stirrers & Mixers",
    slug: "stirrers-mixers",
    description: "High-speed dispersers, pneumatic lift stirrers, laboratory mixers, and multi-vessel mixing solutions for textile pastes.",
    image: "/assets/images/high_speed_stirrer.jpg",
    status: "active",
    displayOrder: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: "washing-plant",
    name: "Washing Plant Machinery",
    slug: "washing-plant",
    description: "High-pressure drum washers, horizontal & vertical screen washing machines, and squeegee wash units.",
    image: "/assets/images/drum_washer_machine.jpg",
    status: "active",
    displayOrder: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: "accessories",
    name: "Parts & Accessories",
    slug: "accessories",
    description: "Endrings, UV exposure lamps, squeegee blades, coating rings, shaping rings, handling clamps, and precision accessories.",
    image: "/assets/images/engraving_accessories_grid.jpg",
    status: "active",
    displayOrder: 5,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_MEDIA_ASSETS = [
  { id: 'm-1', fileName: 'rotary_screen_coating_machine.jpg', fileUrl: '/assets/images/rotary_screen_coating_machine.jpg', folder: 'products', fileType: 'image/jpeg', fileSize: '195 KB', width: 1200, height: 900, usedIn: ['Rotary Screen Coating Machine'], createdAt: '2026-01-15' },
  { id: 'm-2', fileName: 'curing_oven_polymerizer.jpg', fileUrl: '/assets/images/curing_oven_polymerizer.jpg', folder: 'products', fileType: 'image/jpeg', fileSize: '166 KB', width: 1200, height: 900, usedIn: ['Curing Oven (Screen Polymerizer)'], createdAt: '2026-01-15' },
  { id: 'm-3', fileName: 'endring_fixing_machine.jpg', fileUrl: '/assets/images/endring_fixing_machine.jpg', folder: 'products', fileType: 'image/jpeg', fileSize: '312 KB', width: 1200, height: 900, usedIn: ['Endring Fixing Machine'], createdAt: '2026-01-15' },
  { id: 'm-4', fileName: 'endring_removing_machine.jpg', fileUrl: '/assets/images/endring_removing_machine.jpg', folder: 'products', fileType: 'image/jpeg', fileSize: '141 KB', width: 1200, height: 900, usedIn: ['Endring Removing Machine'], createdAt: '2026-01-15' },
  { id: 'm-5', fileName: 'lacquer_drying_climatizer.jpg', fileUrl: '/assets/images/lacquer_drying_climatizer.jpg', folder: 'products', fileType: 'image/jpeg', fileSize: '307 KB', width: 1200, height: 900, usedIn: ['Lacquer Drying Climatizer'], createdAt: '2026-01-15' },
  { id: 'm-6', fileName: 'screen_degreasing_stand.jpg', fileUrl: '/assets/images/screen_degreasing_stand.jpg', folder: 'products', fileType: 'image/jpeg', fileSize: '130 KB', width: 1200, height: 900, usedIn: ['Screen Degreasing Stand'], createdAt: '2026-01-15' },
  { id: 'm-7', fileName: 'screen_inspection_stand.jpg', fileUrl: '/assets/images/screen_inspection_stand.jpg', folder: 'products', fileType: 'image/jpeg', fileSize: '130 KB', width: 1200, height: 900, usedIn: ['Screen Inspection Stand'], createdAt: '2026-01-15' },
  { id: 'm-8', fileName: 'drum_washer_machine.jpg', fileUrl: '/assets/images/drum_washer_machine.jpg', folder: 'products', fileType: 'image/jpeg', fileSize: '187 KB', width: 1200, height: 900, usedIn: ['Drum Washer Machine'], createdAt: '2026-01-15' },
  { id: 'm-9', fileName: 'rotary_screen_washing_machine.jpg', fileUrl: '/assets/images/rotary_screen_washing_machine.jpg', folder: 'products', fileType: 'image/jpeg', fileSize: '141 KB', width: 1200, height: 900, usedIn: ['Rotary Screen Washing Machine'], createdAt: '2026-01-15' },
  { id: 'm-10', fileName: 'vertical_screen_washing_machine.jpg', fileUrl: '/assets/images/vertical_screen_washing_machine.jpg', folder: 'products', fileType: 'image/jpeg', fileSize: '284 KB', width: 1200, height: 900, usedIn: ['Vertical Screen Washing Machine'], createdAt: '2026-01-15' },
  { id: 'm-11', fileName: 'squeegee_washing_machine.jpg', fileUrl: '/assets/images/squeegee_washing_machine.jpg', folder: 'products', fileType: 'image/jpeg', fileSize: '130 KB', width: 1200, height: 900, usedIn: ['Squeegee Washing Machine'], createdAt: '2026-01-15' },
  { id: 'm-12', fileName: 'high_speed_stirrer.jpg', fileUrl: '/assets/images/high_speed_stirrer.jpg', folder: 'products', fileType: 'image/jpeg', fileSize: '47 KB', width: 800, height: 800, usedIn: ['High Speed Stirrer'], createdAt: '2026-01-15' },
  { id: 'm-13', fileName: 'laboratory_stirrer.jpg', fileUrl: '/assets/images/laboratory_stirrer.jpg', folder: 'products', fileType: 'image/jpeg', fileSize: '55 KB', width: 800, height: 800, usedIn: ['Laboratory Stirrer'], createdAt: '2026-01-15' },
  { id: 'm-14', fileName: 'thickener_paste_prep_machine.jpg', fileUrl: '/assets/images/thickener_paste_prep_machine.jpg', folder: 'products', fileType: 'image/jpeg', fileSize: '380 KB', width: 1200, height: 900, usedIn: ['Thickener Paste Preparation Unit'], createdAt: '2026-01-15' },
  { id: 'm-15', fileName: 'vacuum_colour_strainer_unit.jpg', fileUrl: '/assets/images/vacuum_colour_strainer_unit.jpg', folder: 'products', fileType: 'image/jpeg', fileSize: '357 KB', width: 1200, height: 900, usedIn: ['Vacuum Colour Strainer with Lifting & Tilting Unit'], createdAt: '2026-01-15' },
  { id: 'm-16', fileName: 'hero_textile_machinery.jpg', fileUrl: '/assets/images/hero_textile_machinery.jpg', folder: 'website', fileType: 'image/jpeg', fileSize: '373 KB', width: 1920, height: 1080, usedIn: ['Homepage Hero'], createdAt: '2026-01-15' },
  { id: 'm-17', fileName: 'vmark_logo.png', fileUrl: '/assets/images/vmark_logo.png', folder: 'website', fileType: 'image/png', fileSize: '1.08 MB', width: 600, height: 200, usedIn: ['Header', 'Footer'], createdAt: '2026-01-15' },
  { id: 'm-18', fileName: 'metal_halide_lamp.jpg', fileUrl: '/assets/images/accessories/metal_halide_lamp.jpg', folder: 'accessories', fileType: 'image/jpeg', fileSize: '46 KB', width: 800, height: 800, usedIn: ['Metal Halide UV Lamp'], createdAt: '2026-01-15' },
  { id: 'm-19', fileName: 'heating_lamp.jpg', fileUrl: '/assets/images/accessories/heating_lamp.jpg', folder: 'accessories', fileType: 'image/jpeg', fileSize: '38 KB', width: 800, height: 800, usedIn: ['IR Heating Lamp'], createdAt: '2026-01-15' },
  { id: 'm-20', fileName: 'super_spray_gun.jpg', fileUrl: '/assets/images/accessories/super_spray_gun.jpg', folder: 'accessories', fileType: 'image/jpeg', fileSize: '28 KB', width: 800, height: 800, usedIn: ['Super Spray Gun'], createdAt: '2026-01-15' },
  { id: 'm-21', fileName: 'coating_rubber_ring.jpg', fileUrl: '/assets/images/accessories/coating_rubber_ring.jpg', folder: 'accessories', fileType: 'image/jpeg', fileSize: '22 KB', width: 800, height: 800, usedIn: ['Coating Rubber Ring'], createdAt: '2026-01-15' }
];

export const INITIAL_CONTENT = {
  homepage: {
    heroHeading: "Next-Gen Textile Machinery & Engineering Solutions",
    heroSubheading: "Leading Indian manufacturer of Rotary Screen Engraving, Automated Colour Kitchens, High-Speed Stirrers, and Sustainable Washing Plants.",
    badgeText: "ISO 9001:2015 Certified Textile Machinery",
    ctaPrimaryText: "Explore Products",
    ctaSecondaryText: "Request a Quote",
    statsYears: "25+",
    statsCountries: "18+",
    statsMachines: "1,200+",
    statsClients: "450+"
  },
  about: {
    heading: "Engineering Excellence in Textile Machinery Since 1998",
    subheading: "Pioneering indigenous innovation and automated machinery for high-yield textile printing plants worldwide.",
    mission: "To engineer robust, precision-driven, and energy-efficient textile machinery that maximizes printing quality while minimizing chemical and water consumption.",
    vision: "To be the globally preferred machinery brand for rotary engraving and automated dye-house kitchens.",
    addressFactory: "Phase-IV, GIDC Vatva Industrial Estate, Ahmedabad, Gujarat 382445, India",
    addressOffice: "V Mark House, Near Ring Road, Odhav, Ahmedabad, Gujarat 382415, India"
  },
  contact: {
    phonePrimary: "+91 98250 12345",
    phoneSecondary: "+91 79 2589 6789",
    emailSales: "sales@vmarkcorporation.com",
    emailSupport: "info@vmarkcorporation.com",
    whatsappNumber: "+919825012345",
    workingHours: "Monday - Saturday: 9:00 AM - 6:30 PM IST"
  },
  footer: {
    bio: "V MARK Corporation is a premier manufacturer and exporter of rotary screen engraving equipment, automatic colour kitchen dosing systems, and textile washing plants.",
    copyright: "© 2026 V MARK Corporation. All Rights Reserved. Engineered with Pride in India."
  }
};

export const INITIAL_INQUIRIES = [
  {
    id: "INQ-2026-001",
    customerName: "Rajesh Patel",
    companyName: "Gujarat Prints Pvt Ltd",
    email: "rajesh.patel@gujaratprints.com",
    phone: "+91 98251 44321",
    country: "India",
    city: "Surat",
    productId: "rotary-screen-coating-machine",
    product: "Rotary Screen Coating Machine",
    quantity: 2,
    message: "We need urgent quotation for 2 units of Rotary Screen Coating Machine with repeat lengths 640mm and 914mm for our Surat processing plant.",
    attachment: null,
    status: "new",
    adminNotes: [
      { admin: "Admin", note: "Customer contacted via phone. Interested in early delivery.", timestamp: "2026-09-27T14:30:00Z" }
    ],
    createdAt: "2026-09-27T10:15:00Z",
    updatedAt: "2026-09-27T14:30:00Z"
  }
];

// Helper to format a product or accessory record cleanly
function formatCatalogItem(item, index = 0) {
  const isAccessory = item.category === 'accessories' || (item.categoryName && item.categoryName.toLowerCase().includes('accessories'));
  const cleanImage = resolveImageUrl(item.image);
  const cleanGallery = Array.isArray(item.galleryImages) && item.galleryImages.length > 0
    ? item.galleryImages.map(img => resolveImageUrl(img))
    : [cleanImage];

  return {
    id: item.id || `prod-${Date.now()}-${index}`,
    name: item.name || 'Industrial Machine',
    slug: item.slug || item.id || `prod-${index}`,
    categoryId: item.categoryId || item.category || (isAccessory ? 'accessories' : 'engraving-rotary'),
    category: item.category || item.categoryId || (isAccessory ? 'accessories' : 'engraving-rotary'),
    categoryName: item.categoryName || (isAccessory ? 'Parts & Accessories' : 'Industrial Machinery'),
    tagline: item.tagline || '',
    badge: item.badge || (isAccessory ? 'Accessory' : 'Machinery'),
    shortDesc: item.shortDesc || '',
    overview: item.overview || item.shortDesc || '',
    image: cleanImage,
    galleryImages: cleanGallery,
    keyFeatures: Array.isArray(item.keyFeatures) ? item.keyFeatures : [],
    specs: Array.isArray(item.specs) ? item.specs : [],
    applications: Array.isArray(item.applications) ? item.applications : [],
    relatedProducts: Array.isArray(item.relatedProducts) ? item.relatedProducts : [],
    compatibleProducts: Array.isArray(item.compatibleProducts) ? item.compatibleProducts : ['Rotary Nickel Screens'],
    status: item.status || 'active',
    displayOrder: Number(item.displayOrder) || index + 1,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString()
  };
}

export function seedInitialData(force = false) {
  const seeded = localStorage.getItem(STORAGE_KEYS.LAST_SEEDED);
  if (seeded && !force) return;

  console.log('[Admin DB] Seeding initial data cache from official catalog...');

  setLocal(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES.map(c => ({ ...c, image: resolveImageUrl(c.image) })));

  const products = [];
  const accessories = [];

  if (Array.isArray(VMARK_PRODUCTS)) {
    VMARK_PRODUCTS.forEach((item, index) => {
      const formatted = formatCatalogItem(item, index);
      if (formatted.category === 'accessories') {
        accessories.push(formatted);
      } else {
        products.push(formatted);
      }
    });
  }

  setLocal(STORAGE_KEYS.PRODUCTS, products);
  setLocal(STORAGE_KEYS.ACCESSORIES, accessories);
  setLocal(STORAGE_KEYS.INQUIRIES, INITIAL_INQUIRIES);
  setLocal(STORAGE_KEYS.MEDIA, INITIAL_MEDIA_ASSETS.map(m => ({ ...m, fileUrl: resolveImageUrl(m.fileUrl) })));
  setLocal(STORAGE_KEYS.CONTENT, INITIAL_CONTENT);
  setLocal(STORAGE_KEYS.SETTINGS, {
    siteTitle: "V MARK Corporation",
    contactEmail: "sales@vmarkcorporation.com",
    contactPhone: "+91 98250 12345",
    whatsappNumber: "+919825012345",
    gstin: "24AAACV1234F1Z8",
    autoNotifyNewInquiry: true,
    currency: "INR"
  });

  localStorage.setItem(STORAGE_KEYS.LAST_SEEDED, 'true');
  broadcastEvent('database_seeded');
}

// Auto-seed local cache on load if empty
if (typeof window !== 'undefined') {
  if (!localStorage.getItem(STORAGE_KEYS.LAST_SEEDED) || getLocal(STORAGE_KEYS.PRODUCTS).length === 0) {
    seedInitialData();
  }
}

// ================= FIRESTORE CLOUD SYNCHRONIZATION =================
let isSyncing = false;
let listenersInitialized = false;

/**
 * Synchronizes local cache with Cloud Firestore database "vmarkcorporation".
 * - Fetches remote products, accessories, categories, media, content.
 * - Merges remote documents with local cache (remote takes precedence).
 * - If Firestore products collection is empty, pushes initial brochure catalog to Firestore.
 */
export async function syncWithFirestore() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    console.log('[Firestore Sync] Connecting to database "vmarkcorporation"...');

    // 1. Fetch products from Firestore
    const productsSnap = await getDocs(collection(db, "products"));
    if (!productsSnap.empty) {
      const firestoreProducts = [];
      productsSnap.forEach(d => {
        const data = d.data();
        firestoreProducts.push(formatCatalogItem({ ...data, id: d.id }));
      });

      const localProducts = getLocal(STORAGE_KEYS.PRODUCTS, []);
      const map = new Map();
      localProducts.forEach(p => map.set(p.id, p));
      firestoreProducts.forEach(p => map.set(p.id, p)); // Firestore overwrites

      const merged = Array.from(map.values());
      setLocal(STORAGE_KEYS.PRODUCTS, merged);
      console.log(`[Firestore Sync] Synced ${firestoreProducts.length} products from "vmarkcorporation".`);
    } else {
      console.log('[Firestore Sync] Firestore "products" collection is empty. Populating default catalog...');
      await pushBrochureCatalogToFirestore();
    }

    // 2. Fetch accessories from Firestore
    try {
      const accSnap = await getDocs(collection(db, "accessories"));
      if (!accSnap.empty) {
        const firestoreAccs = [];
        accSnap.forEach(d => {
          firestoreAccs.push(formatCatalogItem({ ...d.data(), id: d.id }));
        });
        const localAccs = getLocal(STORAGE_KEYS.ACCESSORIES, []);
        const map = new Map();
        localAccs.forEach(a => map.set(a.id, a));
        firestoreAccs.forEach(a => map.set(a.id, a));
        setLocal(STORAGE_KEYS.ACCESSORIES, Array.from(map.values()));
      }
    } catch (e) {
      console.debug('[Firestore Sync] Accessories fetch notice:', e.message);
    }

    // 3. Fetch categories from Firestore
    try {
      const catSnap = await getDocs(collection(db, "categories"));
      if (!catSnap.empty) {
        const firestoreCats = [];
        catSnap.forEach(d => {
          const data = d.data();
          firestoreCats.push({ ...data, id: d.id, image: resolveImageUrl(data.image) });
        });
        setLocal(STORAGE_KEYS.CATEGORIES, firestoreCats);
      }
    } catch (e) {
      console.debug('[Firestore Sync] Categories fetch notice:', e.message);
    }

    // 4. Fetch site content from Firestore
    try {
      const contentSnap = await getDocs(collection(db, "site_content"));
      if (!contentSnap.empty) {
        const localContent = getLocal(STORAGE_KEYS.CONTENT, INITIAL_CONTENT);
        contentSnap.forEach(d => {
          localContent[d.id] = { ...(localContent[d.id] || {}), ...d.data() };
        });
        setLocal(STORAGE_KEYS.CONTENT, localContent);
      }
    } catch (e) {
      console.debug('[Firestore Sync] Content fetch notice:', e.message);
    }

    // 5. Fetch inquiries from Firestore database "vmarkcorporation"
    try {
      const inqSnap = await getDocs(collection(db, "inquiries"));
      if (!inqSnap.empty) {
        const firestoreInqs = [];
        inqSnap.forEach(d => {
          firestoreInqs.push({ ...d.data(), id: d.id });
        });
        const localInqs = getLocal(STORAGE_KEYS.INQUIRIES, []);
        const map = new Map();
        localInqs.forEach(i => map.set(i.id, i));
        firestoreInqs.forEach(i => map.set(i.id, i));
        const mergedInqs = Array.from(map.values());
        mergedInqs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setLocal(STORAGE_KEYS.INQUIRIES, mergedInqs);
        console.log(`[Firestore Sync] Synced ${firestoreInqs.length} customer inquiries from "vmarkcorporation".`);
      }
    } catch (e) {
      console.debug('[Firestore Sync] Inquiries fetch notice:', e.message);
    }

    // 6. Setup live listeners
    setupFirestoreListeners();

    broadcastEvent('cloud_synced');
  } catch (err) {
    console.warn('[Firestore Sync] Sync warning (running with offline cache):', err.message);
  } finally {
    isSyncing = false;
  }
}

/**
 * Automatically uploads initial default brochure items to Firestore database "vmarkcorporation"
 * so all equipment documents are permanently saved in the Cloud database.
 */
export async function pushBrochureCatalogToFirestore() {
  try {
    const products = getLocal(STORAGE_KEYS.PRODUCTS, []);
    const categories = getLocal(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);

    // Save categories
    for (const cat of categories) {
      await setDoc(doc(db, "categories", cat.id), cat, { merge: true });
    }

    // Save products
    for (const prod of products) {
      await setDoc(doc(db, "products", prod.id), prod, { merge: true });
    }

    console.log(`[Firestore Sync] Successfully pushed ${products.length} products to Firestore database "vmarkcorporation".`);
  } catch (err) {
    console.warn('[Firestore Sync] Push catalog notice:', err.message);
  }
}

/**
 * Sets up real-time onSnapshot listeners on Firestore database "vmarkcorporation"
 */
export function setupFirestoreListeners() {
  if (listenersInitialized || typeof window === 'undefined') return;
  listenersInitialized = true;

  try {
    // Listen to Products
    onSnapshot(collection(db, "products"), (snapshot) => {
      if (snapshot.empty) return;
      const remoteProds = [];
      snapshot.forEach(d => {
        remoteProds.push(formatCatalogItem({ ...d.data(), id: d.id }));
      });

      const localProds = getLocal(STORAGE_KEYS.PRODUCTS, []);
      const map = new Map();
      localProds.forEach(p => map.set(p.id, p));
      remoteProds.forEach(p => map.set(p.id, p));

      setLocal(STORAGE_KEYS.PRODUCTS, Array.from(map.values()));
      broadcastEvent('product_updated_live');
    }, (err) => console.debug('[Firestore Listener] Products listener:', err.message));

    // Listen to Inquiries
    onSnapshot(collection(db, "inquiries"), (snapshot) => {
      if (snapshot.empty) return;
      const remoteInquiries = [];
      snapshot.forEach(d => {
        remoteInquiries.push({ ...d.data(), id: d.id });
      });

      const localInqs = getLocal(STORAGE_KEYS.INQUIRIES, []);
      const map = new Map();
      localInqs.forEach(i => map.set(i.id, i));
      remoteInquiries.forEach(i => map.set(i.id, i));

      const mergedInqs = Array.from(map.values());
      mergedInqs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setLocal(STORAGE_KEYS.INQUIRIES, mergedInqs);
      broadcastEvent('inquiry_created_live', remoteInquiries[0] || null);
    }, (err) => console.debug('[Firestore Listener] Inquiries listener:', err.message));

  } catch (err) {
    console.debug('[Firestore Listener] Listener init notice:', err.message);
  }
}

// Auto-trigger sync on window load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncWithFirestore();
  }, 100);
}

// ================= CRUD: PRODUCTS =================
export async function getAllProducts(filterOptions = {}) {
  // 1. Fetch live snapshot from Firestore if online
  try {
    const snap = await getDocs(collection(db, "products"));
    if (!snap.empty) {
      const firestoreProducts = [];
      snap.forEach(d => {
        firestoreProducts.push(formatCatalogItem({ ...d.data(), id: d.id }));
      });

      const localProducts = getLocal(STORAGE_KEYS.PRODUCTS, []);
      const map = new Map();
      localProducts.forEach(p => map.set(p.id, p));
      firestoreProducts.forEach(p => map.set(p.id, p)); // Firestore takes priority

      const merged = Array.from(map.values());
      setLocal(STORAGE_KEYS.PRODUCTS, merged);
    }
  } catch (err) {
    console.debug('[Admin DB] Firestore getAllProducts fallback to cache:', err.message);
  }

  let products = getLocal(STORAGE_KEYS.PRODUCTS, []);

  // Ensure image URLs are resolved
  products = products.map(p => ({
    ...p,
    image: resolveImageUrl(p.image),
    galleryImages: Array.isArray(p.galleryImages) && p.galleryImages.length > 0
      ? p.galleryImages.map(resolveImageUrl)
      : [resolveImageUrl(p.image)]
  }));
  
  // Apply filters
  if (filterOptions.category && filterOptions.category !== 'all') {
    products = products.filter(p => p.categoryId === filterOptions.category || p.category === filterOptions.category);
  }
  if (filterOptions.status && filterOptions.status !== 'all') {
    products = products.filter(p => p.status === filterOptions.status);
  }
  if (filterOptions.search) {
    const q = filterOptions.search.toLowerCase().trim();
    products = products.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.shortDesc && p.shortDesc.toLowerCase().includes(q)) ||
      (p.tagline && p.tagline.toLowerCase().includes(q)) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(q))
    );
  }

  // Sort
  if (filterOptions.sortBy === 'name') {
    products.sort((a, b) => a.name.localeCompare(b.name));
  } else if (filterOptions.sortBy === 'date') {
    products.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  } else {
    products.sort((a, b) => (Number(a.displayOrder) || 999) - (Number(b.displayOrder) || 999));
  }

  return products;
}

export async function getProductById(id) {
  if (!id) return null;
  const cleanId = id.trim();

  // Try direct fetch from Firestore database "vmarkcorporation"
  try {
    const docRef = doc(db, "products", cleanId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const product = formatCatalogItem({ ...docSnap.data(), id: docSnap.id });
      // Update local cache
      const products = getLocal(STORAGE_KEYS.PRODUCTS, []);
      const idx = products.findIndex(p => p.id === cleanId || p.slug === cleanId);
      if (idx !== -1) {
        products[idx] = product;
      } else {
        products.push(product);
      }
      setLocal(STORAGE_KEYS.PRODUCTS, products);
      return product;
    }
  } catch (err) {
    console.debug('[Admin DB] Firestore getDoc notice:', err.message);
  }

  // Fallback to local cache
  const products = getLocal(STORAGE_KEYS.PRODUCTS, []);
  const found = products.find(p => p.id === cleanId || p.slug === cleanId);
  if (found) {
    return formatCatalogItem(found);
  }
  return null;
}

export async function saveProduct(productData) {
  const products = getLocal(STORAGE_KEYS.PRODUCTS, []);
  const now = new Date().toISOString();

  const cleanImage = resolveImageUrl(productData.image);
  const cleanGallery = Array.isArray(productData.galleryImages) && productData.galleryImages.length > 0
    ? productData.galleryImages.map(resolveImageUrl)
    : [cleanImage];

  // If no ID or new product
  if (!productData.id) {
    const newId = (productData.slug || productData.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let uniqueId = newId;
    let counter = 1;
    while (products.some(p => p.id === uniqueId)) {
      uniqueId = `${newId}-${counter++}`;
    }

    const newProduct = {
      ...productData,
      id: uniqueId,
      slug: uniqueId,
      image: cleanImage,
      galleryImages: cleanGallery,
      status: productData.status || 'active',
      displayOrder: Number(productData.displayOrder) || products.length + 1,
      createdAt: now,
      updatedAt: now
    };

    products.push(newProduct);
    setLocal(STORAGE_KEYS.PRODUCTS, products);

    // Save directly to Firestore database "vmarkcorporation"
    try {
      await setDoc(doc(db, "products", uniqueId), newProduct, { merge: true });
      console.log(`[Admin DB] Saved new product "${uniqueId}" to Firestore database "vmarkcorporation"`);
    } catch (e) {
      console.warn('Firestore sync product pending:', e.message);
    }

    broadcastEvent('product_created', newProduct);
    return { success: true, product: newProduct, id: uniqueId };
  } else {
    // Update existing
    const index = products.findIndex(p => p.id === productData.id);
    const existing = index !== -1 ? products[index] : {};

    const updatedProduct = {
      ...existing,
      ...productData,
      image: cleanImage,
      galleryImages: cleanGallery,
      updatedAt: now
    };

    if (index !== -1) {
      products[index] = updatedProduct;
    } else {
      products.push(updatedProduct);
    }
    setLocal(STORAGE_KEYS.PRODUCTS, products);

    // Save directly to Firestore database "vmarkcorporation"
    try {
      await setDoc(doc(db, "products", updatedProduct.id), updatedProduct, { merge: true });
      console.log(`[Admin DB] Updated product "${updatedProduct.id}" in Firestore database "vmarkcorporation"`);
    } catch (e) {
      console.warn('Firestore update product pending:', e.message);
    }

    broadcastEvent('product_updated', updatedProduct);
    return { success: true, product: updatedProduct, id: updatedProduct.id };
  }
}

export async function deleteProduct(id) {
  let products = getLocal(STORAGE_KEYS.PRODUCTS, []);
  products = products.filter(p => p.id !== id);
  setLocal(STORAGE_KEYS.PRODUCTS, products);

  // Delete from Firestore database "vmarkcorporation"
  try {
    await deleteDoc(doc(db, "products", id));
    console.log(`[Admin DB] Deleted product "${id}" from Firestore database "vmarkcorporation"`);
  } catch (e) {
    console.warn('Firestore delete product pending:', e.message);
  }

  broadcastEvent('product_deleted', { id });
  return { success: true };
}

export async function toggleProductStatus(id, newStatus) {
  const products = getLocal(STORAGE_KEYS.PRODUCTS, []);
  const product = products.find(p => p.id === id);
  if (!product) return { success: false, error: 'Product not found' };

  product.status = newStatus || (product.status === 'active' ? 'inactive' : 'active');
  product.updatedAt = new Date().toISOString();

  setLocal(STORAGE_KEYS.PRODUCTS, products);

  try {
    await updateDoc(doc(db, "products", id), { status: product.status, updatedAt: product.updatedAt });
  } catch (e) {
    console.warn('Firestore toggle status pending:', e.message);
  }

  broadcastEvent('product_updated', product);
  return { success: true, status: product.status };
}

// ================= CRUD: ACCESSORIES =================
export async function getAllAccessories(filterOptions = {}) {
  // Sync live from Firestore
  try {
    const snap = await getDocs(collection(db, "accessories"));
    if (!snap.empty) {
      const firestoreAccs = [];
      snap.forEach(d => {
        firestoreAccs.push(formatCatalogItem({ ...d.data(), id: d.id }));
      });
      const localAccs = getLocal(STORAGE_KEYS.ACCESSORIES, []);
      const map = new Map();
      localAccs.forEach(a => map.set(a.id, a));
      firestoreAccs.forEach(a => map.set(a.id, a));
      setLocal(STORAGE_KEYS.ACCESSORIES, Array.from(map.values()));
    }
  } catch (e) {
    console.debug('[Admin DB] Accessories sync notice:', e.message);
  }

  let accessories = getLocal(STORAGE_KEYS.ACCESSORIES, []);
  accessories = accessories.map(a => formatCatalogItem(a));
  
  if (filterOptions.status && filterOptions.status !== 'all') {
    accessories = accessories.filter(a => a.status === filterOptions.status);
  }
  if (filterOptions.search) {
    const q = filterOptions.search.toLowerCase().trim();
    accessories = accessories.filter(a => 
      (a.name && a.name.toLowerCase().includes(q)) ||
      (a.shortDesc && a.shortDesc.toLowerCase().includes(q))
    );
  }

  accessories.sort((a, b) => (Number(a.displayOrder) || 999) - (Number(b.displayOrder) || 999));
  return accessories;
}

export async function getAccessoryById(id) {
  const accessories = getLocal(STORAGE_KEYS.ACCESSORIES, []);
  const found = accessories.find(a => a.id === id || a.slug === id);
  return found ? formatCatalogItem(found) : null;
}

export async function saveAccessory(data) {
  const accessories = getLocal(STORAGE_KEYS.ACCESSORIES, []);
  const now = new Date().toISOString();
  const cleanImage = resolveImageUrl(data.image);

  if (!data.id) {
    const newId = (data.slug || data.name || 'accessory')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    let uniqueId = newId;
    let counter = 1;
    while (accessories.some(a => a.id === uniqueId)) {
      uniqueId = `${newId}-${counter++}`;
    }

    const newAcc = {
      ...data,
      id: uniqueId,
      slug: uniqueId,
      image: cleanImage,
      category: 'accessories',
      categoryName: 'Parts & Accessories',
      status: data.status || 'active',
      displayOrder: Number(data.displayOrder) || accessories.length + 1,
      createdAt: now,
      updatedAt: now
    };

    accessories.push(newAcc);
    setLocal(STORAGE_KEYS.ACCESSORIES, accessories);

    try {
      await setDoc(doc(db, "accessories", uniqueId), newAcc, { merge: true });
    } catch (e) {
      console.warn('Firestore sync accessory pending:', e.message);
    }

    broadcastEvent('accessory_created', newAcc);
    return { success: true, accessory: newAcc, id: uniqueId };
  } else {
    const index = accessories.findIndex(a => a.id === data.id);
    const existing = index !== -1 ? accessories[index] : {};

    const updated = {
      ...existing,
      ...data,
      image: cleanImage,
      updatedAt: now
    };

    if (index !== -1) {
      accessories[index] = updated;
    } else {
      accessories.push(updated);
    }
    setLocal(STORAGE_KEYS.ACCESSORIES, accessories);

    try {
      await setDoc(doc(db, "accessories", updated.id), updated, { merge: true });
    } catch (e) {
      console.warn('Firestore update accessory pending:', e.message);
    }

    broadcastEvent('accessory_updated', updated);
    return { success: true, accessory: updated, id: updated.id };
  }
}

export async function deleteAccessory(id) {
  let accessories = getLocal(STORAGE_KEYS.ACCESSORIES, []);
  accessories = accessories.filter(a => a.id !== id);
  setLocal(STORAGE_KEYS.ACCESSORIES, accessories);

  try {
    await deleteDoc(doc(db, "accessories", id));
  } catch (e) {
    console.warn('Firestore delete accessory pending:', e.message);
  }

  broadcastEvent('accessory_deleted', { id });
  return { success: true };
}

export async function toggleAccessoryStatus(id, newStatus) {
  const accessories = getLocal(STORAGE_KEYS.ACCESSORIES, []);
  const acc = accessories.find(a => a.id === id);
  if (!acc) return { success: false, error: 'Accessory not found' };

  acc.status = newStatus || (acc.status === 'active' ? 'inactive' : 'active');
  acc.updatedAt = new Date().toISOString();
  setLocal(STORAGE_KEYS.ACCESSORIES, accessories);

  try {
    await updateDoc(doc(db, "accessories", id), { status: acc.status, updatedAt: acc.updatedAt });
  } catch (e) {
    console.warn('Firestore toggle accessory status pending:', e.message);
  }

  broadcastEvent('accessory_updated', acc);
  return { success: true, status: acc.status };
}

// ================= CRUD: CATEGORIES =================
export async function getAllCategories() {
  const categories = getLocal(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  const products = getLocal(STORAGE_KEYS.PRODUCTS, []);
  
  return categories.map(cat => {
    const count = products.filter(p => p.categoryId === cat.id || p.category === cat.id).length;
    return {
      ...cat,
      image: resolveImageUrl(cat.image),
      productCount: count
    };
  }).sort((a, b) => (Number(a.displayOrder) || 999) - (Number(b.displayOrder) || 999));
}

export async function getCategoryById(id) {
  const categories = getLocal(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  const found = categories.find(c => c.id === id || c.slug === id);
  return found ? { ...found, image: resolveImageUrl(found.image) } : null;
}

export async function saveCategory(categoryData) {
  const categories = getLocal(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  const now = new Date().toISOString();
  const cleanImage = resolveImageUrl(categoryData.image);

  if (!categoryData.id) {
    const slug = (categoryData.slug || categoryData.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const newCat = {
      ...categoryData,
      id: slug,
      slug: slug,
      image: cleanImage,
      status: categoryData.status || 'active',
      displayOrder: Number(categoryData.displayOrder) || categories.length + 1,
      createdAt: now,
      updatedAt: now
    };

    categories.push(newCat);
    setLocal(STORAGE_KEYS.CATEGORIES, categories);

    try {
      await setDoc(doc(db, "categories", slug), newCat, { merge: true });
    } catch (e) {
      console.warn('Firestore save category pending:', e.message);
    }

    broadcastEvent('category_created', newCat);
    return { success: true, category: newCat, id: slug };
  } else {
    const index = categories.findIndex(c => c.id === categoryData.id);
    const existing = index !== -1 ? categories[index] : {};

    const updated = {
      ...existing,
      ...categoryData,
      image: cleanImage,
      updatedAt: now
    };

    if (index !== -1) {
      categories[index] = updated;
    } else {
      categories.push(updated);
    }
    setLocal(STORAGE_KEYS.CATEGORIES, categories);

    try {
      await setDoc(doc(db, "categories", updated.id), updated, { merge: true });
    } catch (e) {
      console.warn('Firestore update category pending:', e.message);
    }

    broadcastEvent('category_updated', updated);
    return { success: true, category: updated, id: updated.id };
  }
}

export async function deleteCategory(id) {
  let categories = getLocal(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  categories = categories.filter(c => c.id !== id);
  setLocal(STORAGE_KEYS.CATEGORIES, categories);

  try {
    await deleteDoc(doc(db, "categories", id));
  } catch (e) {
    console.warn('Firestore delete category pending:', e.message);
  }

  broadcastEvent('category_deleted', { id });
  return { success: true };
}

// ================= CRUD: INQUIRIES =================
export async function getAllInquiries(filters = {}) {
  // Try live fetch from Firestore
  try {
    const snap = await getDocs(collection(db, "inquiries"));
    if (!snap.empty) {
      const firestoreInqs = [];
      snap.forEach(d => {
        firestoreInqs.push({ ...d.data(), id: d.id });
      });
      const localInqs = getLocal(STORAGE_KEYS.INQUIRIES, []);
      const map = new Map();
      localInqs.forEach(i => map.set(i.id, i));
      firestoreInqs.forEach(i => map.set(i.id, i));
      setLocal(STORAGE_KEYS.INQUIRIES, Array.from(map.values()));
    }
  } catch (e) {
    console.debug('[Admin DB] Inquiries sync notice:', e.message);
  }

  let inquiries = getLocal(STORAGE_KEYS.INQUIRIES, []);

  if (filters.status && filters.status !== 'all') {
    inquiries = inquiries.filter(inq => inq.status === filters.status);
  }
  if (filters.productId && filters.productId !== 'all') {
    inquiries = inquiries.filter(inq => inq.productId === filters.productId || inq.product === filters.productId);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    inquiries = inquiries.filter(inq => 
      (inq.customerName && inq.customerName.toLowerCase().includes(q)) ||
      (inq.companyName && inq.companyName.toLowerCase().includes(q)) ||
      (inq.email && inq.email.toLowerCase().includes(q)) ||
      (inq.phone && inq.phone.toLowerCase().includes(q)) ||
      (inq.product && inq.product.toLowerCase().includes(q)) ||
      (inq.id && inq.id.toLowerCase().includes(q))
    );
  }

  inquiries.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return inquiries;
}

export async function getInquiryById(id) {
  if (!id) return null;
  const inquiries = getLocal(STORAGE_KEYS.INQUIRIES, []);
  const found = inquiries.find(inq => inq.id === id);
  if (found) return found;

  try {
    const snap = await getDoc(doc(db, "inquiries", id));
    if (snap.exists()) {
      const data = { ...snap.data(), id: snap.id };
      inquiries.unshift(data);
      setLocal(STORAGE_KEYS.INQUIRIES, inquiries);
      return data;
    }
  } catch (err) {
    console.debug('Error getting inquiry by ID from Firestore:', err);
  }
  return null;
}

export async function createInquiry(data) {
  const inquiries = getLocal(STORAGE_KEYS.INQUIRIES, []);
  const now = new Date().toISOString();
  const year = new Date().getFullYear();
  // Generate collision-free sequential ID (e.g. INQ-2026-614839)
  const timeSeq = Date.now().toString().slice(-4);
  const rand = Math.floor(100 + Math.random() * 900);
  const generatedId = `INQ-${year}-${timeSeq}${rand}`;

  const newInquiry = {
    id: generatedId,
    customerName: data.name || data.customerName || 'Anonymous Customer',
    companyName: data.company || data.companyName || 'Not Specified',
    email: data.email || '',
    phone: data.phone || '',
    country: data.country || 'India',
    city: data.city || '',
    productId: data.productId || '',
    product: data.product || 'General Textile Machinery',
    quantity: Number(data.quantity) || 1,
    message: data.message || '',
    attachment: data.attachment || null,
    status: 'new',
    adminNotes: [],
    createdAt: now,
    updatedAt: now
  };

  inquiries.unshift(newInquiry);
  setLocal(STORAGE_KEYS.INQUIRIES, inquiries);

  // Sync to Cloud Firestore database "vmarkcorporation"
  try {
    await setDoc(doc(db, "inquiries", generatedId), newInquiry);
    console.log(`[Admin DB] Inquiry "${generatedId}" saved to Firestore database "vmarkcorporation"`);
  } catch (err) {
    console.error('Firestore inquiry sync error:', err);
    throw err;
  }

  broadcastEvent('inquiry_created', newInquiry);
  return { success: true, inquiry: newInquiry, id: generatedId };
}

export async function updateInquiryStatus(id, newStatus) {
  const inquiries = getLocal(STORAGE_KEYS.INQUIRIES, []);
  const inquiry = inquiries.find(inq => inq.id === id);
  if (!inquiry) return { success: false, error: 'Inquiry not found' };

  inquiry.status = newStatus;
  inquiry.updatedAt = new Date().toISOString();
  setLocal(STORAGE_KEYS.INQUIRIES, inquiries);

  try {
    await updateDoc(doc(db, "inquiries", id), { status: newStatus, updatedAt: inquiry.updatedAt });
  } catch (e) {
    console.warn('Firestore inquiry status sync pending:', e.message);
  }

  broadcastEvent('inquiry_updated', inquiry);
  return { success: true, inquiry };
}

export async function addInquiryNote(id, noteText, adminName = 'Admin') {
  const inquiries = getLocal(STORAGE_KEYS.INQUIRIES, []);
  const inquiry = inquiries.find(inq => inq.id === id);
  if (!inquiry) return { success: false, error: 'Inquiry not found' };

  if (!Array.isArray(inquiry.adminNotes)) {
    inquiry.adminNotes = [];
  }

  const newNote = {
    admin: adminName,
    note: noteText,
    timestamp: new Date().toISOString()
  };

  inquiry.adminNotes.push(newNote);
  inquiry.updatedAt = new Date().toISOString();
  setLocal(STORAGE_KEYS.INQUIRIES, inquiries);

  try {
    await updateDoc(doc(db, "inquiries", id), { adminNotes: inquiry.adminNotes, updatedAt: inquiry.updatedAt });
  } catch (e) {
    console.warn('Firestore note sync pending:', e.message);
  }

  broadcastEvent('inquiry_updated', inquiry);
  return { success: true, note: newNote, inquiry };
}

export async function deleteInquiry(id) {
  let inquiries = getLocal(STORAGE_KEYS.INQUIRIES, []);
  inquiries = inquiries.filter(inq => inq.id !== id);
  setLocal(STORAGE_KEYS.INQUIRIES, inquiries);

  try {
    await deleteDoc(doc(db, "inquiries", id));
  } catch (e) {
    console.warn('Firestore delete inquiry pending:', e.message);
  }

  broadcastEvent('inquiry_deleted', { id });
  return { success: true };
}

export function exportInquiriesToCSV(inquiriesList) {
  if (!inquiriesList || inquiriesList.length === 0) return null;

  const headers = [
    'Inquiry ID',
    'Customer Name',
    'Company',
    'Email',
    'Phone',
    'Country',
    'City',
    'Product Requested',
    'Quantity',
    'Status',
    'Submitted Date',
    'Customer Message'
  ];

  const rows = inquiriesList.map(item => [
    `"${item.id || ''}"`,
    `"${(item.customerName || '').replace(/"/g, '""')}"`,
    `"${(item.companyName || '').replace(/"/g, '""')}"`,
    `"${item.email || ''}"`,
    `"${item.phone || ''}"`,
    `"${item.country || ''}"`,
    `"${item.city || ''}"`,
    `"${(item.product || '').replace(/"/g, '""')}"`,
    item.quantity || 1,
    `"${item.status || ''}"`,
    `"${item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}"`,
    `"${(item.message || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `VMark_Inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

// ================= CRUD: MEDIA LIBRARY =================
export async function getAllMedia(folder = 'all', searchQuery = '') {
  // Sync live from Firestore
  try {
    const snap = await getDocs(collection(db, "media"));
    if (!snap.empty) {
      const firestoreMedia = [];
      snap.forEach(d => {
        const data = d.data();
        firestoreMedia.push({
          ...data,
          id: d.id,
          fileUrl: resolveImageUrl(data.fileUrl)
        });
      });
      const localMedia = getLocal(STORAGE_KEYS.MEDIA, INITIAL_MEDIA_ASSETS);
      const map = new Map();
      localMedia.forEach(m => map.set(m.id, m));
      firestoreMedia.forEach(m => map.set(m.id, m));
      setLocal(STORAGE_KEYS.MEDIA, Array.from(map.values()));
    }
  } catch (e) {
    console.debug('[Admin DB] Media sync notice:', e.message);
  }

  let media = getLocal(STORAGE_KEYS.MEDIA, INITIAL_MEDIA_ASSETS);
  media = media.map(m => ({ ...m, fileUrl: resolveImageUrl(m.fileUrl) }));

  if (folder && folder !== 'all') {
    media = media.filter(m => m.folder === folder);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    media = media.filter(m => 
      (m.fileName && m.fileName.toLowerCase().includes(q)) ||
      (m.usedIn && m.usedIn.some(u => u.toLowerCase().includes(q)))
    );
  }

  media.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return media;
}

export async function saveMediaItem(mediaItem) {
  const media = getLocal(STORAGE_KEYS.MEDIA, INITIAL_MEDIA_ASSETS);
  const now = new Date().toISOString();
  const cleanUrl = resolveImageUrl(mediaItem.fileUrl);

  const newMedia = {
    ...mediaItem,
    id: mediaItem.id || `m-${Date.now()}`,
    fileUrl: cleanUrl,
    createdAt: mediaItem.createdAt || now
  };

  media.unshift(newMedia);
  setLocal(STORAGE_KEYS.MEDIA, media);

  try {
    await setDoc(doc(db, "media", newMedia.id), newMedia, { merge: true });
  } catch (e) {
    console.warn('Firestore save media pending:', e.message);
  }

  broadcastEvent('media_uploaded', newMedia);
  return { success: true, media: newMedia };
}

export async function deleteMediaItem(id) {
  let media = getLocal(STORAGE_KEYS.MEDIA, INITIAL_MEDIA_ASSETS);
  media = media.filter(m => m.id !== id);
  setLocal(STORAGE_KEYS.MEDIA, media);

  try {
    await deleteDoc(doc(db, "media", id));
  } catch (e) {
    console.warn('Firestore delete media pending:', e.message);
  }

  broadcastEvent('media_deleted', { id });
  return { success: true };
}

// ================= CRUD: SITE CONTENT =================
export async function getSiteContent(section = null) {
  const content = getLocal(STORAGE_KEYS.CONTENT, INITIAL_CONTENT);
  return section ? (content[section] || {}) : content;
}

export async function saveSiteContent(section, sectionData) {
  const content = getLocal(STORAGE_KEYS.CONTENT, INITIAL_CONTENT);
  content[section] = {
    ...(content[section] || {}),
    ...sectionData,
    updatedAt: new Date().toISOString()
  };
  setLocal(STORAGE_KEYS.CONTENT, content);

  try {
    await setDoc(doc(db, "site_content", section), content[section], { merge: true });
  } catch (e) {
    console.warn('Firestore content sync pending:', e.message);
  }

  broadcastEvent('content_updated', { section, data: content[section] });
  return { success: true, content: content[section] };
}

// ================= DASHBOARD STATS =================
export async function getDashboardStats() {
  // Sync inquiries from Firestore database "vmarkcorporation" if available
  try {
    const inqSnap = await getDocs(collection(db, "inquiries"));
    if (!inqSnap.empty) {
      const firestoreInqs = [];
      inqSnap.forEach(d => {
        firestoreInqs.push({ ...d.data(), id: d.id });
      });
      const localInqs = getLocal(STORAGE_KEYS.INQUIRIES, []);
      const map = new Map();
      localInqs.forEach(i => map.set(i.id, i));
      firestoreInqs.forEach(i => map.set(i.id, i));
      const mergedInqs = Array.from(map.values());
      mergedInqs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setLocal(STORAGE_KEYS.INQUIRIES, mergedInqs);
    }
  } catch (e) {
    console.debug('[Dashboard Stats] Inquiries fetch notice:', e.message);
  }

  const products = getLocal(STORAGE_KEYS.PRODUCTS, []);
  const accessories = getLocal(STORAGE_KEYS.ACCESSORIES, []);
  const categories = getLocal(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  const inquiries = getLocal(STORAGE_KEYS.INQUIRIES, []);
  inquiries.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const media = getLocal(STORAGE_KEYS.MEDIA, INITIAL_MEDIA_ASSETS);

  const newInquiries = inquiries.filter(i => i.status === 'new').length;
  const inProgressInquiries = inquiries.filter(i => i.status === 'in-progress' || i.status === 'contacted').length;

  return {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'active').length,
    totalAccessories: accessories.length,
    totalCategories: categories.length,
    totalInquiries: inquiries.length,
    newInquiries: newInquiries,
    inProgressInquiries: inProgressInquiries,
    totalMedia: media.length,
    recentInquiries: inquiries.slice(0, 5)
  };
}

// ================= BACKUP & EXPORT =================
export function exportDatabaseJSON() {
  const fullBackup = {
    exportedAt: new Date().toISOString(),
    version: "2.0",
    database: "vmarkcorporation",
    storageBucket: "vmark-corporation.firebasestorage.app",
    products: getLocal(STORAGE_KEYS.PRODUCTS, []),
    accessories: getLocal(STORAGE_KEYS.ACCESSORIES, []),
    categories: getLocal(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES),
    inquiries: getLocal(STORAGE_KEYS.INQUIRIES, []),
    media: getLocal(STORAGE_KEYS.MEDIA, INITIAL_MEDIA_ASSETS),
    content: getLocal(STORAGE_KEYS.CONTENT, INITIAL_CONTENT),
    settings: getLocal(STORAGE_KEYS.SETTINGS, {})
  };

  const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `VMark_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
