// Re-export client-side Supabase client
export * from './client';

// Export utility functions that use Supabase
export async function uploadBeatFile(file: File, path: string) {
  const { supabase } = await import('./client');
  const { data, error } = await supabase.storage
    .from('beats')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Error uploading file: ${error.message}`);
  }

  return data;
}

export async function createBeatWaveform(audioUrl: string, beatId: string) {
  // In a real application, you would use a service like AudioSalad or WaveSurfer.js
  // to generate waveforms for your audio files
  // For this example, we'll just return a placeholder URL
  return `https://placeholder-waveform.com/${beatId}.png`;
}

export async function getBeatFileUrl(path: string) {
  const { supabase } = await import('./client');
  const { data } = supabase.storage.from('beats').getPublicUrl(path);
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