const fs = require('fs');
const https = require('https');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

try {
    const env = fs.readFileSync(envPath, 'utf8');
    const match = env.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
    let apiKey = match ? match[1].trim() : null;

    if (apiKey && (apiKey.startsWith('"') && apiKey.endsWith('"') || apiKey.startsWith("'") && apiKey.endsWith("'"))) {
        apiKey = apiKey.slice(1, -1);
    }

    if (!apiKey) {
        console.error("❌ API Key not found in .env.local");
        process.exit(1);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log(`Fetching models from: ${url.replace(apiKey, 'HIDDEN_KEY')}...`);

    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.error) {
                    console.error("❌ API Error:", json.error);
                } else if (json.models) {
                    const flashModels = json.models.filter(m => m.name.includes("flash")).map(m => m.name);
                    fs.writeFileSync('available_flash_models.json', JSON.stringify(flashModels, null, 2));
                    console.log("✅ Wrote filtered models to available_flash_models.json");
                } else {
                    console.log("⚠️ Unexpected response structure:", json);
                }
            } catch (e) {
                console.error("❌ Error parsing JSON:", e);
                console.log("Raw Output:", data);
            }
        });
    }).on('error', (e) => {
        console.error("❌ Request error:", e);
    });

} catch (err) {
    console.error("❌ Error reading .env.local:", err.message);
}
