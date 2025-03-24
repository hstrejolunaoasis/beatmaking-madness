/**
 * Converts a storage URL to a secure media API URL
 * @param path - The original file path or URL
 * @returns A secure API URL for the file
 */
export function getSecureMediaUrl(path: string): string {
  if (!path) return '';
  
  // If it's already using our secure API endpoint, return as is
  if (path.startsWith('/api/media/')) {
    // If URL already has a timestamp or retry param, return it unchanged
    if (path.includes('t=') || path.includes('retry=')) {
      return path;
    }
    // Otherwise add a cache-busting timestamp
    return `${path}${path.includes('?') ? '&' : '?'}t=${Date.now()}`;
  }
  
  // Extract the path from a Supabase URL
  const matches = path.match(/\/storage\/v1\/object\/[^/]+\/([^?]+)/);
  if (matches && matches[1]) {
    let storagePath = matches[1];
    
    // Properly handle paths with 'private/' in them
    if (storagePath.includes('private/')) {
      // Extract everything after the first occurrence of 'private/'
      const privateParts = storagePath.split('private/');
      if (privateParts.length > 1) {
        // Our API will add 'private/' prefix, so just use what comes after it
        return `/api/media/${privateParts[1]}?t=${Date.now()}`;
      }
    }
    
    return `/api/media/${storagePath}?t=${Date.now()}`;
  }
  
  // If it's a relative path without the Supabase URL structure, use it directly
  if (!path.includes('://')) {
    // Handle paths with 'private/' in them
    if (path.includes('private/')) {
      // Extract everything after the first occurrence of 'private/'
      const privateParts = path.split('private/');
      if (privateParts.length > 1) {
        // Our API will add 'private/' prefix, so just use what comes after it
        return `/api/media/${privateParts[1]}?t=${Date.now()}`;
      }
    }
    
    // For paths without 'private/', pass as is - the API will add the prefix
    return `/api/media/${path}?t=${Date.now()}`;
  }
  
  // Otherwise, return the original URL with a timestamp
  return `${path}${path.includes('?') ? '&' : '?'}t=${Date.now()}`;
} 