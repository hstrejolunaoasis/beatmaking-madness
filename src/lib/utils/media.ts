/**
 * Converts a storage URL to a secure media API URL
 * @param path - The original file path or URL
 * @returns A secure API URL for the file
 */
export function getSecureMediaUrl(path: string): string {
  if (!path) return '';
  
  // If it's already using our secure API endpoint, return as is
  if (path.startsWith('/api/media/')) {
    return path;
  }
  
  // Extract the path from a Supabase URL
  const matches = path.match(/\/storage\/v1\/object\/[^/]+\/([^?]+)/);
  if (matches && matches[1]) {
    const storagePath = matches[1];
    // Return only the part after 'private/' if present since our API adds it automatically
    if (storagePath.startsWith('private/')) {
      return `/api/media/${storagePath.substring(8)}`;
    }
    return `/api/media/${storagePath}`;
  }
  
  // If it's a relative path without the Supabase URL structure, use it directly
  if (!path.includes('://')) {
    // Remove 'private/' prefix if present since our API adds it automatically
    if (path.startsWith('private/')) {
      return `/api/media/${path.substring(8)}`;
    }
    return `/api/media/${path}`;
  }
  
  // Otherwise, return the original URL
  return path;
} 