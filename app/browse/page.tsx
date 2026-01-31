'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import Navigation from '@/components/Navigation';
import EntryCard from '@/components/EntryCard';
import { supabase } from '@/lib/supabase';
import type { Entry, Medium, ContentType } from '@/lib/types';

export const dynamic = 'force-dynamic';

const CONTENT_TYPES: ContentType[] = [
  'Movies',
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

export default function BrowsePage() {
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
        entry.tags?.forEach((tag: string) => tags.add(tag));
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl font-bold mb-4 text-center text-gray-900 dark:text-white">
            Browse All Content
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Use the filters below to find your next favorite show or movie
          </p>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            {hasActiveFilters && (
              <span className="bg-blue-700 text-xs px-2 py-1 rounded-full">Active</span>
            )}
          </button>

          {showFilters && (
            <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Medium Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Medium
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMedium('')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        medium === ''
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setMedium('Movie')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        medium === 'Movie'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      Movies
                    </button>
                    <button
                      onClick={() => setMedium('TV')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        medium === 'TV'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      TV Shows
                    </button>
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Type
                  </label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as ContentType | '')}
                    className="w-full px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    {CONTENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Score Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Minimum Score: {minScore > 0 ? `${minScore}+ stars` : 'Any'}
                  </label>
                  <div className="flex gap-2">
                    {[0, 3, 3.5, 4, 4.5, 5].map((score) => (
                      <button
                        key={score}
                        onClick={() => setMinScore(score)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          minScore === score
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
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
                      className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Most Recent Only (2024-2025)
                    </span>
                  </label>
                </div>

                {/* Tags Filter */}
                {allTags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Tags (select one or more)
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            selectedTags.includes(tag)
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {loading ? 'Loading...' : `${filteredEntries.length} Results`}
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-600 dark:text-gray-400">No results found</p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">Try adjusting your filters</p>
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
