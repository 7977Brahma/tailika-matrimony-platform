export type Gender = 'Male' | 'Female';
export type FamilyValue = 'Traditional' | 'Moderate' | 'Liberal';
export type FamilyType = 'Nuclear' | 'Joint' | 'Other';
export type Diet = 'Veg' | 'Non-Veg' | 'Vegan' | 'Eggetarian';
export type SmokingDrinking = 'No' | 'Occasional' | 'Yes';

export interface Preferences {
    ageRange: { min: number; max: number };
    preferredLocations?: string[]; // Cities or States
    preferredEducation?: string[];
    preferredDiet?: Diet[];
    preferredFamilyValues?: FamilyValue[];
}

export interface Profile {
    id: string;
    name: string;
    gender: Gender;
    age: number;
    location: {
        city: string;
        state: string;
        country: string;
    };
    education: {
        degree: string;
        field: string;
    };
    career: {
        jobTitle: string;
        incomeRange?: string;
    };
    lifestyle: {
        diet: Diet;
        smoking: SmokingDrinking;
        drinking: SmokingDrinking;
    };
    family: {
        type: FamilyType;
        values: FamilyValue;
    };
    preferences?: Preferences;
}

export interface CompatibilityResult {
    overallScore: number;
    categoryScores: {
        age: number;
        location: number;
        educationCareer: number;
        lifestyle: number;
        familyValues: number;
    };
    radarGraphData: {
        labels: string[];
        values: number[];
    };
    insights: string[];
    symbolicIndicator?: {
        level: 'High' | 'Medium' | 'Low';
        note: string;
    };
    disclaimer: string;
}

export interface EngineOptions {
    includeSymbolic?: boolean;
}

// Weights
const WEIGHTS = {
    AGE: 0.30,
    LOCATION: 0.20,
    EDUCATION_CAREER: 0.20,
    LIFESTYLE: 0.15,
    FAMILY_VALUES: 0.15,
};

// --- Helper Scoring Functions ---

function calculateAgeScore(p1: Profile, p2: Profile): number {
    // If preferences exist, strictly follow them
    if (p1.preferences?.ageRange) {
        if (p2.age >= p1.preferences.ageRange.min && p2.age <= p1.preferences.ageRange.max) {
            return 100;
        }
        // Decay based on how far off
        const diff = Math.min(
            Math.abs(p2.age - p1.preferences.ageRange.min),
            Math.abs(p2.age - p1.preferences.ageRange.max)
        );
        return Math.max(0, 100 - (diff * 10)); // Drop 10 points per year outside range
    }

    // Default Heuristic (General Matrimony standard: Grooms slightly older or same age preferred by some, but here we treat equality as base)
    // We'll use a simple "compatible gap" logic. 
    // Perfect: Gap between -1 and +5 (Male older) or similar.
    // For gender neutral calculation (keeping it simple): Gap < 5 years is great.
    const gap = Math.abs(p1.age - p2.age);
    if (gap <= 5) return 100;
    if (gap <= 8) return 80;
    if (gap <= 12) return 50;
    return 20;
}

function calculateLocationScore(p1: Profile, p2: Profile): number {
    if (p1.location.city.toLowerCase() === p2.location.city.toLowerCase()) return 100;
    if (p1.location.state.toLowerCase() === p2.location.state.toLowerCase()) return 70;
    if (p1.location.country.toLowerCase() === p2.location.country.toLowerCase()) return 40;
    return 0;
}

function calculateEducationCareerScore(p1: Profile, p2: Profile): number {
    // Simplified string matching / tier logic
    // In a real app, we'd have a hierarchy/enum.
    let score = 50; // Base score

    // Same degree level roughly?
    if (p1.education.degree.toLowerCase() === p2.education.degree.toLowerCase()) {
        score += 30;
    }

    // You would expand this with real data mapping
    return Math.min(100, score + 20); // Optimistic baseline
}

