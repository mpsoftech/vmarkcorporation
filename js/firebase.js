/**
 * Firebase Services Configuration & SDK Integration
 * V MARK Corporation - Textile Machinery
 */
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { app, db, storage } from "../admin/js/admin-firebase.js";
import { createInquiry } from "../admin/js/admin-db.js";

export { app, db, storage };

// 3. Initialize Firebase Analytics safely (checks environment & browser capability)
export let analytics = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("[Firebase] Analytics initialized successfully.");
    } else {
      console.info("[Firebase] Analytics not supported in this client environment.");
    }
  }).catch((err) => {
    console.warn("[Firebase] Analytics initialization warning:", err);
  });
}

/**
 * Safely log custom Firebase Analytics events
 * @param {string} eventName 
 * @param {object} [eventParams={}] 
 */
export function trackEvent(eventName, eventParams = {}) {
  try {
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    }
  } catch (err) {
    console.debug(`[Firebase Analytics] Event ${eventName} failed to log:`, err);
  }
}

/**
 * Log standard GA4 / Firebase view_item event when viewing equipment details
 * @param {object} product 
 */
export function trackProductView(product) {
  if (!product) return;
  trackEvent("view_item", {
    currency: "INR",
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.categoryName || product.category
      }
    ]
  });
}

/**
 * Log catalog category selection
 * @param {string} category 
 */
export function trackCategoryFilter(category) {
  trackEvent("select_content", {
    content_type: "machinery_category",
    item_id: category
  });
}

/**
 * Log catalog search query
 * @param {string} searchTerm 
 */
export function trackSearch(searchTerm) {
  if (!searchTerm) return;
  trackEvent("search", {
    search_term: searchTerm
  });
}

/**
 * Log contact interactions (WhatsApp, Phone, Email)
 * @param {string} method - 'whatsapp' | 'phone' | 'email'
 * @param {string} [context='general'] 
 */
export function trackContactInteraction(method, context = "general") {
  trackEvent("contact", {
    method: method,
    context: context
  });
}

/**
 * Submit an RFQ inquiry to Cloud Firestore & Admin Panel and record lead conversion in Analytics
 * @param {object} inquiryData 
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function submitRFQ(inquiryData) {
  try {
    // 1. Create in Admin Database (Dual Layer: Firestore + Persistent Store + Cross-tab broadcast)
    const adminDbResult = await createInquiry({
      name: inquiryData.name,
      company: inquiryData.company,
      email: inquiryData.email,
      phone: inquiryData.phone,
      country: inquiryData.country || "India",
      city: inquiryData.city || "",
      product: inquiryData.product,
      quantity: Number(inquiryData.quantity) || 1,
      message: inquiryData.message || "",
      attachment: inquiryData.attachment || null
    });

    // 2. Record generate_lead conversion event in Firebase Analytics
    trackEvent("generate_lead", {
      currency: "INR",
      value: 1,
      lead_source: "website_rfq",
      machinery_requested: inquiryData.product,
      company_name: inquiryData.company,
      inquiry_id: adminDbResult.id
    });

    console.log(`[Firebase & Admin DB] RFQ logged successfully with ID: ${adminDbResult.id}`);
    return { success: true, id: adminDbResult.id };
  } catch (error) {
    console.error("[Inquiry Submission] Error saving inquiry:", error);
    
    // Log error event in Analytics
    trackEvent("rfq_submission_error", {
      error_message: error.message,
      product: inquiryData.product || "unknown"
    });

    return { success: false, error: error.message };
  }
}
