import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        emoji: '💕',
        title: 'Find Your Soulmate',
        description: 'Connect with verified profiles who share your values and aspirations',
    },
    {
        id: '2',
        emoji: '🔒',
        title: 'Safe & Secure',
        description: 'Your privacy is our priority. All profiles are verified and protected',
    },
    {
        id: '3',
        emoji: '✨',
        title: 'Smart Matching',
        description: 'Advanced compatibility algorithm to find your perfect match',
    },
];

export default function OnboardingScreen({ onComplete }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef(null);

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            const nextIndex = currentIndex + 1;
            flatListRef.current?.scrollToIndex({ index: nextIndex });
            setCurrentIndex(nextIndex);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const renderSlide = ({ item }) => (
        <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
                keyExtractor={(item) => item.id}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentIndex && styles.activeDot,
                            ]}
                        />
                    ))}
                </View>

                <PrimaryButton
                    title={currentIndex === slides.length - 1 ? "Get Started" : "Next"}
                    onPress={handleNext}
                    style={styles.button}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    skipButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    skipText: {
        color: theme.colors.textMuted,
        fontSize: 16,
        fontWeight: '600',
    },
    slide: {
        width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emoji: {
        fontSize: 100,
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: theme.colors.textMuted,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        paddingBottom: 50,
        paddingHorizontal: 20,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.border,
        marginHorizontal: 4,
    },
    activeDot: {
        backgroundColor: theme.colors.primary,
        width: 24,
    },
    button: {
        marginHorizontal: 0,
    },
});
