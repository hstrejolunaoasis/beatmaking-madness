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
    // Use a stable timestamp based on the path itself to prevent frequent reloads
    // This ensures the same audio file gets the same URL during a session
    const stableTimestamp = Math.floor(Date.now() / 300000); // Changes every 5 minutes
    return `${path}${path.includes('?') ? '&' : '?'}t=${stableTimestamp}`;
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
        const stableTimestamp = Math.floor(Date.now() / 300000); // Changes every 5 minutes
        return `/api/media/${privateParts[1]}?t=${stableTimestamp}`;
      }
    }
    
    const stableTimestamp = Math.floor(Date.now() / 300000); // Changes every 5 minutes
    return `/api/media/${storagePath}?t=${stableTimestamp}`;
  }
  
  // If it's a relative path without the Supabase URL structure, use it directly
  if (!path.includes('://')) {
    // Handle paths with 'private/' in them
    if (path.includes('private/')) {
      // Extract everything after the first occurrence of 'private/'
      const privateParts = path.split('private/');
      if (privateParts.length > 1) {
        // Our API will add 'private/' prefix, so just use what comes after it
        const stableTimestamp = Math.floor(Date.now() / 300000); // Changes every 5 minutes
        return `/api/media/${privateParts[1]}?t=${stableTimestamp}`;
      }
    }
    
    // For paths without 'private/', pass as is - the API will add the prefix
    const stableTimestamp = Math.floor(Date.now() / 300000); // Changes every 5 minutes
    return `/api/media/${path}?t=${stableTimestamp}`;
  }
  
  // Otherwise, return the original URL with a timestamp
  const stableTimestamp = Math.floor(Date.now() / 300000); // Changes every 5 minutes
  return `${path}${path.includes('?') ? '&' : '?'}t=${stableTimestamp}`;
} 