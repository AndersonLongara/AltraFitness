const { createClient } = require('@libsql/client');

const client = createClient({ url: 'file:local.db' });

async function run() {
    // Create table
    await client.execute(`
        CREATE TABLE IF NOT EXISTS exercise_categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            sort_order INTEGER NOT NULL DEFAULT 0,
            active INTEGER DEFAULT 1,
            created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
    `);
    console.log('Table created');

    // Seed data
    const inserts = [
        ['cat_peito', 'Peito', 1],
        ['cat_costas', 'Costas', 2],
        ['cat_pernas', 'Pernas', 3],
        ['cat_ombros', 'Ombros', 4],
        ['cat_biceps', 'Bíceps', 5],
        ['cat_triceps', 'Tríceps', 6],
        ['cat_core', 'Core', 7],
        ['cat_gluteos', 'Glúteos', 8],
        ['cat_mobilidade', 'Mobilidade', 9],
        ['cat_cardio', 'Cardio', 10],
        ['cat_outros', 'Outros', 11],
    ];

    for (const [id, name, order] of inserts) {
        await client.execute({
            sql: 'INSERT OR IGNORE INTO exercise_categories (id, name, sort_order) VALUES (?, ?, ?)',
            args: [id, name, order],
        });
    }

    const rows = await client.execute('SELECT name, sort_order, active FROM exercise_categories ORDER BY sort_order');
    console.log('Categories seeded:');
    for (const row of rows.rows) {
        console.log(`  ${row.sort_order}. ${row.name} (active: ${row.active})`);
    }
}

run().catch(console.error);
