
import { db } from "../db";
import { trainers, students } from "../db/schema";

async function main() {
    console.log("TRAINERS:");
    const allTrainers = await db.select({ id: trainers.id, email: trainers.email }).from(trainers);
    console.log(JSON.stringify(allTrainers, null, 2));

    console.log("STUDENTS:");
    const allStudents = await db.select({ id: students.id, name: students.name, email: students.email }).from(students);
    console.log(JSON.stringify(allStudents, null, 2));
}

main().catch(console.error);
