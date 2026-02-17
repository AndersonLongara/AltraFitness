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
    // Check if column already exists
    console.log('\n🔍 Verificando se coluna student_id já existe...');
    const checkColumn = await client.execute(`
      SELECT sql FROM sqlite_master 
      WHERE type='table' AND name='leads'
    `);
    
    const tableSchema = checkColumn.rows[0]?.sql as string || '';
    
    if (tableSchema.includes('student_id')) {
      console.log('⚠️  Coluna student_id já existe na tabela leads');
      console.log('✅ Migração já foi aplicada anteriormente');
      return;
    }
    
    console.log('✅ Coluna student_id não encontrada. Prosseguindo com a alteração...');
    
    // Add student_id column
    console.log('\n📝 Adicionando coluna student_id à tabela leads...');
    await client.execute(`
      ALTER TABLE leads ADD COLUMN student_id TEXT REFERENCES students(id)
    `);
    console.log('✅ Coluna student_id adicionada com sucesso!');
    
    // Verify the change
    console.log('\n🔍 Verificando a estrutura da tabela...');
    const verify = await client.execute(`
      SELECT sql FROM sqlite_master 
      WHERE type='table' AND name='leads'
    `);
    
    console.log('📋 Estrutura da tabela leads:');
    console.log(verify.rows[0]?.sql);
    
    console.log('\n✅ Migração 0020_add_lead_student_id aplicada com sucesso!');
    
  } catch (error: any) {
    console.error('❌ Erro ao aplicar migração:', error.message);
    throw error;
  } finally {
    console.log('\n🔌 Fechando conexão...');
  }
}

applyMigration()
  .then(() => {
    console.log('\n✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script falhou:', error);
    process.exit(1);
  });
