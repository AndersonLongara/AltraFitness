import { createClient } from '@libsql/client';

// PRODUCTION DATABASE
const PROD_DATABASE_URL = 'libsql://altrafit-andersonlongara.aws-us-east-1.turso.io';
const TURSO_AUTH_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzEyNjg5NTAsImlkIjoiMjhiMTIzY2MtZTdiZS00YWJkLTllODUtZGE3YmRiY2Y3ZWIzIiwicmlkIjoiM2YwODhjMWMtNjVkZi00NDE2LWIwMjktZTJhN2IwMDRkYTFhIn0.6wlizpAwixjZbg-rKg5GHJW0DMYfIccH-DLnKhMi8WJxHS1bNxx7-ZhGfVdayoL2CDGQBO_FzJFaUMh7SE9yAQ';

async function applyWelcomeTitleMigration() {
    console.log('🔄 Aplicando migração welcome_title ao banco de PRODUÇÃO...');
    console.log(`📍 Database: ${PROD_DATABASE_URL}\n`);

    const client = createClient({
        url: PROD_DATABASE_URL,
        authToken: TURSO_AUTH_TOKEN,
    });

    try {
        // Check if column already exists
        console.log('🔍 Verificando se coluna já existe...');
        const tableInfo = await client.execute(`PRAGMA table_info(forms);`);
        const columnExists = tableInfo.rows.some((row: any) => row.name === 'welcome_title');

        if (columnExists) {
            console.log('✅ Coluna welcome_title já existe!');
            client.close();
            return;
        }

        // Add the column
        console.log('📝 Adicionando coluna welcome_title...');
        await client.execute(`ALTER TABLE forms ADD COLUMN welcome_title TEXT;`);
        
        console.log('✅ Coluna welcome_title adicionada com SUCESSO!');
        
        // Verify
        const verifyTableInfo = await client.execute(`PRAGMA table_info(forms);`);
        const verified = verifyTableInfo.rows.some((row: any) => row.name === 'welcome_title');
        
        if (verified) {
            console.log('✅ Verificação: Coluna welcome_title confirmada no banco!');
        } else {
            console.log('❌ Erro: Coluna não foi adicionada corretamente');
        }

    } catch (error: any) {
        console.error('❌ Erro ao aplicar migração:', error.message);
        throw error;
    } finally {
        client.close();
    }
}

applyWelcomeTitleMigration().catch(console.error);
