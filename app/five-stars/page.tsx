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
    <div className="min-h-screen bg-cream">
      <Navigation />

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="w-12 h-12 fill-brown text-brown" />
            <h1 className="font-serif text-5xl font-bold text-text-dark">
              5-Star Content
            </h1>
            <Star className="w-12 h-12 fill-brown text-brown" />
          </div>
          <p className="text-xl text-text-medium">
            The absolute best of the best — movies and shows that earned a perfect score
          </p>
          <p className="mt-4 text-sm text-text-light max-w-2xl mx-auto">
            All ratings reflect content watched by the Gopals since 2020. For a comprehensive database of all films and TV, visit{' '}
            <a href="https://letterboxd.com" target="_blank" rel="noopener noreferrer" className="text-brown hover:underline">Letterboxd</a>,{' '}
            <a href="https://www.imdb.com" target="_blank" rel="noopener noreferrer" className="text-brown hover:underline">IMDb</a>, or{' '}
            <a href="https://www.rottentomatoes.com" target="_blank" rel="noopener noreferrer" className="text-brown hover:underline">Rotten Tomatoes</a>.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="font-serif text-3xl font-bold text-text-dark">
            {loading ? 'Loading...' : `${entries.length} Perfect Ratings`}
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cream border-t-brown"></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-16 h-16 mx-auto mb-4 text-text-light" />
            <p className="text-xl text-text-dark font-medium">No 5-star ratings yet</p>
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
