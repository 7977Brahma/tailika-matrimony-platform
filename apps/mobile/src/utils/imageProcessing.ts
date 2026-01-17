import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { IMAGE_RULES } from '@tailika/logic';

export interface ProcessedMobileImage {
    uri: string;
    width: number;
    height: number;
    hash: string;
    base64?: string; // Optional if needed for immediate upload
}

export async function processMobileImage(uri: string): Promise<ProcessedMobileImage> {
    // 1. Manipulate / Compress
    // We use the shared logic constants
    const result = await manipulateAsync(
        uri,
        [{ resize: { width: IMAGE_RULES.MAX_DIMENSION } }], // Resize fits within 1280x1280 maintaining aspect ratio
        { compress: IMAGE_RULES.COMPRESSION_QUALITY, format: SaveFormat.JPEG, base64: true } // base64 needed for hash in this simpler flow
    );

    // 2. Hash
    // Using native crypto for speed on mobile
    // Mobile doesn't use the 'logic' package's spark-md5 always, simpler to use native digest if available
    // But strict requirement was "Detect duplicate images using hashing"
    let hash;
    if (result.base64) {
        hash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            result.base64
        );
    } else {
        // Fallback if no base64 (should strictly not happen with options above)
        // Read file as string
        const fileContent = await FileSystem.readAsStringAsync(result.uri, { encoding: FileSystem.EncodingType.Base64 });
        hash = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            fileContent
        );
    }

    return {
        uri: result.uri,
        width: result.width,
        height: result.height,
        hash: hash
    };
}
