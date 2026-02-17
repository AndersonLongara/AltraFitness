import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function applyMigration() {
  console.log('🔄 Conectando ao banco Turso de produção...');
  console.log(`📍 Database: ${process.env.TURSO_DATABASE_URL}`);
  
  try {
    // Check if tables already exist
    console.log('\n🔍 Verificando tabelas existentes...');
    const checkTables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('lead_forms', 'lead_form_answers')
    `);
    
    if (checkTables.rows.length > 0) {
      console.log('⚠️  Tabelas já existem:');
      checkTables.rows.forEach(row => console.log(`   - ${row.name}`));
      console.log('\n❓ Deseja continuar e tentar criar as tabelas novamente? (pode falhar se já existirem)');
      // Continue anyway for safety
    } else {
      console.log('✅ Nenhuma tabela encontrada. Prosseguindo com a criação...');
    }
    
    // Create lead_forms table
    console.log('\n📝 Criando tabela lead_forms...');
    await client.execute(`
      CREATE TABLE lead_forms (
        id TEXT PRIMARY KEY NOT NULL,
        lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
        form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        status TEXT DEFAULT 'pending',
        assigned_at INTEGER DEFAULT (strftime('%s', 'now')),
        completed_at INTEGER,
        expires_at INTEGER
      )
    `);
    console.log('✅ Tabela lead_forms criada com sucesso!');
    
    // Create lead_form_answers table
    console.log('\n📝 Criando tabela lead_form_answers...');
    await client.execute(`
      CREATE TABLE lead_form_answers (
        id TEXT PRIMARY KEY NOT NULL,
        response_id TEXT NOT NULL REFERENCES lead_forms(id) ON DELETE CASCADE,
        question_id TEXT NOT NULL REFERENCES form_questions(id),
        answer TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);
    console.log('✅ Tabela lead_form_answers criada com sucesso!');
    
    // Verify tables were created
    console.log('\n🔍 Verificando criação das tabelas...');
    const verifyTables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name LIKE 'lead_%'
      ORDER BY name
    `);
    
    console.log('\n✅ Tabelas encontradas no banco:');
    verifyTables.rows.forEach(row => console.log(`   - ${row.name}`));
    
    console.log('\n🎉 Migração 0015 aplicada com sucesso!');
    console.log('✅ Agora você pode testar a funcionalidade de envio de questionários em produção.');
    
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('\n⚠️  As tabelas já existem no banco de dados.');
      console.log('✅ Nenhuma ação necessária. Você pode testar a funcionalidade em produção.');
    } else {
      console.error('\n❌ Erro ao aplicar migração:', error);
      throw error;
    }
  } finally {
    client.close();
  }
}

applyMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Falha na migração:', error);
    process.exit(1);
  });
