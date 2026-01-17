/**
 * Cloudinary Upload Service
 * Client-side image uploads using unsigned upload preset
 */

const CLOUDINARY_CONFIG = {
    cloudName: 'dlv1hmo1u',
    uploadPreset: 'tailika_unsigned_profile',
    folder: 'tailika/profile-photos',
    resourceType: 'image'
};

/**
 * Upload image to Cloudinary
 * @param {string} uri - Local file URI (processed image)
 * @param {string} userId - User ID for folder organization
 * @returns {Promise<{url: string, publicId: string}>}
 */
export const uploadToCloudinary = async (uri, userId) => {
    try {
        const formData = new FormData();

        // Create file object from URI
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/webp';

        formData.append('file', {
            uri,
            type,
            name: filename,
        });

        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
        formData.append('folder', `${CLOUDINARY_CONFIG.folder}/${userId}`);
        formData.append('resource_type', CLOUDINARY_CONFIG.resourceType);

        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();

        return {
            url: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
            format: data.format,
            bytes: data.bytes
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<{uri: string, hash: string}>} images - Processed images
 * @param {string} userId - User ID
 * @param {Function} onProgress - Progress callback (current, total)
 * @returns {Promise<Array<string>>} Array of Cloudinary URLs
 */
export const uploadMultipleToCloudinary = async (images, userId, onProgress) => {
    const uploadedUrls = [];

    for (let i = 0; i < images.length; i++) {
        const image = images[i];

        if (onProgress) {
            onProgress(i + 1, images.length);
        }

        const result = await uploadToCloudinary(image.uri, userId);
        uploadedUrls.push(result.url);
    }

    return uploadedUrls;
};

export default {
    uploadToCloudinary,
    uploadMultipleToCloudinary,
    config: CLOUDINARY_CONFIG
};
