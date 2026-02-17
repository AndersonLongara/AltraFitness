import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

console.log(`Connecting to: ${url}`);
const client = createClient({ url, authToken });

async function checkAndAddColumn() {
  try {
    // Check if column exists by trying to select it
    console.log('Checking if instagram column exists...');
    const result = await client.execute('PRAGMA table_info(students)');
    const columns = result.rows.map(row => row.name);
    
    console.log('Existing columns:', columns);
    
    if (columns.includes('instagram')) {
      console.log('✓ instagram column already exists');
    } else {
      console.log('✗ instagram column does not exist, adding it...');
      await client.execute('ALTER TABLE students ADD COLUMN instagram TEXT');
      console.log('✓ instagram column added successfully');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

checkAndAddColumn();
