// Test script to verify Supabase and TMDB connections
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  const envFile = fs.readFileSync(envPath, 'utf8');

  envFile.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, ...values] = line.split('=');
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim();
      }
    }
  });
}

loadEnv();

async function testSupabase() {
  console.log('\n🔍 Testing Supabase Connection...');

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  try {
    // Test connection by querying entries table
    const { data, error } = await supabase.from('entries').select('count');

    if (error) {
      console.log('❌ Supabase Error:', error.message);
      console.log('\n💡 Make sure you ran the SQL from supabase-setup.sql in your Supabase SQL Editor');
      return false;
    }

    console.log('✅ Supabase Connected! Tables are accessible.');
    console.log(`   Current entries in database: ${data?.length || 0}`);
    return true;
  } catch (err) {
    console.log('❌ Supabase Connection Failed:', err.message);
    return false;
  }
}

async function testTMDB() {
  console.log('\n🔍 Testing TMDB API...');

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    console.log('❌ TMDB_API_KEY not found in .env.local');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=Inception`
    );

    if (!response.ok) {
      console.log('❌ TMDB API Error:', response.status, response.statusText);
      console.log('   Check that your TMDB_API_KEY is correct');
      return false;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      console.log('✅ TMDB API Connected!');
      console.log(`   Test search found: "${data.results[0].title}" (${data.results[0].release_date?.slice(0, 4)})`);
      return true;
    }
  } catch (err) {
    console.log('❌ TMDB Connection Failed:', err.message);
    return false;
  }
}

async function runTests() {
  console.log('================================');
  console.log('🧪 Connection Test');
  console.log('================================');

  const supabaseOk = await testSupabase();
  const tmdbOk = await testTMDB();

  console.log('\n================================');
  console.log('📊 Results:');
  console.log('================================');
  console.log(`Supabase: ${supabaseOk ? '✅ Working' : '❌ Failed'}`);
  console.log(`TMDB API: ${tmdbOk ? '✅ Working' : '❌ Failed'}`);

  if (supabaseOk && tmdbOk) {
    console.log('\n🎉 All connections working! Ready to import data.');
    console.log('\n📝 Next steps:');
    console.log('   1. Go to http://localhost:3000/admin');
    console.log('   2. Login with your admin password');
    console.log('   3. Click "Bulk Import" to add your entries');
  } else {
    console.log('\n⚠️  Fix the errors above before proceeding.');
  }

  console.log('\n');
}

runTests();
