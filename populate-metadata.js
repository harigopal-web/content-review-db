// Script to populate missing metadata from TMDB for existing entries
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

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Score-derived tags — never store these; they are computed on the fly
const SCORE_TAGS = ['must-watch', 'recommended', 'entertaining'];

function cleanTitleForSearch(title) {
  // Remove season indicators like "s2", "S3", "season 2", etc.
  let cleaned = title
    .replace(/\s+s\d+$/i, '')           // Remove " s2", " S3", etc. at end
    .replace(/\s+season\s+\d+$/i, '')   // Remove " season 2", etc. at end
    .replace(/\s+part\s+\d+$/i, '')     // Remove " part 2", etc. at end
    .replace(/\s+pt\.?\s+\d+$/i, '')    // Remove " pt 2", " pt. 2", etc. at end
    .trim();

  return cleaned;
}

async function lookupTMDB(title) {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

  // Clean the title before searching
  const searchTitle = cleanTitleForSearch(title);

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTitle)}&page=1`
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0];
    }

    return null;
  } catch (error) {
    console.error(`Error looking up "${title}":`, error.message);
    return null;
  }
}

function determineMedium(tmdbResult) {
  if (tmdbResult.media_type === 'movie') return 'Movie';
  if (tmdbResult.media_type === 'tv') return 'TV';
  if (tmdbResult.release_date) return 'Movie';
  if (tmdbResult.first_air_date) return 'TV';
  return 'Movie';
}

function determineType(tmdbResult, title) {
  const medium = determineMedium(tmdbResult);
  const lowerTitle = title.toLowerCase();
  const overview = tmdbResult.overview?.toLowerCase() || '';

  // Check for specific keywords
  if (lowerTitle.includes('stand-up') || lowerTitle.includes('comedy special') ||
      overview.includes('stand-up') || overview.includes('comedy special')) {
    return 'Comedy Specials';
  }

  if (lowerTitle.includes('love island') || lowerTitle.includes('bachelor') ||
      lowerTitle.includes('dating') || overview.includes('dating')) {
    return 'Reality Dating';
  }

  if (lowerTitle.includes('survivor') || lowerTitle.includes('challenge') ||
      lowerTitle.includes('competition') || overview.includes('competition')) {
    return 'Reality Competition';
  }

  if (lowerTitle.includes('hgtv') || lowerTitle.includes('renovation') ||
      lowerTitle.includes('home') || overview.includes('renovation')) {
    return 'Home Improvement';
  }

  if (lowerTitle.includes('marvel') || lowerTitle.includes('dc ') ||
      lowerTitle.includes('superhero') || lowerTitle.includes('comic')) {
    return 'Comic Book Stuff';
  }

  if (lowerTitle.includes('sport') || overview.includes('sport') ||
      lowerTitle.includes('football') || lowerTitle.includes('basketball')) {
    return 'Sports';
  }

  // Check TMDB genres
  if (tmdbResult.genre_ids && tmdbResult.genre_ids.length > 0) {
    const primaryGenre = tmdbResult.genre_ids[0];

    if (primaryGenre === 99) return 'Documentary/True Crime';

    if (medium === 'TV') {
      if (primaryGenre === 35) return 'Comedy TV';
      if (primaryGenre === 18) return 'Drama TV';
    }
  }

  if (medium === 'Movie') return 'Drama';
  return 'Drama TV';
}

function generateTags(tmdbResult, title) {
  const tags = new Set();
  const lowerTitle = title.toLowerCase();
  const overview = tmdbResult.overview?.toLowerCase() || '';

  // Genre map
  const genreMap = {
    28: 'action', 12: 'adventure', 16: 'animation', 35: 'comedy',
    80: 'crime', 99: 'documentary', 18: 'drama', 10751: 'family',
    14: 'fantasy', 36: 'history', 27: 'horror', 10402: 'music',
    9648: 'mystery', 10749: 'romance', 878: 'sci-fi', 53: 'thriller',
    10752: 'war', 37: 'western',
  };

  if (tmdbResult.genre_ids) {
    tmdbResult.genre_ids.slice(0, 3).forEach(genreId => {
      const tag = genreMap[genreId];
      if (tag) tags.add(tag);
    });
  }

  // Keyword-based tags
  const keywords = [
    { terms: ['true crime', 'murder', 'investigation'], tag: 'true-crime' },
    { terms: ['cooking', 'chef', 'baking'], tag: 'cooking' },
    { terms: ['competition', 'contest', 'challenge'], tag: 'competition' },
    { terms: ['dating', 'romance', 'love'], tag: 'dating' },
    { terms: ['superhero', 'marvel', 'dc'], tag: 'superhero' },
    { terms: ['sports', 'football', 'basketball', 'soccer'], tag: 'sports' },
    { terms: ['thriller', 'suspense'], tag: 'thriller' },
    { terms: ['based on true', 'true story'], tag: 'based-on-true-story' },
    { terms: ['period', 'historical'], tag: 'period-piece' },
    { terms: ['international', 'foreign'], tag: 'international' },
  ];

  keywords.forEach(({ terms, tag }) => {
    if (terms.some(term => lowerTitle.includes(term) || overview.includes(term))) {
      tags.add(tag);
    }
  });

  // Ensure at least 3 tags
  const genericTags = ['engaging', 'compelling', 'worth-watching'];
  let i = 0;
  while (tags.size < 3 && i < genericTags.length) {
    tags.add(genericTags[i]);
    i++;
  }

  return Array.from(tags).slice(0, 5);
}

function getPosterUrl(tmdbResult) {
  if (!tmdbResult.poster_path) return null;
  return `https://image.tmdb.org/t/p/w500${tmdbResult.poster_path}`;
}

