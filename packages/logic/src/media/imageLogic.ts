import SparkMD5 from 'spark-md5';

export const IMAGE_RULES = {
    MIN_COUNT: 4,
    MAX_COUNT: 8,
    MAX_SIZE_BYTES: 200 * 1024, // 200KB
    MAX_DIMENSION: 1280, // 1280x1280 max
    COMPRESSION_QUALITY: 0.7,
    FORMAT: 'image/jpeg', // Standardize to JPEG for compatibility
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
};

export interface ImageFile {
    uri: string;
    blob?: Blob; // Web
    base64?: string; // Mobile/Web
    size: number;
    width?: number;
    height?: number;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

/**
 * Validates the set of images against count rules.
 */
export function validateImageSet(images: ImageFile[]): ValidationResult {
    const errors: string[] = [];

    if (images.length < IMAGE_RULES.MIN_COUNT) {
        errors.push(`Minimum ${IMAGE_RULES.MIN_COUNT} images required.`);
    }
    if (images.length > IMAGE_RULES.MAX_COUNT) {
        errors.push(`Maximum ${IMAGE_RULES.MAX_COUNT} images allowed.`);
    }

    // Check for duplicate content using hash is done separately usually, but we can do a quick check here if hashes are present
    // Assuming images validation happens post-processing or pre-upload

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * callback-based hash generation to avoid blocking UI thread
 */
export function generateImageHash(fileData: Blob | string): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            if (typeof fileData === 'string') {
                // Base64 string
                const hash = SparkMD5.hash(fileData);
                resolve(hash);
            } else {
                // Blob/File
                const fileReader = new FileReader();
                fileReader.onload = (e) => {
                    const buffer = e.target?.result as ArrayBuffer;
                    const spark = new SparkMD5.ArrayBuffer();
                    spark.append(buffer);
                    resolve(spark.end());
                };
                fileReader.onerror = (e) => reject(e);
                fileReader.readAsArrayBuffer(fileData);
            }
        } catch (e) {
            reject(e);
        }
    });
}

/**
 * Checks for duplicates in a new list of images against existing ones
 */
export async function detectDuplicates(
    newImages: (Blob | string)[],
    existingHashes: string[] = []
): Promise<{ duplicates: number[], newHashes: string[] }> {
    const duplicates: number[] = [];
    const generatedHashes: string[] = [];
    const currentHashes = new Set(existingHashes);

    for (let i = 0; i < newImages.length; i++) {
        const hash = await generateImageHash(newImages[i]);
        if (currentHashes.has(hash)) {
            duplicates.push(i); // Index of duplicate
        } else {
            currentHashes.add(hash);
            generatedHashes.push(hash);
        }
    }

    return { duplicates, newHashes: generatedHashes };
}
