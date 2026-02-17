import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
config({ path: join(__dirname, '..', '.env.local') });

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL?.trim();
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN?.trim();

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
    console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env.local');
    process.exit(1);
}

const client = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
});

async function applyMigration() {
    try {
        console.log('📦 Applying instagram migration to Turso...');
        
        // Read migration file
        const migrationSQL = readFileSync(
            join(__dirname, '..', 'drizzle', '0014_add_student_instagram.sql'),
            'utf-8'
        );

        // Execute migration
        await client.execute(migrationSQL);
        
        console.log('✅ Migration applied successfully!');
        console.log('   Added "instagram" column to students table');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

applyMigration();
