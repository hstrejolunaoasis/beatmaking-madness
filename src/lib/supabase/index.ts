// Re-export client-side Supabase client
export * from './client';

// Export utility functions that use Supabase
export async function uploadBeatFile(file: File, folder = "beats") {
  const { supabase } = await import('./client');
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;
  
  const { error } = await supabase.storage
    .from('public')
    .upload(filePath, file);
  
  if (error) {
    throw error;
  }
  
  return filePath;
}

export async function createBeatWaveform(filePath: string) {
  // This is a placeholder for waveform generation
  // In a real implementation, we would use an API or server function to generate the waveform
  // For now, we'll return a placeholder URL
  return `/api/waveform?path=${encodeURIComponent(filePath)}`;
}

export async function getBeatFileUrl(filePath: string) {
  const { supabase } = await import('./client');
  const { data } = await supabase.storage
    .from('public')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

export async function deleteBeatFile(path: string) {
  const { supabase } = await import('./client');
  const { error } = await supabase.storage.from('beats').remove([path]);
  
  if (error) {
    throw new Error(`Error deleting file: ${error.message}`);
  }
  
  return true;
} 