async function populateMetadata() {
  console.log('\n🚀 Starting metadata population from TMDB...\n');

  // Fetch all entries with null medium or type
  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .or('medium.is.null,type.is.null');

  if (error) {
    console.error('❌ Error fetching entries:', error);
    return;
  }

  console.log(`📊 Found ${entries.length} entries needing metadata\n`);

  let updated = 0;
  let failed = 0;

  // Process in batches to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);

    await Promise.all(batch.map(async (entry) => {
      console.log(`🔍 Looking up: ${entry.title}`);

      try {
        const tmdbResult = await lookupTMDB(entry.title);

        if (!tmdbResult) {
          console.log(`   ⚠️  No TMDB result found, skipping\n`);
          failed++;
          return;
        }

        const medium = determineMedium(tmdbResult);
        const type = determineType(tmdbResult, entry.title);
        const tags = generateTags(tmdbResult, entry.title);
        const poster_url = getPosterUrl(tmdbResult);

        // Update the entry (strip any score-derived tags before writing)
        const { error: updateError } = await supabase
          .from('entries')
          .update({
            medium,
            type,
            tags: tags.filter(t => !SCORE_TAGS.includes(t)),
            poster_url,
          })
          .eq('id', entry.id);

        if (updateError) {
          console.log(`   ❌ Update failed: ${updateError.message}\n`);
          failed++;
        } else {
          console.log(`   ✅ Updated: ${medium} | ${type} | Tags: ${tags.join(', ')}`);
          if (poster_url) console.log(`   🖼️  Poster: ${poster_url}`);
          console.log('');
          updated++;
        }

      } catch (err) {
        console.log(`   ❌ Error: ${err.message}\n`);
        failed++;
      }
    }));

    // Small delay between batches
    if (i + batchSize < entries.length) {
      console.log('⏸️  Pausing 1 second to avoid rate limits...\n');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('=====================================');
  console.log('📈 Summary:');
  console.log('=====================================');
  console.log(`✅ Successfully updated: ${updated}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total processed: ${entries.length}`);
  console.log('\n🎉 Done! Refresh your browser to see the updated entries.\n');
}

populateMetadata();
