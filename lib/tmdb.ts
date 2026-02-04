import type { TMDBResult, Medium, ContentType } from './types';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// TMDB genre ID to our content type mapping
const GENRE_TO_TYPE_MAP: Record<number, ContentType> = {
  // Documentary
  99: 'Documentary/True Crime',

  // Comedy
  35: 'Comedy TV',

  // Drama
  18: 'Drama TV',

  // Sports (not a standard TMDB genre, handled separately)

  // Reality (not standard TMDB genres, handled by keywords/search)

  // Action/Adventure/Superhero - Comic Book Stuff
  28: 'Movies', // Action
  12: 'Movies', // Adventure
  14: 'Movies', // Fantasy
  878: 'Movies', // Science Fiction

  // Home (not standard, handled separately)
};

function cleanTitleForSearch(title: string): string {
  // Remove season indicators like "s2", "S3", "season 2", etc.
  let cleaned = title
    .replace(/\s+s\d+$/i, '')           // Remove " s2", " S3", etc. at end
    .replace(/\s+season\s+\d+$/i, '')   // Remove " season 2", etc. at end
    .replace(/\s+part\s+\d+$/i, '')     // Remove " part 2", etc. at end
    .replace(/\s+pt\.?\s+\d+$/i, '')    // Remove " pt 2", " pt. 2", etc. at end
    .trim();

  return cleaned;
}

export async function searchTMDB(title: string): Promise<TMDBResult | null> {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is not configured');
  }

  // Clean the title before searching
  const searchTitle = cleanTitleForSearch(title);

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTitle)}&page=1`
    );

    if (!response.ok) {
      throw new Error('TMDB API request failed');
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Return the first result (usually most relevant)
      return data.results[0];
    }

    return null;
  } catch (error) {
    console.error('Error searching TMDB:', error);
    return null;
  }
}

export function determineMedium(tmdbResult: TMDBResult): Medium {
  if (tmdbResult.media_type === 'movie') return 'Movie';
  if (tmdbResult.media_type === 'tv') return 'TV';

  // Fallback: check if it has movie-specific or TV-specific fields
  if (tmdbResult.release_date) return 'Movie';
  if (tmdbResult.first_air_date) return 'TV';

  return 'Movie'; // Default fallback
}

export function determineType(tmdbResult: TMDBResult, title: string): ContentType {
  const medium = determineMedium(tmdbResult);
  const lowerTitle = title.toLowerCase();
  const overview = tmdbResult.overview?.toLowerCase() || '';

  // Check for specific keywords in title or overview
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

  // Default based on medium
  if (medium === 'Movie') return 'Movies';
  return 'Drama TV'; // Default for TV
}

export function generateTags(tmdbResult: TMDBResult, title: string): string[] {
  const tags: Set<string> = new Set();
  const lowerTitle = title.toLowerCase();
  const overview = tmdbResult.overview?.toLowerCase() || '';

  // Genre-based tags (TMDB genre IDs)
  const genreMap: Record<number, string> = {
    28: 'action',
    12: 'adventure',
    16: 'animation',
    35: 'comedy',
    80: 'crime',
    99: 'documentary',
    18: 'drama',
    10751: 'family',
    14: 'fantasy',
    36: 'history',
    27: 'horror',
    10402: 'music',
    9648: 'mystery',
    10749: 'romance',
    878: 'sci-fi',
    10770: 'tv-movie',
    53: 'thriller',
    10752: 'war',
    37: 'western',
  };

  if (tmdbResult.genre_ids) {
    tmdbResult.genre_ids.slice(0, 3).forEach(genreId => {
      const tag = genreMap[genreId];
      if (tag) tags.add(tag);
    });
  }

  // Keyword-based tags from title and overview
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
    { terms: ['anthology'], tag: 'anthology' },
    { terms: ['miniseries', 'limited series'], tag: 'limited-series' },
  ];

  keywords.forEach(({ terms, tag }) => {
    if (terms.some(term => lowerTitle.includes(term) || overview.includes(term))) {
      tags.add(tag);
    }
  });

  // Ensure we have at least 4 tags
  const genericTags = ['binge-worthy', 'feel-good', 'engaging', 'compelling'];
  let i = 0;
  while (tags.size < 4 && i < genericTags.length) {
    tags.add(genericTags[i]);
    i++;
  }

  return Array.from(tags).slice(0, 5);
}

export function getPosterUrl(tmdbResult: TMDBResult): string | null {
  if (!tmdbResult.poster_path) return null;
  return `https://image.tmdb.org/t/p/w500${tmdbResult.poster_path}`;
}

export async function autoLookupEntry(title: string, score: number) {
  const tmdbResult = await searchTMDB(title);

  if (!tmdbResult) {
    // Return defaults if lookup fails
    return {
      title,
      score,
      medium: 'Movie' as Medium,
      type: 'Movies' as ContentType,
      tags: ['unknown'],
      poster_url: null,
    };
  }

  return {
    title: tmdbResult.title || tmdbResult.name || title,
    score,
    medium: determineMedium(tmdbResult),
    type: determineType(tmdbResult, title),
    tags: generateTags(tmdbResult, title),
    poster_url: getPosterUrl(tmdbResult),
  };
}
