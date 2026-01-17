import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { processMobileImage } from '../utils/imageProcessing';
import { uploadToCloudinary } from '../services/cloudinary';
import { theme } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';

const MIN_PHOTOS = 4;
const MAX_PHOTOS = 8;

export default function ManagePhotosScreen({ navigation }) {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadPhotos();
    }, []);

    const loadPhotos = async () => {
        try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
                setPhotos(userDoc.data().photos || []);
            }
        } catch (error) {
            console.error('Error loading photos:', error);
            Alert.alert('Error', 'Failed to load photos');
        } finally {
            setLoading(false);
        }
    };

    const addPhoto = async () => {
        if (photos.length >= MAX_PHOTOS) {
            Alert.alert('Limit Reached', `Maximum ${MAX_PHOTOS} photos allowed.`);
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setUploading(true);
            try {
                const uri = result.assets[0].uri;
                const processed = await processMobileImage(uri);

                // Upload to Cloudinary
                const uploadResult = await uploadToCloudinary(processed.uri, auth.currentUser.uid);

                const newPhoto = {
                    url: uploadResult.url,
                    publicId: uploadResult.publicId,
                    timestamp: Date.now()
                };

                const updatedPhotos = [...photos, newPhoto];

                // Update Firestore
                await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                    photos: updatedPhotos,
                    isProfileComplete: updatedPhotos.length >= MIN_PHOTOS,
                    updatedAt: Date.now()
                });

                setPhotos(updatedPhotos);
                Alert.alert('Success', 'Photo added successfully!');
            } catch (error) {
                console.error('Upload error:', error);
                Alert.alert('Error', 'Failed to upload photo. Please try again.');
            } finally {
                setUploading(false);
            }
        }
    };

    const deletePhoto = async (index) => {
        const photoToDelete = photos[index];

        Alert.alert(
            'Delete Photo',
            'Are you sure you want to delete this photo?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const updatedPhotos = photos.filter((_, i) => i !== index);

                            // Update Firestore
                            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                                photos: updatedPhotos,
                                isProfileComplete: updatedPhotos.length >= MIN_PHOTOS,
                                updatedAt: Date.now()
                            });

                            setPhotos(updatedPhotos);

                            if (updatedPhotos.length < MIN_PHOTOS) {
                                Alert.alert(
                                    'Profile Incomplete',
                                    `You need at least ${MIN_PHOTOS} photos to keep your profile active.`
                                );
                            }
                        } catch (error) {
                            console.error('Delete error:', error);
                            Alert.alert('Error', 'Failed to delete photo');
                        }
                    }
                }
            ]
        );
    };

    const renderPhoto = ({ item, index }) => (
        <View style={styles.photoWrapper}>
            <Image source={{ uri: item.url }} style={styles.photo} />
            <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deletePhoto(index)}
            >
                <Text style={styles.deleteBtnText}>×</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Manage Photos</Text>
                <Text style={styles.subtitle}>
                    {photos.length}/{MAX_PHOTOS} photos (Min {MIN_PHOTOS} required)
                </Text>
            </View>

            <FlatList
                data={photos}
                renderItem={renderPhoto}
                keyExtractor={(item, index) => index.toString()}
                numColumns={3}
                contentContainerStyle={styles.grid}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No photos yet</Text>
                        <Text style={styles.emptySubText}>Add at least {MIN_PHOTOS} photos</Text>
                    </View>
                }
            />

            {photos.length < MAX_PHOTOS && (
                <PrimaryButton
                    title={uploading ? 'Uploading...' : 'Add Photo'}
                    onPress={addPhoto}
                    disabled={uploading}
                    style={styles.addButton}
                />
            )}

            {photos.length < MIN_PHOTOS && (
                <View style={styles.warning}>
                    <Text style={styles.warningText}>
                        ⚠️ Add {MIN_PHOTOS - photos.length} more photo(s) to complete your profile
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: {
        ...theme.typography.h1,
        color: theme.colors.primary,
        marginBottom: 5,
    },
    subtitle: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
    },
    grid: {
        padding: 10,
    },
    photoWrapper: {
        flex: 1,
        margin: 5,
        position: 'relative',
        aspectRatio: 1,
    },
    photo: {
        width: '100%',
        height: '100%',
        borderRadius: theme.borderRadius.md,
    },
    deleteBtn: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: theme.colors.surface,
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    deleteBtnText: {
        color: theme.colors.error,
        fontWeight: 'bold',
        fontSize: 20,
    },
    addButton: {
        margin: 20,
        marginTop: 10,
    },
    warning: {
        backgroundColor: '#FFF3CD',
        padding: 15,
        margin: 20,
        marginTop: 0,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: '#FFC107',
    },
    warningText: {
        color: '#856404',
        textAlign: 'center',
        fontWeight: '600',
    },
    empty: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        ...theme.typography.h2,
        color: theme.colors.textMuted,
        marginBottom: 5,
    },
    emptySubText: {
        ...theme.typography.caption,
        color: theme.colors.textMuted,
    },
});
