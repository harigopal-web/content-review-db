'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import Navigation from '@/components/Navigation';
import EntryCard from '@/components/EntryCard';
import { supabase } from '@/lib/supabase';
import type { Entry, Medium, ContentType } from '@/lib/types';
import { SCORE_TAGS } from '@/lib/tags';

export const dynamic = 'force-dynamic';

const TV_TYPES: ContentType[] = [
  'Documentary/True Crime',
  'Sports',
  'Drama TV',
  'Comedy TV',
  'Comedy Specials',
  'Reality Competition',
  'Reality Dating',
  'Comic Book Stuff',
  'Home Improvement',
];

const MOVIE_TYPES: ContentType[] = [
  'Comic Book Stuff',
  'Documentary/True Crime',
  'Drama',
  'Horror',
  'Comedy',
  'Thriller',
  'Romance',
  'Action',
  'Family',
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);

  // Filter states
  const [medium, setMedium] = useState<Medium | ''>('');
  const [contentType, setContentType] = useState<ContentType | ''>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [minScore, setMinScore] = useState<number>(0);
  const [mostRecent, setMostRecent] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  // Load filters from URL params (from quiz)
  useEffect(() => {
    const mediumParam = searchParams.get('medium') as Medium | null;
    const typeParam = searchParams.get('type') as ContentType | null;
    const tagsParam = searchParams.get('tags');
    const minScoreParam = searchParams.get('minScore');
    const mostRecentParam = searchParams.get('mostRecent');

    if (mediumParam) setMedium(mediumParam);
    if (typeParam) setContentType(typeParam);
    if (tagsParam) setSelectedTags(tagsParam.split(','));
    if (minScoreParam) setMinScore(parseFloat(minScoreParam));
    if (mostRecentParam === 'true') setMostRecent(true);

    // Show filters if coming from quiz
    if (mediumParam || typeParam || tagsParam || minScoreParam || mostRecentParam) {
      setShowFilters(true);
    }
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [entries, medium, contentType, selectedTags, minScore, mostRecent]);

  // Reset content type when medium changes
  useEffect(() => {
    if (medium && contentType) {
      const availableTypes = medium === 'TV' ? TV_TYPES : MOVIE_TYPES;
      if (!availableTypes.includes(contentType)) {
        setContentType('');
      }
    }
  }, [medium]);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('score', { ascending: false })
        .order('year', { ascending: false });

      if (error) throw error;

      setEntries(data || []);

      // Extract all unique tags
      const tags = new Set<string>();
      (data as any)?.forEach((entry: any) => {
        entry.tags?.forEach((tag: string) => {
          if (!SCORE_TAGS.includes(tag)) tags.add(tag);
        });
      });
      setAllTags(Array.from(tags).sort());
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...entries];

    if (medium) {
      filtered = filtered.filter((entry) => entry.medium === medium);
    }

    if (contentType) {
      filtered = filtered.filter((entry) => entry.type === contentType);
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter((entry) =>
        selectedTags.some((tag) => entry.tags?.includes(tag))
      );
    }

    if (minScore > 0) {
      filtered = filtered.filter((entry) => entry.score >= minScore);
    }

    if (mostRecent) {
      filtered = filtered.filter(
        (entry) => entry.year === 2024 || entry.year === 2025
      );
    }

    setFilteredEntries(filtered);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setMedium('');
    setContentType('');
    setSelectedTags([]);
    setMinScore(0);
    setMostRecent(false);
  };

  const hasActiveFilters = medium || contentType || selectedTags.length > 0 || minScore > 0 || mostRecent;

  return (
    <div className="min-h-screen bg-cream">
      <Navigation />

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto mb-10">
          <h1 className="font-serif text-5xl font-bold mb-3 text-text-dark">
            Browse Content
          </h1>
          <p className="text-text-medium mb-8 text-lg">
            Filter and search through the complete database
          </p>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-6 py-3 border-2 border-brown text-brown hover:bg-brown hover:text-white rounded-full transition-all font-medium"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">{showFilters ? 'Hide' : 'Show'} Filters</span>
            {hasActiveFilters && (
              <span className="bg-brown text-white text-xs px-2 py-0.5 rounded-full">
                {[medium, contentType, ...selectedTags].filter(Boolean).length + (minScore > 0 ? 1 : 0) + (mostRecent ? 1 : 0)}
              </span>
            )}
          </button>

          {showFilters && (
            <div className="mt-6 p-8 bg-white rounded-xl shadow-lg border border-border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-2xl font-semibold text-text-dark">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-sm text-brown hover:text-brown-dark font-medium"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Medium Filter */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-text-dark">
                    Medium
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMedium('')}
                      className={`px-5 py-2 rounded-full transition-all font-medium ${
                        medium === ''
                          ? 'bg-brown text-white shadow-md'
                          : 'bg-cream text-text-medium hover:bg-brown hover:text-white border border-border'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setMedium('Movie')}
                      className={`px-5 py-2 rounded-full transition-all font-medium ${
                        medium === 'Movie'
                          ? 'bg-brown text-white shadow-md'
                          : 'bg-cream text-text-medium hover:bg-brown hover:text-white border border-border'
                      }`}
                    >
                      Movies
                    </button>
                    <button
                      onClick={() => setMedium('TV')}
                      className={`px-5 py-2 rounded-full transition-all font-medium ${
                        medium === 'TV'
                          ? 'bg-brown text-white shadow-md'
                          : 'bg-cream text-text-medium hover:bg-brown hover:text-white border border-border'
                      }`}
                    >
                      TV Shows
                    </button>
                  </div>
                </div>

                {/* Type Filter */}
                {medium && (
                  <div>
                    <label className="block text-sm font-medium mb-3 text-text-dark">
                      Type
                    </label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value as ContentType | '')}
                      className="w-full px-4 py-3 rounded-lg bg-cream text-text-dark border-2 border-border focus:ring-2 focus:ring-brown focus:border-brown"
                    >
                      <option value="">All Types</option>
                      {(medium === 'TV' ? TV_TYPES : MOVIE_TYPES).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Score Filter */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-text-dark">
                    Minimum Score: {minScore > 0 ? `${minScore}+ stars` : 'Any'}
                  </label>
                  <div className="flex gap-2">
                    {[0, 3, 3.5, 4, 4.5, 5].map((score) => (
                      <button
                        key={score}
                        onClick={() => setMinScore(score)}
                        className={`px-4 py-2 rounded-full text-sm transition-all font-medium ${
                          minScore === score
                            ? 'bg-brown text-white shadow-md'
                            : 'bg-cream text-text-medium hover:bg-brown hover:text-white border border-border'
                        }`}
                      >
                        {score === 0 ? 'Any' : `${score}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Most Recent Toggle */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mostRecent}
                      onChange={(e) => setMostRecent(e.target.checked)}
                      className="w-5 h-5 rounded border-border text-brown focus:ring-brown"
                    />
                    <span className="text-sm font-medium text-text-dark">
                      Most Recent Only (2024-2025)
                    </span>
                  </label>
                </div>

                {/* Tags Filter */}
                {allTags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-3 text-text-dark">
                      Tags (select one or more)
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm transition-all ${
                            selectedTags.includes(tag)
                              ? 'bg-brown text-white shadow-md'
                              : 'bg-cream text-text-medium hover:bg-brown hover:text-white border border-border'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-8">
          <h2 className="font-serif text-3xl font-bold text-text-dark">
            {loading ? 'Loading...' : `${filteredEntries.length} Results`}
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cream border-t-brown"></div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto mb-4 text-text-light" />
            <p className="text-xl text-text-dark font-medium">No results found</p>
            <p className="text-text-medium mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream">
        <Navigation />
        <main className="container mx-auto px-6 py-12">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cream border-t-brown"></div>
          </div>
        </main>
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
