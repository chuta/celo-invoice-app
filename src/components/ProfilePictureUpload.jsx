import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function ProfilePictureUpload({ currentImageUrl, onUploadSuccess }) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(currentImageUrl)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (event) => {
    try {
      setError('')
      setUploading(true)

      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)')
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        throw new Error('Image size must be less than 5MB')
      }

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)

      // Generate file path: {user_id}/profile.{ext}
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/profile.${fileExt}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true, // Replace existing file
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl

      // Update profile with new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(publicUrl)
      }
    } catch (err) {
      console.error('Error uploading image:', err)
      setError(err.message)
      setPreview(currentImageUrl) // Revert preview on error
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return

    try {
      setError('')
      setUploading(true)

      // Remove from database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image_url: null })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Optionally delete from storage (commented out to keep file history)
      // const fileName = `${user.id}/profile.*`
      // await supabase.storage.from('profile-pictures').remove([fileName])

      setPreview(null)
      if (onUploadSuccess) {
        onUploadSuccess(null)
      }
    } catch (err) {
      console.error('Error removing image:', err)
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Preview */}
        <div className="relative">
          {preview ? (
            <img
              src={preview}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-600">
              {user?.email?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>

        {/* Upload/Remove Buttons */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary text-sm disabled:opacity-50"
            >
              {preview ? 'Change Photo' : 'Upload Photo'}
            </button>
            
            {preview && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            JPG, PNG, WebP or GIF. Max 5MB.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
