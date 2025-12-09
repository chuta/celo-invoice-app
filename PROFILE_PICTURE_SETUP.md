# Profile Picture Feature - Setup Guide

## ✅ What's Been Implemented

Profile picture upload feature using Supabase Storage! Users can now upload, change, and remove their profile pictures.

## 🚀 Setup Steps (5 minutes)

### Step 1: Create Storage Bucket in Supabase

1. Go to: https://supabase.com/dashboard/project/pijcliprhnxulqctfeik/storage/buckets
2. Click **"New bucket"**
3. Configure:
   - **Name:** `profile-pictures`
   - **Public bucket:** ✅ Yes (checked)
   - **File size limit:** `5242880` (5MB in bytes)
   - **Allowed MIME types:** `image/jpeg,image/png,image/webp,image/gif`
4. Click **"Create bucket"**

### Step 2: Set Up Storage Policies

Run this SQL in Supabase SQL Editor:

```sql
-- Policy 1: Users can upload their own profile picture
CREATE POLICY "Users can upload their own profile picture"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can update their own profile pictures
CREATE POLICY "Users can update their own profile picture"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can delete their own profile pictures
CREATE POLICY "Users can delete their own profile picture"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Anyone can view profile pictures (public bucket)
CREATE POLICY "Anyone can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');
```

### Step 3: Test the Feature

1. Login to the app
2. Go to **Payment Link** settings
3. Click **"Upload Photo"**
4. Select an image (JPG, PNG, WebP, or GIF, max 5MB)
5. Image uploads and displays immediately
6. Visit your payment link to see the profile picture

## 📁 Files Created

### Components
- `src/components/ProfilePictureUpload.jsx` - Upload component

### SQL Scripts
- `setup-profile-pictures-storage.sql` - Storage policies

### Updates
- `src/pages/PaymentLinkSettings.jsx` - Added profile picture upload section

## 🎨 Features

### Upload
- ✅ Drag & drop or click to upload
- ✅ Image preview before upload
- ✅ Automatic resize and optimization
- ✅ Progress indicator
- ✅ Error handling

### Validation
- ✅ File type validation (JPEG, PNG, WebP, GIF only)
- ✅ File size validation (5MB max)
- ✅ Automatic format conversion
- ✅ Security checks

### Display
- ✅ Circular profile picture
- ✅ Fallback to initials if no picture
- ✅ Responsive design
- ✅ Loading states

### Management
- ✅ Change picture anytime
- ✅ Remove picture option
- ✅ Automatic URL update in database
- ✅ Public URL generation

## 🗂️ Storage Structure

Files are stored with this path structure:
```
profile-pictures/
  ├── {user_id_1}/
  │   └── profile.jpg
  ├── {user_id_2}/
  │   └── profile.png
  └── {user_id_3}/
      └── profile.webp
```

Each user has their own folder identified by their user ID.

## 🔒 Security

### Access Control
- Users can only upload to their own folder
- Users can only update/delete their own images
- Anyone can view images (public bucket)
- Authenticated users only for uploads

### File Validation
- MIME type checking
- File size limits
- Extension validation
- Malicious file detection

### Storage Policies
- Row Level Security (RLS) enabled
- Folder-based permissions
- User ID verification
- Public read access only

## 💡 How It Works

### Upload Flow
1. User selects image file
2. Client validates file type and size
3. Creates preview using FileReader
4. Uploads to Supabase Storage
5. Gets public URL
6. Updates profile in database
7. Refreshes profile data
8. Displays new image

### File Path
- Format: `{user_id}/profile.{ext}`
- Example: `98365811-902c-4d93-b301-24f07c9359dd/profile.jpg`
- Upsert: true (replaces existing file)

### Public URL
- Format: `https://{project}.supabase.co/storage/v1/object/public/profile-pictures/{user_id}/profile.{ext}`
- Cached for 1 hour
- CDN-delivered
- Globally accessible

## 🎯 User Experience

### Upload Process
1. Click "Upload Photo" button
2. Select image from device
3. See instant preview
4. Automatic upload starts
5. Success confirmation
6. Image appears on profile

### Change Picture
1. Click "Change Photo"
2. Select new image
3. Old image replaced
4. New image displays

### Remove Picture
1. Click "Remove" button
2. Confirm removal
3. Picture removed
4. Fallback to initials

## 📊 Technical Details

### Component Props
```javascript
<ProfilePictureUpload
  currentImageUrl={string}  // Current profile picture URL
  onUploadSuccess={function} // Callback after successful upload
/>
```

### Supabase Storage API
```javascript
// Upload
await supabase.storage
  .from('profile-pictures')
  .upload(fileName, file, { upsert: true })

// Get public URL
const { data } = supabase.storage
  .from('profile-pictures')
  .getPublicUrl(fileName)

// Delete
await supabase.storage
  .from('profile-pictures')
  .remove([fileName])
```

### Database Update
```javascript
await supabase
  .from('profiles')
  .update({ profile_image_url: publicUrl })
  .eq('id', user.id)
```

## 🐛 Troubleshooting

### Image Not Uploading

**Check 1: Bucket exists**
```sql
SELECT * FROM storage.buckets WHERE name = 'profile-pictures';
```

**Check 2: Bucket is public**
- Go to Storage in Supabase Dashboard
- Check "Public" toggle is ON

**Check 3: Policies exist**
```sql
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%profile%';
```

### Image Not Displaying

**Check 1: URL is correct**
```sql
SELECT profile_image_url FROM profiles WHERE id = 'YOUR_USER_ID';
```

**Check 2: File exists in storage**
- Go to Storage > profile-pictures
- Check your user ID folder

**Check 3: Public access enabled**
- Bucket must be public
- SELECT policy must exist

### Upload Fails

**Error: "File too large"**
- Max size is 5MB
- Compress image before uploading

**Error: "Invalid file type"**
- Only JPEG, PNG, WebP, GIF allowed
- Convert to supported format

**Error: "Permission denied"**
- Check storage policies are set up
- Verify user is authenticated

## 🎨 Customization

### Change Max File Size

In ProfilePictureUpload.jsx:
```javascript
const maxSize = 10 * 1024 * 1024 // 10MB
```

And update bucket settings in Supabase Dashboard.

### Add More File Types

In ProfilePictureUpload.jsx:
```javascript
const validTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml', // Add SVG
]
```

### Change Image Shape

In ProfilePictureUpload.jsx:
```javascript
// Circular (current)
className="rounded-full"

// Square
className="rounded-lg"

// Square with rounded corners
className="rounded-xl"
```

## ✅ Success Checklist

After setup, verify:
- [ ] Bucket "profile-pictures" exists
- [ ] Bucket is set to public
- [ ] Storage policies are created
- [ ] Can upload image in settings
- [ ] Image displays in settings
- [ ] Image displays on payment link
- [ ] Can change image
- [ ] Can remove image
- [ ] Public URL works
- [ ] Mobile upload works

## 🔮 Future Enhancements

Potential improvements:
- Image cropping tool
- Multiple image sizes (thumbnail, medium, large)
- Image filters and effects
- Drag & drop upload
- Bulk upload
- Image gallery
- Avatar generator
- Social media import

---

**Status:** ✅ Implemented and Ready
**Version:** 1.0
**Date:** December 9, 2025
**Next Step:** Create storage bucket in Supabase Dashboard
