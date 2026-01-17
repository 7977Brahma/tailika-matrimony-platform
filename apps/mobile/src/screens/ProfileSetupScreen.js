import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { validateImageSet } from '@tailika/logic';
import { processMobileImage } from '../utils/imageProcessing';
import { PrimaryButton } from '../components/PrimaryButton';
import { MotiView } from 'moti';

const MIN_PHOTOS = 4;
const MAX_PHOTOS = 8;

export default function ProfileSetupScreen() {
  const { refreshProfile } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: '',
    city: '',
    religion: '',
    motherTongue: '',
    maritalStatus: '',
    height: '',
  });

  const pickImage = async () => {
    if (images.length >= MAX_PHOTOS) {
      Alert.alert('Limit Reached', `Maximum ${MAX_PHOTOS} photos allowed.`);
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      try {
        const processed = await processMobileImage(uri);
        setImages([...images, processed]);
      } catch (e) {
        console.log(e);
        Alert.alert("Processing Error", "Failed to process image.");
      }
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const calculateProgress = () => {
    let progress = 0;
    if (formData.name && formData.gender && formData.age) progress += 0.33;
    if (formData.religion && formData.motherTongue && formData.maritalStatus) progress += 0.33;
    if (images.length >= MIN_PHOTOS) progress += 0.34;
    return Math.min(progress, 1);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.gender || !formData.age || !formData.city ||
      !formData.religion || !formData.motherTongue || !formData.maritalStatus) {
      Alert.alert('Incomplete', 'Please fill all fields.');
      return;
    }

    if (images.length < MIN_PHOTOS) {
      Alert.alert('Photos Required', `Please add at least ${MIN_PHOTOS} photos.`);
      return;
    }

    if (images.length > MAX_PHOTOS) {
      Alert.alert('Too Many Photos', `Maximum ${MAX_PHOTOS} photos allowed.`);
      return;
    }

    setLoading(true);

    try {
      const { uploadMultipleToCloudinary } = require('../services/cloudinary');
      const uploadedPhotos = await uploadMultipleToCloudinary(images, auth.currentUser.uid);

      const userData = {
        ...formData,
        age: parseInt(formData.age),
        height: formData.height ? parseInt(formData.height) : null,
        photos: uploadedPhotos,
        isProfileComplete: true,
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', auth.currentUser.uid), userData, { merge: true });
      await refreshProfile();
      Alert.alert('Success', 'Profile created successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const renderOptionChip = (label, value, key) => (
    <TouchableOpacity
      key={value}
      style={[
        styles.chip,
        formData[key] === value && { backgroundColor: theme.colors.primary },
        { borderColor: theme.colors.border }
      ]}
      onPress={() => setFormData({ ...formData, [key]: value })}
    >
      <Text style={[
        styles.chipText,
        { color: formData[key] === value ? '#FFFFFF' : theme.colors.textMain }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const styles = getStyles(theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Prominent Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${calculateProgress() * 100}%`, backgroundColor: theme.colors.primary }
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>
          {Math.round(calculateProgress() * 100)}% Complete
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={[styles.header, { color: theme.colors.textMain }]}>Create Your Profile</Text>
        <Text style={[styles.subHeader, { color: theme.colors.textMuted }]}>
          Complete all sections to unlock the app
        </Text>

        {/* Section 1: Identity */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.textMain }]}>Basic Info</Text>

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>I am a...</Text>
          <View style={styles.row}>
            {renderOptionChip('Male', 'Male', 'gender')}
            {renderOptionChip('Female', 'Female', 'gender')}
          </View>

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Full Name</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.textMain
            }]}
            placeholder="Enter your name"
            placeholderTextColor={theme.colors.textMuted}
            value={formData.name}
            onChangeText={t => setFormData({ ...formData, name: t })}
          />

          <View style={styles.row2}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[styles.label, { color: theme.colors.textMuted }]}>Age</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.textMain
                }]}
                placeholder="25"
                placeholderTextColor={theme.colors.textMuted}
                value={formData.age}
                onChangeText={t => setFormData({ ...formData, age: t })}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={[styles.label, { color: theme.colors.textMuted }]}>Height (cm)</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.textMain
                }]}
                placeholder="175"
                placeholderTextColor={theme.colors.textMuted}
                value={formData.height}
                onChangeText={t => setFormData({ ...formData, height: t })}
                keyboardType="numeric"
              />
            </View>
          </View>
        </MotiView>

        {/* Section 2: Background */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 100 }}
          style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.textMain }]}>Background</Text>

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>City</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.textMain
            }]}
            placeholder="Mumbai"
            placeholderTextColor={theme.colors.textMuted}
            value={formData.city}
            onChangeText={t => setFormData({ ...formData, city: t })}
          />

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Religion</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.textMain
            }]}
            placeholder="Enter religion"
            placeholderTextColor={theme.colors.textMuted}
            value={formData.religion}
            onChangeText={t => setFormData({ ...formData, religion: t })}
          />

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Mother Tongue</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
              color: theme.colors.textMain
            }]}
            placeholder="Enter language"
            placeholderTextColor={theme.colors.textMuted}
            value={formData.motherTongue}
            onChangeText={t => setFormData({ ...formData, motherTongue: t })}
          />

          <Text style={[styles.label, { color: theme.colors.textMuted }]}>Marital Status</Text>
          <View style={styles.rowWrap}>
            {['Single', 'Divorced', 'Widowed'].map(s => renderOptionChip(s, s, 'maritalStatus'))}
          </View>
        </MotiView>

        {/* Section 3: Photos */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 200 }}
          style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        >
          <View style={styles.photoHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textMain }]}>Profile Photos</Text>
            <View style={[
              styles.photoBadge,
              { backgroundColor: images.length >= MIN_PHOTOS ? theme.colors.success : theme.colors.error }
            ]}>
              <Text style={styles.photoBadgeText}>{images.length}/{MAX_PHOTOS}</Text>
            </View>
          </View>

          <Text style={[styles.photoHint, { color: theme.colors.textMuted }]}>
            {images.length < MIN_PHOTOS
              ? `⚠️ Add ${MIN_PHOTOS - images.length} more photo${MIN_PHOTOS - images.length > 1 ? 's' : ''} to continue`
              : '✅ You can now complete your profile'}
          </Text>

          <View style={styles.photoGrid}>
            {images.map((img, idx) => (
              <View key={idx} style={styles.photoItem}>
                <Image source={{ uri: img.uri }} style={styles.photoImage} />
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeImage(idx)}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}

            {Array.from({ length: Math.min(MAX_PHOTOS - images.length, MAX_PHOTOS) }).map((_, idx) => (
              <TouchableOpacity
                key={`placeholder-${idx}`}
                style={[
                  styles.photoPlaceholder,
                  { borderColor: theme.colors.border, backgroundColor: theme.colors.background },
                  images.length >= MAX_PHOTOS && styles.photoPlaceholderDisabled
                ]}
                onPress={images.length < MAX_PHOTOS ? pickImage : null}
                disabled={images.length >= MAX_PHOTOS}
              >
                <Text style={[styles.placeholderIcon, { color: theme.colors.textMuted }]}>+</Text>
                <Text style={[styles.placeholderText, { color: theme.colors.textMuted }]}>Add Photo</Text>
              </TouchableOpacity>
            ))}
          </View>
        </MotiView>

        <PrimaryButton
          title={loading ? 'Creating Profile...' : 'Complete Profile'}
          onPress={handleSubmit}
          disabled={loading || images.length < MIN_PHOTOS}
          style={{ marginTop: 24, marginBottom: 50 }}
        />
      </ScrollView>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1 },
  progressContainer: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  progressBarTrack: { height: 6, backgroundColor: theme.colors.border, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, marginTop: 8, textAlign: 'center', fontWeight: '600' },

  contentContainer: { padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subHeader: { fontSize: 14, marginBottom: 24 },

  section: { marginBottom: 20, padding: 20, borderRadius: 16, borderWidth: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { height: 50, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, fontSize: 15 },

  row: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  row2: { flexDirection: 'row', marginTop: 8 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  chip: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, borderWidth: 1.5, minWidth: 100, alignItems: 'center' },
  chipText: { fontSize: 15, fontWeight: '600' },

  photoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  photoBadge: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14 },
  photoBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  photoHint: { fontSize: 13, marginBottom: 16, lineHeight: 18 },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  photoItem: { width: '47%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  photoImage: { width: '100%', height: '100%' },
  deleteBtn: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(220, 38, 38, 0.95)', paddingVertical: 10, alignItems: 'center' },
  deleteBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  photoPlaceholder: { width: '47%', aspectRatio: 1, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  photoPlaceholderDisabled: { opacity: 0.4 },
  placeholderIcon: { fontSize: 36, marginBottom: 6 },
  placeholderText: { fontSize: 12, fontWeight: '500' },
});
