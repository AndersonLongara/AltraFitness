
/**
 * Anthropometric Assessment Calculations
 * 
 * Protocols:
 * - Pollock 3 Folds (Men/Women)
 * - Pollock 7 Folds (Men/Women)
 * - Guedes (Men/Women)
 * - Bioimpedance (Passthrough)
 * 
 * Equations:
 * - Body Fat %: Siri Equation
 * - BMR: Harris-Benedict & Katch-McArdle
 */

export type AssessmentMethod = 'pollock3' | 'pollock7' | 'guedes' | 'bioimpedance';
export type Gender = 'male' | 'female';

export interface AssessmentInput {
    weight: number; // kg
    height: number; // cm
    age: number;
    gender: Gender;
    skinfolds?: {
        triceps?: number;
        subscapular?: number;
        chest?: number;
        axillary?: number;
        suprailiac?: number;
        abdominal?: number;
        thigh?: number;
    };
    bioimpedance?: {
        bodyFat: number; // percentage
        leanMass?: number; // kg
    }
}

export interface AssessmentResult {
    bodyFat: number; // percentage (0-100)
    leanMass: number; // kg
    fatMass: number; // kg
    bmi: number;
    bmr: {
        harrisBenedict: number; // kcal
        katchMcArdle?: number; // kcal (if lean mass available)
    };
    density?: number; // g/cm3
}

// --- Utils ---

export function calculateBMI(weight: number, heightCm: number): number {
    const heightM = heightCm / 100;
    return Number((weight / (heightM * heightM)).toFixed(2));
}

// --- Body Density Calculations (DC) ---

function calculateDensityPollock3(sum3: number, age: number, gender: Gender): number {
    // Sum3 = Chest + Abdominal + Thigh (Men)
    // Sum3 = Triceps + Suprailiac + Thigh (Women)

    if (gender === 'male') {
        const dc = 1.10938 - (0.0008267 * sum3) + (0.0000016 * (sum3 * sum3)) - (0.0002574 * age);
        return dc;
    } else {
        const dc = 1.0994921 - (0.0009929 * sum3) + (0.0000023 * (sum3 * sum3)) - (0.0001392 * age);
        return dc;
    }
}

function calculateDensityPollock7(sum7: number, age: number, gender: Gender): number {
    // Sum7 = Chest + Axillary + Triceps + Subscapular + Abdominal + Suprailiac + Thigh

    if (gender === 'male') {
        const dc = 1.112 - (0.00043499 * sum7) + (0.00000055 * (sum7 * sum7)) - (0.00028826 * age);
        return dc;
    } else {
        const dc = 1.097 - (0.00046971 * sum7) + (0.00000056 * (sum7 * sum7)) - (0.00012828 * age);
        return dc;
    }
}

function calculateDensityGuedes(age: number, gender: Gender, skinfolds: NonNullable<AssessmentInput['skinfolds']>): number {
    // Guedes (1994) - Brazilian Population
    // Men: Triceps, Suprailiac, Abdominal
    // Women: Suprailiac, Thigh, Subscapular

    if (gender === 'male') {
        // DC = 1.17136 - 0.06706 log10(TR + SI + AB)
        const tr = skinfolds.triceps || 0;
        const si = skinfolds.suprailiac || 0;
        const ab = skinfolds.abdominal || 0;
        const sum = tr + si + ab;
        if (sum === 0) return 0;
        return 1.17136 - (0.06706 * Math.log10(sum));
    } else {
        // DC = 1.16650 - 0.07063 log10(CP + SI + SB) -> CP = Coxa Proximal? Usually Thigh.
        // Guedes Women often uses: Suprailiac, Thigh, Subscapular (Petroski uses others). 
        // Let's use standard Guedes female:
        // DC = 1.16650 - 0.07063 log10(Suprailiac + Thigh + Subscapular)
        const si = skinfolds.suprailiac || 0;
        const th = skinfolds.thigh || 0;
        const sb = skinfolds.subscapular || 0;
        const sum = si + th + sb;
        if (sum === 0) return 0;
        return 1.16650 - (0.07063 * Math.log10(sum));
    }
}

// --- Body Fat % (Siri Equation) ---

export function calculateBodyFatPercentage(density: number): number {
    if (density <= 0 || density === Infinity) return 0;
    // Siri (1961): %G = (4.95 / DC) - 4.50
    const bf = ((4.95 / density) - 4.50) * 100;
    return Number(Math.max(0, bf).toFixed(2));
}

// --- Main Calculator ---

export function calculateAssessment(input: AssessmentInput, method: AssessmentMethod): AssessmentResult {
    let density = 0;
    let bodyFat = 0;

    const { skinfolds, age, gender, weight, height } = input;

    if (method === 'bioimpedance') {
        bodyFat = input.bioimpedance?.bodyFat || 0;
        density = 0; // Not applicable
    } else if (skinfolds) {
        if (method === 'pollock3') {
            let sum3 = 0;
            if (gender === 'male') {
                sum3 = (skinfolds.chest || 0) + (skinfolds.abdominal || 0) + (skinfolds.thigh || 0);
            } else {
                sum3 = (skinfolds.triceps || 0) + (skinfolds.suprailiac || 0) + (skinfolds.thigh || 0);
            }
            density = calculateDensityPollock3(sum3, age, gender);
        }
        else if (method === 'pollock7') {
            const sum7 =
                (skinfolds.triceps || 0) +
                (skinfolds.subscapular || 0) +
                (skinfolds.chest || 0) +
                (skinfolds.axillary || 0) +
                (skinfolds.suprailiac || 0) +
                (skinfolds.abdominal || 0) +
                (skinfolds.thigh || 0);
            density = calculateDensityPollock7(sum7, age, gender);
        }
        else if (method === 'guedes') {
            density = calculateDensityGuedes(age, gender, skinfolds);
        }

        if (density > 0) {
            bodyFat = calculateBodyFatPercentage(density);
        }
    }

    // Compositions
    const fatMass = (weight * bodyFat) / 100;
    const leanMass = weight - fatMass;

    // BMI
    const bmi = calculateBMI(weight, height);

    // BMR (TMB)
    // Harris-Benedict (Original 1919 or Revised 1984? Using Roza & Shizgal 1984 commonly used)
    let bmrHarris = 0;
    if (gender === 'male') {
        bmrHarris = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
        bmrHarris = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    // Katch-McArdle (Uses Lean Mass)
    // BMR = 370 + (21.6 * Lean Mass in kg)
    const bmrKatch = 370 + (21.6 * leanMass);

    return {
        bodyFat: Number(bodyFat.toFixed(2)),
        leanMass: Number(leanMass.toFixed(2)),
        fatMass: Number(fatMass.toFixed(2)),
        bmi,
        bmr: {
            harrisBenedict: Math.round(bmrHarris),
            katchMcArdle: Math.round(bmrKatch)
        },
        density: method !== 'bioimpedance' ? Number(density.toFixed(4)) : undefined
    };
}
