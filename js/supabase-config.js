// LuckyDragon - Supabase Configuration (Real Database)
// Supabase Project: uiiitnakstwbxgaykmkx

const SUPABASE_URL = 'https://uiiitnakstwbxgaykmkx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpaWl0bmFrc3R3YnhnYXlrbWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzUyNTcsImV4cCI6MjA4NDE1MTI1N30.GbkEHNYbtosntm25y5tpeIzQV64cSlwaGrbgroy_5hU';

let supabaseClient = null;

// Initialize Supabase Client
function initSupabase() {
    if (supabaseClient) return supabaseClient;

    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        try {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase client initialized successfully');
            return supabaseClient;
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            return null;
        }
    }

    console.warn('Supabase SDK not loaded');
    return null;
}

// Get Supabase Client
function getSupabase() {
    return supabaseClient || initSupabase();
}

// Test Connection
async function testConnection() {
    const client = getSupabase();
    if (!client) {
        console.log('No Supabase client');
        return false;
    }

    try {
        const { data, error } = await client.from('users').select('id').limit(1);
        if (error) {
            console.error('Connection test failed:', error);
            return false;
        }
        console.log('✅ Supabase connection successful');
        return true;
    } catch (e) {
        console.error('Connection test exception:', e);
        return false;
    }
}

// Export
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.initSupabase = initSupabase;
window.getSupabase = getSupabase;
window.testSupabaseConnection = testConnection;
