/**
 * Firebase Services Configuration & SDK Integration
 * V MARK Corporation - Textile Machinery
 */
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, logEvent } from "firebase/analytics";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEKBeyYlg5T5cvwZvNTUx5vmaWJIeVUvc",
  authDomain: "vmark-corporation.firebaseapp.com",
  projectId: "vmark-corporation",
  storageBucket: "vmark-corporation.firebasestorage.app",
  messagingSenderId: "759926371618",
  appId: "1:759926371618:web:e550ac1c4f429d3e56217b",
  measurementId: "G-KR4TRHHK7G"
};

// 1. Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// 2. Initialize Cloud Firestore Database
export const db = getFirestore(app);

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
 * Submit an RFQ inquiry to Cloud Firestore and record lead conversion in Analytics
 * @param {object} inquiryData 
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function submitRFQ(inquiryData) {
  try {
    const inquiriesRef = collection(db, "inquiries");
    const docRef = await addDoc(inquiriesRef, {
      name: inquiryData.name,
      company: inquiryData.company,
      email: inquiryData.email,
      phone: inquiryData.phone,
      country: inquiryData.country || "India",
      product: inquiryData.product,
      quantity: Number(inquiryData.quantity) || 1,
      message: inquiryData.message || "",
      source: "website_rfq_form",
      status: "new",
      createdAt: serverTimestamp(),
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown"
    });

    // Record generate_lead conversion event in Firebase Analytics
    trackEvent("generate_lead", {
      currency: "INR",
      value: 1,
      lead_source: "website_rfq",
      machinery_requested: inquiryData.product,
      company_name: inquiryData.company,
      inquiry_id: docRef.id
    });

    console.log(`[Firebase Firestore] RFQ logged successfully with ID: ${docRef.id}`);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("[Firebase Firestore] Error saving inquiry:", error);
    
    // Log error event in Analytics
    trackEvent("rfq_submission_error", {
      error_message: error.message,
      product: inquiryData.product || "unknown"
    });

    return { success: false, error: error.message };
  }
}
