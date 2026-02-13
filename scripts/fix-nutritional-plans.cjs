const { createClient } = require('@libsql/client');

const url = 'libsql://develop-andersonlongara.aws-us-east-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzEwMDUzMzksImlkIjoiMGMyMDY1ZWEtNjY1Mi00Y2E0LWJiMDQtNzM2NTk3ZjAzY2QwIiwicmlkIjoiNzI2NGFlOGYtMjI4Ny00ZjE2LTliZjItZTUyMGRhMTExYzVmIn0.2RKnQj5jPBVc9CUs38_5JsBBb2UxiN5qXZzxZoGnzPUoOb5jmJmR-itMNFZ6qRkGLv3yVLGhn6dhW-vdCzvFBQ';

const client = createClient({ url, authToken });

async function fixNutritionalPlans() {
    try {
        // Get current columns
        const info = await client.execute(`PRAGMA table_info(nutritional_plans)`);
        const existingCols = info.rows.map(r => r.name);
        
        console.log('Current nutritional_plans columns:', existingCols);
        
        // Expected columns from schema.ts
        const expectedCols = {
            'is_template': 'INTEGER DEFAULT 0',
            'days_of_week': 'TEXT',
            'water_goal_ml': 'INTEGER DEFAULT 2500',
        };
        
        for (const [col, type] of Object.entries(expectedCols)) {
            if (!existingCols.includes(col)) {
                console.log(`\nAdding missing column: ${col} (${type})`);
                await client.execute(`ALTER TABLE nutritional_plans ADD COLUMN ${col} ${type}`);
                console.log(`✅ Added ${col}`);
            } else {
                console.log(`✓ Column ${col} already exists`);
            }
        }
        
        // Verify final state
        const finalInfo = await client.execute(`PRAGMA table_info(nutritional_plans)`);
        console.log('\n=== Final nutritional_plans columns ===');
        console.log(finalInfo.rows.map(r => r.name));
        console.log(`\nTotal: ${finalInfo.rows.length} columns`);
        
    } catch (e) {
        console.error('ERROR:', e.message);
        console.error(e.stack);
    }
}

fixNutritionalPlans();
