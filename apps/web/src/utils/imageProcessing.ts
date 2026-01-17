import imageCompression from 'browser-image-compression';
import { IMAGE_RULES, generateImageHash } from '@tailika/logic';

export interface ProcessedImage {
    file: File;
    hash: string;
    previewUrl: string;
}

export async function processImageForUpload(file: File): Promise<ProcessedImage> {
    // 1. Check strict file type before doing anything simple
    if (!IMAGE_RULES.ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Unsupported file type: ${file.type}`);
    }

    // 2. Compress
    const options = {
        maxSizeMB: IMAGE_RULES.MAX_SIZE_BYTES / 1024 / 1024,
        maxWidthOrHeight: IMAGE_RULES.MAX_DIMENSION,
        useWebWorker: true,
        fileType: IMAGE_RULES.FORMAT,
        initialQuality: IMAGE_RULES.COMPRESSION_QUALITY
    };

    try {
        const compressedFile = await imageCompression(file, options);

        // 3. Generate Hash
        const hash = await generateImageHash(compressedFile);

        // 4. Create Preview
        const previewUrl = URL.createObjectURL(compressedFile);

        return {
            file: compressedFile,
            hash,
            previewUrl
        };
    } catch (error) {
        console.error("Image processing failed:", error);
        throw error;
    }
}
