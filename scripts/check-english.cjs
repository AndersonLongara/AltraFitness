const { createClient } = require('@libsql/client');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i === -1) continue;
  let k = t.slice(0, i).trim();
  let v = t.slice(i+1).trim().replace(/^"|"$/g,'');
  env[k] = v;
}

const url = env.TURSO_DATABASE_URL.replace(/[\r\n\s]/g,'').replace(/\\r\\n/g,'');
const token = env.TURSO_AUTH_TOKEN.replace(/[\r\n\s]/g,'').replace(/\\r\\n/g,'');
const client = createClient({ url, authToken: token });

async function main() {
  // Find exercises that still have English words
  const r = await client.execute(
    `SELECT id, name FROM exercises WHERE trainer_id IS NULL ORDER BY name`
  );
  
  // Check for common English words remaining
  const engPatterns = /\b(On|And|With|The|For|From|To|Of|Or|In|At|By|Against|Between|Over|Behind|After|Up|Down|Off|Out|Into|Hands|Legs|Arms|Feet|Head|Body|Floor|Wall|Straight|Two|Finger|Arm|Hang|Power|Speed|Full|Wide|Double|Bench|Each|No|Side|Around|Cross|Under|Above|Below|Close|Skull|Board|Neck|Grip|Palms|Foam|Roll|Prone|Step|Single|One|Box|Drag|Push|Pull|Tire|Log|Sled|Farmer|Bear|Spider|Cat|Child|Pigeon|World|Greatest|Trunk|Butterfly|Standing|Seated|Lying|Kneeling|Treadmill|Running|Jogging)\b/;
  
  const withEnglish = r.rows.filter(row => engPatterns.test(row.name));
  
  console.log(`Total exercises: ${r.rows.length}`);
  console.log(`With English fragments: ${withEnglish.length}`);
  console.log('');
  withEnglish.forEach(row => console.log(`  ${row.name}`));
}

main().catch(console.error);
