import { db } from "./index";
import { exercises } from "./schema";
import { eq, or, isNull } from "drizzle-orm";

const publicExercises = [
    // Chest
    { name: "Supino Reto com Barra", muscleGroup: "Peito", videoUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg" },
    { name: "Supino Inclinado com Halteres", muscleGroup: "Peito", videoUrl: "https://www.youtube.com/watch?v=8iPEnn-ltC8" },
    { name: "Crucifixo na Máquina", muscleGroup: "Peito", videoUrl: null },
    { name: "Flexão de Braços", muscleGroup: "Peito", videoUrl: null },

    // Back
    { name: "Puxada Alta", muscleGroup: "Costas", videoUrl: null },
    { name: "Remada Curvada", muscleGroup: "Costas", videoUrl: null },
    { name: "Remada Baixa", muscleGroup: "Costas", videoUrl: null },
    { name: "Levantamento Terra", muscleGroup: "Costas", videoUrl: null },

    // Legs
    { name: "Agachamento Livre", muscleGroup: "Pernas", videoUrl: null },
    { name: "Leg Press 45", muscleGroup: "Pernas", videoUrl: null },
    { name: "Cadeira Extensora", muscleGroup: "Pernas", videoUrl: null },
    { name: "Mesa Flexora", muscleGroup: "Pernas", videoUrl: null },
    { name: "Panturrilha em Pé", muscleGroup: "Pernas", videoUrl: null },

    // Shoulders
    { name: "Desenvolvimento com Halteres", muscleGroup: "Ombros", videoUrl: null },
    { name: "Elevação Lateral", muscleGroup: "Ombros", videoUrl: null },
    { name: "Elevação Frontal", muscleGroup: "Ombros", videoUrl: null },

    // Arms
    { name: "Rosca Direta", muscleGroup: "Braços", videoUrl: null },
    { name: "Tríceps Pulley", muscleGroup: "Braços", videoUrl: null },
    { name: "Rosca Martelo", muscleGroup: "Braços", videoUrl: null },
    { name: "Tríceps Testa", muscleGroup: "Braços", videoUrl: null },

    // Core
    { name: "Prancha Abdominal", muscleGroup: "Core", videoUrl: null },
    { name: "Abdominal Crunch", muscleGroup: "Core", videoUrl: null },
];

async function seed() {
    console.log("Cleaning up old public exercises...");
    // Delete exercises where trainerId is null OR 'system_trainer'
    await db.delete(exercises).where(
        or(
            isNull(exercises.trainerId),
            eq(exercises.trainerId, 'system_trainer')
        )
    );

    console.log("Seeding public exercises...");

    // Insert without trainerId to make them public
    await db.insert(exercises).values(
        publicExercises.map(ex => ({
            ...ex,
            trainerId: null, // Explicitly null
        }))
    );

    console.log("Done!");
}

seed().catch(console.error);
