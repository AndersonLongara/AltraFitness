import "./load-env"; // Must be the very first import to load env vars before db init
import { db } from "./index";
import { trainers, exercises, badges } from "./schema";
import { eq } from "drizzle-orm";

const INITIAL_EXERCISES = [
    // Chest
    { name: "Supino Reto (Barra)", muscleGroup: "Peito", videoUrl: "https://www.youtube.com/results?search_query=supino+reto+barra" },
    { name: "Supino Inclinado (Halteres)", muscleGroup: "Peito", videoUrl: "https://www.youtube.com/results?search_query=supino+inclinado+halteres" },
    { name: "Crucifixo (Máquina)", muscleGroup: "Peito", videoUrl: "https://www.youtube.com/results?search_query=peck+deck" },
    { name: "Flexão de Braço", muscleGroup: "Peito", videoUrl: "https://www.youtube.com/results?search_query=flexao+de+braco" },

    // Back
    { name: "Puxada Alta (Frente)", muscleGroup: "Costas", videoUrl: "https://www.youtube.com/results?search_query=puxada+alta" },
    { name: "Remada Curvada", muscleGroup: "Costas", videoUrl: "https://www.youtube.com/results?search_query=remada+curvada" },
    { name: "Remada Baixa (Triângulo)", muscleGroup: "Costas", videoUrl: "https://www.youtube.com/results?search_query=remada+baixa" },
    { name: "Pull-down", muscleGroup: "Costas", videoUrl: "https://www.youtube.com/results?search_query=pull+down+corda" },

    // Legs
    { name: "Agachamento Livre", muscleGroup: "Pernas", videoUrl: "https://www.youtube.com/results?search_query=agachamento+livre" },
    { name: "Leg Press 45", muscleGroup: "Pernas", videoUrl: "https://www.youtube.com/results?search_query=leg+press+45" },
    { name: "Cadeira Extensora", muscleGroup: "Pernas", videoUrl: "https://www.youtube.com/results?search_query=cadeira+extensora" },
    { name: "Mesa Flexora", muscleGroup: "Pernas", videoUrl: "https://www.youtube.com/results?search_query=mesa+flexora" },
    { name: "Panturrilha no Smith", muscleGroup: "Pernas", videoUrl: "https://www.youtube.com/results?search_query=panturrilha+smith" },

    // Shoulders
    { name: "Desenvolvimento (Halteres)", muscleGroup: "Ombros", videoUrl: "https://www.youtube.com/results?search_query=desenvolvimento+halteres" },
    { name: "Elevação Lateral", muscleGroup: "Ombros", videoUrl: "https://www.youtube.com/results?search_query=elevacao+lateral" },
    { name: "Elevação Frontal", muscleGroup: "Ombros", videoUrl: "https://www.youtube.com/results?search_query=elevacao+frontal" },

    // Arms
    { name: "Rosca Direta (Barra W)", muscleGroup: "Bíceps", videoUrl: "https://www.youtube.com/results?search_query=rosca+direta" },
    { name: "Rosca Martelo", muscleGroup: "Bíceps", videoUrl: "https://www.youtube.com/results?search_query=rosca+martelo" },
    { name: "Tríceps Pulley (Corda)", muscleGroup: "Tríceps", videoUrl: "https://www.youtube.com/results?search_query=triceps+corda" },
    { name: "Tríceps Testa", muscleGroup: "Tríceps", videoUrl: "https://www.youtube.com/results?search_query=triceps+testa" },

    // Core
    { name: "Abdominal Supra", muscleGroup: "Abdômen", videoUrl: "https://www.youtube.com/results?search_query=abdominal+supra" },
    { name: "Prancha Alta", muscleGroup: "Abdômen", videoUrl: "https://www.youtube.com/results?search_query=prancha+abdominal" },
];

async function main() {
    console.log("🌱 Starting seed...");

    // 1. Ensure we have a trainer to attach exercises to
    let trainerId: string;

    const existingTrainers = await db.select().from(trainers).limit(1);

    if (existingTrainers.length > 0) {
        trainerId = existingTrainers[0].id;
        console.log(`👍 Using existing trainer: ${existingTrainers[0].name} (${trainerId})`);
    } else {
        console.log("👤 Creating default 'System' trainer...");
        const newTrainer = await db.insert(trainers).values({
            id: "system_trainer",
            name: "AltraFitness System",
            email: "system@altrafitness.com",
        }).returning();
        trainerId = newTrainer[0].id;
    }

    // 2. Insert Exercises
    console.log(`🏋️  Seeding ${INITIAL_EXERCISES.length} exercises...`);

    // We'll loop to handle potential conflicts individually or just insert batch if we don't care about dupes yet
    // Ideally we should check if exists, but for a simple seed, let's try to insert.
    // SQLite doesn't have "ON CONFLICT DO NOTHING" in the same way as Postgres in Drizzle sometimes, but let's try standard insert.

    for (const ex of INITIAL_EXERCISES) {
        // Check duplication by name to avoid filling DB with copies
        // Note: This is checking against the entire DB, not just this trainer's exercises, but simple enough for now.
        const existing = await db.select().from(exercises).where(eq(exercises.name, ex.name)).limit(1);

        if (existing.length === 0) {
            await db.insert(exercises).values({
                trainerId,
                name: ex.name,
                muscleGroup: ex.muscleGroup,
                videoUrl: ex.videoUrl,
            });
        }
    }

    console.log("✅ Exercises seeded!");

    // 3. Insert Badges
    console.log("📛 Seeding badges...");

    const INITIAL_BADGES = [
        {
            name: "Primeira Conquista",
            description: "Complete seu primeiro treino",
            icon: "🏆",
            xpRequired: 50,
            color: "amber",
        },
        {
            name: "Guerreiro da Semana",
            description: "Complete 5 treinos em uma semana",
            icon: "💪",
            xpRequired: 300,
            color: "indigo",
        },
        {
            name: "Mestre da Consistência",
            description: "Alcance 1000 XP",
            icon: "🔥",
            xpRequired: 1000,
            color: "rose",
        },
        {
            name: "Campeão",
            description: "Alcance 5000 XP",
            icon: "👑",
            xpRequired: 5000,
            color: "emerald",
        },
    ];

    for (const badge of INITIAL_BADGES) {
        const existing = await db.select().from(badges).where(eq(badges.name, badge.name)).limit(1);

        if (existing.length === 0) {
            await db.insert(badges).values(badge);
        }
    }

    console.log("✅ Badges seeded!");
    console.log("✅ Seed completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:");
        console.error(e);
        process.exit(1);
    });
