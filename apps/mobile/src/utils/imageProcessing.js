import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

export const processMobileImage = async (uri) => {
    // 1. Resize & Compress to WebP (75% quality, 1080px max width)
    const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.75, format: ImageManipulator.SaveFormat.WEBP }
    );

    // 2. Generate Hash (for duplicate detection)
    // We need to read the file as base64 to hash it, or simply hash the file info if content is too large.
    // Reading full base64 of large img might be slow.
    // For "strict" duplicate check, we need content.
    const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
        encoding: FileSystem.EncodingType.Base64
    });
    const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.MD5,
        base64
    );

    return {
        uri: manipulated.uri,
        width: manipulated.width,
        height: manipulated.height,
        size: base64.length, // Approx size
        hash: hash,
        type: 'image/webp'
    };
};
