const { createClient } = require('@libsql/client');

const url = 'libsql://develop-andersonlongara.aws-us-east-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzEwMDUzMzksImlkIjoiMGMyMDY1ZWEtNjY1Mi00Y2E0LWJiMDQtNzM2NTk3ZjAzY2QwIiwicmlkIjoiNzI2NGFlOGYtMjI4Ny00ZjE2LTliZjItZTUyMGRhMTExYzVmIn0.2RKnQj5jPBVc9CUs38_5JsBBb2UxiN5qXZzxZoGnzPUoOb5jmJmR-itMNFZ6qRkGLv3yVLGhn6dhW-vdCzvFBQ';

const client = createClient({ url, authToken });

async function checkNutritionTable() {
    try {
        // Get nutritional_plans table schema
        const result = await client.execute(`PRAGMA table_info(nutritional_plans)`);
        
        console.log('\n=== nutritional_plans columns ===');
        console.log(result.rows.map(r => r.name));
        
        const expectedCols = [
            'id', 'trainer_id', 'student_id', 'title', 'daily_kcal', 
            'protein_g', 'carbs_g', 'fat_g', 'water_goal_ml', 'days_of_week',
            'is_template', 'active', 'created_at', 'updated_at'
        ];
        
        const actualCols = result.rows.map(r => r.name);
        const missing = expectedCols.filter(c => !actualCols.includes(c));
        const extra = actualCols.filter(c => !expectedCols.includes(c));
        
        if (missing.length > 0) {
            console.log('\n❌ MISSING columns:', missing);
        }
        if (extra.length > 0) {
            console.log('\n⚠️  EXTRA columns:', extra);
        }
        if (missing.length === 0 && extra.length === 0) {
            console.log('\n✅ All columns match');
        }
        
        // Try to fetch one row
        const row = await client.execute('SELECT * FROM nutritional_plans LIMIT 1');
        console.log('\n=== Sample row count:', row.rows.length);
        
    } catch (e) {
        console.error('ERROR:', e.message);
        console.error(e.stack);
    }
}

checkNutritionTable();
