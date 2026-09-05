const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

const supabaseUrl = 'https://vvdmieppkecvpbmfphas.supabase.co';
const supabaseKey = 'sb_publishable_9epkR5D4fgummjS1pZSdag_67WGoMC0';
const email = 'admin_tiemgom@gmail.com';
const password = 'password123';
const username = 'admin_gom';

async function run() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log(`Registering account: ${email}...`);
    
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username
            }
        }
    });

    if (error) {
        console.error('Error during sign up:', error);
        return;
    }

    console.log('Account registered successfully in auth.users!');
    const userId = data.user.id;
    console.log('User ID:', userId);

    // PostgreSQL connection
    const connectionString = process.env.DATABASE_URL;
    const client = connectionString
        ? new Client({ connectionString })
        : new Client({
            user: process.env.PGUSER || 'postgres.vvdmieppkecvpbmfphas',
            host: process.env.PGHOST || 'aws-0-ap-south-1.pooler.supabase.com',
            database: process.env.PGDATABASE || 'postgres',
            password: process.env.PGPASSWORD,
            port: Number(process.env.PGPORT) || 6543,
        });

    await client.connect();
    console.log('Connected to PostgreSQL database.');

    console.log('Confirming email and setting role to admin...');
    const now = new Date().toISOString();
    await client.query(`
        UPDATE auth.users 
        SET email_confirmed_at = $1, 
            confirmed_at = $2,
            raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
        WHERE id = $3;
    `, [now, now, userId]);

    console.log('Database updated successfully! Email confirmed, role set to admin.');
    await client.end();
}

run().catch(console.error);