function calculateLifestyleScore(p1: Profile, p2: Profile): number {
    let score = 100;

    // Diet mismatch
    if (p1.lifestyle.diet !== p2.lifestyle.diet) {
        // Basic compatibility: Veg vs Non-Veg
        if ((p1.lifestyle.diet === 'Veg' && p2.lifestyle.diet === 'Non-Veg') ||
            (p2.lifestyle.diet === 'Veg' && p1.lifestyle.diet === 'Non-Veg')) {
            score -= 40;
        } else {
            score -= 10; // Other mismatches (e.g. Eggetarian)
        }
    }

    // Habits
    if (p1.lifestyle.smoking !== p2.lifestyle.smoking) score -= 20;
    if (p1.lifestyle.drinking !== p2.lifestyle.drinking) score -= 20;

    return Math.max(0, score);
}

function calculateFamilyValuesScore(p1: Profile, p2: Profile): number {
    if (p1.family.values === p2.family.values) return 100;
    if (p1.family.values === 'Moderate' || p2.family.values === 'Moderate') return 70; // Bridge
    return 30; // Traditional vs Liberal mismatch
}

// --- Symbolic Layer (Deterministic Hash) ---
function getSymbolicCompatibility(id1: string, id2: string): { level: 'High' | 'Medium' | 'Low'; note: string } {
    // Simple deterministic hash of IDs
    const combined = id1 < id2 ? id1 + id2 : id2 + id1;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(i);
        hash |= 0;
    }
    const normalized = Math.abs(hash) % 100;

    if (normalized > 66) return { level: 'High', note: 'Symbolic indicators suggest a harmonious connection.' };
    if (normalized > 33) return { level: 'Medium', note: 'Symbolic indicators suggest a balanced connection.' };
    return { level: 'Low', note: 'Symbolic indicators suggest effort is needed for harmony.' };
}

// --- Templates ---
function getInsight(category: string, score: number): string {
    if (score > 80) return `Strong alignment in ${category}.`;
    if (score > 50) return `Moderate compatibility in ${category}.`;
    return `Differing viewpoints in ${category}.`;
}

// --- Main Export ---

/**
 * Narad Muni Compatibility Engine
 * Calculates a deterministic compatibility score based on weighted profile attributes.
 */
export function generateNaradMuniCompatibility(
    myProfile: Profile,
    candidateProfile: Profile,
    options: EngineOptions = {}
): CompatibilityResult | null { // Returns null if invalid (e.g. same gender)

    // 1. Gender Filtering
    if (myProfile.gender === candidateProfile.gender) {
        // The prompt says "Male users can see only Female profiles". 
        // This implies same-gender matching is strictly disallowed.
        console.warn("NaradMuni: Same gender matching is not supported.");
        return null;
    }

    // 2. Score Calculation
    const ageScore = calculateAgeScore(myProfile, candidateProfile);
    const locationScore = calculateLocationScore(myProfile, candidateProfile);
    const eduScore = calculateEducationCareerScore(myProfile, candidateProfile);
    const lifestyleScore = calculateLifestyleScore(myProfile, candidateProfile);
    const familyScore = calculateFamilyValuesScore(myProfile, candidateProfile);

    // 3. Overall Weighted Score
    const overall = (
        (ageScore * WEIGHTS.AGE) +
        (locationScore * WEIGHTS.LOCATION) +
        (eduScore * WEIGHTS.EDUCATION_CAREER) +
        (lifestyleScore * WEIGHTS.LIFESTYLE) +
        (familyScore * WEIGHTS.FAMILY_VALUES)
    );

    const overallRounded = Math.round(overall);

    // 4. Insights
    const insights = [
        getInsight("family values", familyScore),
        getInsight("lifestyle preferences", lifestyleScore),
        getInsight("life goals", eduScore)
    ];

    // 5. Symbolic Layer (Optional)
    let symbolicIndicator = undefined;
    if (options.includeSymbolic) {
        symbolicIndicator = getSymbolicCompatibility(myProfile.id, candidateProfile.id);
    }

    return {
        overallScore: overallRounded,
        categoryScores: {
            age: ageScore,
            location: locationScore,
            educationCareer: eduScore,
            lifestyle: lifestyleScore,
            familyValues: familyScore
        },
        radarGraphData: {
            labels: ["Age", "Location", "Career", "Lifestyle", "Family"],
            values: [ageScore, locationScore, eduScore, lifestyleScore, familyScore]
        },
        insights: insights,
        symbolicIndicator: symbolicIndicator,
        disclaimer: "This compatibility insight is for informational purposes only and does not constitute medical, legal, or predictive advice."
    };
}
