/**
 * Patch: fix remaining partially-translated exercise names
 * 
 * Usage: node scripts/patch-exercise-names.mjs
 */

import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local
try {
  const envPath = resolve(process.cwd(), '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
} catch { /* no .env.local */ }

// Current name → corrected name
const PATCHES = {
  'Abdominal - Hands Sobre a Cabeça': 'Abdominal com Mãos Sobre a Cabeça',
  'Abdominal - Legs On Bola Suíça': 'Abdominal com Pernas na Bola Suíça',
  'Agachamento no Box': 'Agachamento no Box',
  'Agachamento no Box com Elástico': 'Agachamento no Box com Elástico',
  'Agachamento no Box com Elástico Reverso': 'Agachamento no Box com Elástico Reverso',
  'Agachamentos - With Elásticos': 'Agachamentos com Elásticos',
  'Arm Circles': 'Círculos de Braço',
  'Around The Worlds': 'Volta ao Mundo',
  'Back Crucifixoes - With Elásticos': 'Crucifixo para Costas com Elásticos',
  'Backward Drag': 'Arrasto para Trás',
  'Baixo Pulley Remada To Pescoço': 'Remada na Polia Baixa ao Pescoço',
  'Balance Board': 'Prancha de Equilíbrio',
  'Barra Abdominal Rollout - On Joelhos': 'Rollout com Barra nos Joelhos',
  'Barra Rollout from Bench': 'Rollout com Barra no Banco',
  'Barra Side Bend': 'Flexão Lateral com Barra',
  'Barra Side Split Agachamento': 'Agachamento Split Lateral com Barra',
  'Bear Crawl Sled Drags': 'Arrasto de Trenó com Caminhada do Urso',
  'Behind Head Peito Alongamento': 'Alongamento de Peito por Trás da Cabeça',
  'Bench Salto': 'Salto no Banco',
  'Bench Sprint': 'Sprint no Banco',
  'Bent Over Baixo-Pulley Side Lateral': 'Elevação Lateral Curvado na Polia Baixa',
  'Bent Over Halter Deltóide Posterior Elevação With Head On Bench': 'Elevação Posterior Curvado com Halter Apoiado no Banco',
  'Bent-Arm Barra Pullover': 'Pullover com Barra Braços Flexionados',
  'Bent-Arm Halter Pullover': 'Pullover com Halter Braços Flexionados',
  'Body Tríceps Pressão': 'Tríceps com Peso Corporal',
  'Body Up': 'Body Up',
  'Bola Medicinal Full Torção': 'Torção Completa com Bola Medicinal',
  'Bosu Ball Cabo Abdominal With Side Bends': 'Abdominal no Cabo com Bosu e Flexão Lateral',
  'Bottoms-Up Clean From The Hang Position': 'Clean Invertido Suspenso',
  'Box Agachamento with Correntes': 'Agachamento no Box com Correntes',
  'Box Skip': 'Pulo no Box',
  'Cabo Iron Cross': 'Cruz de Ferro no Cabo',
  'Carioca Quick Step': 'Passo Rápido Carioca',
  'Chair Upper Body Alongamento': 'Alongamento Superior na Cadeira',
  'Corda Straight-Arm Puxada': 'Puxada com Corda Braços Estendidos',
  'Cross Over - With Elásticos': 'Cross Over com Elásticos',
  'Deitado Alto Bench Barra Rosca': 'Rosca com Barra Deitado no Banco Alto',
  'Deitado Pegada Fechada Bar Rosca On Alto Pulley': 'Rosca Deitado Pegada Fechada na Polia Alta',
  'Deitado Pegada Fechada Barra Tríceps Pressão To Chin': 'Tríceps Testa Pegada Fechada com Barra',
  'Double Kettlebell Arranco': 'Arranco Duplo com Kettlebell',
  'Double Kettlebell Arremesso': 'Arremesso Duplo com Kettlebell',
  'Double Kettlebell Push Pressão': 'Push Press Duplo com Kettlebell',
  'Double Kettlebell Windmill': 'Moinho de Vento Duplo com Kettlebell',
  'Double Leg Butt Kick': 'Chute Duplo no Glúteo',
  'Drag Rosca': 'Rosca Drag',
  'Drop Push': 'Empurrão com Queda',
  'Elástico Good Morning': 'Bom Dia com Elástico',
  'Elástico Good Morning (Pull Through)': 'Bom Dia com Elástico (Pull Through)',
  'Elástico Skull Crusher': 'Testa com Elástico',
  'Extended Range UniLateral Kettlebell Floor Pressão': 'Supino no Chão Unilateral com Kettlebell Amplitude Estendida',
  'Face Pull (Puxada para o Rosto)': 'Face Pull (Puxada para o Rosto)',
  'Finger Roscas': 'Rosca de Dedos',
  'Flexão Wide': 'Flexão Aberta',
  'Floor Glúteo-Ham Elevação': 'Elevação Glúteo-Femoral no Solo',
  'Floor Pressão with Correntes': 'Supino no Chão com Correntes',
  'Forward Drag with Pressão': 'Arrasto para Frente com Empurrão',
  'Frontal Agachamentos With Two Kettlebells': 'Agachamento Frontal com Dois Kettlebells',
  'Full Range-Of-Motion Dorsal Puxada': 'Puxada Dorsal Amplitude Completa',
  'Halter Sentado Box Salto': 'Salto no Box Sentado com Halter',
  'Halter Sentado One-Leg Panturrilha Elevação': 'Panturrilha Unilateral Sentado com Halter',
  'Halter Tríceps Extensão -Pronated Grip': 'Extensão de Tríceps Pronada com Halter',
  'Hang Arranco': 'Arranco Suspenso',
  'Hang Arranco - BeBaixo Joelhos': 'Arranco Suspenso Abaixo dos Joelhos',
  'Hang Clean - BeBaixo the Joelhos': 'Clean Suspenso Abaixo dos Joelhos',
  'Hug Joelhos To Peito': 'Abraçar Joelhos ao Peito',
  'Inclinado Bench Pull': 'Puxada no Banco Inclinado',
  'Inclinado Flexão Wide': 'Flexão Inclinada Aberta',
  'Inclinado Halter Bench With Palms Facing In': 'Supino Inclinado com Halter Pegada Neutra',
  'Inclinado Halter Crucifixoes - With A Torção': 'Crucifixo Inclinado com Halter com Rotação',
  'Joelho Across The Body': 'Joelho Cruzado ao Corpo',
  'Joelholing Arm Drill': 'Exercício de Braço Ajoelhado',
  'Jogging, Treadmill': 'Corrida Leve na Esteira',
  'Kipping Muscle Up': 'Muscle Up com Kipping',
  'Leg-Over Floor Pressão': 'Supino no Chão com Perna Cruzada',
  'Leg-Up Posterior Alongamento': 'Alongamento Posterior com Perna Elevada',
  'Levantamento Terra Parcial (Rack Pull)': 'Levantamento Terra Parcial (Rack Pull)',
  'Linear Acceleration Wall Drill': 'Exercício de Aceleração Linear na Parede',
  'Log Lift': 'Levantamento de Log',
  'Looking At Ceiling': 'Olhar para o Teto',
  'Muscle Up': 'Muscle Up',
  'Ombro Pressão - With Elásticos': 'Desenvolvimento de Ombro com Elásticos',
  'On Your Side Quadríceps Alongamento': 'Alongamento de Quadríceps Deitado de Lado',
  'On-Your-Back Quadríceps Alongamento': 'Alongamento de Quadríceps Deitado de Costas',
  'One Half Locust': 'Meio Gafanhoto',
  'One Handed Hang': 'Suspensão com Uma Mão',
  'One Joelho To Peito': 'Um Joelho ao Peito',
  'Otis-Up': 'Otis-Up',
  'Pallof Pressão With Rotação': 'Pallof Press com Rotação',
  'Panturrilha Alongamento Elbows Against Wall': 'Alongamento de Panturrilha com Cotovelos na Parede',
  'Panturrilha Elevação On A Halter': 'Elevação de Panturrilha no Halter',
  'Panturrilha Elevaçãos - With Elásticos': 'Elevação de Panturrilha com Elásticos',
  'Peito And Frontal Of Ombro Alongamento': 'Alongamento de Peito e Ombro Frontal',
  'Peito Push (multiple response)': 'Arremesso de Peito (Múltiplas Repetições)',
  'Peito Push (single response)': 'Arremesso de Peito (Única Repetição)',
  'Peito Push from 3 point stance': 'Arremesso de Peito da Posição de 3 Pontos',
  'Peito Push with Run Release': 'Arremesso de Peito com Corrida e Soltura',
  'Power Arranco from Blocks': 'Power Arranco do Bloco',
  'Power Clean (Arremesso de Potência)': 'Power Clean',
  'Power Clean do Bloco': 'Power Clean do Bloco',
  'Power Jerk (Arremesso de Potência)': 'Power Jerk',
  'Power Snatch (Arranco de Potência)': 'Power Snatch',
  'Power Stairs': 'Escada de Potência',
  'Pressão Sit-Up': 'Abdominal com Pressão',
  'Pull Through': 'Pull Through (Puxada entre as Pernas)',
  'Punho Rotaçãos with Straight Bar': 'Rotação de Punho com Barra Reta',
  'Push Press': 'Push Press',
  'Push Press Unilateral com Kettlebell': 'Push Press Unilateral com Kettlebell',
  'Push Press por Trás': 'Push Press por Trás',
  'Rack Pull with Elásticos': 'Rack Pull com Elásticos',
  'Return Push from Stance': 'Empurrão de Retorno da Posição Base',
  'Reverso Elástico Power Agachamento': 'Agachamento de Potência com Elástico Reverso',
  'Round The World Ombro Alongamento': 'Alongamento de Ombro Volta ao Mundo',
  'Salto Frontal no Box': 'Salto Frontal no Box',
  'Salto Lateral no Box': 'Salto Lateral no Box',
  'Salto no Box (Múltiplas Repetições)': 'Salto no Box (Múltiplas Repetições)',
  'See-Saw Pressão (Alternado Side Pressão)': 'Desenvolvimento Alternado (See-Saw)',
  'Sentado Bent-Over Two-Arm Halter Tríceps Extensão': 'Extensão de Tríceps Curvado Sentado com Dois Halteres',
  'Sentado Bent-Over UniLateral Halter Tríceps Extensão': 'Extensão de Tríceps Curvado Sentado Unilateral com Halter',
  'Sentado FDorsal Bench Leg Encolhimento': 'Encolhimento de Pernas Sentado no Banco Reto',
  'Sentado Two-Arm Supinada Baixo-Pulley Punho Rosca': 'Rosca de Punho Supinada Sentado Bilateral na Polia Baixa',
  'Side Deitado Virilha Alongamento': 'Alongamento de Virilha Deitado de Lado',
  'Side Hop-Sprint': 'Sprint com Salto Lateral',
  'Side Jackknife': 'Canivete Lateral',
  'Side Leg Elevaçãos': 'Elevação Lateral de Perna',
  'Side Punho Pull': 'Puxada Lateral de Punho',
  'Side To Side Chins': 'Barra Fixa Lado a Lado',
  'Side em Pé Long Salto': 'Salto em Distância Lateral em Pé',
  'Side to Side Box Shuffle': 'Shuffle Lateral no Box',
  'Side-Deitado Floor Alongamento': 'Alongamento no Solo Deitado de Lado',
  'Single Halter Elevação': 'Elevação Unilateral com Halter',
  'Single-Cone Sprint Drill': 'Sprint de Cone Único',
  'Sled Drag - Harness': 'Arrasto de Trenó com Harness',
  'Sled Remada': 'Remada com Trenó',
  'Sled Reverso Crucifixoe': 'Crucifixo Reverso com Trenó',
  'Sled Sobre a Cabeça Backward Walk': 'Caminhada para Trás com Trenó Sobre a Cabeça',
  'Sled Sobre a Cabeça Tríceps Extensão': 'Extensão de Tríceps com Trenó Sobre a Cabeça',
  'Smith Hang Power Clean': 'Power Clean Suspenso no Smith',
  'Speed Box Agachamento': 'Agachamento Rápido no Box',
  'Speed Elástico Sobre a Cabeça Tríceps': 'Tríceps Overhead com Elástico Rápido',
  'Step Mill': 'Escada Ergométrica (Step Mill)',
  'Straight Bar Bench Mid Remadas': 'Remada Média no Banco com Barra Reta',
  'Straight Elevaçãos on Inclinado Bench': 'Elevações no Banco Inclinado',
  'Subida no Step com Barra': 'Subida no Step com Barra',
  'Subida no Step com Halter': 'Subida no Step com Halter',
  'Subida no Step with Joelho Elevação': 'Subida no Step com Elevação de Joelho',
  'Supinado Two-Arm Sobre a Cabeça ThRemada': 'Remada Sobre a Cabeça Supinada Bilateral',
  'The Straddle': 'Straddle (Abertura de Pernas)',
  'Tornozelo On The Joelho': 'Tornozelo no Joelho',
  'Tríceps Side Alongamento': 'Alongamento Lateral de Tríceps',
  'Two-Arm Halter Preacher Rosca': 'Rosca Scott Bilateral com Halter',
  'Two-Arm Kettlebell Arremesso': 'Arremesso Bilateral com Kettlebell',
  'Two-Arm Kettlebell Clean': 'Clean Bilateral com Kettlebell',
  'Two-Arm Kettlebell Military Pressão': 'Desenvolvimento Militar Bilateral com Kettlebell',
  'Two-Arm Kettlebell Remada': 'Remada Bilateral com Kettlebell',
  'UniLateral Against Wall': 'Empurrão Unilateral na Parede',
  'UniLateral Alto Box Agachamento': 'Agachamento Unilateral no Box Alto',
  'UniLateral Alto-Pulley Cabo Side Bends': 'Flexão Lateral Unilateral na Polia Alta',
  'UniLateral Chin-Up': 'Barra Fixa Unilateral',
  'UniLateral FDorsal Bench Halter Crucifixoe': 'Crucifixo Unilateral no Banco Reto com Halter',
  'UniLateral Kettlebell Floor Pressão': 'Supino no Chão Unilateral com Kettlebell',
  'UniLateral Kettlebell Military Pressão To The Side': 'Desenvolvimento Militar Lateral Unilateral com Kettlebell',
  'UniLateral Push-off': 'Impulso Unilateral',
  'UniLateral Side Levantamento Terra': 'Levantamento Terra Lateral Unilateral',
  'Wide Stance Barra Agachamento': 'Agachamento com Barra Pés Afastados',
  'Wide Stance Stiff Legs': 'Stiff com Pernas Afastadas',
  'com Peso Ball Side Bend': 'Flexão Lateral com Bola Medicinal',
  'com Peso Bench Mergulho': 'Mergulho no Banco com Peso',
  'com Peso Sit-Ups - With Elásticos': 'Abdominal com Peso e Elásticos',
  'em Pé Barra Pressão Behind Pescoço': 'Desenvolvimento com Barra por Trás do Pescoço',
  'em Pé Soleus And Achilles Alongamento': 'Alongamento de Sóleo e Tendão de Aquiles em Pé',
  'em Pé Two-Arm Sobre a Cabeça ThRemada': 'Remada Sobre a Cabeça Bilateral em Pé',
  'em Pé UniLateral Halter Rosca Over Inclinado Bench': 'Rosca Unilateral no Banco Inclinado em Pé',
};

async function main() {
  const url = (process.env.TURSO_DATABASE_URL || '').replace(/[\r\n\s]/g, '').replace(/\\r\\n/g, '');
  const authToken = (process.env.TURSO_AUTH_TOKEN || '').replace(/[\r\n\s]/g, '').replace(/\\r\\n/g, '');

  if (!url || !authToken) {
    console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
    process.exit(1);
  }

  console.log(`🔗 Connecting to: ${url}`);
  const client = createClient({ url, authToken });

  // Fetch all system exercises
  const result = await client.execute(
    "SELECT id, name FROM exercises WHERE trainer_id IS NULL"
  );
  console.log(`📥 ${result.rows.length} exercises found`);

  // Build lookup by name
  const updates = [];
  for (const row of result.rows) {
    const corrected = PATCHES[row.name];
    if (corrected && corrected !== row.name) {
      updates.push({ id: row.id, oldName: row.name, newName: corrected });
    }
  }

  console.log(`🔄 ${updates.length} exercises to patch`);

  // Show examples
  for (const u of updates.slice(0, 10)) {
    console.log(`  "${u.oldName}" → "${u.newName}"`);
  }

  // Apply updates in batches
  const BATCH_SIZE = 50;
  let done = 0;

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    const stmts = batch.map(u => ({
      sql: "UPDATE exercises SET name = ?, updated_at = strftime('%s', 'now') WHERE id = ?",
      args: [u.newName, u.id],
    }));

    await client.batch(stmts, 'write');
    done += batch.length;
  }

  console.log(`✅ Done! Patched ${done} exercise names.`);

  // Verify
  const samples = await client.execute(
    "SELECT name, muscle_group FROM exercises WHERE trainer_id IS NULL ORDER BY name LIMIT 15"
  );
  console.log('\n🏋️ Sample exercises:');
  for (const row of samples.rows) {
    console.log(`  • ${row.name} [${row.muscle_group}]`);
  }
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
