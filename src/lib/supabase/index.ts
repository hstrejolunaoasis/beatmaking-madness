// Re-export client-side Supabase client
export * from './client';

// Export utility functions that use Supabase
export async function uploadBeatFile(file: File, folder = "beats") {
  try {
    if (!file) {
      throw new Error("No file provided for upload");
    }
    
    // Validate file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds the 10MB limit (current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
    }
    
    // Validate file type for audio files
    if (folder === "beats") {
      const validAudioTypes = ["audio/mpeg", "audio/wav", "audio/mp3"];
      if (!validAudioTypes.includes(file.type)) {
        throw new Error(`Invalid audio file type: ${file.type}. Please upload MP3 or WAV files only.`);
      }
    }
    
    // Validate file type for images
    if (folder === "beat-images") {
      const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validImageTypes.includes(file.type)) {
        throw new Error(`Invalid image file type: ${file.type}. Please upload JPG or PNG files only.`);
      }
    }
    
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    // Add 'private/' prefix to path as required by bucket policy
    const filePath = `private/${folder}/${fileName}`;
    
    const { supabase } = await import('./client');
    
    const { error } = await supabase.storage
      .from('beats')
      .upload(filePath, file);
    
    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
    
    return filePath;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

export async function createBeatWaveform(filePath: string) {
  try {
    if (!filePath) {
      throw new Error("No file path provided for waveform generation");
    }
    
    // This is a placeholder for waveform generation
    // In a real implementation, we would use an API or server function to generate the waveform
    // For now, we'll return a placeholder URL
    return `/api/waveform?path=${encodeURIComponent(filePath)}`;
  } catch (error) {
    console.error("Waveform generation error:", error);
    throw error;
  }
}

export async function getBeatFileUrl(filePath: string) {
  try {
    if (!filePath) {
      throw new Error("No file path provided");
    }
    
    const { supabase } = await import('./client');
    
    // Get a signed URL that expires in 24 hours instead of a public URL
    const { data, error } = await supabase.storage
      .from('beats')
      .createSignedUrl(filePath, 60 * 60 * 24); // 24 hours expiry
    
    if (error) {
      console.error("Get file URL error:", error);
      throw new Error(`Failed to get file URL: ${error.message}`);
    }
    
    if (!data?.signedUrl) {
      throw new Error("Failed to get signed URL for the file");
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error("Get file URL error:", error);
    throw error;
  }
}

export async function deleteBeatFile(path: string) {
  const { supabase } = await import('./client');
  const { error } = await supabase.storage.from('beats').remove([path]);
  
  if (error) {
    throw new Error(`Error deleting file: ${error.message}`);
  }
  
  return true;
} 