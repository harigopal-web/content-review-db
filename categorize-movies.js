const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Mapping of tags to movie categories
const TAG_TO_CATEGORY = {
  // Drama
  'emotional': 'Drama',
  'slow burn': 'Drama',
  'character study': 'Drama',
  'period piece': 'Drama',
  'historical': 'Drama',
  'heartfelt': 'Drama',
  'powerful': 'Drama',
  'moving': 'Drama',
  'serious': 'Drama',

  // Horror
  'scary': 'Horror',
  'horror': 'Horror',
  'suspenseful': 'Horror',
  'thriller': 'Thriller',
  'tense': 'Thriller',
  'mystery': 'Thriller',
  'dark': 'Horror',
  'creepy': 'Horror',

  // Comedy
  'funny': 'Comedy',
  'hilarious': 'Comedy',
  'comedy': 'Comedy',
  'humor': 'Comedy',
  'witty': 'Comedy',
  'lighthearted': 'Comedy',
  'satire': 'Comedy',

  // Action
  'action': 'Action',
  'intense': 'Action',
  'explosive': 'Action',
  'fight scenes': 'Action',
  'superhero': 'Comic Book Stuff',
  'marvel': 'Comic Book Stuff',
  'dc': 'Comic Book Stuff',
  'comic book': 'Comic Book Stuff',

  // Romance
  'romance': 'Romance',
  'romantic': 'Romance',
  'love story': 'Romance',
  'relationship': 'Romance',

  // Family
  'family': 'Family',
  'kids': 'Family',
  'animated': 'Family',
  'animation': 'Family',
  'disney': 'Family',
  'pixar': 'Family',
  'wholesome': 'Family',

  // Documentary
  'documentary': 'Documentary/True Crime',
  'true story': 'Documentary/True Crime',
  'true crime': 'Documentary/True Crime',
  'based on true events': 'Documentary/True Crime',
  'real life': 'Documentary/True Crime',
};

async function categorizeMovies() {
  console.log('Starting movie categorization...\n');

  try {
    // Get all movies that don't have a type yet or have generic 'Movies' type
    const { data: movies, error } = await supabase
      .from('entries')
      .select('*')
      .eq('medium', 'Movie')
      .or('type.is.null,type.eq.Movies');

    if (error) throw error;

    console.log(`Found ${movies.length} movies to categorize\n`);

    let categorized = 0;
    let skipped = 0;

    for (const movie of movies) {
      const tags = movie.tags || [];
      const title = movie.title;

      // Find matching category based on tags
      let matchedCategory = null;
      let matchedTag = null;

      for (const tag of tags) {
        const tagLower = tag.toLowerCase();
        if (TAG_TO_CATEGORY[tagLower]) {
          matchedCategory = TAG_TO_CATEGORY[tagLower];
          matchedTag = tag;
          break;
        }
      }

      if (matchedCategory) {
        // Update the movie with the matched category
        const { error: updateError } = await supabase
          .from('entries')
          .update({ type: matchedCategory })
          .eq('id', movie.id);

        if (updateError) {
          console.error(`Error updating ${title}:`, updateError);
        } else {
          console.log(`✓ ${title} → ${matchedCategory} (based on tag: "${matchedTag}")`);
          categorized++;
        }
      } else {
        console.log(`○ ${title} - No matching tags, skipped`);
        skipped++;
      }
    }

    console.log(`\n✅ Categorization complete!`);
    console.log(`   Categorized: ${categorized}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${movies.length}`);
    console.log(`\n⚠️  Please review and manually categorize the skipped movies.`);

  } catch (error) {
    console.error('Error categorizing movies:', error);
  }
}

categorizeMovies();
