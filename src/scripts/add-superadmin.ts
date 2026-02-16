/**
 * Script para definir um usuário como Super Admin (role no nosso banco).
 * Uso: npx tsx src/scripts/add-superadmin.ts <CLERK_USER_ID>
 * Ou: SUPERADMIN_USER_ID=user_xxx npx tsx src/scripts/add-superadmin.ts
 *
 * O Clerk User ID está no dashboard do Clerk (Users > user > User ID)
 * ou no URL ao inspecionar o usuário.
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { db } from "../db";
import { userRoles } from "../db/schema";

const userId = process.env.SUPERADMIN_USER_ID ?? process.argv[2];
if (!userId) {
  console.error("Uso: npx tsx src/scripts/add-superadmin.ts <CLERK_USER_ID>");
  console.error("  ou: SUPERADMIN_USER_ID=user_xxx npx tsx src/scripts/add-superadmin.ts");
  process.exit(1);
}

async function main() {
  await db
    .insert(userRoles)
    .values({ userId, role: "superadmin" })
    .onConflictDoUpdate({
      target: userRoles.userId,
      set: { role: "superadmin", updatedAt: new Date() },
    });
  console.log(`Super admin definido para userId: ${userId}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
