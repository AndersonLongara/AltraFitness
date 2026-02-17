import { createClient } from '@libsql/client';

// PRODUCTION DATABASE - altrafit-andersonlongara
const PROD_DATABASE_URL = 'libsql://altrafit-andersonlongara.aws-us-east-1.turso.io';
const TURSO_AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzEyNjg5NTAsImlkIjoiMjhiMTIzY2MtZTdiZS00YWJkLTllODUtZGE3YmRiY2Y3ZWIzIiwicmlkIjoiM2YwODhjMWMtNjVkZi00NDE2LWIwMjktZTJhN2IwMDRkYTFhIn0.6wlizpAwixjZbg-rKg5GHJW0DMYfIccH-DLnKhMi8WJxHS1bNxx7-ZhGfVdayoL2CDGQBO_FzJFaUMh7SE9yAQ';

const client = createClient({
  url: PROD_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

async function applyProductionMigration() {
  console.log('🔄 Conectando ao banco de PRODUÇÃO...');
  console.log(`📍 Database: ${PROD_DATABASE_URL}`);
  
  try {
    // Check current tables
    console.log('\n🔍 Verificando tabelas existentes...');
    const allTables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table'
      ORDER BY name
    `);
    
    console.log(`\n📊 Total de tabelas: ${allTables.rows.length}`);
    allTables.rows.forEach(row => console.log(`   - ${row.name}`));
    
    // Check for lead_forms tables
    const leadTables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('lead_forms', 'lead_form_answers')
    `);
    
    if (leadTables.rows.length === 2) {
      console.log('\n✅ Tabelas lead_forms e lead_form_answers JÁ EXISTEM!');
      console.log('✅ Nenhuma ação necessária.');
      return;
    }
    
    console.log(`\n⚠️  Tabelas encontradas: ${leadTables.rows.length}/2`);
    console.log('📝 Criando tabelas faltantes no banco de PRODUÇÃO...\n');
    
    // Create lead_forms table
    if (!leadTables.rows.find((r: any) => r.name === 'lead_forms')) {
      console.log('📝 Criando tabela lead_forms...');
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
    
    // Create lead_form_answers table
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
    
    // Verify
    console.log('\n🔍 Verificando criação...');
    const verifyTables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name IN ('lead_forms', 'lead_form_answers')
      ORDER BY name
    `);
    
    console.log('\n✅ Tabelas encontradas no banco de PRODUÇÃO:');
    verifyTables.rows.forEach(row => console.log(`   - ${row.name}`));
    
    console.log('\n🎉 Migração aplicada com SUCESSO no banco de PRODUÇÃO!');
    console.log('✅ Teste agora: https://altra-fitness-hub.vercel.app/dashboard/sales');
    
  } catch (error: any) {
    console.error('\n❌ Erro ao aplicar migração:', error);
    console.error('Detalhes:', error.message);
    throw error;
  } finally {
    client.close();
  }
}

applyProductionMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Falha na migração:', error);
    process.exit(1);
  });
