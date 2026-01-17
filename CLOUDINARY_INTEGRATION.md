# Cloudinary Integration Guide

## Configuration

**Cloud Name**: `dlv1hmo1u`  
**Upload Preset**: `tailika_unsigned_profile` (unsigned)  
**Folder Structure**: `tailika/profile-photos/{userId}/`  
**Resource Type**: `image`

---

## Implementation

### Mobile (`apps/mobile`)

**Service**: `src/services/cloudinary.js`

```javascript
import { uploadToCloudinary, uploadMultipleToCloudinary } from '../services/cloudinary';

// Single image upload
const result = await uploadToCloudinary(imageUri, userId);
console.log(result.url); // Cloudinary URL

// Multiple images with progress
const urls = await uploadMultipleToCloudinary(
  images, 
  userId,
  (current, total) => {
    console.log(`Uploading ${current}/${total}`);
  }
);
```

**Integration**: `ProfileSetupScreen.js`
- Uploads processed images to Cloudinary on submit
- Stores resulting URLs in Firestore `users/{userId}.photos[]`
- Replaces placeholder URLs with actual cloud storage

---

### Web (`apps/web`)

**Service**: `src/services/cloudinary.ts`

```typescript
import { uploadToCloudinary, uploadMultipleToCloudinary } from '../services/cloudinary';

// Browser File objects
const file = input.files[0];
const result = await uploadToCloudinary(file, userId);

// Multiple files
const urls = await uploadMultipleToCloudinary(fileArray, userId, onProgress);
```

---

## Upload Flow

### Mobile
1. User picks image via `expo-image-picker`
2. Image processed via `processMobileImage()`:
   - Resized to 1080px max width
   - Compressed to 75% quality
   - Converted to WebP
   - MD5 hash generated
3. On profile submit:
   - All images uploaded to Cloudinary
   - URLs stored in Firestore
   - Profile marked complete

### Web
1. User selects files via `<input type="file">`
2. Images processed via `browser-image-compression`:
   - Resized to 1080px
   - Compressed to WebP
3. Upload to Cloudinary
4. Store URLs in Firestore

---

## Cloudinary Configuration

### Upload Preset Settings
- **Mode**: Unsigned (no authentication required)
- **Folder**: Auto-organized by user ID
- **Allowed formats**: jpg, png, webp
- **Max file size**: 5MB (example)
- **Transformations**: None (client-side compression handles this)

### Security
- Unsigned preset allows client-side uploads without exposing API secret
- Folder structure prevents URL guessing: `tailika/profile-photos/{userId}/{filename}`
- User ID must match authenticated Firebase user

---

## Storage Structure

```
cloudinary://dlv1hmo1u/
  └── tailika/
      └── profile-photos/
          ├── userId123/
          │   ├── photo1.webp
          │   ├── photo2.webp
          │   └── photo3.webp
          └── userId456/
              └── photo1.webp
```

**Example URL**:
```
https://res.cloudinary.com/dlv1hmo1u/image/upload/tailika/profile-photos/userId123/photo1.webp
```

---

## Firestore Storage

URLs are stored in the `users` collection:

```javascript
{
  uid: "userId123",
  name: "John Doe",
  photos: [
    "https://res.cloudinary.com/dlv1hmo1u/image/upload/.../photo1.webp",
    "https://res.cloudinary.com/dlv1hmo1u/image/upload/.../photo2.webp",
    "https://res.cloudinary.com/dlv1hmo1u/image/upload/.../photo3.webp",
    "https://res.cloudinary.com/dlv1hmo1u/image/upload/.../photo4.webp"
  ],
  // ... other fields
}
```

---

## Error Handling

### Common Errors

**"Upload failed"**
- Check network connectivity
- Verify upload preset name
- Ensure file is valid image

**"Invalid signature"**
- Should not occur with unsigned preset
- If it does, preset may require signing

**"File too large"**
- Client-side compression should prevent this
- Max size configured in Cloudinary preset

### Retry Logic

```javascript
const uploadWithRetry = async (uri, userId, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await uploadToCloudinary(uri, userId);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

---

## Performance Considerations

### Upload Speed
- **Compression reduces size**: 1080px WebP at 75% quality
- **Parallel uploads**: Can upload multiple images concurrently
- **Progress tracking**: Visual feedback for user

### Bandwidth Optimization
- Images compressed before upload
- WebP format reduces file size by ~30% vs JPEG
- Typical upload: 200-500KB per image

---

## vs Firebase Storage

| Feature | Cloudinary | Firebase Storage |
|---------|------------|------------------|
| **Setup** | ✅ Instant (unsigned preset) | ⚠️ Requires Console init |
| **Client Upload** | ✅ Direct | ✅ Direct |
| **Transformations** | ✅ On-the-fly | ❌ Manual |
| **Free Tier** | 25GB storage, 25GB bandwidth/mo | 5GB storage, 1GB/day |
| **Cost** | Pay-as-you-go after free tier | Blaze plan required for scale |
| **CDN** | ✅ Global | ✅ Global |
| **Security** | Unsigned preset (folder-based) | Firebase rules |

**Decision**: Using Cloudinary for immediate unblocked workflow.

---

## Migration to Firebase Storage (Optional)

If you later want to migrate:

1. Enable Firebase Storage
2. Deploy storage rules
3. Update upload logic to use Firebase SDK:
   ```javascript
   import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
   ```
4. Migrate existing URLs (optional, or keep both)

---

## Testing

### Mobile
```bash
cd apps/mobile
npm start
# Test profile setup with real image uploads
```

### Web
```bash
cd apps/web
npm run dev
# Test profile setup flow
```

**Verify**:
1. Images upload to Cloudinary
2. URLs stored in Firestore
3. Images visible in match discovery (future)

---

## Monitoring

### Cloudinary Dashboard
- [View Usage](https://cloudinary.com/console/dlv1hmo1u)
- Monitor upload count, bandwidth, storage
- Check for errors or abuse

### Firestore
- Verify `photos` array contains valid URLs
- Check profile completion status

---

## Best Practices

1. **Always compress before upload** (already implemented)
2. **Validate image count** (min 4, max 8)
3. **Show upload progress** to user
4. **Handle errors gracefully** with retry logic
5. **Delete old images** when user updates profile (future)

---

## Security Notes

- ✅ Unsigned preset is safe (read-only folder restrictions)
- ✅ User ID-based folders prevent collision
- ⚠️ No direct image deletion from client (use Cloudinary API with signed requests)
- ⚠️ Public URLs (not signed) - images are publicly accessible

For sensitive images, consider:
- Using signed URLs
- Implementing server-side upload (Cloud Functions)
- Adding access control via Cloudinary transformations

---

**Status**: ✅ Fully Integrated for Mobile & Web
