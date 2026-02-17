import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Use EXACTLY the same connection as production
const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;

if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  console.error('TURSO_DATABASE_URL:', TURSO_DATABASE_URL);
  console.error('TURSO_AUTH_TOKEN:', TURSO_AUTH_TOKEN ? 'Definido' : 'Não definido');
  process.exit(1);
}

const client = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

async function applyMigration() {
  console.log('🔄 Conectando ao banco Turso...');
  console.log(`📍 Database URL: ${TURSO_DATABASE_URL}`);
  
  try {
    // Check current tables
    console.log('\n🔍 Verificando tabelas existentes...');
    const allTables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table'
      ORDER BY name
    `);
    
    console.log(`\n📊 Total de tabelas no banco: ${allTables.rows.length}`);
    allTables.rows.forEach(row => console.log(`   - ${row.name}`));
    
    // Check specifically for lead_forms tables
    const leadTables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('lead_forms', 'lead_form_answers')
    `);
    
    if (leadTables.rows.length === 2) {
      console.log('\n✅ Tabelas lead_forms e lead_form_answers JÁ EXISTEM!');
      console.log('🎉 Nenhuma ação necessária. O banco está correto.');
      return;
    }
    
    if (leadTables.rows.length === 1) {
      console.log(`\n⚠️  Apenas uma tabela existe: ${leadTables.rows[0].name}`);
      console.log('Criando a tabela faltante...');
    } else {
      console.log('\n❌ Nenhuma das tabelas lead_forms existe!');
      console.log('Criando ambas as tabelas...');
    }
    
    // Create lead_forms table if not exists
    if (!leadTables.rows.find((r: any) => r.name === 'lead_forms')) {
      console.log('\n📝 Criando tabela lead_forms...');
      await client.execute(`
        CREATE TABLE IF NOT EXISTS lead_forms (
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
      console.log('✅ Tabela lead_forms criada!');
    }
    
    // Create lead_form_answers table if not exists
    if (!leadTables.rows.find((r: any) => r.name === 'lead_form_answers')) {
      console.log('\n📝 Criando tabela lead_form_answers...');
      await client.execute(`
        CREATE TABLE IF NOT EXISTS lead_form_answers (
          id TEXT PRIMARY KEY NOT NULL,
          response_id TEXT NOT NULL REFERENCES lead_forms(id) ON DELETE CASCADE,
          question_id TEXT NOT NULL REFERENCES form_questions(id),
          answer TEXT,
          created_at INTEGER DEFAULT (strftime('%s', 'now'))
        )
      `);
      console.log('✅ Tabela lead_form_answers criada!');
    }
    
    // Verify tables were created
    console.log('\n🔍 Verificando criação das tabelas...');
    const verifyTables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name LIKE 'lead_%'
      ORDER BY name
    `);
    
    console.log('\n✅ Tabelas "lead_*" encontradas no banco:');
    verifyTables.rows.forEach(row => console.log(`   - ${row.name}`));
    
    console.log('\n🎉 Migração aplicada com sucesso!');
    console.log('✅ Teste agora em produção: https://altra-fitness-hub.vercel.app/dashboard/sales');
    
  } catch (error: any) {
    console.error('\n❌ Erro ao aplicar migração:', error);
    console.error('Detalhes:', error.message);
    throw error;
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
