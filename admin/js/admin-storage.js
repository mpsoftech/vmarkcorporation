/**
 * V MARK CORPORATION - Firebase Cloud Storage Service
 * Bucket: gs://vmark-corporation.firebasestorage.app
 * Manages direct upload of product photos, accessories, and brochure assets.
 */

import { storage, ref, uploadBytes, getDownloadURL, deleteObject } from './admin-firebase.js';

/**
 * Uploads an image File or Blob directly to Firebase Cloud Storage.
 * Target Bucket: gs://vmark-corporation.firebasestorage.app
 *
 * @param {File|Blob} fileOrBlob 
 * @param {string} [folder='products'] 'products' | 'accessories' | 'categories' | 'website' | 'banners'
 * @param {string} [customFileName=null]
 * @returns {Promise<{downloadURL: string, storagePath: string, fileName: string, sizeFormatted: string}>}
 */
export async function uploadImageToStorage(fileOrBlob, folder = 'products', customFileName = null) {
  if (!fileOrBlob) {
    throw new Error('No image file provided for upload.');
  }

  // Determine extension & MIME
  let mimeType = fileOrBlob.type || 'image/jpeg';
  let ext = 'jpg';
  if (mimeType.includes('webp')) ext = 'webp';
  else if (mimeType.includes('png')) ext = 'png';
  else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';

  // Construct clean filename
  const rawName = customFileName || fileOrBlob.name || `img_${Date.now()}`;
  const baseName = rawName.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const uniqueFileName = `${Date.now()}_${baseName}.${ext}`;
  const storagePath = `images/${folder}/${uniqueFileName}`;

  console.log(`[Firebase Storage] Uploading to gs://vmark-corporation.firebasestorage.app/${storagePath}...`);

  const storageRef = ref(storage, storagePath);

  // Upload to Cloud Storage
  const snapshot = await uploadBytes(storageRef, fileOrBlob, {
    contentType: mimeType,
    customMetadata: {
      uploadedAt: new Date().toISOString(),
      folder: folder,
      originalName: rawName
    }
  });

  // Retrieve public persistent download URL
  const downloadURL = await getDownloadURL(snapshot.ref);

  const sizeBytes = fileOrBlob.size || 0;
  const sizeFormatted = sizeBytes > 1024 * 1024 
    ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB` 
    : `${Math.round(sizeBytes / 1024)} KB`;

  console.log(`[Firebase Storage] Upload complete! Download URL:`, downloadURL);

  return {
    downloadURL,
    storagePath,
    fullBucketUri: `gs://vmark-corporation.firebasestorage.app/${storagePath}`,
    fileName: uniqueFileName,
    sizeFormatted,
    mimeType
  };
}

/**
 * Deletes an image from Firebase Cloud Storage by its storage path or download URL
 * @param {string} pathOrUrl 
 */
export async function deleteImageFromStorage(pathOrUrl) {
  if (!pathOrUrl) return;

  try {
    let storageRef;
    if (pathOrUrl.startsWith('gs://') || pathOrUrl.startsWith('http')) {
      storageRef = ref(storage, pathOrUrl);
    } else {
      storageRef = ref(storage, pathOrUrl);
    }
    await deleteObject(storageRef);
    console.log(`[Firebase Storage] Deleted object: ${pathOrUrl}`);
  } catch (err) {
    console.warn(`[Firebase Storage] Could not delete file:`, err.message);
  }
}
