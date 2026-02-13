import { db } from "@/db";
import { students, leads } from "@/db/schema";
import { eq } from "drizzle-orm";

async function checkPhotos() {
    console.log("--- Checking Students ---");
    const allStudents = await db.query.students.findMany({
        columns: {
            id: true,
            name: true,
            photoUrl: true,
            email: true
        }
    });

    for (const s of allStudents) {
        if (s.name.includes("Pri")) {
            console.log(`Student: ${s.name} | Photo Length: ${s.photoUrl ? s.photoUrl.length : 0}`);
            if (s.photoUrl) console.log(`Photo Start: ${s.photoUrl.substring(0, 50)}`);
        }
    }

    console.log("\n--- Checking Leads ---");
    const allLeads = await db.query.leads.findMany({
        columns: {
            id: true,
            name: true,
            photoUrl: true
        }
    });
    for (const l of allLeads) {
        if (l.name.includes("Pri")) {
            console.log(`Lead: ${l.name} | Photo Length: ${l.photoUrl ? l.photoUrl.length : 0}`);
            if (l.photoUrl) console.log(`Photo Start: ${l.photoUrl.substring(0, 50)}`);
        }
    }
}

checkPhotos();
