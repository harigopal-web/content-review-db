'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import Navigation from '@/components/Navigation';
import EntryCard from '@/components/EntryCard';
import { supabase } from '@/lib/supabase';
import type { Entry } from '@/lib/types';

export default function FiveStarsPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiveStarEntries();
  }, []);

  const loadFiveStarEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('score', 5.0)
        .order('year', { ascending: false })
        .order('title', { ascending: true });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading 5-star entries:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="w-12 h-12 fill-yellow-500 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              5-Star Shows
            </h1>
            <Star className="w-12 h-12 fill-yellow-500 text-yellow-500" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            The absolute best of the best - shows and movies that earned a perfect score
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {loading ? 'Loading...' : `${entries.length} Perfect Ratings`}
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-600 dark:text-gray-400">No 5-star ratings yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
