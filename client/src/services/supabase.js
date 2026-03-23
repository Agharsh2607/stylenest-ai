import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Only create a real Supabase client if credentials are provided
const isConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://your-project.supabase.co'

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured() {
  return isConfigured
}

/**
 * Upload an image file to Supabase Storage bucket "images"
 * Returns the public URL of the uploaded file
 */
export async function uploadImage(file, folder = 'uploads') {
  if (!supabase) throw new Error('Supabase is not configured')
  const fileExt = file.name.split('.').pop()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file, { cacheControl: '3600', upsert: false })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

/**
 * Upload an image from a URL (for AI-generated images)
 */
export async function uploadImageFromUrl(imageUrl, folder = 'generated') {
  if (!supabase) throw new Error('Supabase is not configured')
  const response = await fetch(imageUrl)
  const blob = await response.blob()
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.png`

  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, blob, { contentType: 'image/png', cacheControl: '3600', upsert: false })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

/**
 * Save a design record to the designs table
 */
export async function saveDesign({ userId, originalImage, generatedImage, style }) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('designs')
    .insert([{
      user_id: userId,
      original_image: originalImage,
      generated_image: generatedImage,
      style: style,
    }])
    .select()

  if (error) throw error
  return data[0]
}

/**
 * Fetch all designs for a specific user
 */
export async function fetchUserDesigns(userId) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('designs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Delete a design by ID
 */
export async function deleteDesign(designId) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { error } = await supabase
    .from('designs')
    .delete()
    .eq('id', designId)

  if (error) throw error
}
