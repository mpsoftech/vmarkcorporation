/**
 * V MARK CORPORATION - Universal Image URL Resolver
 * Handles:
 * - Firebase Cloud Storage URLs (https://firebasestorage.googleapis.com/...)
 * - External Web URLs (http://, https://)
 * - Data URLs (data:image/...)
 * - Object URLs (blob:...)
 * - Local static brochure assets (/assets/images/...)
 * - Automatically repairs accidental leading slashes on absolute URLs (e.g. "/https://...")
 */
export function resolveImageUrl(url, fallback = '/assets/images/vmark_logo.png') {
  if (!url || typeof url !== 'string') {
    return fallback;
  }

  let clean = url.trim();
  if (!clean) return fallback;

  // Repair accidental leading slashes before full protocol
  if (clean.startsWith('/https://') || clean.startsWith('/http://')) {
    clean = clean.substring(1);
  }

  // Absolute Web URLs or Data / Blob URLs
  if (
    clean.startsWith('https://') ||
    clean.startsWith('http://') ||
    clean.startsWith('data:') ||
    clean.startsWith('blob:')
  ) {
    return clean;
  }

  // gs:// Firebase Storage URIs fallback
  if (clean.startsWith('gs://')) {
    const withoutGs = clean.replace('gs://', '');
    const firstSlash = withoutGs.indexOf('/');
    if (firstSlash !== -1) {
      const bucket = withoutGs.substring(0, firstSlash);
      const path = encodeURIComponent(withoutGs.substring(firstSlash + 1));
      return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${path}?alt=media`;
    }
  }

  // Local assets: ensure single leading slash
  return clean.startsWith('/') ? clean : '/' + clean;
}
