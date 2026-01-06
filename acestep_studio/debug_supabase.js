const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
console.log("Reading:", envPath);

try {
    const content = fs.readFileSync(envPath, 'utf-8');
    const env = {};
    content.split(/\r?\n/).forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        const idx = line.indexOf('=');
        if (idx !== -1) {
            const key = line.substring(0, idx).trim();
            let val = line.substring(idx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            env[key] = val;
        }
    });

    const rootEnvPath = path.join(__dirname, '..', '.env');
    console.log("Reading Root:", rootEnvPath);
    if (fs.existsSync(rootEnvPath)) {
        const rootContent = fs.readFileSync(rootEnvPath, 'utf-8');
        rootContent.split(/\r?\n/).forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;
            const idx = line.indexOf('=');
            if (idx !== -1) {
                const key = line.substring(0, idx).trim();
                let val = line.substring(idx + 1).trim();
                if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                    val = val.slice(1, -1);
                }
                // Don't overwrite if exists (prefer local?) Actually root usually has secrets.
                // Prioritize root for SERVICE KEY
                if (key === 'SUPABASE_SERVICE_ROLE_KEY' || !env[key]) {
                    env[key] = val;
                }
            }
        });
    }

    const url = env.NEXT_PUBLIC_SUPABASE_URL;
    const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("URL:", url ? "Found" : "Missing");
    console.log("Key Type:", key ? (env.SUPABASE_SERVICE_ROLE_KEY ? "Service" : "Anon") : "Missing");

    if (!url || !key) {
        console.error("Credentials missing from .env.local");
        process.exit(1);
    }

    const supabase = createClient(url, key);

    async function run() {
        console.log("Listing Buckets...");
        const { data: buckets, error } = await supabase.storage.listBuckets();
        if (error) {
            console.error("List Error:", error);
            if (error.status === 401 || error.status === 403) {
                console.log("Permission Denied. Anon key cannot list buckets. Need Service Role.");
            }
        } else {
            const names = buckets.map(b => b.name);
            console.log("Buckets:", names);
            if (!names.includes('music')) {
                console.log("Creating 'music' bucket...");
                const { error: createError } = await supabase.storage.createBucket('music', { public: true });
                if (createError) console.error("Create Error:", createError);
                else console.log("Bucket 'music' Created Successfully!");
            } else {
                console.log("Bucket 'music' exists.");
            }
        }
    }
    run();

} catch (e) {
    console.error("File Read Error:", e);
}
