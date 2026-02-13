import { db } from "@/db";
import { foods } from "@/db/schema";

const TACO_DATA = [
    { name: "Arroz, tipo 1, cozido", calories: 128, protein: 250, carbs: 2810, fat: 20, baseAmount: 100, category: "Cereais", source: "TACO" },
    { name: "Feijão, carioca, cozido", calories: 76, protein: 480, carbs: 1360, fat: 50, baseAmount: 100, category: "Leguminosas", source: "TACO" },
    { name: "Frango, peito, sem pele, cozido", calories: 163, protein: 3150, carbs: 0, fat: 320, baseAmount: 100, category: "Carnes", source: "TACO" },
    { name: "Frango, peito, sem pele, grelhado", calories: 159, protein: 3200, carbs: 0, fat: 250, baseAmount: 100, category: "Carnes", source: "TACO" },
    { name: "Ovo, de galinha, inteiro, cozido", calories: 146, protein: 1330, carbs: 60, fat: 950, baseAmount: 100, category: "Ovos", source: "TACO" },
    { name: "Banana, prata, crua", calories: 98, protein: 130, carbs: 2600, fat: 10, baseAmount: 100, category: "Frutas", source: "TACO" },
    { name: "Batata, doce, cozida", calories: 77, protein: 60, carbs: 1840, fat: 10, baseAmount: 100, category: "Tubérculos", source: "TACO" },
    { name: "Aveia, flocos, crua", calories: 394, protein: 1390, carbs: 6660, fat: 850, baseAmount: 100, category: "Cereais", source: "TACO" },
    { name: "Leite, de vaca, integral", calories: 60, protein: 330, carbs: 470, fat: 330, baseAmount: 100, category: "Laticínios", source: "TACO", baseUnit: "ml" },
    { name: "Whey Protein, Concentrado (Genérico)", calories: 400, protein: 8000, carbs: 1000, fat: 500, baseAmount: 100, category: "Suplementos", source: "System" },
];

async function seed() {
    console.log("Seeding foods...");
    try {
        await db.insert(foods).values(TACO_DATA);
        console.log("Seeded successfully.");
    } catch (e) {
        console.error("Error seeding foods:", e);
    }
}

seed();
