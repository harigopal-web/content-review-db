'use client';

import { useState, useEffect } from 'react';
import { Trophy, Film, Tv } from 'lucide-react';
import Navigation from '@/components/Navigation';
import EntryCard from '@/components/EntryCard';
import { supabase } from '@/lib/supabase';
import type { Entry } from '@/lib/types';

const TOP_10_MOVIES = [
  'Mean Girls',
  'Coco',
  'American Factory',
  'Slave Play. Not a Movie. A Play.',
  'Creed',
  'Waco: American Apocalypse',
  'Gladbeck: The Hostage Crisis',
  'Barbie',
  'Sinners',
  'Sorry to Bother You',
];

const TOP_10_TV = [
  'Station Eleven',
  'RHOSLC S2',
  'Fleishman is in Trouble',
  'People Just Do Nothing s1-s4',
  'Formula 1: Drive to Survive S1',
  'Succession s3',
  'Summer Job',
  'Working Moms s7',
  'Welcome to Wrexham s2',
  'Outlast S1',
];

export default function Top10Page() {
  const [movies, setMovies] = useState<Entry[]>([]);
  const [tvShows, setTvShows] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const [{ data: movieData }, { data: tvData }] = await Promise.all([
        supabase.from('entries').select('*').in('title', TOP_10_MOVIES),
        supabase.from('entries').select('*').in('title', TOP_10_TV),
      ]);

      // Sort results to match the curated order
      const sortByList = (data: Entry[], list: string[]) =>
        list.map((title) => data?.find((e) => e.title === title)).filter(Boolean) as Entry[];

      setMovies(sortByList(movieData || [], TOP_10_MOVIES));
      setTvShows(sortByList(tvData || [], TOP_10_TV));
    } catch (error) {
      console.error('Error loading top 10 entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const entries = activeTab === 'movies' ? movies : tvShows;

  return (
    <div className="min-h-screen bg-cream">
      <Navigation />

      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-brown" />
            <h1 className="font-serif text-5xl font-bold text-text-dark">
              Top 10
            </h1>
          </div>
          <p className="text-xl text-text-medium">
            The absolute favorites — the cream of the crop
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setActiveTab('movies')}
            className={`flex items-center gap-2 px-8 py-3 rounded-full text-lg font-medium transition-all ${
              activeTab === 'movies'
                ? 'bg-brown text-white shadow-md'
                : 'bg-white text-text-medium border border-border hover:border-brown hover:text-brown'
            }`}
          >
            <Film className="w-5 h-5" />
            Top 10 Movies
          </button>
          <button
            onClick={() => setActiveTab('tv')}
            className={`flex items-center gap-2 px-8 py-3 rounded-full text-lg font-medium transition-all ${
              activeTab === 'tv'
                ? 'bg-brown text-white shadow-md'
                : 'bg-white text-text-medium border border-border hover:border-brown hover:text-brown'
            }`}
          >
            <Tv className="w-5 h-5" />
            Top 10 TV Shows
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cream border-t-brown" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-text-light" />
            <p className="text-xl text-text-dark font-medium">No entries yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {entries.map((entry, index) => (
              <div key={entry.id} className="relative">
                <div className="absolute -top-3 -left-3 z-10 w-8 h-8 bg-brown text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                  {index + 1}
                </div>
                <EntryCard entry={entry} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
