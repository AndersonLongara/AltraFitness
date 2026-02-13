const { drizzle } = require('drizzle-orm/libsql');
const { createClient } = require('@libsql/client');
const { eq, and } = require('drizzle-orm');

// Load schema
const { nutritionalPlans, students } = require('./src/db/schema.ts');

const url = 'libsql://develop-andersonlongara.aws-us-east-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzEwMDUzMzksImlkIjoiMGMyMDY1ZWEtNjY1Mi00Y2E0LWJiMDQtNzM2NTk3ZjAzY2QwIiwicmlkIjoiNzI2NGFlOGYtMjI4Ny00ZjE2LTliZjItZTUyMGRhMTExYzVmIn0.2RKnQj5jPBVc9CUs38_5JsBBb2UxiN5qXZzxZoGnzPUoOb5jmJmR-itMNFZ6qRkGLv3yVLGhn6dhW-vdCzvFBQ';

const client = createClient({ url, authToken });

// Import full schema
async function loadSchema() {
    try {
        const schema = await import('./src/db/schema.ts');
        return schema;
    } catch (e) {
        console.error('Failed to load schema:', e.message);
        return null;
    }
}

async function testQuery() {
    try {
        const schema = await loadSchema();
        if (!schema) return;

        const db = drizzle(client, { schema });
        
        console.log('Testing the exact query from nutrition page...\n');
        
        const result = await db.query.nutritionalPlans.findMany({
            where: and(
                eq(schema.nutritionalPlans.trainerId, 'test_trainer_id'),
                eq(schema.nutritionalPlans.isTemplate, false)
            ),
            with: {
                student: {
                    columns: {
                        name: true,
                        photoUrl: true
                    }
                }
            },
            orderBy: (plans, { desc }) => [desc(plans.createdAt)],
        });
        
        console.log('✅ Query succeeded!');
        console.log('Result:', JSON.stringify(result, null, 2));
        
    } catch (e) {
        console.error('❌ Query failed!');
        console.error('Error:', e.message);
        console.error('Stack:', e.stack);
    }
}

testQuery();
